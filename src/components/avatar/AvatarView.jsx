import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calcScore, calcStreak, getLevel, getLevelLabel, accentColor, accentDark, accentSecondary } from '../../lib/stats';

// ── Palette pixel art ─────────────────────────────────────────────
const PAL = {
  '.': null,
  'd': '#92400e',  // contour mane
  'y': '#fbbf24',  // corps/mane jaune
  'p': '#fef3c7',  // visage pale
  'e': '#1c1917',  // yeux
  'n': '#f43f5e',  // nez
  'r': '#ef4444',  // armure rouge / yeux légendaire
  'G': '#ffd700',  // or
  'M': '#7c3aed',  // magie violet
  'w': '#ffffff',  // blanc
};

// Sprites 16×N
const SPRITES = {
  lionceau: [
    '....dddddd......',
    '...dyyyyyyd.....',
    '..dypppppypd....',
    '..dypeppepyd....',
    '..dypppppypd....',
    '..dyppnpppyd....',
    '..dyypppppyd....',
    '...dyyyyyyd.....',
    '..dyyyyyyyyyd...',
    '..dy.yyyy.yyd...',
    '...ddd...ddd....',
  ],
  adulte: [
    '....dddddd......',
    '...dyyyyyyyy....',
    '..dypppppypd....',
    '..dypeppepyd....',
    '..dypppppypd....',
    '..dyppnpppyd....',
    '..dyypppppyd....',
    '.rrdyyyyyddrr...',
    '.rrryyyyyyyyrrr.',
    '..rryyyyyyyyrr..',
    '..rryyyyyyyrr...',
    '...ry.yyyy.yr...',
    '...dd.....dd....',
  ],
  legendaire: [
    '...GGGG.GGGG....',
    '...GMMMMMMMG....',
    '....dddddddd....',
    '..dypppppypd....',
    '..dyrppppryd....',
    '..dypppppypd....',
    '..dyppnpppyd....',
    '..GGGGGGGGGG....',
    '.MMMyyyyyyyyMMM.',
    '.MGGyyyyyyyyGGM.',
    '.MMMyyyy.yyyMMM.',
    '..AMyyyy.yyyMA..',  // A = Gold (réutilise G)
    '..AddddddddA....',
    '.GGGGG.GGGGG....',
  ],
};
// 'A' dans legendaire = gold aussi
PAL['A'] = '#ffd700';

function PixelSprite({ map, pixelSize = 5 }) {
  const rows = map.length;
  const cols = map[0].length;
  return (
    <svg width={cols * pixelSize} height={rows * pixelSize}
      style={{ imageRendering: 'pixelated', display: 'block' }}>
      {map.flatMap((row, y) =>
        row.split('').map((char, x) => {
          const fill = PAL[char];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x * pixelSize} y={y * pixelSize} width={pixelSize} height={pixelSize} fill={fill} />;
        })
      )}
    </svg>
  );
}

// Décors de fond selon le niveau
function Environment({ level }) {
  const W = 220, H = 110;
  if (level === 'lionceau') return (
    <svg width={W} height={H} style={{ imageRendering: 'pixelated', display: 'block', width: '100%' }}>
      <rect width={W} height={H * 0.65} fill="#0a1e0a" />
      <rect y={H * 0.65} width={W} height={H * 0.35} fill="#0f3010" />
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={i * 10} y={H * 0.65 - 3} width={5} height={7} fill="#1a8030" />
      ))}
      <rect x={165} y={12} width={18} height={18} fill="#ffd700" />
      <rect x={10} y={18} width={45} height={10} fill="#1a3a1a" />
      <rect x={15} y={12} width={35} height={12} fill="#1a3a1a" />
      <rect x={28} y={H * 0.4} width={8} height={H * 0.27} fill="#5a3010" />
      <rect x={19} y={H * 0.2} width={26} height={H * 0.25} fill="#10a030" />
      <rect x={150} y={H * 0.4} width={8} height={H * 0.27} fill="#5a3010" />
      <rect x={141} y={H * 0.2} width={26} height={H * 0.25} fill="#10a030" />
    </svg>
  );

  if (level === 'adulte') return (
    <svg width={W} height={H} style={{ imageRendering: 'pixelated', display: 'block', width: '100%' }}>
      <rect width={W} height={H * 0.72} fill="#08082a" />
      <rect y={H * 0.72} width={W} height={H * 0.28} fill="#13133a" />
      {[[8,8],[28,14],[60,7],[95,18],[135,9],[165,16],[195,10],[40,26],[115,5],[180,22]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={3} height={3} fill={i % 3 === 0 ? '#ffd700' : '#fff'} />
      ))}
      <rect x={150} y={8} width={18} height={18} fill="#ffd700" />
      <rect x={155} y={8} width={13} height={18} fill="#08082a" />
      <rect x={55} y={H * 0.35} width={90} height={H * 0.37} fill="#202050" />
      <rect x={50} y={H * 0.22} width={22} height={H * 0.17} fill="#202050" />
      <rect x={118} y={H * 0.22} width={22} height={H * 0.17} fill="#202050" />
      <rect x={88} y={H * 0.16} width={24} height={H * 0.22} fill="#202050" />
      {[50,62,74,118,130,142].map((x, i) => (
        <rect key={i} x={x} y={H * 0.22 - 8} width={8} height={10} fill="#202050" />
      ))}
      <rect x={92} y={H * 0.16 - 8} width={8} height={10} fill="#202050" />
      <rect x={100} y={H * 0.16 - 8} width={8} height={10} fill="#202050" />
      <rect x={75} y={H * 0.58} width={14} height={H * 0.14} fill="#13102a" />
    </svg>
  );

  return (
    <svg width={W} height={H} style={{ imageRendering: 'pixelated', display: 'block', width: '100%' }}>
      <rect width={W} height={H * 0.76} fill="#18082a" />
      <rect y={H * 0.76} width={W} height={H * 0.24} fill="#28103a" />
      {[[5,5],[22,11],[55,7],[88,4],[125,9],[162,7],[195,13],[38,22],[108,17],[178,20]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={3} height={3} fill={i % 2 === 0 ? '#ffd700' : '#a855f7'} />
      ))}
      {[20,50,80,115,150,180].map((x, i) => (
        <rect key={i} x={x} y={H * 0.72} width={6} height={6} fill={i % 2 === 0 ? '#ffd70088' : '#7c3aed88'} />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={78 + i * 4} y={H * 0.75 - i * 5} width={H * 0.75 - 8} height={i * 5 + 5} fill="#2a1050" />
      ))}
      <rect x={109} y={H * 0.13} width={12} height={12} fill="#ffd700" />
      <rect x={107} y={H * 0.16} width={16} height={6} fill="#ffd70066" />
    </svg>
  );
}

// Jauge de streak avec paliers
const MILESTONES = [7, 14, 30, 100];

function StreakBar({ streak, accent }) {
  const max = Math.max(100, streak + 10);
  const pct = Math.min((streak / max) * 100, 100);

  return (
    <div>
      {/* Barre */}
      <div style={{ position: 'relative', height: 22, background: '#0a0a1a', border: `2px solid ${accent}`, boxShadow: '3px 3px 0 #000' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, transition: 'width 0.6s steps(20)' }} />
        {MILESTONES.filter(m => m <= max).map(m => (
          <div key={m} style={{
            position: 'absolute', left: `${(m / max) * 100}%`,
            top: -2, bottom: -2, width: 3,
            background: streak >= m ? '#ffd700' : '#2a2a4a', zIndex: 2,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#fff', textShadow: '1px 1px 0 #000', zIndex: 3,
        }}>
          {streak} JOURS
        </div>
      </div>
      {/* Labels paliers */}
      <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
        {MILESTONES.filter(m => m <= max).map(m => (
          <span key={m} style={{
            position: 'absolute', left: `${(m / max) * 100}%`, transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P', monospace", fontSize: 6,
            color: streak >= m ? '#ffd700' : '#3a3a5a',
            animation: streak === m ? 'pxMilestone 0.6s ease-out' : 'none',
          }}>{m}J</span>
        ))}
      </div>
    </div>
  );
}

export default function AvatarView({ space }) {
  const { store } = useApp();
  const { checkins } = store;

  const score   = useMemo(() => calcScore(checkins), [checkins]);
  const level   = getLevel(score);
  const accent  = accentColor(space);
  const shadow  = accentDark(space);

  const habits   = store.habits[space].filter(h => !h.archived);
  const habitIds = habits.map(h => h.id);
  const streak   = useMemo(() => calcStreak(checkins, space, habitIds), [checkins, space, habitIds]);

  const nextThreshold = level === 'lionceau' ? 50 : level === 'adulte' ? 200 : null;
  const prevThreshold = level === 'lionceau' ? 0  : level === 'adulte' ? 50  : 200;
  const xpPct = nextThreshold
    ? Math.round(((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;

  const todayKey  = new Date().toISOString().split('T')[0];
  const todayDone = habitIds.filter(id => checkins[todayKey]?.[space]?.[id]).length;

  const sprite = SPRITES[level];

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 8px' }}>

      {/* Titre */}
      <div className="animate-fade-up delay-1" style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: accent, letterSpacing: '0.1em', marginBottom: 8 }}>
          ▶ MON AVATAR
        </p>
        <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: '#e0e0ff' }}>
          {getLevelLabel(level)}
        </h1>
      </div>

      {/* Card avatar */}
      <div className="animate-fade-up delay-2" style={{
        border: `2px solid ${accent}`, boxShadow: `6px 6px 0 ${shadow}`,
        background: '#13132a', marginBottom: 16, overflow: 'hidden',
      }}>
        {/* Décor + sprite */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#0a0a1a' }}>
          <Environment level={level} />
          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)' }}>
            <PixelSprite map={sprite} pixelSize={5} />
          </div>
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: '#000', border: `2px solid ${accent}`, padding: '3px 7px',
            fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: accent,
          }}>
            LVL {level === 'lionceau' ? '01' : level === 'adulte' ? '02' : '03'}
          </div>
          {level === 'legendaire' && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontFamily: "'Press Start 2P',monospace", fontSize: 8,
              animation: 'pxBlink 1s infinite', color: '#ffd700',
            }}>★</div>
          )}
        </div>

        {/* Stats */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'SCORE', value: score, color: '#ffd700' },
              { label: 'STREAK', value: `${streak}J`, color: accent },
              { label: 'TODAY', value: `${todayDone}/${habits.length}`, color: '#20ff80' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '10px 6px', background: '#0a0a1a', border: '1px solid #2a2a4a' }}>
                <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#5a5a8a', marginBottom: 6, letterSpacing: '0.05em' }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 13, color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* XP Bar */}
          {nextThreshold ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#5a5a8a' }}>XP</span>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: accent }}>{score} / {nextThreshold}</span>
              </div>
              <div style={{ height: 14, background: '#0a0a1a', border: `2px solid ${accent}`, position: 'relative', boxShadow: '2px 2px 0 #000' }}>
                <div style={{ height: '100%', width: `${xpPct}%`, background: accent, transition: 'width 0.5s steps(20)' }} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#fff', textShadow: '1px 1px 0 #000',
                }}>{xpPct}%</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px', border: '2px solid #ffd700', background: 'rgba(255,215,0,0.05)' }}>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: '#ffd700', marginBottom: 4 }}>★ NIVEAU MAX ★</p>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#5a5a8a' }}>TU ES LEGENDAIRE</p>
            </div>
          )}
        </div>
      </div>

      {/* Streak */}
      <div className="card animate-fade-up delay-3" style={{ padding: '18px 20px', marginBottom: 14 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: accent, marginBottom: 14 }}>▶ STREAK</p>
        <StreakBar streak={streak} accent={accent} />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14 }}>
          {[{ label: '1SEM', days: 7 }, { label: '2SEM', days: 14 }, { label: '1MOIS', days: 30 }, { label: '100J', days: 100 }].map(({ label, days }) => (
            <div key={days} style={{ textAlign: 'center' }}>
              <div style={{
                width: 28, height: 28, margin: '0 auto 6px',
                border: `2px solid ${streak >= days ? '#ffd700' : '#2a2a4a'}`,
                background: streak >= days ? 'rgba(255,215,0,0.12)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                animation: streak === days ? 'pxMilestone 0.8s ease-out' : 'none',
              }}>{streak >= days ? '★' : '☆'}</div>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: streak >= days ? '#ffd700' : '#2a2a4a' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guide évolution */}
      <div className="card animate-fade-up delay-4" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#5a5a8a', marginBottom: 14 }}>▶ EVOLUTION</p>
        {[
          { lvl: 'LVL 01', name: 'LIONCEAU',   range: '0-49 pts',   color: '#fbbf24', reached: true },
          { lvl: 'LVL 02', name: 'ADULTE',      range: '50-199 pts', color: '#ef4444', reached: score >= 50 },
          { lvl: 'LVL 03', name: 'LEGENDAIRE',  range: '200+ pts',   color: '#ffd700', reached: score >= 200 },
        ].map(({ lvl, name, range, color, reached }) => (
          <div key={lvl} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0',
            borderBottom: '1px solid #1a1a3a', opacity: reached ? 1 : 0.35,
          }}>
            <div style={{
              width: 30, height: 30, border: `2px solid ${reached ? color : '#2a2a4a'}`,
              background: reached ? `${color}18` : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>{reached ? '★' : '○'}</div>
            <div>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: reached ? color : '#2a2a4a', marginBottom: 4 }}>
                {lvl} — {name}
              </p>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#3a3a5a' }}>{range}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
