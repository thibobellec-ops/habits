import { Settings, LogOut } from 'lucide-react';
import { TABS } from '../App';

export default function Header({ space, setSpace, tab, setTab, onManage, onSignOut, userEmail }) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1.5px solid #E5E2DC',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '0 20px',
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
      }}>
        {/* Logo */}
        <span style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontWeight: 700, fontSize: 22, color: '#1C1917',
          letterSpacing: '-0.02em', flexShrink: 0,
        }}>
          Habits.
        </span>

        {/* Space toggle */}
        <div style={{
          display: 'flex', borderBottom: '1.5px solid #E5E2DC',
          alignSelf: 'stretch', alignItems: 'flex-end',
        }}>
          {[{ key: 'pro', label: '💼 Pro' }, { key: 'perso', label: '🏠 Perso' }].map(s => (
            <button key={s.key} onClick={() => setSpace(s.key)} style={{
              padding: '0 16px', height: 42, border: 'none',
              borderBottom: space === s.key ? '2px solid #B45309' : '2px solid transparent',
              background: 'transparent',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: space === s.key ? 700 : 500, fontSize: 14,
              color: space === s.key ? '#B45309' : '#A8A29E',
              cursor: 'pointer', transition: 'all 0.18s',
              marginBottom: -1.5, whiteSpace: 'nowrap',
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Tabs + actions — desktop */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 2 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '6px 12px', border: 'none', borderRadius: 6,
              background: tab === key ? 'rgba(180,83,9,0.08)' : 'transparent',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13,
              color: tab === key ? '#B45309' : '#A8A29E',
              cursor: 'pointer', transition: 'all 0.18s',
            }}>
              {label}
            </button>
          ))}
          <button onClick={onManage} title="Gérer mes habitudes" style={{
            marginLeft: 6, padding: '6px 8px', border: '1.5px solid #E5E2DC',
            borderRadius: 6, background: 'transparent', cursor: 'pointer',
            color: '#A8A29E', display: 'flex', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#B45309'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DC'; e.currentTarget.style.color = '#A8A29E'; }}
          >
            <Settings size={15} />
          </button>
          <button onClick={onSignOut} title={`Déconnexion (${userEmail})`} style={{
            marginLeft: 2, padding: '6px 8px', border: '1.5px solid #E5E2DC',
            borderRadius: 6, background: 'transparent', cursor: 'pointer',
            color: '#A8A29E', display: 'flex', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E2DC'; e.currentTarget.style.color = '#A8A29E'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
