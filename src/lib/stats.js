// ── Utilitaires de stats ──────────────────────────────────────────

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

/** Calcule le streak de jours consécutifs à 100% pour un espace donné */
export function calcStreak(checkins, space, habitIds) {
  if (!habitIds.length) return 0;

  function rate(dateKey) {
    const day = checkins[dateKey]?.[space];
    if (!day) return null;
    const done = habitIds.filter(id => day[id]).length;
    return done / habitIds.length;
  }

  const todayKey = fmt(new Date());
  const todayRate = rate(todayKey);
  let s = 0;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  while (true) {
    const r = rate(fmt(d));
    if (r === null || r < 1) break;
    s++;
    d.setDate(d.getDate() - 1);
  }
  return todayRate === 1 ? s + 1 : s;
}

/** Score global = total coches sur tous les espaces et toute la durée */
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

/** Couleur principale selon l'espace */
export function accentColor(space) {
  return space === 'pro' ? '#4a7cff' : '#20c060';
}
export function accentDark(space) {
  return space === 'pro' ? '#1a2860' : '#0a3020';
}
export function accentSecondary(space) {
  return space === 'pro' ? '#7c3aed' : '#ff7020';
}
