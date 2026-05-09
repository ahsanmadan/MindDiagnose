export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface Symptom {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface CategoryGroup {
  category: string;
  symptoms: Symptom[];
}

export interface DiagnosisResult {
  disease: {
    id: string;
    code: string;
    name: string;
    threshold: number;
  };
  score_percentage: number;
  is_above_threshold: boolean;
  matched_symptoms: Array<{
    code: string;
    name: string;
    weight: number;
    type: string;
  }>;
}

export interface DiagnosisResponse {
  consultation_id: string;
  results: DiagnosisResult[];
}

export async function fetchSymptoms(): Promise<CategoryGroup[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/symptoms/`);
    if (!res.ok) throw new Error('Failed to fetch symptoms');
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return [];
  }
}

export async function submitDiagnosis(symptomIds: string[]): Promise<DiagnosisResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/diagnose/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptom_ids: symptomIds }),
    });
    
    if (!res.ok) throw new Error('Failed to submit diagnosis');
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error submitting diagnosis:', error);
    return null;
  }
}
