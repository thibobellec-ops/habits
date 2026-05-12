import { DEFAULT_HABITS } from './defaultHabits';

const STORAGE_KEY = 'habit-tracker-v2';

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // First launch: habits loaded, checkins empty
  const initial = {
    habits: DEFAULT_HABITS,
    checkins: {},
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getTodayKey() {
  return formatDate(new Date());
}
