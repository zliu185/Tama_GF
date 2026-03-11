const { recalcPetState, applyPetAction } = require('./engine.js');

function makePet(overrides = {}) {
  const now = new Date('2026-03-10T00:00:00.000Z').toISOString();
  return {
    id: 'p1',
    user_id: 'u1',
    name: 'Mochi',
    stage: 'egg',
    hunger: 80,
    mood: 80,
    energy: 80,
    cleanliness: 80,
    health: 100,
    xp: 0,
    age_days: 0,
    is_sleeping: false,
    is_sick: false,
    last_fed_at: null,
    last_played_at: null,
    last_cleaned_at: null,
    last_slept_at: null,
    last_calculated_at: now,
    created_at: now,
    updated_at: now,
    ...overrides
  };
}

function assert(name, condition) {
  if (!condition) {
    throw new Error(`FAIL: ${name}`);
  }
  console.log(`PASS: ${name}`);
}

const base = makePet();

const after1hAwake = recalcPetState(base, new Date('2026-03-10T01:00:00.000Z'));
assert('awake hunger -6/h', after1hAwake.hunger === 74);
assert('awake mood -4/h', after1hAwake.mood === 76);
assert('awake cleanliness -3/h', after1hAwake.cleanliness === 77);
assert('awake energy -5/h', after1hAwake.energy === 75);

const sleepingPet = makePet({ is_sleeping: true });
const after1hSleep = recalcPetState(sleepingPet, new Date('2026-03-10T01:00:00.000Z'));
assert('sleep hunger slower drop', after1hSleep.hunger === 76);
assert('sleep energy +8/h', after1hSleep.energy === 88);

const lowStatsPet = makePet({ hunger: 10, mood: 10, cleanliness: 10, energy: 10, health: 50 });
const lowAfter1h = recalcPetState(lowStatsPet, new Date('2026-03-10T01:00:00.000Z'));
assert('health declines when multiple low stats', lowAfter1h.health === 48);
assert('is_sick true when low stats severe', lowAfter1h.is_sick === true);

const fed = applyPetAction(makePet({ hunger: 10, mood: 20 }), 'feed', new Date('2026-03-10T00:10:00.000Z')).pet;
assert('feed increases hunger', fed.hunger >= 29);
assert('feed increases mood', fed.mood >= 24);

const played = applyPetAction(makePet({ mood: 50, energy: 50 }), 'play', new Date('2026-03-10T00:10:00.000Z')).pet;
assert('play increases mood', played.mood >= 64);
assert('play decreases energy', played.energy <= 42);
assert('play adds xp', played.xp === 4);

const cleaned = applyPetAction(makePet({ cleanliness: 10, mood: 40 }), 'clean', new Date('2026-03-10T00:10:00.000Z')).pet;
assert('clean increases cleanliness', cleaned.cleanliness >= 39);
assert('clean increases mood', cleaned.mood >= 42);

const slept = applyPetAction(makePet({ is_sleeping: false }), 'sleep', new Date('2026-03-10T00:10:00.000Z')).pet;
assert('sleep sets is_sleeping true', slept.is_sleeping === true);

const woke = applyPetAction(makePet({ is_sleeping: true }), 'wake', new Date('2026-03-10T00:10:00.000Z')).pet;
assert('wake sets is_sleeping false', woke.is_sleeping === false);

const evolved = recalcPetState(makePet(), new Date('2026-03-11T00:00:00.000Z'));
assert('egg evolves to baby at age >= 1 day', evolved.stage === 'baby');
