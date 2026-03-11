export type PetStage = 'egg' | 'baby' | 'child' | 'adult';

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  stage: PetStage;
  hunger: number;
  mood: number;
  energy: number;
  cleanliness: number;
  health: number;
  xp: number;
  age_days: number;
  is_sleeping: boolean;
  is_sick: boolean;
  last_fed_at: string | null;
  last_played_at: string | null;
  last_cleaned_at: string | null;
  last_slept_at: string | null;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export type PetActionType = 'feed' | 'play' | 'clean' | 'sleep' | 'wake';

export interface PetActionResult {
  pet: Pet;
  delta: Record<string, number | boolean | string | null>;
  note: string;
}

export interface PetStateResponse {
  pet: Pet;
  dialogue: string;
}
