import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fmt, sectionColor, sectionDark } from '../../lib/stats';
import HabitItem from './HabitItem';

const SEC    = sectionColor('today');   // #F8D000
const SEC_DK = sectionDark('today');    // #A86000
const GREEN    = '#5AC54F';
const GREEN_DK = '#2D7B23';

function groupByCategory(habits) {
  return habits.reduce((acc, h) => {
    if (!acc[h.category]) acc[h.category] = [];
    acc[h.category].push(h);
    return acc;
  }, {});
}

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).toUpperCase();
}

function getSelectedDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d;
}

export default function TodayView({ space }) {
  const { store, dispatch } = useApp();
  const [dayOffset, setDayOffset] = useState(0);

  const isToday  = dayOffset === 0;
  const selDate  = getSelectedDate(dayOffset);
  const selKey   = fmt(selDate);

  const habits   = useMemo(() => store.habits[space].filter(h => !h.archived), [store.habits, space]);
  const checkins = store.checkins[selKey]?.[space] || {};
  const total    = habits.length;
  const done     = habits.filter(h => checkins[h.id]).length;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone  = done === total && total > 0;
  const grouped  = groupByCategory(habits);

  function handleToggle(habitId) {
    dispatch({ type: 'TOGGLE_CHECKIN', space, habitId, date: selKey });
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

      {/* Date + navigation */}
      <div className="animate-fade-up delay-1" style={{ marginBottom: 20 }}>
        <p style={{
          fontFamily: "'Press Start 2P',monospace", fontSize: 6,
          color: SEC, letterSpacing: '0.1em', marginBottom: 10,
        }}>
          {isToday ? '📅 AUJOURD\'HUI' : '🗓️ JOUR PRECEDENT'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setDayOffset(o => Math.max(o - 1, -30))}
            disabled={dayOffset <= -30}
            style={{
              padding: '6px 10px', border: `2px solid ${SEC}`,
              background: dayOffset <= -30 ? 'transparent' : `${SEC}22`,
              color: dayOffset <= -30 ? '#c0c0d8' : SEC_DK,
              fontFamily: "'Press Start 2P',monospace", fontSize: 9,
              cursor: dayOffset <= -30 ? 'not-allowed' : 'pointer',
              boxShadow: dayOffset <= -30 ? 'none' : `2px 2px 0 ${SEC_DK}`,
              transition: 'all 0.1s',
            }}
          >◀</button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: "'Press Start 2P',monospace",
              fontSize: 'clamp(8px, 2vw, 12px)',
              color: '#1a1a2e', letterSpacing: '0.02em', lineHeight: 1.6,
            }}>
              {formatDate(selDate)}
            </h1>
            {!isToday && (
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#9090b0', marginTop: 4 }}>
                J{dayOffset} · MAX -30J
              </p>
            )}
          </div>

          <button
            onClick={() => setDayOffset(o => Math.min(o + 1, 0))}
            disabled={dayOffset >= 0}
            style={{
              padding: '6px 10px', border: `2px solid ${SEC}`,
              background: dayOffset >= 0 ? 'transparent' : `${SEC}22`,
              color: dayOffset >= 0 ? '#c0c0d8' : SEC_DK,
              fontFamily: "'Press Start 2P',monospace", fontSize: 9,
              cursor: dayOffset >= 0 ? 'not-allowed' : 'pointer',
              boxShadow: dayOffset >= 0 ? 'none' : `2px 2px 0 ${SEC_DK}`,
              transition: 'all 0.1s',
            }}
          >▶</button>

          {!isToday && (
            <button
              onClick={() => setDayOffset(0)}
              style={{
                padding: '6px 8px', border: `2px solid ${SEC}`,
                background: SEC, color: '#1a1a2e',
                fontFamily: "'Press Start 2P',monospace", fontSize: 6,
                cursor: 'pointer', boxShadow: `2px 2px 0 ${SEC_DK}`,
              }}
            >📅 TODAY</button>
          )}
        </div>
      </div>

      {/* Score card */}
      <div className="animate-fade-up delay-2" style={{
        padding: '16px 18px', marginBottom: 16,
        background: '#ffffff', border: `3px solid ${GREEN}`,
        boxShadow: `4px 4px 0 ${GREEN_DK}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#9090b0' }}>🎯 SCORE</span>
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 22, color: allDone ? GREEN : '#1a1a2e' }}>
            {done}<span style={{ fontSize: 11, color: '#c0c0d8' }}>/{total}</span>
          </span>
        </div>

        {/* Barre verte */}
        <div style={{ height: 14, background: '#f0f8f0', border: `2px solid ${GREEN}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: GREEN,
            transition: 'width 0.4s steps(20)',
          }} />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${(i + 1) * 10}%`, top: 0, bottom: 0,
              width: 1, background: 'rgba(255,255,255,0.6)',
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: pct > 40 ? '#fff' : GREEN_DK,
            textShadow: pct > 40 ? '1px 1px 0 #0004' : 'none',
          }}>
            {pct}%
          </div>
        </div>

        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0', marginTop: 8 }}>
          {total - done === 0
            ? '🌟 TOUTES COMPLETEES !'
            : `⏳ ${total - done} RESTANTE${total - done !== 1 ? 'S' : ''}`}
        </p>
      </div>

      {/* Congrats */}
      {allDone && (
        <div className="animate-fade-up" style={{
          padding: '14px 18px', marginBottom: 16,
          background: 'rgba(90,197,79,0.08)',
          border: `3px solid ${GREEN}`,
          boxShadow: `4px 4px 0 ${GREEN_DK}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24, animation: 'pxBlink 1.2s infinite' }}>🏆</span>
          <div>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: GREEN_DK, marginBottom: 4 }}>
              PERFECT {isToday ? 'DAY' : 'JOUR'} !
            </p>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#4a4a6e' }}>
              TOUTES LES HABITUDES COMPLETEES ⭐
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(grouped).length === 0 && (
        <div className="card animate-fade-up delay-3" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#9090b0', lineHeight: 2 }}>
            🌱 AUCUNE HABITUDE.<br />CLIQUE SUR GERER.
          </p>
        </div>
      )}

      {/* Groupes par catégorie */}
      {Object.entries(grouped).map(([category, catHabits], ci) => {
        const catDone  = catHabits.filter(h => checkins[h.id]).length;
        const catTotal = catHabits.length;
        const catOk    = catDone === catTotal && catTotal > 0;

        return (
          <div
            key={category}
            className={`animate-fade-up delay-${Math.min(ci + 3, 4)}`}
            style={{
              marginBottom: 12,
              background: '#ffffff',
              border: `3px solid ${catOk ? GREEN : '#d0d0e0'}`,
              boxShadow: `4px 4px 0 ${catOk ? GREEN_DK : '#0002'}`,
              overflow: 'hidden',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px 8px',
              borderBottom: '1px solid #f0f0f8',
              background: catOk ? 'rgba(90,197,79,0.06)' : `${SEC}11`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 12, background: catOk ? GREEN : SEC, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'Press Start 2P',monospace",
                  fontSize: 7, color: catOk ? GREEN_DK : SEC_DK,
                  letterSpacing: '0.06em',
                }}>
                  {catOk ? '✅' : '📋'} {category.toUpperCase()}
                </span>
              </div>
              <span style={{
                fontFamily: "'Press Start 2P',monospace",
                fontSize: 9,
                color: catOk ? GREEN : '#9090b0',
              }}>
                {catDone}/{catTotal}
              </span>
            </div>

            <div style={{ padding: '4px 2px' }}>
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
