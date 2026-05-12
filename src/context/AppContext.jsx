import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { loadStore, saveStore, getTodayKey } from '../data/storage';

const AppContext = createContext(null);

function reducer(state, action) {
  let next;

  switch (action.type) {
    case 'TOGGLE_CHECKIN': {
      const { space, habitId, date } = action;
      const dateKey = date || getTodayKey();
      const existing = state.checkins[dateKey]?.[space]?.[habitId];
      next = {
        ...state,
        checkins: {
          ...state.checkins,
          [dateKey]: {
            ...state.checkins[dateKey],
            [space]: {
              ...state.checkins[dateKey]?.[space],
              [habitId]: !existing,
            },
          },
        },
      };
      break;
    }
    case 'ADD_HABIT': {
      const { space, habit } = action;
      next = {
        ...state,
        habits: {
          ...state.habits,
          [space]: [...state.habits[space], habit],
        },
      };
      break;
    }
    case 'UPDATE_HABIT': {
      const { space, habit } = action;
      next = {
        ...state,
        habits: {
          ...state.habits,
          [space]: state.habits[space].map(h => h.id === habit.id ? habit : h),
        },
      };
      break;
    }
    case 'REORDER_HABITS': {
      const { space, habits } = action;
      next = { ...state, habits: { ...state.habits, [space]: habits } };
      break;
    }
    default:
      return state;
  }

  // Sauvegarde synchrone dans le reducer, avant même le re-render
  try { saveStore(next); } catch {}
  return next;
}

export function AppProvider({ children }) {
  const [store, dispatch] = useReducer(reducer, null, loadStore);

  // Ref toujours à jour — utilisée par le beforeunload
  const storeRef = useRef(store);
  storeRef.current = store;

  // Filet de sécurité : sauvegarde avant fermeture de l'onglet/page
  useEffect(() => {
    const save = () => { try { saveStore(storeRef.current); } catch {} };
    window.addEventListener('beforeunload', save);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') save();
    });
    return () => {
      window.removeEventListener('beforeunload', save);
    };
  }, []);

  return (
    <AppContext.Provider value={{ store, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
