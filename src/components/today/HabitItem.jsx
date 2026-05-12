import { useState, useCallback } from 'react';

// 8 particules en étoile — couleurs Mario/NES flashy
const PARTICLES = [
  { dx:  0, dy: -28, color: '#F8D000', delay: 0   },
  { dx: 20, dy: -20, color: '#FC5252', delay: 20  },
  { dx: 28, dy:   0, color: '#5AC54F', delay: 0   },
  { dx: 20, dy:  20, color: '#3CBCFC', delay: 20  },
  { dx:  0, dy:  28, color: '#F8D000', delay: 0   },
  { dx:-20, dy:  20, color: '#FC9838', delay: 20  },
  { dx:-28, dy:   0, color: '#B070F8', delay: 0   },
  { dx:-20, dy: -20, color: '#FC5252', delay: 20  },
];

export default function HabitItem({ habit, checked, onToggle, accent = '#F8D000' }) {
  const [animating, setAnimating] = useState(false);
  const isNeg = habit.type === 'negative';

  const handleClick = useCallback(() => {
    if (!animating) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 420);
    }
    onToggle(habit.id);
  }, [animating, onToggle, habit.id]);

  let borderColor, bgColor, symbol, textColor;
  if (checked) {
    borderColor = accent;
    bgColor     = `${accent}22`;
    symbol      = '✓';
    textColor   = '#1a1a2e';
  } else if (isNeg) {
    borderColor = '#FC5252';
    bgColor     = 'rgba(252,82,82,0.08)';
    symbol      = '✗';
    textColor   = '#FC5252';
  } else {
    borderColor = '#c0c0d8';
    bgColor     = 'transparent';
    symbol      = '';
    textColor   = '#4a4a6e';
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
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
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
          color: checked ? accent : '#FC5252',
          boxShadow: checked ? `2px 2px 0 ${accent}66` : '2px 2px 0 #0002',
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
            marginTop: -3, marginLeft: -3,
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
        color: textColor,
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
          border: `1px solid ${checked ? accent : '#FC5252'}`,
          color: checked ? accent : '#FC5252',
          background: checked ? `${accent}11` : 'rgba(252,82,82,0.08)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {checked ? 'OK' : 'EVITER'}
        </span>
      )}
    </div>
  );
}
