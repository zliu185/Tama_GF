import { PetActionResult, PetActionType, Pet } from './types';
import { applyPetAction } from './engine';

export function runPetAction(pet: Pet, action: PetActionType, nowDate: Date = new Date()): PetActionResult {
  return applyPetAction(pet, action, nowDate);
}
