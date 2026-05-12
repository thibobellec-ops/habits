import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fmt, getDays, calcStreak, sectionColor, sectionDark } from '../../lib/stats';

const SEC    = sectionColor('dashboard');  // #5AC54F
const SEC_DK = sectionDark('dashboard');   // #2D7B23

function heatColor(rate) {
  if (rate === null) return '#e8f8e8';
  if (rate === 0)    return '#f0f8f0';
  if (rate < 0.33)  return `${SEC}44`;
  if (rate < 0.66)  return `${SEC}88`;
  if (rate < 1)     return `${SEC}cc`;
  return SEC;
}

const STREAK_MILESTONES = [7, 14, 30, 100];

function StreakBarMini({ streak }) {
  const max = Math.max(100, streak + 10);
  const pct = Math.min((streak / max) * 100, 100);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#4a4a6e' }}>🔥 STREAK</span>
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: SEC }}>{streak}J</span>
      </div>
      <div style={{ position: 'relative', height: 18, background: '#f0f8f0', border: `2px solid ${SEC}`, boxShadow: `3px 3px 0 ${SEC_DK}` }}>
        <div style={{ height: '100%', width: `${pct}%`, background: SEC, transition: 'width 0.5s steps(20)' }} />
        {STREAK_MILESTONES.filter(m => m <= max).map(m => (
          <div key={m} style={{
            position: 'absolute', left: `${(m / max) * 100}%`, top: -2, bottom: -2,
            width: 3, background: streak >= m ? '#F8D000' : '#d0d0e0', zIndex: 2,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#fff', textShadow: '1px 1px 0 #0004', zIndex: 3,
        }}>
          {streak} JOURS
        </div>
      </div>
      <div style={{ position: 'relative', height: 16, marginTop: 4 }}>
        {STREAK_MILESTONES.filter(m => m <= max).map(m => (
          <span key={m} style={{
            position: 'absolute', left: `${(m / max) * 100}%`, transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P',monospace", fontSize: 5,
            color: streak >= m ? '#F8D000' : '#c0c0d8',
            animation: streak === m ? 'pxMilestone 0.8s ease-out' : 'none',
          }}>{m}J</span>
        ))}
      </div>
    </div>
  );
}

function KPI({ label, value, suffix }) {
  return (
    <div style={{
      padding: '14px 12px', flex: '1 1 100px', minWidth: 0,
      background: '#ffffff', border: `3px solid ${SEC}`, boxShadow: `3px 3px 0 ${SEC_DK}`,
    }}>
      <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, letterSpacing: '0.08em', color: '#9090b0', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 18, color: '#1a1a2e', lineHeight: 1 }}>
        {value}
        {suffix && <span style={{ fontSize: 10, color: SEC }}>{suffix}</span>}
      </p>
    </div>
  );
}

const CustomTip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div style={{ background: '#fff', border: `2px solid ${SEC}`, boxShadow: `3px 3px 0 ${SEC_DK}`, padding: '8px 12px' }}>
      <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: SEC }}>{payload[0].value}%</p>
    </div>
  ) : null;

export default function DashboardView({ space }) {
  const { store }  = useApp();
  const habits     = store.habits[space].filter(h => !h.archived);
  const ids        = habits.map(h => h.id);
  const { checkins } = store;
  const todayKey   = fmt(new Date());

  function rate(dateKey) {
    const day = checkins[dateKey]?.[space];
    if (!day || !ids.length) return null;
    return ids.filter(id => day[id]).length / ids.length;
  }

  const todayDone = ids.filter(id => checkins[todayKey]?.[space]?.[id]).length;
  const streak    = useMemo(() => calcStreak(checkins, space, ids), [checkins, space, ids]);

  const last7  = getDays(7);
  const last30 = getDays(30);
  const days90 = getDays(90);

  function avgRate(days) {
    const rs = days.map(d => rate(fmt(d))).filter(r => r !== null);
    return rs.length ? Math.round(rs.reduce((a, b) => a + b, 0) / rs.length * 100) : 0;
  }

  const rate7  = useMemo(() => avgRate(last7),  [checkins, space]);
  const rate30 = useMemo(() => avgRate(last30), [checkins, space]);

  const chartData = useMemo(() => last30.map(d => ({
    date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    taux: (() => { const r = rate(fmt(d)); return r !== null ? Math.round(r * 100) : null; })(),
  })), [checkins, space]);

  const habitStats = useMemo(() => habits.map(h => {
    const rs = last30.map(d => { const day = checkins[fmt(d)]?.[space]; return day ? (day[h.id] ? 1 : 0) : null; }).filter(r => r !== null);
    return { name: h.name, pct: rs.length ? Math.round(rs.reduce((a, b) => a + b, 0) / rs.length * 100) : 0 };
  }), [checkins, space]);

  const top3    = [...habitStats].sort((a, b) => b.pct - a.pct).slice(0, 3);
  const bottom3 = [...habitStats].sort((a, b) => a.pct - b.pct).slice(0, 3);
  const cats    = [...new Set(habits.map(h => h.category))];

  const catStats = useMemo(() => cats.map(cat => {
    const cids = habits.filter(h => h.category === cat).map(h => h.id);
    const rs = last30.map(d => {
      const day = checkins[fmt(d)]?.[space];
      return day ? cids.filter(id => day[id]).length / cids.length : null;
    }).filter(r => r !== null);
    return { category: cat, pct: rs.length ? Math.round(rs.reduce((a, b) => a + b, 0) / rs.length * 100) : 0 };
  }), [checkins, space]);

  const months = useMemo(() => {
    const res = []; let cur = null, grp = [];
    days90.forEach(d => {
      const m = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      if (m !== cur) { if (grp.length) res.push({ label: cur, days: grp }); cur = m; grp = [d]; } else grp.push(d);
    });
    if (grp.length) res.push({ label: cur, days: grp });
    return res;
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>

      <div className="animate-fade-up delay-1" style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: SEC, letterSpacing: '0.1em', marginBottom: 8 }}>
          📊 STATISTIQUES
        </p>
        <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: '#1a1a2e' }}>DASHBOARD</h1>
      </div>

      {/* KPIs */}
      <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <KPI label="🎯 TODAY"   value={`${todayDone}/${habits.length}`} />
        <KPI label="📅 7J"      value={rate7}  suffix="%" />
        <KPI label="🗓️ 30J"    value={rate30} suffix="%" />
      </div>

      {/* Streak bar */}
      <div className="animate-fade-up delay-2" style={{
        padding: '18px 20px', marginBottom: 14,
        background: '#ffffff', border: `3px solid ${SEC}`, boxShadow: `4px 4px 0 ${SEC_DK}`,
      }}>
        <StreakBarMini streak={streak} />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
          {[{ l: '1SEM', d: 7 }, { l: '2SEM', d: 14 }, { l: '1MOIS', d: 30 }, { l: '100J', d: 100 }].map(({ l, d }) => (
            <div key={d} style={{ textAlign: 'center' }}>
              <div style={{
                width: 24, height: 24, margin: '0 auto 4px',
                border: `2px solid ${streak >= d ? '#F8D000' : '#d0d0e0'}`,
                background: streak >= d ? 'rgba(248,208,0,0.12)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              }}>{streak >= d ? '⭐' : '○'}</div>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: streak >= d ? '#F8D000' : '#c0c0d8' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 30j */}
      <div className="card animate-fade-up delay-2" style={{ padding: '18px 14px 12px', marginBottom: 12 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#9090b0', marginBottom: 14 }}>
          📈 EVOLUTION — 30J
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#e8f0e8" />
            <XAxis dataKey="date" tick={{ fill: '#9090b0', fontSize: 7, fontFamily: "'Press Start 2P',monospace" }} tickLine={false} interval={4} />
            <YAxis domain={[0, 100]} tick={{ fill: '#9090b0', fontSize: 7, fontFamily: "'Press Start 2P',monospace" }} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTip />} />
            <Line type="stepAfter" dataKey="taux" stroke={SEC} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: SEC, strokeWidth: 0 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap 90j */}
      <div className="card animate-fade-up delay-3" style={{ padding: '18px 16px', marginBottom: 12 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#9090b0', marginBottom: 14 }}>
          🗺️ HEATMAP — 90J
        </p>
        {months.map(({ label, days: mDays }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#4a4a6e', marginBottom: 6, letterSpacing: '0.06em' }}>
              {label.toUpperCase()}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {mDays.map(d => {
                const key = fmt(d);
                const day = checkins[key]?.[space];
                const r   = (day && ids.length) ? ids.filter(id => day[id]).length / ids.length : null;
                return (
                  <div key={key}
                    title={`${d.toLocaleDateString('fr-FR')} — ${r !== null ? Math.round(r * 100) + '%' : '—'}`}
                    style={{
                      width: 14, height: 14,
                      background: heatColor(r),
                      border: key === todayKey ? `2px solid ${SEC}` : '1px solid #e0e0e8',
                      cursor: 'default',
                      imageRendering: 'pixelated',
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Top / Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 12 }}>
        <div className="card animate-fade-up delay-3" style={{ padding: '16px' }}>
          <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: SEC, marginBottom: 12 }}>🏆 TOP</p>
          {top3.length === 0
            ? <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0' }}>PAS DE DONNEES</p>
            : top3.map((h, i) => (
              <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#4a4a6e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {['🥇','🥈','🥉'][i]} {h.name}
                </span>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: SEC, flexShrink: 0 }}>{h.pct}%</span>
              </div>
            ))
          }
        </div>
        <div className="card animate-fade-up delay-4" style={{ padding: '16px' }}>
          <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#FC5252', marginBottom: 12 }}>💪 A AMELIORER</p>
          {bottom3.length === 0
            ? <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0' }}>PAS DE DONNEES</p>
            : bottom3.map((h, i) => (
              <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#4a4a6e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {i + 1}. {h.name}
                </span>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#FC5252', flexShrink: 0 }}>{h.pct}%</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Par catégorie */}
      <div className="card animate-fade-up delay-4" style={{ padding: '16px', marginBottom: 20 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0', marginBottom: 14 }}>🗂️ PAR CATEGORIE — 30J</p>
        {catStats.length === 0
          ? <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0' }}>PAS DE DONNEES</p>
          : catStats.map(({ category, pct }) => (
            <div key={category} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#4a4a6e' }}>{category.toUpperCase()}</span>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: SEC }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: '#f0f8f0', border: `1px solid ${SEC}88`, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: SEC, transition: 'width 0.5s steps(20)' }} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
