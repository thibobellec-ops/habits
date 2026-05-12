// ── Utilitaires stats & couleurs ──────────────────────────────────

export function fmt(date) {
  return date.toISOString().split('T')[0];
}

export function getDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

/** Streak de jours consécutifs à 100% */
export function calcStreak(checkins, space, habitIds) {
  if (!habitIds.length) return 0;
  function rate(dateKey) {
    const day = checkins[dateKey]?.[space];
    if (!day) return null;
    return habitIds.filter(id => day[id]).length / habitIds.length;
  }
  const todayKey = fmt(new Date());
  const todayRate = rate(todayKey);
  let s = 0;
  const d = new Date(); d.setDate(d.getDate() - 1);
  while (true) {
    const r = rate(fmt(d));
    if (r === null || r < 1) break;
    s++; d.setDate(d.getDate() - 1);
  }
  return todayRate === 1 ? s + 1 : s;
}

/** Score global = total de coches toutes sections */
export function calcScore(checkins) {
  let total = 0;
  Object.values(checkins).forEach(day => {
    Object.values(day).forEach(spaceDay => {
      Object.values(spaceDay).forEach(v => { if (v) total++; });
    });
  });
  return total;
}

export function getLevel(score) {
  if (score >= 200) return 'legendaire';
  if (score >= 50)  return 'adulte';
  return 'lionceau';
}
export function getLevelLabel(level) {
  return { lionceau: 'LIONCEAU', adulte: 'ADULTE', legendaire: 'LEGENDAIRE' }[level];
}

// ── Couleurs par espace ───────────────────────────────────────────
export function accentColor(space) {
  return space === 'pro' ? '#3CBCFC' : '#FC9838';
}
export function accentDark(space) {
  return space === 'pro' ? '#0074B8' : '#C05000';
}

// ── Couleurs flashy par section ───────────────────────────────────
export function sectionColor(tab) {
  return { today: '#F8D000', history: '#FC5252', dashboard: '#5AC54F', avatar: '#B070F8' }[tab] || '#F8D000';
}
export function sectionDark(tab) {
  return { today: '#A86000', history: '#C00000', dashboard: '#2D7B23', avatar: '#6020A0' }[tab] || '#A86000';
}
export function sectionLight(tab) {
  return { today: '#FFF8CC', history: '#FFE0E0', dashboard: '#E0FFE0', avatar: '#F0E0FF' }[tab] || '#FFF8CC';
}
