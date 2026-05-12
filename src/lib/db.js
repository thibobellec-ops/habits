/**
 * Toutes les opérations Supabase centralisées ici.
 * Chaque fonction retourne { data, error }.
 */
import { supabase } from './supabase';
import { DEFAULT_HABITS } from '../data/defaultHabits';

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function sendMagicLink(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export async function fetchHabits(userId) {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('order', { ascending: true });
  return { data, error };
}

export async function seedDefaultHabits(userId) {
  // Appelé au premier login pour pré-remplir les habitudes
  const rows = [];
  ['pro', 'perso'].forEach(space => {
    DEFAULT_HABITS[space].forEach(h => {
      rows.push({
        id: h.id,
        user_id: userId,
        space,
        name: h.name,
        category: h.category,
        type: h.type,
        archived: h.archived,
        order: h.order,
      });
    });
  });

  return supabase.from('habits').upsert(rows, { onConflict: 'id' });
}

export async function upsertHabit(userId, space, habit) {
  return supabase.from('habits').upsert({
    id: habit.id,
    user_id: userId,
    space,
    name: habit.name,
    category: habit.category,
    type: habit.type,
    archived: habit.archived,
    order: habit.order,
  }, { onConflict: 'id' });
}

// ─── Checkins ────────────────────────────────────────────────────────────────

export async function fetchCheckins(userId) {
  // Récupère les 90 derniers jours
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceStr = since.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('checkins')
    .select('habit_id, date, space, done')
    .eq('user_id', userId)
    .gte('date', sinceStr);

  if (error) return { data: {}, error };

  // Transforme en format { 'YYYY-MM-DD': { pro: { id: bool }, perso: { id: bool } } }
  const result = {};
  data.forEach(({ habit_id, date, space, done }) => {
    if (!result[date]) result[date] = {};
    if (!result[date][space]) result[date][space] = {};
    result[date][space][habit_id] = done;
  });

  return { data: result, error: null };
}

export async function toggleCheckin(userId, space, habitId, date, value) {
  return supabase.from('checkins').upsert({
    user_id: userId,
    habit_id: habitId,
    space,
    date,
    done: value,
  }, { onConflict: 'user_id,habit_id,date' });
}
