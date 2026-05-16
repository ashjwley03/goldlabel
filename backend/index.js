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

// --- Google Gen AI (Gemini Developer API) ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MEDICATION_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MedicationLabelTrainingData",
  "type": "object",
  "required": ["raw_text", "medication_name", "pictogram_categories"],
  "properties": {
    "raw_text": { "type": "string" },
    "medication_name": { "type": "string" },
    "pictogram_categories": {
      "type": "object",
      "required": ["time_of_day", "dosage", "special_instructions"],
      "properties": {
        "time_of_day": {
          "type": "object",
          "required": ["suggested_options", "selected_pictogram_id"],
          "properties": {
            "suggested_options": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["pictogram_id", "label"],
                "properties": {
                  "pictogram_id": { "type": "string" },
                  "label": { "type": "string" }
                }
              }
            },
            "selected_pictogram_id": { "type": ["string", "null"] }
          }
        },
        "dosage": {
          "type": "object",
          "required": ["suggested_options", "selected_pictogram_id"],
          "properties": {
            "suggested_options": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["pictogram_id", "label"],
                "properties": {
                  "pictogram_id": { "type": "string" },
                  "label": { "type": "string" }
                }
              }
            },
            "selected_pictogram_id": { "type": ["string", "null"] }
          }
        },
        "special_instructions": {
          "type": "object",
          "required": ["suggested_options", "selected_pictogram_id"],
          "properties": {
            "suggested_options": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["pictogram_id", "label"],
                "properties": {
                  "pictogram_id": { "type": "string" },
                  "label": { "type": "string" }
                }
              }
            },
            "selected_pictogram_id": { "type": ["string", "null"] }
          }
        }
      }
    }
  }
};

async function parseMedicationLabel(ocrText) {
  const prompt = `
    Extract medication information from the following OCR text.
    Return the data strictly following this JSON schema: ${JSON.stringify(MEDICATION_SCHEMA)}
    
    Instructions:
    1. The 'raw_text' field MUST be the exact text provided below.
    2. For 'suggested_options', provide 2-3 logical options based on the text.
    3. Set 'selected_pictogram_id' to the best match from the suggested options.
    4. Ensure 'pictogram_id' is a slug-style string (e.g., 'morning-1', '2-pills').
    
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
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    const imageBase64 = req.file.buffer.toString('base64');

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
