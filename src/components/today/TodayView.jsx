import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fmt } from '../../lib/stats';
import { accentColor, accentSecondary } from '../../lib/stats';
import HabitItem from './HabitItem';

function groupByCategory(habits) {
  return habits.reduce((acc, h) => {
    if (!acc[h.category]) acc[h.category] = [];
    acc[h.category].push(h);
    return acc;
  }, {});
}

function formatTodayDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).toUpperCase();
}

export default function TodayView({ space }) {
  const { store, dispatch } = useApp();
  const todayKey = fmt(new Date());
  const accent   = accentColor(space);
  const secondary = accentSecondary(space);

  const habits   = useMemo(() => store.habits[space].filter(h => !h.archived), [store.habits, space]);
  const checkins = store.checkins[todayKey]?.[space] || {};
  const total    = habits.length;
  const done     = habits.filter(h => checkins[h.id]).length;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone  = done === total && total > 0;
  const grouped  = groupByCategory(habits);

  function handleToggle(habitId) {
    dispatch({ type: 'TOGGLE_CHECKIN', space, habitId, date: todayKey });
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

      {/* Date */}
      <div className="animate-fade-up delay-1" style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: accent, letterSpacing: '0.1em', marginBottom: 8 }}>
          ▶ AUJOURD'HUI
        </p>
        <h1 style={{
          fontFamily: "'Press Start 2P',monospace",
          fontSize: 'clamp(9px, 2.5vw, 13px)',
          color: '#e0e0ff', letterSpacing: '0.02em', lineHeight: 1.6,
        }}>
          {formatTodayDate()}
        </h1>
      </div>

      {/* Score card */}
      <div className="animate-fade-up delay-2" style={{
        padding: '16px 18px', marginBottom: 16,
        background: '#13132a', border: `2px solid ${accent}`,
        boxShadow: `4px 4px 0 #000`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#5a5a8a' }}>
            SCORE
          </span>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 22, color: allDone ? '#20ff80' : accent }}>
            {done}<span style={{ fontSize: 11, color: '#3a3a6a' }}>/{total}</span>
          </span>
        </div>

        {/* Progress bar style pixel */}
        <div style={{ height: 14, background: '#0a0a1a', border: `2px solid ${accent}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: allDone ? '#20ff80' : accent,
            transition: 'width 0.4s steps(20)',
          }} />
          {/* Quadrillage pixel sur la barre */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${(i + 1) * 10}%`, top: 0, bottom: 0,
              width: 1, background: 'rgba(0,0,0,0.3)',
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#fff', textShadow: '1px 1px 0 #000',
          }}>
            {pct}%
          </div>
        </div>

        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#3a3a5a', marginTop: 8 }}>
          {total - done} RESTANTE{total - done !== 1 ? 'S' : ''}
        </p>
      </div>

      {/* Congrats */}
      {allDone && (
        <div className="animate-fade-up" style={{
          padding: '14px 18px', marginBottom: 16,
          background: 'rgba(32,255,128,0.06)',
          border: '2px solid #20ff80',
          boxShadow: '4px 4px 0 #000',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20, animation: 'pxBlink 1.2s infinite' }}>★</span>
          <div>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#20ff80', marginBottom: 4 }}>
              PERFECT DAY !
            </p>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#3a3a5a' }}>
              TOUTES LES HABITUDES COMPLETEES
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(grouped).length === 0 && (
        <div className="card animate-fade-up delay-3" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#3a3a5a', lineHeight: 2 }}>
            AUCUNE HABITUDE.<br />CLIQUE SUR GERER.
          </p>
        </div>
      )}

      {/* Groupes par catégorie */}
      {Object.entries(grouped).map(([category, catHabits], ci) => {
        const catDone  = catHabits.filter(h => checkins[h.id]).length;
        const catTotal = catHabits.length;
        const catOk    = catDone === catTotal;

        return (
          <div
            key={category}
            className={`animate-fade-up delay-${Math.min(ci + 3, 4)}`}
            style={{
              marginBottom: 12,
              background: '#13132a',
              border: `2px solid ${catOk ? '#20ff80' : '#2a2a4a'}`,
              boxShadow: `4px 4px 0 #000`,
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Catégorie header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px 8px',
              borderBottom: `1px solid #1a1a3a`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 12, background: accent, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'Press Start 2P',monospace",
                  fontSize: 7, color: accent,
                  letterSpacing: '0.06em',
                }}>
                  {category.toUpperCase()}
                </span>
              </div>
              <span style={{
                fontFamily: "'Press Start 2P',monospace",
                fontSize: 9,
                color: catOk ? '#20ff80' : '#3a3a6a',
              }}>
                {catDone}/{catTotal}
              </span>
            </div>

            {/* Habitudes */}
            <div style={{ padding: '4px 2px' }}>
              {catHabits.map(habit => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  checked={!!checkins[habit.id]}
                  onToggle={handleToggle}
                  accent={accent}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
