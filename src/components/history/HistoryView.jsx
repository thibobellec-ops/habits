import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fmt, getDays, sectionColor, sectionDark } from '../../lib/stats';

const SEC    = sectionColor('history');  // #FC5252
const SEC_DK = sectionDark('history');   // #C00000

function heatColor(rate) {
  if (rate === null) return '#f8f0f0';
  if (rate === 0)    return '#fde8e8';
  if (rate < 0.33)  return `${SEC}44`;
  if (rate < 0.66)  return `${SEC}88`;
  if (rate < 1)     return `${SEC}cc`;
  return SEC;
}

function TableView({ days, habits, checkins, space }) {
  const active = habits.filter(h => !h.archived);
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: Math.max(400, days.length * 36 + 200) }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left', padding: '6px 12px',
              fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0',
              width: 180, position: 'sticky', left: 0, background: '#fff',
              borderBottom: `2px solid #f0f0f8`,
            }}>
              HABITUDE
            </th>
            {days.map(d => (
              <th key={d.toISOString()} style={{
                padding: '6px 2px',
                fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#9090b0',
                textAlign: 'center', minWidth: 30,
                borderBottom: `2px solid #f0f0f8`,
              }}>
                <div>{d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2).toUpperCase()}</div>
                <div style={{ color: '#c0c0d8' }}>{d.getDate()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {active.length === 0 && (
            <tr>
              <td colSpan={days.length + 1} style={{ padding: 24, textAlign: 'center', fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#9090b0' }}>
                AUCUNE HABITUDE
              </td>
            </tr>
          )}
          {active.map(habit => (
            <tr key={habit.id} style={{ borderTop: '1px solid #f0f0f8' }}>
              <td style={{
                padding: '6px 10px',
                fontFamily: "'Press Start 2P',monospace", fontSize: 6,
                color: '#4a4a6e', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                position: 'sticky', left: 0, background: '#fff',
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
                      background: !has ? '#f8f0f0' : val ? `${SEC}18` : 'rgba(252,82,82,0.06)',
                      border: `1px solid ${!has ? '#e8e8f0' : val ? SEC : '#FC525244'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Press Start 2P',monospace", fontSize: 9,
                    }}>
                      {has && (val
                        ? <span style={{ color: SEC }}>✓</span>
                        : <span style={{ color: '#FC525288' }}>✗</span>
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

function HeatmapView({ days, habits, checkins, space }) {
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
          <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#4a4a6e', marginBottom: 8, letterSpacing: '0.08em' }}>
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
                    background: heatColor(rate),
                    border: key === todayKey ? `2px solid ${SEC}` : '1px solid #e8e0e0',
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
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#9090b0' }}>0%</span>
        {[null, 0, 0.25, 0.65, 1].map((r, i) => (
          <div key={i} style={{ width: 12, height: 12, background: heatColor(r), border: '1px solid #e8e0e0', imageRendering: 'pixelated' }} />
        ))}
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#9090b0' }}>100%</span>
      </div>
    </div>
  );
}

export default function HistoryView({ space }) {
  const { store }  = useApp();
  const [view, setView] = useState('SEMAINE');
  const n          = view === 'SEMAINE' ? 7 : view === 'MOIS' ? 30 : 90;
  const days       = useMemo(() => getDays(n), [n]);
  const views      = ['SEMAINE', 'MOIS', '90J'];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>

      <div className="animate-fade-up delay-1" style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: SEC, letterSpacing: '0.1em', marginBottom: 8 }}>
          ▶ HISTORIQUE
        </p>
        <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: '#1a1a2e', marginBottom: 18 }}>
          ARCHIVE
        </h1>
        {/* Toggle vue */}
        <div style={{ display: 'flex', gap: 0, background: '#f8f0f0', border: `3px solid ${SEC}`, boxShadow: `3px 3px 0 ${SEC_DK}`, width: 'fit-content' }}>
          {views.map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 14px', border: 'none', cursor: 'pointer',
              fontFamily: "'Press Start 2P',monospace", fontSize: 7,
              background: view === v ? SEC : 'transparent',
              color: view === v ? '#fff' : '#9090b0',
              transition: 'all 0.15s',
            }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="card animate-fade-up delay-2" style={{ padding: '18px 14px', borderColor: `${SEC}88` }}>
        {view === '90J'
          ? <HeatmapView days={days} habits={store.habits[space]} checkins={store.checkins} space={space} />
          : <TableView   days={days} habits={store.habits[space]} checkins={store.checkins} space={space} />
        }
      </div>
    </div>
  );
}
