import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

function fmt(date) { return date.toISOString().split('T')[0]; }

function getDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

function heatColor(rate) {
  if (rate === null) return '#F0EDE8';
  if (rate === 0)    return '#E5E2DC';
  if (rate < 0.33)   return '#FDE68A';
  if (rate < 0.66)   return '#D97706';
  if (rate < 1)      return '#B45309';
  return '#92400E';
}

function TableView({ days, habits, checkins, space }) {
  const active = habits.filter(h => !h.archived);
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: Math.max(400, days.length * 36 + 180) }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 12px', color: '#A8A29E', fontSize: 11, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', width: 180, position: 'sticky', left: 0, background: '#fff' }}>
              Habitude
            </th>
            {days.map(d => (
              <th key={d.toISOString()} style={{ padding: '6px 3px', color: '#A8A29E', fontSize: 10, fontWeight: 700, textAlign: 'center', minWidth: 32, fontFamily: 'Space Grotesk, sans-serif' }}>
                <div>{d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2)}</div>
                <div style={{ color: '#C7C3BD', fontWeight: 500 }}>{d.getDate()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {active.length === 0 && (
            <tr><td colSpan={days.length + 1} style={{ padding: 24, textAlign: 'center', color: '#A8A29E', fontSize: 13 }}>Aucune habitude active.</td></tr>
          )}
          {active.map(habit => (
            <tr key={habit.id} style={{ borderTop: '1px solid #F5F2EE' }}>
              <td style={{
                padding: '7px 12px', fontSize: 12, fontFamily: 'Space Grotesk, sans-serif',
                color: '#57534E', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
                  <td key={key} style={{ padding: '4px 3px', textAlign: 'center' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, margin: '0 auto',
                      background: !has ? '#F5F2EE' : val ? 'rgba(21,128,61,0.1)' : 'rgba(220,38,38,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                    }}>
                      {has && (val ? <span style={{ color: '#15803D' }}>✓</span> : <span style={{ color: '#DC2626' }}>✗</span>)}
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
  const ids = habits.filter(h => !h.archived).map(h => h.id);
  const todayKey = fmt(new Date());

  const months = useMemo(() => {
    const result = [];
    let cur = null, group = [];
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
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {mDays.map(d => {
              const key = fmt(d);
              const day = checkins[key]?.[space];
              let rate = null;
              if (day && ids.length) rate = ids.filter(id => day[id]).length / ids.length;
              return (
                <div key={key} title={`${d.toLocaleDateString('fr-FR')} — ${rate !== null ? Math.round(rate * 100) + '%' : '—'}`}
                  style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: heatColor(rate),
                    border: key === todayKey ? '2px solid #B45309' : '1px solid rgba(0,0,0,0.05)',
                    transition: 'transform 0.1s', cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.35)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#A8A29E' }}>0%</span>
        {[null, 0, 0.25, 0.65, 1].map((r, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: heatColor(r), border: '1px solid rgba(0,0,0,0.05)' }} />
        ))}
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#A8A29E' }}>100%</span>
      </div>
    </div>
  );
}

export default function HistoryView({ space }) {
  const { store } = useApp();
  const [view, setView] = useState('Semaine');
  const n = view === 'Semaine' ? 7 : view === 'Mois' ? 30 : 90;
  const days = useMemo(() => getDays(n), [n]);
  const views = ['Semaine', 'Mois', '90 jours'];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
      <div className="animate-fade-up delay-1" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 'clamp(24px, 5vw, 32px)', letterSpacing: '-0.03em', color: '#1C1917', marginBottom: 16 }}>
          Historique
        </h1>
        <div style={{ display: 'flex', gap: 0, background: '#F5F2EE', border: '1.5px solid #E5E2DC', borderRadius: 8, padding: 3, width: 'fit-content' }}>
          {views.map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 12,
              background: view === v ? '#B45309' : 'transparent',
              color: view === v ? '#fff' : '#A8A29E',
              transition: 'all 0.18s',
            }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="card animate-fade-up delay-2" style={{ padding: '20px 16px' }}>
        {view === '90 jours'
          ? <HeatmapView days={days} habits={store.habits[space]} checkins={store.checkins} space={space} />
          : <TableView days={days} habits={store.habits[space]} checkins={store.checkins} space={space} />
        }
      </div>
    </div>
  );
}
