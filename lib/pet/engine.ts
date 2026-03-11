import {
  ACTION_EFFECTS,
  DECAY_RATES_PER_HOUR,
  HEALTH_RATES_PER_HOUR,
  LOW_THRESHOLD,
  MAX_STAT,
  MIN_STAT
} from './constants';
import { Pet, PetActionResult, PetActionType, PetStage } from './types';

function clamp(value: number): number {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, Math.round(value)));
}

function toHours(deltaMinutes: number): number {
  return deltaMinutes / 60;
}

function deriveStage(ageDays: number, xp: number): PetStage {
  if (ageDays < 1) return 'egg';
  if (ageDays < 4 || xp < 20) return 'baby';
  if (ageDays < 10 || xp < 80) return 'child';
  return 'adult';
}

export function buildDialogue(pet: Pet): string {
  if (pet.health <= 30 || pet.is_sick) return '我有点不舒服，能陪陪我吗？';
  if (pet.hunger <= 25) return '我有点饿了……';
  if (pet.energy <= 25) return '想睡觉了……';
  if (pet.mood >= 75) return '今天好开心！';
  if (pet.cleanliness <= 30) return '我想洗香香。';
  if (pet.is_sleeping) return '呼噜呼噜，睡得很香。';
  return '有你在，我就很安心。';
}

export function recalcPetState(inputPet: Pet, nowDate: Date = new Date()): Pet {
  const pet = { ...inputPet };
  const now = nowDate.toISOString();
  const lastCalculated = new Date(pet.last_calculated_at).getTime();
  const deltaMs = Math.max(0, nowDate.getTime() - lastCalculated);
  const deltaMinutes = deltaMs / 60000;

  if (deltaMinutes <= 0) {
    const ageDays = Math.floor((nowDate.getTime() - new Date(pet.created_at).getTime()) / 86400000);
    return {
      ...pet,
      age_days: ageDays,
      stage: deriveStage(ageDays, pet.xp)
    };
  }

  const hours = toHours(deltaMinutes);

  if (pet.is_sleeping) {
    pet.hunger = clamp(pet.hunger - DECAY_RATES_PER_HOUR.hungerSleeping * hours);
    pet.energy = clamp(pet.energy + DECAY_RATES_PER_HOUR.energySleeping * hours);
  } else {
    pet.hunger = clamp(pet.hunger - DECAY_RATES_PER_HOUR.hungerAwake * hours);
    pet.mood = clamp(pet.mood - DECAY_RATES_PER_HOUR.mood * hours);
    pet.cleanliness = clamp(pet.cleanliness - DECAY_RATES_PER_HOUR.cleanliness * hours);
    pet.energy = clamp(pet.energy - DECAY_RATES_PER_HOUR.energyAwake * hours);
  }

  const lowStats = [pet.hunger, pet.mood, pet.cleanliness, pet.energy].filter((value) => value <= LOW_THRESHOLD).length;
  if (lowStats >= 2) {
    pet.health = clamp(pet.health - HEALTH_RATES_PER_HOUR.decline * hours);
  } else {
    pet.health = clamp(pet.health + HEALTH_RATES_PER_HOUR.recover * hours);
  }

  pet.is_sick = pet.health <= 35 || lowStats >= 3;
  pet.age_days = Math.floor((nowDate.getTime() - new Date(pet.created_at).getTime()) / 86400000);
  pet.stage = deriveStage(pet.age_days, pet.xp);
  pet.last_calculated_at = now;
  pet.updated_at = now;

  return pet;
}

export function applyPetAction(inputPet: Pet, action: PetActionType, nowDate: Date = new Date()): PetActionResult {
  const pet = recalcPetState(inputPet, nowDate);
  const now = nowDate.toISOString();
  const effect = ACTION_EFFECTS[action];
  const delta: Record<string, number | boolean | string | null> = {};

  if (action === 'play' && pet.is_sleeping) {
    pet.is_sleeping = false;
    delta.is_sleeping = false;
  }

  for (const [key, rawValue] of Object.entries(effect)) {
    if (typeof rawValue === 'boolean') {
      (pet as unknown as Record<string, unknown>)[key] = rawValue;
      delta[key] = rawValue;
      continue;
    }

    const currentValue = Number((pet as unknown as Record<string, unknown>)[key] ?? 0);
    const nextValue = clamp(currentValue + rawValue);
    (pet as unknown as Record<string, unknown>)[key] = nextValue;
    delta[key] = nextValue - currentValue;
  }

  if (action === 'feed') {
    pet.last_fed_at = now;
    delta.last_fed_at = now;
  }
  if (action === 'play') {
    pet.last_played_at = now;
    delta.last_played_at = now;
  }
  if (action === 'clean') {
    pet.last_cleaned_at = now;
    delta.last_cleaned_at = now;
  }
  if (action === 'sleep') {
    pet.last_slept_at = now;
    delta.last_slept_at = now;
  }

  pet.last_calculated_at = now;
  pet.updated_at = now;

  const rebalanced = recalcPetState(pet, nowDate);

  return {
    pet: rebalanced,
    delta,
    note: buildActionNote(action)
  };
}

function buildActionNote(action: PetActionType): string {
  switch (action) {
    case 'feed':
      return '吃饱饱了，谢谢你喂我。';
    case 'play':
      return '和你玩真开心！';
    case 'clean':
      return '洗香香完成，心情变好了。';
    case 'sleep':
      return '晚安，我先睡一会。';
    case 'wake':
      return '早安，我醒来啦。';
    default:
      return '收到你的照顾了。';
  }
}
