"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PET_NAME = exports.DEFAULT_USER_ID = exports.ACTION_EFFECTS = exports.LOW_THRESHOLD = exports.HEALTH_RATES_PER_HOUR = exports.DECAY_RATES_PER_HOUR = exports.MIN_STAT = exports.MAX_STAT = void 0;
exports.MAX_STAT = 100;
exports.MIN_STAT = 0;
exports.DECAY_RATES_PER_HOUR = {
    hungerAwake: 6,
    hungerSleeping: 3.6,
    mood: 4,
    cleanliness: 3,
    energyAwake: 5,
    energySleeping: 8
};
exports.HEALTH_RATES_PER_HOUR = {
    decline: 2,
    recover: 1
};
exports.LOW_THRESHOLD = 20;
exports.ACTION_EFFECTS = {
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
exports.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? '00000000-0000-0000-0000-000000000001';
exports.DEFAULT_PET_NAME = 'Mochi';
