import { createContext, useContext, useEffect, useReducer, useState, useCallback } from 'react';
import {
  fetchHabits, fetchCheckins, seedDefaultHabits,
  upsertHabit, toggleCheckin, onAuthChange, getUser,
} from '../lib/db';
import { getTodayKey } from '../data/storage';
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

  // ── Dispatch wrappé : optimistic UI + sync Supabase ─────────────────────
  const dispatch = useCallback(async (action) => {
    // Mise à jour optimiste immédiate (UI réactive)
    rawDispatch(action);

    if (!user) return;

    // Sync en background
    try {
      switch (action.type) {
        case 'TOGGLE_CHECKIN': {
          const { space, habitId, date } = action;
          // Lit la valeur APRÈS le dispatch optimiste (inverse de l'actuelle)
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
      console.error('Erreur sync Supabase:', err);
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
