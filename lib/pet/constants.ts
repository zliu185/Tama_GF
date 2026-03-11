import { PetActionType } from './types';

export const MAX_STAT = 100;
export const MIN_STAT = 0;

export const DECAY_RATES_PER_HOUR = {
  hungerAwake: 6,
  hungerSleeping: 3.6,
  mood: 4,
  cleanliness: 3,
  energyAwake: 5,
  energySleeping: 8
} as const;

export const HEALTH_RATES_PER_HOUR = {
  decline: 2,
  recover: 1
} as const;

export const LOW_THRESHOLD = 20;

export const ACTION_EFFECTS: Record<PetActionType, Record<string, number | boolean>> = {
  feed: {
    hunger: 20,
    mood: 5
  },
  play: {
    mood: 15,
    energy: -8,
    xp: 4
  },
  clean: {
    cleanliness: 30,
    mood: 3
  },
  sleep: {
    is_sleeping: true
  },
  wake: {
    is_sleeping: false
  }
};

export const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? '00000000-0000-0000-0000-000000000001';
export const DEFAULT_PET_NAME = 'Mochi';
