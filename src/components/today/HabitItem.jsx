import { useState, useCallback } from 'react';

// 8 particules en étoile, couleurs Game Boy Color
const PARTICLES = [
  { dx:  0, dy: -26, color: '#ffd700', delay: 0   },
  { dx: 18, dy: -18, color: '#4a7cff', delay: 20  },
  { dx: 26, dy:   0, color: '#20c060', delay: 0   },
  { dx: 18, dy:  18, color: '#ffd700', delay: 20  },
  { dx:  0, dy:  26, color: '#ff4040', delay: 0   },
  { dx:-18, dy:  18, color: '#4a7cff', delay: 20  },
  { dx:-26, dy:   0, color: '#20c060', delay: 0   },
  { dx:-18, dy: -18, color: '#ff4040', delay: 20  },
];

export default function HabitItem({ habit, checked, onToggle, accent = '#4a7cff' }) {
  const [animating, setAnimating] = useState(false);
  const isNeg = habit.type === 'negative';

  const handleClick = useCallback(() => {
    if (!animating) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 420);
    }
    onToggle(habit.id);
  }, [animating, onToggle, habit.id]);

  // Couleurs de la checkbox selon l'état
  let borderColor, bgColor, symbol;
  if (checked) {
    borderColor = '#20ff80';
    bgColor = 'rgba(32,255,128,0.15)';
    symbol = '✓';
  } else if (isNeg) {
    borderColor = '#ff4040';
    bgColor = 'rgba(255,64,64,0.08)';
    symbol = '✗';
  } else {
    borderColor = '#2a2a4a';
    bgColor = 'transparent';
    symbol = '';
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Checkbox pixel art */}
      <div
        className={animating && checked ? 'check-pop' : ''}
        style={{
          width: 20, height: 20, flexShrink: 0,
          border: `2px solid ${borderColor}`,
          background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9,
          color: checked ? '#20ff80' : '#ff4040',
          boxShadow: checked ? `2px 2px 0 ${borderColor}44` : '2px 2px 0 #000',
          imageRendering: 'pixelated',
          transition: 'all 0.15s',
        }}
      >
        {symbol}
      </div>

      {/* Particules étoile 8-bit */}
      {animating && checked && PARTICLES.map((p, i) => (
        <div
          key={i}
          className="px-star"
          style={{
            top: '50%', left: 19,
            marginTop: -2, marginLeft: -2,
            background: p.color,
            '--tx': `${p.dx}px`,
            '--ty': `${p.dy}px`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}

      {/* Nom */}
      <span style={{
        flex: 1,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7, lineHeight: 1.8,
        color: checked ? '#e0e0ff' : isNeg ? '#ff6060' : '#9090c0',
        textDecoration: checked ? 'none' : 'none',
        transition: 'color 0.15s',
        wordBreak: 'break-word',
      }}>
        {habit.name}
      </span>

      {/* Badge négatif */}
      {isNeg && (
        <span style={{
          fontSize: 5, fontFamily: "'Press Start 2P', monospace",
          padding: '2px 5px',
          border: `1px solid ${checked ? '#20ff80' : '#ff4040'}`,
          color: checked ? '#20ff80' : '#ff4040',
          background: checked ? 'rgba(32,255,128,0.08)' : 'rgba(255,64,64,0.08)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {checked ? 'OK' : 'EVITER'}
        </span>
      )}
    </div>
  );
}
