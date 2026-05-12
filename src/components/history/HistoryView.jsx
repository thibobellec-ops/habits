import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fmt, getDays, accentColor } from '../../lib/stats';

function heatColor(rate, accent) {
  if (rate === null) return '#0d0d1a';
  if (rate === 0)    return '#13132a';
  if (rate < 0.33)   return `${accent}44`;
  if (rate < 0.66)   return `${accent}88`;
  if (rate < 1)      return `${accent}cc`;
  return accent;
}

function TableView({ days, habits, checkins, space, accent }) {
  const active = habits.filter(h => !h.archived);
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: Math.max(400, days.length * 36 + 200) }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left', padding: '6px 12px',
              fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#5a5a8a',
              width: 180, position: 'sticky', left: 0, background: '#13132a',
              borderBottom: `1px solid #2a2a4a`,
            }}>
              HABITUDE
            </th>
            {days.map(d => (
              <th key={d.toISOString()} style={{
                padding: '6px 2px',
                fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#5a5a8a',
                textAlign: 'center', minWidth: 30,
                borderBottom: `1px solid #2a2a4a`,
              }}>
                <div>{d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2).toUpperCase()}</div>
                <div style={{ color: '#3a3a5a' }}>{d.getDate()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {active.length === 0 && (
            <tr>
              <td colSpan={days.length + 1} style={{ padding: 24, textAlign: 'center', fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#3a3a5a' }}>
                AUCUNE HABITUDE
              </td>
            </tr>
          )}
          {active.map(habit => (
            <tr key={habit.id} style={{ borderTop: '1px solid #1a1a3a' }}>
              <td style={{
                padding: '6px 10px',
                fontFamily: "'Press Start 2P',monospace", fontSize: 6,
                color: '#9090c0', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                position: 'sticky', left: 0, background: '#13132a',
              }}>
                {habit.name}
              </td>
              {days.map(d => {
                const key = fmt(d);
                const day = checkins[key]?.[space];
                const val = day?.[habit.id];
                const has = day !== undefined;
                return (
                  <td key={key} style={{ padding: '3px 2px', textAlign: 'center' }}>
                    <div style={{
                      width: 22, height: 22, margin: '0 auto',
                      background: !has ? '#0d0d1a' : val ? `${accent}22` : 'rgba(255,64,64,0.1)',
                      border: `1px solid ${!has ? '#1a1a3a' : val ? accent : '#ff404044'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Press Start 2P',monospace", fontSize: 9,
                    }}>
                      {has && (val
                        ? <span style={{ color: accent }}>✓</span>
                        : <span style={{ color: '#ff4040' }}>✗</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeatmapView({ days, habits, checkins, space, accent }) {
  const ids      = habits.filter(h => !h.archived).map(h => h.id);
  const todayKey = fmt(new Date());

  const months = useMemo(() => {
    const result = []; let cur = null, group = [];
    days.forEach(d => {
      const m = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (m !== cur) { if (group.length) result.push({ label: cur, days: group }); cur = m; group = [d]; }
      else group.push(d);
    });
    if (group.length) result.push({ label: cur, days: group });
    return result;
  }, [days]);

  return (
    <div>
      {months.map(({ label, days: mDays }) => (
        <div key={label} style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#3a3a5a', marginBottom: 8, letterSpacing: '0.08em' }}>
            {label.toUpperCase()}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {mDays.map(d => {
              const key  = fmt(d);
              const day  = checkins[key]?.[space];
              let rate   = null;
              if (day && ids.length) rate = ids.filter(id => day[id]).length / ids.length;
              return (
                <div key={key}
                  title={`${d.toLocaleDateString('fr-FR')} — ${rate !== null ? Math.round(rate * 100) + '%' : '—'}`}
                  style={{
                    width: 16, height: 16,
                    background: heatColor(rate, accent),
                    border: key === todayKey ? `2px solid ${accent}` : '1px solid #0a0a1a',
                    imageRendering: 'pixelated', cursor: 'default',
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#3a3a5a' }}>0%</span>
        {[null, 0, 0.25, 0.65, 1].map((r, i) => (
          <div key={i} style={{ width: 12, height: 12, background: heatColor(r, accent), border: '1px solid #0a0a1a', imageRendering: 'pixelated' }} />
        ))}
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#3a3a5a' }}>100%</span>
      </div>
    </div>
  );
}

export default function HistoryView({ space }) {
  const { store }  = useApp();
  const [view, setView] = useState('SEMAINE');
  const accent     = accentColor(space);
  const n          = view === 'SEMAINE' ? 7 : view === 'MOIS' ? 30 : 90;
  const days       = useMemo(() => getDays(n), [n]);
  const views      = ['SEMAINE', 'MOIS', '90J'];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>

      <div className="animate-fade-up delay-1" style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: accent, letterSpacing: '0.1em', marginBottom: 8 }}>
          ▶ HISTORIQUE
        </p>
        <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: '#e0e0ff', marginBottom: 18 }}>
          ARCHIVE
        </h1>
        {/* Toggle vue */}
        <div style={{ display: 'flex', gap: 0, background: '#0d0d1a', border: `2px solid #2a2a4a`, boxShadow: '3px 3px 0 #000', width: 'fit-content' }}>
          {views.map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 14px', border: 'none', cursor: 'pointer',
              fontFamily: "'Press Start 2P',monospace", fontSize: 7,
              background: view === v ? accent : 'transparent',
              color: view === v ? '#fff' : '#3a3a6a',
              transition: 'all 0.15s',
            }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="card animate-fade-up delay-2" style={{ padding: '18px 14px' }}>
        {view === '90J'
          ? <HeatmapView days={days} habits={store.habits[space]} checkins={store.checkins} space={space} accent={accent} />
          : <TableView   days={days} habits={store.habits[space]} checkins={store.checkins} space={space} accent={accent} />
        }
      </div>
    </div>
  );
}
