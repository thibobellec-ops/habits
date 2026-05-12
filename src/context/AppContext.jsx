import { createContext, useContext, useEffect, useReducer, useState, useCallback } from 'react';
import {
  fetchHabits, fetchCheckins, seedDefaultHabits,
  upsertHabit, toggleCheckin, onAuthChange, getUser,
} from '../lib/db';
import { supabase } from '../lib/supabase';
import { DEFAULT_HABITS } from '../data/defaultHabits';

const AppContext = createContext(null);

// ─── State shape ─────────────────────────────────────────────────────────────
const EMPTY_STORE = {
  habits: { pro: [], perso: [] },
  checkins: {},
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STORE':
      return action.payload;

    case 'TOGGLE_CHECKIN': {
      const { space, habitId, date } = action;
      const existing = state.checkins[date]?.[space]?.[habitId];
      return {
        ...state,
        checkins: {
          ...state.checkins,
          [date]: {
            ...state.checkins[date],
            [space]: {
              ...state.checkins[date]?.[space],
              [habitId]: !existing,
            },
          },
        },
      };
    }

    case 'ADD_HABIT': {
      const { space, habit } = action;
      return {
        ...state,
        habits: {
          ...state.habits,
          [space]: [...state.habits[space], habit],
        },
      };
    }

    case 'UPDATE_HABIT': {
      const { space, habit } = action;
      return {
        ...state,
        habits: {
          ...state.habits,
          [space]: state.habits[space].map(h => h.id === habit.id ? habit : h),
        },
      };
    }

    case 'REALTIME_CHECKIN': {
      // Mise à jour d'un checkin reçu depuis Supabase Realtime
      const { habit_id, date, space, done } = action.payload;
      return {
        ...state,
        checkins: {
          ...state.checkins,
          [date]: {
            ...state.checkins[date],
            [space]: {
              ...state.checkins[date]?.[space],
              [habit_id]: done,
            },
          },
        },
      };
    }

    case 'REALTIME_HABIT': {
      // Mise à jour d'une habitude reçue depuis Supabase Realtime
      const { habit, space } = action.payload;
      const exists = state.habits[space]?.some(h => h.id === habit.id);
      return {
        ...state,
        habits: {
          ...state.habits,
          [space]: exists
            ? state.habits[space].map(h => h.id === habit.id ? habit : h)
            : [...state.habits[space], habit],
        },
      };
    }

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [store, rawDispatch] = useReducer(reducer, EMPTY_STORE);
  const [user,    setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Chargement initial au login ──────────────────────────────────────────
  const loadUserData = useCallback(async (u) => {
    setLoading(true);
    try {
      // Récupère les habitudes
      let { data: habitsRows } = await fetchHabits(u.id);

      // Premier login → seed avec les habitudes par défaut
      if (!habitsRows || habitsRows.length === 0) {
        await seedDefaultHabits(u.id);
        const { data } = await fetchHabits(u.id);
        habitsRows = data || [];
      }

      // Reconstruit la structure { pro: [...], perso: [...] }
      const habits = { pro: [], perso: [] };
      habitsRows.forEach(row => {
        const space = row.space;
        if (habits[space]) {
          habits[space].push({
            id: row.id, name: row.name, category: row.category,
            type: row.type, archived: row.archived, order: row.order,
          });
        }
      });

      // Récupère les checkins
      const { data: checkins } = await fetchCheckins(u.id);

      rawDispatch({ type: 'SET_STORE', payload: { habits, checkins: checkins || {} } });
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Écoute les changements d'auth ────────────────────────────────────────
  useEffect(() => {
    // Vérifie si déjà connecté
    getUser().then(u => {
      if (u) { setUser(u); loadUserData(u); }
      else    { setLoading(false); }
    });

    // Écoute les changements (magic link callback, logout)
    const { data: { subscription } } = onAuthChange(u => {
      setUser(u);
      if (u) loadUserData(u);
      else   { rawDispatch({ type: 'SET_STORE', payload: EMPTY_STORE }); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ── Supabase Realtime — sync instantané entre appareils ─────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`realtime-${user.id}`)

      // Checkins : coche/décoche sur un autre appareil
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'checkins',
      }, ({ new: row }) => {
        // Filtre côté client pour ne traiter que ses propres données
        if (!row || row.user_id !== user.id) return;
        rawDispatch({
          type: 'REALTIME_CHECKIN',
          payload: { habit_id: row.habit_id, date: row.date, space: row.space, done: row.done },
        });
      })

      // Habits : ajout/modif d'habitude sur un autre appareil
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habits',
      }, ({ new: row }) => {
        if (!row || row.user_id !== user.id) return;
        rawDispatch({
          type: 'REALTIME_HABIT',
          payload: {
            space: row.space,
            habit: {
              id: row.id, name: row.name, category: row.category,
              type: row.type, archived: row.archived, order: row.order,
            },
          },
        });
      })

      .subscribe((status) => {
        console.log('Realtime status:', status);
      });

    return () => supabase.removeChannel(channel);
  }, [user]);

  // ── Rechargement quand l'onglet redevient visible (fallback) ────────────
  useEffect(() => {
    if (!user) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadUserData(user);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, loadUserData]);

  // ── Dispatch wrappé : optimistic UI + sync Supabase ─────────────────────
  const dispatch = useCallback(async (action) => {
    rawDispatch(action);
    if (!user) return;

    // Sync en background
    try {
      switch (action.type) {
        case 'TOGGLE_CHECKIN': {
          const { space, habitId, date } = action;
          const currentVal = store.checkins[date]?.[space]?.[habitId] ?? false;
          await toggleCheckin(user.id, space, habitId, date, !currentVal);
          break;
        }
        case 'ADD_HABIT':
          await upsertHabit(user.id, action.space, action.habit);
          break;
        case 'UPDATE_HABIT':
          await upsertHabit(user.id, action.space, action.habit);
          break;
      }
    } catch (err) {
      console.error('Erreur sync Supabase:', err?.message || err);
    }
  }, [user, store]);

  return (
    <AppContext.Provider value={{ store, dispatch, user, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
