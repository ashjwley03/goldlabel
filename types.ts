export interface PictogramOption {
  pictogram_id: string;
  label: string;
}

export interface CategoryData {
  suggested_options: PictogramOption[];
  selected_pictogram_id: string | null;
}

export interface GeminiResponse {
  raw_ocr_reference: string;
  medication_name: string;
  language: string;
  pictogram_categories: {
    how_to_take: string | null;
    side_effects: string | null;
    duration: string | null;
    dosage: string | null;
    time_of_day: string | null;
    precautions: string | null;
  };
}

export interface LabelRecord extends GeminiResponse {
  id: string;
  created_at: string;
  verification_status?: 'verified' | 'rejected' | 'needs_review' | null;
}

export interface OptionSelection {
  optionId: string;
  variantId: string;
}

// Kept for compatibility with ConfigureLabel/PrintPreview flow
export interface MedicationRecord {
  id: string;
  name: string;
  dosage: { amount: number; unit: string };
  timing: { morning: boolean; noon: boolean; night: boolean };
  withFood: boolean | null;
  instructions: string;
  scannedAt: Date;
  imageUrl?: string;
}

