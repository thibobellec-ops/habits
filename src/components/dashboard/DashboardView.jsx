import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function fmt(d) { return d.toISOString().split('T')[0]; }
function getDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return d;
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

function KPI({ label, value, suffix, sub }) {
  return (
    <div className="card" style={{ padding: '16px 18px', flex: '1 1 120px', minWidth: 0 }}>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#A8A29E', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 'clamp(22px, 4vw, 30px)', color: '#1C1917', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
        {suffix && <span style={{ fontSize: 16, color: '#B45309', marginLeft: 2 }}>{suffix}</span>}
      </p>
      {sub && <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#A8A29E', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

export default function DashboardView({ space }) {
  const { store } = useApp();
  const habits = store.habits[space].filter(h => !h.archived);
  const ids = habits.map(h => h.id);
  const { checkins } = store;
  const todayKey = fmt(new Date());

  function rate(dateKey) {
    const day = checkins[dateKey]?.[space];
    if (!day || !ids.length) return null;
    return ids.filter(id => day[id]).length / ids.length;
  }

  const todayDone = ids.filter(id => checkins[todayKey]?.[space]?.[id]).length;
  const todayRate = rate(todayKey);

  const streak = useMemo(() => {
    let s = 0;
    const d = new Date(); d.setDate(d.getDate() - 1);
    while (true) {
      const r = rate(fmt(d));
      if (r === null || r < 1) break;
      s++; d.setDate(d.getDate() - 1);
    }
    return todayRate === 1 ? s + 1 : s;
  }, [checkins, space]);

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

  const cats = [...new Set(habits.map(h => h.category))];
  const catStats = useMemo(() => cats.map(cat => {
    const cids = habits.filter(h => h.category === cat).map(h => h.id);
    const rs = last30.map(d => { const day = checkins[fmt(d)]?.[space]; return day ? cids.filter(id => day[id]).length / cids.length : null; }).filter(r => r !== null);
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

  const CustomTip = ({ active, payload, label }) => active && payload?.length ? (
    <div style={{ background: '#fff', border: '1.5px solid #E5E2DC', borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#A8A29E', marginBottom: 2 }}>{label}</p>
      <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20, color: '#B45309' }}>{payload[0].value}%</p>
    </div>
  ) : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
      <h1 className="animate-fade-up delay-1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 'clamp(24px, 5vw, 32px)', letterSpacing: '-0.03em', color: '#1C1917', marginBottom: 20 }}>
        Dashboard
      </h1>

      {/* KPIs */}
      <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <KPI label="Aujourd'hui"    value={`${todayDone}/${habits.length}`} />
        <KPI label="Streak"         value={streak}  suffix="j" />
        <KPI label="7 jours"        value={rate7}   suffix="%" />
        <KPI label="30 jours"       value={rate30}  suffix="%" />
      </div>

      {/* Chart */}
      <div className="card animate-fade-up delay-2" style={{ padding: '20px 16px 12px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 700, color: '#57534E', marginBottom: 14, paddingLeft: 4 }}>
          Évolution — 30 jours
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="date" tick={{ fill: '#A8A29E', fontSize: 10, fontFamily: 'Space Grotesk' }} tickLine={false} interval={4} />
            <YAxis domain={[0, 100]} tick={{ fill: '#A8A29E', fontSize: 10, fontFamily: 'Space Grotesk' }} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTip />} />
            <Line type="monotone" dataKey="taux" stroke="#B45309" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#D97706', strokeWidth: 0 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="card animate-fade-up delay-3" style={{ padding: '20px 16px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 700, color: '#57534E', marginBottom: 14 }}>
          Heatmap — 90 jours
        </p>
        {months.map(({ label, days: mDays }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700, color: '#A8A29E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {mDays.map(d => {
                const key = fmt(d);
                const day = checkins[key]?.[space];
                const r = (day && ids.length) ? ids.filter(id => day[id]).length / ids.length : null;
                return (
                  <div key={key} title={`${d.toLocaleDateString('fr-FR')} — ${r !== null ? Math.round(r * 100) + '%' : '—'}`}
                    style={{ width: 15, height: 15, borderRadius: 3, background: heatColor(r), border: key === todayKey ? '2px solid #B45309' : '1px solid rgba(0,0,0,0.05)', cursor: 'default' }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Top + Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 14 }}>
        <div className="card animate-fade-up delay-3" style={{ padding: '18px 16px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15803D', marginBottom: 12 }}>
            ↑ Meilleures
          </p>
          {top3.length === 0
            ? <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#A8A29E' }}>Pas encore de données.</p>
            : top3.map((h, i) => (
              <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 8 }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#57534E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {i + 1}. {h.name}
                </span>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: '#15803D', flexShrink: 0 }}>{h.pct}%</span>
              </div>
            ))
          }
        </div>
        <div className="card animate-fade-up delay-4" style={{ padding: '18px 16px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#DC2626', marginBottom: 12 }}>
            ↓ À améliorer
          </p>
          {bottom3.length === 0
            ? <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#A8A29E' }}>Pas encore de données.</p>
            : bottom3.map((h, i) => (
              <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 8 }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: '#57534E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {i + 1}. {h.name}
                </span>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: '#DC2626', flexShrink: 0 }}>{h.pct}%</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Categories */}
      <div className="card animate-fade-up delay-4" style={{ padding: '18px 16px', marginBottom: 20 }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#57534E', marginBottom: 16 }}>
          Par catégorie — 30 jours
        </p>
        {catStats.length === 0
          ? <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#A8A29E' }}>Pas encore de données.</p>
          : catStats.map(({ category, pct }) => (
            <div key={category} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600, color: '#57534E' }}>{category}</span>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14, color: '#B45309' }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: '#F0EDE8', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#B45309', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
