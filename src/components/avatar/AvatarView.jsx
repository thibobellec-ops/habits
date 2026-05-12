import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calcScore, calcStreak, getLevel, getLevelLabel, sectionColor, sectionDark } from '../../lib/stats';

const SEC    = sectionColor('avatar');  // #B070F8
const SEC_DK = sectionDark('avatar');   // #6020A0

// ── Palette pixel art ─────────────────────────────────────────────
const PAL = {
  '.': null,
  'd': '#92400e',
  'y': '#fbbf24',
  'p': '#fef3c7',
  'e': '#1c1917',
  'n': '#f43f5e',
  'r': '#ef4444',
  'G': '#ffd700',
  'M': '#7c3aed',
  'w': '#ffffff',
  'A': '#ffd700',
};

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
    '..AMyyyy.yyyMA..',
    '..AddddddddA....',
    '.GGGGG.GGGGG....',
  ],
};

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

function Environment({ level }) {
  const W = 220, H = 110;
  if (level === 'lionceau') return (
    <svg width={W} height={H} style={{ imageRendering: 'pixelated', display: 'block', width: '100%' }}>
      <rect width={W} height={H} fill="#5C94FC" />
      {[[20,15],[140,20],[70,8]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width={30} height={12} fill="rgba(255,255,255,0.9)" />
      ))}
      <rect x={0} y={H * 0.72} width={W} height={H * 0.28} fill="#5AC54F" />
      <rect x={0} y={H * 0.78} width={W} height={H * 0.22} fill="#2D7B23" />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={i * 16} y={H * 0.78} width={15} height={1} fill="#1D6018" />
      ))}
      <rect x={175} y={10} width={20} height={20} fill="#F8D000" />
      <rect x={173} y={18} width={24} height={4} fill="#F8D000" />
      <rect x={183} y={8} width={4} height={24} fill="#F8D000" />
    </svg>
  );

  if (level === 'adulte') return (
    <svg width={W} height={H} style={{ imageRendering: 'pixelated', display: 'block', width: '100%' }}>
      <rect width={W} height={H} fill="#8870d0" />
      {[[15,8],[45,18],[80,6],[120,14],[160,9],[195,20]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width={3} height={3} fill={i%2===0?'#F8D000':'#fff'} />
      ))}
      <rect x={0} y={H * 0.72} width={W} height={H * 0.28} fill="#404070" />
      <rect x={60} y={H * 0.38} width={100} height={H * 0.36} fill="#6050a8" />
      <rect x={50} y={H * 0.26} width={26} height={H * 0.16} fill="#6050a8" />
      <rect x={144} y={H * 0.26} width={26} height={H * 0.16} fill="#6050a8" />
      <rect x={95} y={H * 0.20} width={30} height={H * 0.22} fill="#6050a8" />
      {[50,58,66,144,152,160,95,103,111].map((x,i) => (
        <rect key={i} x={x} y={H * 0.22} width={6} height={8} fill="#7060b8" />
      ))}
      <rect x={98} y={H * 0.56} width={24} height={H * 0.18} fill="#2a1a5a" />
      <rect x={105} y={H * 0.54} width={10} height={4} fill="#F8D000" />
      <rect x={109} y={H * 0.12} width={3} height={14} fill="#c0c0d0" />
      <rect x={112} y={H * 0.12} width={10} height={8} fill="#FC5252" />
    </svg>
  );

  return (
    <svg width={W} height={H} style={{ imageRendering: 'pixelated', display: 'block', width: '100%' }}>
      <rect width={W} height={H} fill="#18082a" />
      {[[5,5],[22,11],[55,7],[88,4],[125,9],[162,7],[195,13],[38,22],[108,17],[178,20]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width={3} height={3} fill={i%2===0?'#F8D000':'#B070F8'} />
      ))}
      <rect x={0} y={H * 0.76} width={W} height={H * 0.24} fill="#28103a" />
      {[20,50,80,115,150,180].map((x,i) => (
        <rect key={i} x={x} y={H * 0.70} width={6} height={8} fill={i%2===0?'#B070F888':'#F8D00088'} />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={78 + i * 4} y={H * 0.75 - i * 4} width={H * 0.75 - 8} height={i * 4 + 4} fill="#4020a0" />
      ))}
      <rect x={105} y={H * 0.12} width={14} height={14} fill="#F8D000" />
      <rect x={103} y={H * 0.17} width={18} height={5} fill="#F8D00066" />
    </svg>
  );
}

const MILESTONES = [7, 14, 30, 100];

function StreakBar({ streak }) {
  const max = Math.max(100, streak + 10);
  const pct = Math.min((streak / max) * 100, 100);
  return (
    <div>
      <div style={{ position: 'relative', height: 22, background: `${SEC}18`, border: `2px solid ${SEC}`, boxShadow: `3px 3px 0 ${SEC_DK}` }}>
        <div style={{ height: '100%', width: `${pct}%`, background: SEC, transition: 'width 0.6s steps(20)' }} />
        {MILESTONES.filter(m => m <= max).map(m => (
          <div key={m} style={{
            position: 'absolute', left: `${(m / max) * 100}%`,
            top: -2, bottom: -2, width: 3,
            background: streak >= m ? '#F8D000' : '#d0d0e0', zIndex: 2,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#fff', textShadow: '1px 1px 0 #0004', zIndex: 3,
        }}>
          🔥 {streak} JOURS
        </div>
      </div>
      <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
        {MILESTONES.filter(m => m <= max).map(m => (
          <span key={m} style={{
            position: 'absolute', left: `${(m / max) * 100}%`, transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P', monospace", fontSize: 6,
            color: streak >= m ? '#F8D000' : '#c0c0d8',
            animation: streak === m ? 'pxMilestone 0.6s ease-out' : 'none',
          }}>{m}J</span>
        ))}
      </div>
    </div>
  );
}

const LEVEL_EMOJI = { lionceau: '🐾', adulte: '⚔️', legendaire: '👑' };

export default function AvatarView({ space }) {
  const { store } = useApp();
  const { checkins } = store;

  const score   = useMemo(() => calcScore(checkins), [checkins]);
  const level   = getLevel(score);

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
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: SEC, letterSpacing: '0.1em', marginBottom: 8 }}>
          🎮 MON AVATAR
        </p>
        <h1 style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: '#1a1a2e' }}>
          {LEVEL_EMOJI[level]} {getLevelLabel(level)}
        </h1>
      </div>

      {/* Card avatar */}
      <div className="animate-fade-up delay-2" style={{
        border: `3px solid ${SEC}`, boxShadow: `6px 6px 0 ${SEC_DK}`,
        background: '#ffffff', marginBottom: 16, overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <Environment level={level} />
          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)' }}>
            <PixelSprite map={sprite} pixelSize={5} />
          </div>
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: '#1220B0', border: `2px solid ${SEC}`, padding: '3px 7px',
            fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: SEC,
          }}>
            LVL {level === 'lionceau' ? '01' : level === 'adulte' ? '02' : '03'}
          </div>
          {level === 'legendaire' && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontSize: 16, animation: 'pxBlink 1s infinite',
            }}>⭐</div>
          )}
        </div>

        {/* Stats */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              { label: '⭐ SCORE',  value: score,                    color: '#F8D000' },
              { label: '🔥 STREAK', value: `${streak}J`,             color: SEC },
              { label: '✅ TODAY',  value: `${todayDone}/${habits.length}`, color: '#5AC54F' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '10px 6px', background: `${SEC}0a`, border: `2px solid ${SEC}44` }}>
                <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#9090b0', marginBottom: 6, letterSpacing: '0.05em' }}>
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
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0' }}>✨ XP</span>
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: SEC }}>{score} / {nextThreshold}</span>
              </div>
              <div style={{ height: 14, background: `${SEC}18`, border: `2px solid ${SEC}`, position: 'relative', boxShadow: `2px 2px 0 ${SEC_DK}` }}>
                <div style={{ height: '100%', width: `${xpPct}%`, background: SEC, transition: 'width 0.5s steps(20)' }} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#fff', textShadow: '1px 1px 0 #0004',
                }}>{xpPct}%</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px', border: `2px solid #F8D000`, background: 'rgba(248,208,0,0.06)' }}>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: '#F8D000', marginBottom: 4 }}>👑 NIVEAU MAX 👑</p>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#9090b0' }}>TU ES LEGENDAIRE !</p>
            </div>
          )}
        </div>
      </div>

      {/* Streak */}
      <div className="card animate-fade-up delay-3" style={{ padding: '18px 20px', marginBottom: 14, borderColor: `${SEC}88` }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: SEC, marginBottom: 14 }}>🔥 STREAK</p>
        <StreakBar streak={streak} />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14 }}>
          {[{ label: '1SEM', days: 7 }, { label: '2SEM', days: 14 }, { label: '1MOIS', days: 30 }, { label: '100J', days: 100 }].map(({ label, days }) => (
            <div key={days} style={{ textAlign: 'center' }}>
              <div style={{
                width: 28, height: 28, margin: '0 auto 6px',
                border: `2px solid ${streak >= days ? '#F8D000' : '#d0d0e0'}`,
                background: streak >= days ? 'rgba(248,208,0,0.12)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                animation: streak === days ? 'pxMilestone 0.8s ease-out' : 'none',
              }}>{streak >= days ? '⭐' : '○'}</div>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: streak >= days ? '#F8D000' : '#c0c0d8' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guide évolution */}
      <div className="card animate-fade-up delay-4" style={{ padding: '18px 20px', marginBottom: 20, borderColor: `${SEC}88` }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#9090b0', marginBottom: 14 }}>🌱 EVOLUTION</p>
        {[
          { lvl: 'LVL 01', name: 'LIONCEAU',  range: '0-49 pts',   color: '#fbbf24', emoji: '🐾', reached: true },
          { lvl: 'LVL 02', name: 'ADULTE',    range: '50-199 pts', color: '#FC5252', emoji: '⚔️', reached: score >= 50 },
          { lvl: 'LVL 03', name: 'LEGENDAIRE',range: '200+ pts',   color: '#F8D000', emoji: '👑', reached: score >= 200 },
        ].map(({ lvl, name, range, color, emoji, reached }) => (
          <div key={lvl} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0',
            borderBottom: '1px solid #f0f0f8', opacity: reached ? 1 : 0.4,
          }}>
            <div style={{
              width: 30, height: 30, border: `2px solid ${reached ? color : '#d0d0e0'}`,
              background: reached ? `${color}18` : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>{reached ? emoji : '○'}</div>
            <div>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: reached ? color : '#c0c0d8', marginBottom: 4 }}>
                {lvl} — {name}
              </p>
              <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#9090b0' }}>{range}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
