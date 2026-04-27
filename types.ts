export interface PictogramOption {
  pictogram_id: string;
  label: string;
}

export interface CategoryData {
  suggested_options: PictogramOption[];
  selected_pictogram_id: string | null;
}

export interface GeminiResponse {
  raw_text: string;
  medication_name: string;
  pictogram_categories: {
    time_of_day: CategoryData;
    dosage: CategoryData;
    special_instructions: CategoryData;
  };
}

export interface LabelRecord extends GeminiResponse {
  id: string;
  created_at: string;
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
