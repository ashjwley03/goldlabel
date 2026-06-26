const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Google Gen AI (Gemini Developer API) ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY
);

const CATEGORIES = [
  'how_to_take',
  'side_effects',
  'duration',
  'dosage',
  'time_of_day',
  'precautions',
];

// Cache the allowed pictogram IDs so we don't query on every request.
let ALLOWED_IDS = new Set();
// Same IDs, grouped by category, used to tell the LLM exactly what it may pick.
let IDS_BY_CATEGORY = {};

async function loadAllowedIds() {
  const { data, error } = await supabase
    .from('pictogram_assets')
    .select('pictogram_id, category_key')
    .eq('language_code', 'none'); // any single language has the full set

  if (error || !data) {
    console.error('Failed to load allowed pictogram IDs:', error);
    return;
  }
  ALLOWED_IDS = new Set(data.map((r) => r.pictogram_id));

  // Build { how_to_take: [...], dosage: [...], ... } with de-duplicated, sorted IDs
  const grouped = {};
  for (const cat of CATEGORIES) grouped[cat] = new Set();
  for (const r of data) {
    if (grouped[r.category_key]) grouped[r.category_key].add(r.pictogram_id);
  }
  IDS_BY_CATEGORY = {};
  for (const cat of CATEGORIES) {
    IDS_BY_CATEGORY[cat] = [...grouped[cat]].sort();
  }

  console.log(`Loaded ${ALLOWED_IDS.size} allowed pictogram IDs`);
}

const MEDICATION_SCHEMA = {
  type: "object",
  required: ["raw_ocr_reference", "medication_name", "language", "pictogram_categories", "confidence", "requires_review"],
  properties: {
    raw_ocr_reference: { type: "string" },
    medication_name: { type: "string" },
    language: { type: "string", enum: ["none","en","bn","hi","kn","ml","te","my","th","vi","zh","ms","ta"] },
    confidence: { type: "number" },
    requires_review: { type: "boolean" },
    pictogram_categories: {
      type: "object",
      properties: {
        how_to_take:   { type: ["string", "null"] },
        side_effects:  { type: ["string", "null"] },
        duration:      { type: ["string", "null"] },
        dosage:        { type: ["string", "null"] },
        time_of_day:   { type: ["string", "null"] },
        precautions:   { type: ["string", "null"] }
      }
    }
  }
};

//Communicates with supabase
async function parseMedicationLabel(ocrText) {
  // Build a readable, per-category list of the ONLY IDs the model may choose from.
  const allowedList = CATEGORIES
    .map((cat) => `  ${cat}:\n${IDS_BY_CATEGORY[cat].map((id) => `    - ${id}`).join('\n')}`)
    .join('\n');

  const prompt = `
    Extract medication information from the following OCR text.
    Return the data strictly following this JSON schema: ${JSON.stringify(MEDICATION_SCHEMA)}

    For each category, you may ONLY choose from these exact pictogram IDs (or null if not mentioned):
    ${allowedList}

    Common label phrasings and their correct pictogram IDs — use these mappings:
    - "tablet" / "capsule" / "pill" / "by mouth" / "orally" → how_to_take.swallow_whole
    - "oral solution" / "liquid" / "syrup" / "suspension" / "elixir" / "drink" → how_to_take.with_water
    - "with food" / "with meals" → how_to_take.with_food
    - "on empty stomach" / "before meals" → how_to_take.empty_stomach
    - "with water" / "with a full glass of water" → how_to_take.with_water
    - "dissolve" / "effervescent" / "dissolve in water" → how_to_take.dissolve_in_water
    - "30 min before food" / "half hour before eating" → how_to_take.take_30_min_before_food
    - "30 min after food" / "half hour after eating" → how_to_take.take_30_min_after_food
    - "may cause drowsiness" / "causes sleepiness" → side_effects.drowsiness
    - "may cause dizziness" → side_effects.dizziness
    - "avoid alcohol" / "no alcohol" → precautions.no_alcohol
    - "once a day" / "once daily" → time_of_day.once_daily
    - "twice a day" / "twice daily" → time_of_day.twice_daily
    - "three times a day" / "thrice daily" → time_of_day.thrice_daily

    Instructions:
    1. The 'raw_ocr_reference' field MUST be the exact OCR text provided below, copied verbatim.
    2. Use ONLY information explicitly found in the OCR text. Do NOT invent dosage, duration, timing, or warnings.
    3. For each pictogram category, pick ONE pictogram ID from the allowed list above that best matches the label, or null if not mentioned.
    4. You MUST use an ID exactly as written in the allowed list. Do NOT invent, modify, combine, or guess new IDs. If nothing fits, use null.
    5. Set requires_review to true if you are uncertain about any field.
    6. Set confidence to a number between 0 and 1 based on how clearly the label states the information.
    7. Return valid JSON only — no explanation, no markdown, no code fences.

    OCR Text: "${ocrText}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return response.text;
}

// --- Validation ----------------------------------------------------------
// Returns { valid: true, data } or { valid: false, errors: [...] }
function validateLlmOutput(rawText) {
  const errors = [];

  // 1. Valid JSON
  let parsed;
  try {
    // Strip code fences just in case the model added them
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return { valid: false, errors: ['Response is not valid JSON'] };
  }

  // 2. Required top-level fields exist
  const requiredFields = [
    'raw_ocr_reference',
    'medication_name',
    'language',
    'pictogram_categories',
    'confidence',
    'requires_review',
  ];
  for (const field of requiredFields) {
    if (!(field in parsed)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // 3. confidence is a number (between 0 and 1)
  if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
    errors.push('confidence must be a number between 0 and 1');
  }

  // 4. requires_review is a boolean
  if (typeof parsed.requires_review !== 'boolean') {
    errors.push('requires_review must be true or false');
  }

  // 5. language is in the allowed enum
  const allowedLangs = ["none","en","bn","hi","kn","ml","te","my","th","vi","zh","ms","ta"];
  if (!allowedLangs.includes(parsed.language)) {
    errors.push(`language "${parsed.language}" is not an allowed language code`);
  }

  // 6. pictogram_categories is an object with the 6 keys, each a valid ID or null
  const cats = parsed.pictogram_categories;
  if (typeof cats !== 'object' || cats === null || Array.isArray(cats)) {
    errors.push('pictogram_categories must be an object');
  } else {
    for (const cat of CATEGORIES) {
      if (!(cat in cats)) {
        errors.push(`pictogram_categories missing key: ${cat}`);
        continue;
      }
      const val = cats[cat];
      if (val === null) continue; // null is allowed
      if (typeof val !== 'string') {
        errors.push(`${cat} must be a string or null`);
        continue;
      }
      // Every pictogram ID must be in the allowed set
      if (!ALLOWED_IDS.has(val)) {
        errors.push(`${cat} has invalid pictogram ID: ${val}`);
      }
      // And the ID must belong to the right category
      if (!val.startsWith(cat + '.')) {
        errors.push(`${cat} has mismatched ID: ${val}`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, data: parsed };
}

// --- Main Route ---
app.post('/api/ocr/extract', upload.single('file'), async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    let imageBase64 = req.body?.imageBase64;

    if (!imageBase64 && req.file) {
      imageBase64 = req.file.buffer.toString('base64');
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided.' });
    }

    // 1. Get raw text from Google Vision
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          }],
        }),
      }
    );

    const visionJson = await visionResponse.json();

    if (!visionResponse.ok || visionJson.error) {
      const errMsg = visionJson.error?.message || 'Vision API request failed.';
      console.error('Vision API error:', visionJson.error);
      return res.status(502).json({ error: `Vision API error: ${errMsg}` });
    }

    const extractedText = visionJson.responses?.[0]?.fullTextAnnotation?.text || '';

    if (!extractedText) {
      return res.status(422).json({ error: 'Could not detect any text in the image.' });
    }

    // 2. Parse text into structured schema using Gemini — validate, retry once if needed
    let validation;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const rawLlm = await parseMedicationLabel(extractedText);
      console.log('LLM raw response:', rawLlm); // ADD THIS LINE
      validation = validateLlmOutput(rawLlm);
      if (validation.valid) break;
      console.warn(`LLM validation failed (attempt ${attempt}):`, validation.errors);
    }

    if (!validation.valid) {
      return res.status(422).json({
        error: 'LLM output failed validation after retry.',
        details: validation.errors,
      });
    }

    // 3. Return validated structured data to the mobile app
    return res.json(validation.data);

  } catch (err) {
    console.error('Processing error:', err);
    return res.status(500).json({ error: 'Internal server error during processing.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', async () => {
  await loadAllowedIds();
  console.log(`GoldLabel Backend running on http://localhost:${PORT}`);
  console.log(`Gemini API key: ${process.env.GEMINI_API_KEY ? '✓ set' : '⚠ GEMINI_API_KEY not set'}`);
});