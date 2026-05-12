import { Settings, LogOut } from 'lucide-react';
import { TABS } from '../App';
import { accentColor } from '../lib/stats';

export default function Header({ space, setSpace, tab, setTab, onManage, onSignOut, userEmail }) {
  const accent = accentColor(space);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: '#0d0d20',
      borderBottom: `2px solid ${accent}`,
      boxShadow: `0 4px 0 #000`,
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '0 16px',
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
      }}>

        {/* Logo */}
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 13, color: accent,
          letterSpacing: '0.05em', flexShrink: 0,
          textShadow: `0 0 12px ${accent}88`,
        }}>
          HABITS.
        </span>

        {/* Space toggle */}
        <div style={{ display: 'flex', alignSelf: 'stretch', alignItems: 'flex-end' }}>
          {[
            { key: 'pro',   label: '💼 PRO',   accent: '#4a7cff' },
            { key: 'perso', label: '🏠 PERSO', accent: '#20c060' },
          ].map(s => (
            <button key={s.key} onClick={() => setSpace(s.key)} style={{
              padding: '0 14px', height: 44, border: 'none',
              borderBottom: space === s.key ? `3px solid ${s.accent}` : '3px solid transparent',
              background: 'transparent',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              color: space === s.key ? s.accent : '#3a3a6a',
              cursor: 'pointer',
              marginBottom: -2,
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Tabs + actions — desktop */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 2 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '6px 10px', border: 'none',
              background: tab === key ? `${accent}22` : 'transparent',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: tab === key ? accent : '#3a3a6a',
              cursor: 'pointer',
              borderBottom: tab === key ? `2px solid ${accent}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {label}
            </button>
          ))}

          <button onClick={onManage} title="Gérer" style={{
            marginLeft: 8, padding: '6px 8px',
            border: '2px solid #2a2a4a',
            background: 'transparent', cursor: 'pointer',
            color: '#3a3a6a', display: 'flex', boxShadow: '2px 2px 0 #000',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#3a3a6a'; }}
          >
            <Settings size={14} />
          </button>

          <button onClick={onSignOut} title={`Déconnexion (${userEmail})`} style={{
            marginLeft: 4, padding: '6px 8px',
            border: '2px solid #2a2a4a',
            background: 'transparent', cursor: 'pointer',
            color: '#3a3a6a', display: 'flex', boxShadow: '2px 2px 0 #000',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4040'; e.currentTarget.style.color = '#ff4040'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#3a3a6a'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
