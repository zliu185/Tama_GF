"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDialogue = buildDialogue;
exports.recalcPetState = recalcPetState;
exports.applyPetAction = applyPetAction;
const constants_1 = require("./constants");
function clamp(value) {
    return Math.max(constants_1.MIN_STAT, Math.min(constants_1.MAX_STAT, Math.round(value)));
}
function toHours(deltaMinutes) {
    return deltaMinutes / 60;
}
function deriveStage(ageDays, xp) {
    if (ageDays < 1)
        return 'egg';
    if (ageDays < 4 || xp < 20)
        return 'baby';
    if (ageDays < 10 || xp < 80)
        return 'child';
    return 'adult';
}
function buildDialogue(pet) {
    if (pet.health <= 30 || pet.is_sick)
        return '我有点不舒服，能陪陪我吗？';
    if (pet.hunger <= 25)
        return '我有点饿了……';
    if (pet.energy <= 25)
        return '想睡觉了……';
    if (pet.mood >= 75)
        return '今天好开心！';
    if (pet.cleanliness <= 30)
        return '我想洗香香。';
    if (pet.is_sleeping)
        return '呼噜呼噜，睡得很香。';
    return '有你在，我就很安心。';
}
function recalcPetState(inputPet, nowDate = new Date()) {
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
        pet.hunger = clamp(pet.hunger - constants_1.DECAY_RATES_PER_HOUR.hungerSleeping * hours);
        pet.energy = clamp(pet.energy + constants_1.DECAY_RATES_PER_HOUR.energySleeping * hours);
    }
    else {
        pet.hunger = clamp(pet.hunger - constants_1.DECAY_RATES_PER_HOUR.hungerAwake * hours);
        pet.mood = clamp(pet.mood - constants_1.DECAY_RATES_PER_HOUR.mood * hours);
        pet.cleanliness = clamp(pet.cleanliness - constants_1.DECAY_RATES_PER_HOUR.cleanliness * hours);
        pet.energy = clamp(pet.energy - constants_1.DECAY_RATES_PER_HOUR.energyAwake * hours);
    }
    const lowStats = [pet.hunger, pet.mood, pet.cleanliness, pet.energy].filter((value) => value <= constants_1.LOW_THRESHOLD).length;
    if (lowStats >= 2) {
        pet.health = clamp(pet.health - constants_1.HEALTH_RATES_PER_HOUR.decline * hours);
    }
    else {
        pet.health = clamp(pet.health + constants_1.HEALTH_RATES_PER_HOUR.recover * hours);
    }
    pet.is_sick = pet.health <= 35 || lowStats >= 3;
    pet.age_days = Math.floor((nowDate.getTime() - new Date(pet.created_at).getTime()) / 86400000);
    pet.stage = deriveStage(pet.age_days, pet.xp);
    pet.last_calculated_at = now;
    pet.updated_at = now;
    return pet;
}
function applyPetAction(inputPet, action, nowDate = new Date()) {
    const pet = recalcPetState(inputPet, nowDate);
    const now = nowDate.toISOString();
    const effect = constants_1.ACTION_EFFECTS[action];
    const delta = {};
    if (action === 'play' && pet.is_sleeping) {
        pet.is_sleeping = false;
        delta.is_sleeping = false;
    }
    for (const [key, rawValue] of Object.entries(effect)) {
        if (typeof rawValue === 'boolean') {
            pet[key] = rawValue;
            delta[key] = rawValue;
            continue;
        }
        const currentValue = Number(pet[key] ?? 0);
        const nextValue = clamp(currentValue + rawValue);
        pet[key] = nextValue;
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
function buildActionNote(action) {
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
