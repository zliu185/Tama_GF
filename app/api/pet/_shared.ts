import { NextResponse } from 'next/server';
import { DEFAULT_PET_NAME, DEFAULT_USER_ID } from '@/lib/pet/constants';
import { buildDialogue, recalcPetState } from '@/lib/pet/engine';
import { runPetAction } from '@/lib/pet/actions';
import { Pet, PetActionType } from '@/lib/pet/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const DEFAULT_EASTER_EGG_MESSAGE = '宝宝我爱你 - ZL';

function asPet(record: Record<string, unknown>): Pet {
  return {
    id: String(record.id),
    user_id: String(record.user_id),
    name: String(record.name),
    stage: record.stage as Pet['stage'],
    hunger: Number(record.hunger),
    mood: Number(record.mood),
    energy: Number(record.energy),
    cleanliness: Number(record.cleanliness),
    health: Number(record.health),
    xp: Number(record.xp),
    age_days: Number(record.age_days),
    is_sleeping: Boolean(record.is_sleeping),
    is_sick: Boolean(record.is_sick),
    last_fed_at: (record.last_fed_at as string | null) ?? null,
    last_played_at: (record.last_played_at as string | null) ?? null,
    last_cleaned_at: (record.last_cleaned_at as string | null) ?? null,
    last_slept_at: (record.last_slept_at as string | null) ?? null,
    last_calculated_at: String(record.last_calculated_at),
    created_at: String(record.created_at),
    updated_at: String(record.updated_at)
  };
}

export async function ensureSingleUserAndPet(): Promise<Pet> {
  const supabase = createSupabaseServerClient();

  const { error: userError } = await supabase.from('users_profile').upsert(
    {
      id: DEFAULT_USER_ID,
      nickname: 'Gift User'
    },
    { onConflict: 'id' }
  );

  if (userError) {
    throw new Error(`Failed to ensure user: ${userError.message}`);
  }

  const { data: existingPet, error: selectError } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to read pet: ${selectError.message}`);
  }

  if (existingPet) {
    return asPet(existingPet as Record<string, unknown>);
  }

  const now = new Date().toISOString();
  const { data: created, error: createError } = await supabase
    .from('pets')
    .insert({
      user_id: DEFAULT_USER_ID,
      name: DEFAULT_PET_NAME,
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
      last_calculated_at: now
    })
    .select('*')
    .single();

  if (createError || !created) {
    throw new Error(`Failed to create default pet: ${createError?.message ?? 'Unknown error'}`);
  }

  return asPet(created as Record<string, unknown>);
}

async function persistPet(nextPet: Pet): Promise<Pet> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('pets')
    .update({
      name: nextPet.name,
      stage: nextPet.stage,
      hunger: nextPet.hunger,
      mood: nextPet.mood,
      energy: nextPet.energy,
      cleanliness: nextPet.cleanliness,
      health: nextPet.health,
      xp: nextPet.xp,
      age_days: nextPet.age_days,
      is_sleeping: nextPet.is_sleeping,
      is_sick: nextPet.is_sick,
      last_fed_at: nextPet.last_fed_at,
      last_played_at: nextPet.last_played_at,
      last_cleaned_at: nextPet.last_cleaned_at,
      last_slept_at: nextPet.last_slept_at,
      last_calculated_at: nextPet.last_calculated_at,
      updated_at: nextPet.updated_at
    })
    .eq('id', nextPet.id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to save pet: ${error?.message ?? 'Unknown error'}`);
  }

  return asPet(data as Record<string, unknown>);
}

export function resolveNow(request: Request): Date {
  const rawNow = new URL(request.url).searchParams.get('now');
  if (!rawNow) {
    return new Date();
  }

  const parsedNow = new Date(rawNow);
  if (Number.isNaN(parsedNow.getTime())) {
    return new Date();
  }

  return parsedNow;
}

export async function getCurrentPetState(nowDate: Date = new Date()) {
  const pet = await ensureSingleUserAndPet();
  const recalced = recalcPetState(pet, nowDate);
  const saved = await persistPet(recalced);

  return {
    pet: saved,
    dialogue: buildDialogue(saved)
  };
}

export async function applyAction(action: PetActionType, nowDate: Date = new Date()) {
  const supabase = createSupabaseServerClient();
  const pet = await ensureSingleUserAndPet();
  const { pet: nextPet, delta, note } = runPetAction(pet, action, nowDate);
  const saved = await persistPet(nextPet);

  const { error: actionLogError } = await supabase.from('pet_actions').insert({
    pet_id: saved.id,
    action_type: action,
    delta,
    note
  });

  if (actionLogError) {
    throw new Error(`Failed to write action log: ${actionLogError.message}`);
  }

  return {
    pet: saved,
    dialogue: buildDialogue(saved),
    note
  };
}

export async function getEasterEggMessage(): Promise<string> {
  const supabase = createSupabaseServerClient();
  const pet = await ensureSingleUserAndPet();

  const { data, error } = await supabase
    .from('special_events')
    .select('payload')
    .eq('pet_id', pet.id)
    .eq('event_type', 'easter_egg_message')
    .eq('title', 'love_note')
    .order('trigger_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read easter egg message: ${error.message}`);
  }

  const payload = (data?.payload ?? null) as Record<string, unknown> | null;
  const customMessage = typeof payload?.message === 'string' ? payload.message : null;
  if (customMessage && customMessage.trim().length > 0) {
    return customMessage;
  }

  const { error: insertError } = await supabase.from('special_events').insert({
    pet_id: pet.id,
    event_type: 'easter_egg_message',
    title: 'love_note',
    payload: { message: DEFAULT_EASTER_EGG_MESSAGE },
    trigger_at: new Date().toISOString(),
    consumed_at: null
  });

  if (insertError) {
    throw new Error(`Failed to seed easter egg message: ${insertError.message}`);
  }

  return DEFAULT_EASTER_EGG_MESSAGE;
}

export function okJson<T>(payload: T) {
  return NextResponse.json(payload, { status: 200 });
}

export function errorJson(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown server error';
  return NextResponse.json({ error: message }, { status: 500 });
}
