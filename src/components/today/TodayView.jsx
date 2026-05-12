import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayKey } from '../../data/storage';
import HabitItem from './HabitItem';

function groupByCategory(habits) {
  return habits.reduce((acc, h) => {
    if (!acc[h.category]) acc[h.category] = [];
    acc[h.category].push(h);
    return acc;
  }, {});
}

function formatTodayDate() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function TodayView({ space }) {
  const { store, dispatch } = useApp();
  const todayKey = getTodayKey();

  const habits = useMemo(() =>
    store.habits[space].filter(h => !h.archived),
    [store.habits, space]
  );

  const checkins = store.checkins[todayKey]?.[space] || {};
  const total = habits.length;
  const done = habits.filter(h => checkins[h.id]).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done === total && total > 0;
  const grouped = groupByCategory(habits);

  function handleToggle(habitId) {
    dispatch({ type: 'TOGGLE_CHECKIN', space, habitId, date: todayKey });
  }

  const dateStr = formatTodayDate();
  const cap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

      {/* Header date */}
      <div className="animate-fade-up delay-1" style={{ marginBottom: 28 }}>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#A8A29E', marginBottom: 6,
        }}>
          Aujourd'hui
        </p>
        <h1 style={{
          fontFamily: 'Fraunces, serif',
          fontWeight: 700, fontSize: 'clamp(26px, 5vw, 34px)',
          letterSpacing: '-0.03em', color: '#1C1917', lineHeight: 1.1,
        }}>
          {cap}
        </h1>
      </div>

      {/* Score */}
      <div className="card animate-fade-up delay-2" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: '#57534E' }}>
            Score du jour
          </span>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, color: allDone ? '#15803D' : '#1C1917', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {done}
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 500, color: '#A8A29E', marginLeft: 2 }}>
              /{total}
            </span>
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 5, background: '#F0EDE8', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: allDone ? '#15803D' : '#B45309',
            borderRadius: 99,
            transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#A8A29E', marginTop: 6 }}>
          {pct}% — {total - done} restante{total - done !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Congrats */}
      {allDone && (
        <div className="animate-fade-up card" style={{
          padding: '14px 18px', marginBottom: 20,
          background: 'rgba(21,128,61,0.05)',
          borderColor: 'rgba(21,128,61,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>✦</span>
          <div>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 15, color: '#15803D' }}>
              Journée parfaite !
            </p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#57534E', marginTop: 1 }}>
              Toutes tes habitudes sont complétées. Continue comme ça !
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(grouped).length === 0 && (
        <div className="card animate-fade-up delay-3" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: '#A8A29E' }}>
            Aucune habitude active. Clique sur "Gérer" pour en ajouter.
          </p>
        </div>
      )}

      {/* Habit groups */}
      {Object.entries(grouped).map(([category, catHabits], ci) => {
        const catDone = catHabits.filter(h => checkins[h.id]).length;
        return (
          <div
            key={category}
            className={`card animate-fade-up delay-${Math.min(ci + 3, 4)}`}
            style={{ marginBottom: 12, overflow: 'hidden' }}
          >
            {/* Category header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px 10px',
              borderBottom: '1px solid #F0EDE8',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: '#B45309', flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.09em', textTransform: 'uppercase', color: '#57534E',
                }}>
                  {category}
                </span>
              </div>
              <span style={{
                fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 13,
                color: catDone === catHabits.length ? '#15803D' : '#A8A29E',
              }}>
                {catDone}/{catHabits.length}
              </span>
            </div>
            <div style={{ padding: '4px 4px' }}>
              {catHabits.map(habit => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  checked={!!checkins[habit.id]}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
