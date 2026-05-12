import { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function HabitItem({ habit, checked, onToggle }) {
  const [animating, setAnimating] = useState(false);
  const isNeg = habit.type === 'negative';

  function handleClick() {
    setAnimating(true);
    onToggle(habit.id);
    setTimeout(() => setAnimating(false), 300);
  }

  // Circle checkbox style
  let ringColor, fillBg, icon;
  if (checked) {
    ringColor = '#15803D';
    fillBg = '#15803D';
    icon = <Check size={11} color="#fff" strokeWidth={3} />;
  } else if (isNeg) {
    ringColor = '#DC2626';
    fillBg = 'rgba(220,38,38,0.07)';
    icon = <X size={10} color="#DC2626" strokeWidth={2.5} />;
  } else {
    ringColor = '#E5E2DC';
    fillBg = 'transparent';
    icon = null;
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.025)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Round checkbox */}
      <div
        className={animating ? 'check-pop' : ''}
        style={{
          width: 22, height: 22, borderRadius: '50%',
          border: `2px solid ${ringColor}`,
          background: fillBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.18s',
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 14, fontWeight: 500,
        color: checked ? '#1C1917' : isNeg ? '#DC2626' : '#57534E',
        transition: 'color 0.18s',
      }}>
        {habit.name}
      </span>

      {/* Negative tag */}
      {isNeg && (
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: '2px 6px', borderRadius: 3,
          background: checked ? 'rgba(21,128,61,0.08)' : 'rgba(220,38,38,0.07)',
          color: checked ? '#15803D' : '#DC2626',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          {checked ? 'ok' : 'éviter'}
        </span>
      )}
    </div>
  );
}
