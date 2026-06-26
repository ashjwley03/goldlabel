const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

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

const MEDICATION_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MedicationLabelTrainingData",
  "type": "object",
  "required": ["raw_ocr_reference", "medication_name", "language", "pictogram_categories"],
  "properties": {
    "raw_ocr_reference": { "type": "string" },
    "medication_name": { "type": "string" },
    "language": { "type": "string", "enum": ["none", "en", "bn", "hi", "kn", "ml", "te", "my", "th", "vi", "zh", "ms", "ta"] },
    "pictogram_categories": {
      "type": "object",
      "required": ["how_to_take", "side_effects", "duration", "dosage", "time_of_day", "precautions"],
      "properties": {
        "how_to_take": { "type": ["string", "null"] },
        "side_effects": { "type": ["string", "null"] },
        "duration": { "type": ["string", "null"] },
        "dosage": { "type": ["string", "null"] },
        "time_of_day": { "type": ["string", "null"] },
        "precautions": { "type": ["string", "null"] }
      }
    }
  }
};

async function parseMedicationLabel(ocrText) {
  const prompt = `
    Extract medication information from the following OCR text.
    Return the data strictly following this JSON schema: ${JSON.stringify(MEDICATION_SCHEMA)}
    
    Instructions:
    1. The 'raw_ocr_reference' field MUST be the exact text provided below.
    2. Under 'pictogram_categories', for each of the 6 fields, choose the best matching option from these valid IDs or null if not applicable:
       - how_to_take: how_to_take_swallow_whole, how_to_take_dissolve_in_water, how_to_take_take_with_food, how_to_take_take_with_water, how_to_take_take_on_empty_stomach, how_to_take_take_30min_before_food, how_to_take_take_30min_after_food
       - side_effects: side_effects_may_cause_drowsiness, side_effects_may_cause_dizziness, side_effects_avoid_driving, side_effects_may_cause_headache, side_effects_may_cause_blurred_vision, side_effects_may_cause_tremors, side_effects_may_cause_nausea, side_effects_may_cause_vomiting, side_effects_may_cause_diarrhea, side_effects_may_cause_constipation, side_effects_may_cause_dry_mouth, side_effects_may_cause_light_sensitivity, side_effects_may_cause_allergic_reaction, side_effects_may_cause_muscle_weakness, side_effects_may_cause_fast_heartbeat, side_effects_may_cause_fever, side_effects_increased_fall_risk
       - duration: duration_1_day, duration_2_days, duration_3_days, duration_4_days, duration_5_days, duration_6_days, duration_7_days, duration_8_days, duration_9_days, duration_10_days, duration_1_week, duration_2_weeks, duration_3_weeks, duration_4_weeks, duration_5_weeks, duration_6_weeks, duration_7_weeks, duration_8_weeks, duration_9_weeks, duration_10_weeks, duration_1_month, duration_2_months, duration_3_months, duration_4_months, duration_5_months, duration_6_months, duration_7_months, duration_8_months, duration_9_months, duration_10_months, duration_11_months, duration_12_months, duration_complete_course, duration_stop_on_doctors_advice, duration_take_until_symptoms_resolve, duration_repeat_cycle
       - dosage: dosage_half_tablet, dosage_1_tablet, dosage_1_and_half_tablets, dosage_2_tablets, dosage_2_and_half_tablets, dosage_3_tablets, dosage_3_and_half_tablets, dosage_4_tablets, dosage_4_and_half_tablets, dosage_1_teaspoon, dosage_2_teaspoons, dosage_3_teaspoons, dosage_1_tablespoon, dosage_2_tablespoons, dosage_3_tablespoons, dosage_1_ear_drop, dosage_2_ear_drops, dosage_3_ear_drops, dosage_4_ear_drops, dosage_1_eye_drop, dosage_2_eye_drops, dosage_3_eye_drops, dosage_4_eye_drops, dosage_injection_5ml, dosage_injection_10ml, dosage_injection_15ml, dosage_injection_20ml
       - time_of_day: time_of_day_once_daily, time_of_day_twice_daily, time_of_day_thrice_daily, time_of_day_morning, time_of_day_noon, time_of_day_night, time_of_day_upon_waking_up, time_of_day_before_bed, time_of_day_every_4_hours, time_of_day_every_8_hours, time_of_day_with_breakfast, time_of_day_with_lunch, time_of_day_with_dinner
       - precautions: precautions_avoid_alcohol, precautions_avoid_dairy, precautions_avoid_grapefruit, precautions_keep_refrigerated, precautions_keep_refrigerated_do_not_freeze, precautions_keep_away_from_light, precautions_keep_away_from_children, precautions_keep_away_from_pets, precautions_dispose_properly, precautions_do_not_share, precautions_do_not_take_if_pregnant, precautions_do_not_take_if_breastfeeding, precautions_consult_doctor_before_taking, precautions_consult_doctor_if_symptoms_worsen, precautions_check_expiry_date, precautions_discard_8_weeks_after_opening, precautions_store_in_cool_dry_place
    3. For 'language', identify the primary language of the text (e.g. 'en', 'bn', 'hi', 'kn'). Default to 'en' if English. If no text is found, set to 'none'.
    
    OCR Text: "${ocrText}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text);
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

    // 2. Parse text into structured schema using Gemini via Vertex AI
    const structuredData = await parseMedicationLabel(extractedText);

    // 3. Return structured data to the mobile app (app then saves to Supabase)
    return res.json(structuredData);

  } catch (err) {
    console.error('Processing error:', err);
    return res.status(500).json({ error: 'Internal server error during processing.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GoldLabel Backend running on http://localhost:${PORT}`);
  console.log(`Gemini API key: ${process.env.GEMINI_API_KEY ? '✓ set' : '⚠ GEMINI_API_KEY not set'}`);
});
