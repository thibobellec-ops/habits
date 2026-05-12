import { Settings, LogOut } from 'lucide-react';
import { TABS } from '../App';
import { sectionColor, sectionDark, accentColor } from '../lib/stats';

export default function Header({ space, setSpace, tab, setTab, onManage, onSignOut, userEmail }) {
  const sec = sectionColor(tab);
  const secDk = sectionDark(tab);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: '#1220B0',
      borderBottom: `4px solid ${sec}`,
      boxShadow: `0 4px 0 ${secDk}`,
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '0 14px',
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 10,
      }}>

        {/* Logo */}
        <span style={{
          fontFamily: "'Press Start 2P',monospace",
          fontSize: 13, color: sec,
          textShadow: `2px 2px 0 ${secDk}`,
          flexShrink: 0, letterSpacing: '0.04em',
        }}>
          HABITS.
        </span>

        {/* Space toggle */}
        <div style={{ display: 'flex', alignSelf: 'stretch', alignItems: 'flex-end' }}>
          {[
            { key: 'pro',   label: '💼 PRO',  color: '#3CBCFC', dk: '#0074B8' },
            { key: 'perso', label: '🏠 PERSO', color: '#FC9838', dk: '#C05000' },
          ].map(s => (
            <button key={s.key} onClick={() => setSpace(s.key)} style={{
              padding: '0 12px', height: 44, border: 'none',
              borderBottom: space === s.key ? `4px solid ${s.color}` : '4px solid transparent',
              background: space === s.key ? `${s.color}22` : 'transparent',
              fontFamily: "'Press Start 2P',monospace", fontSize: 8,
              color: space === s.key ? s.color : '#4a5aaa',
              cursor: 'pointer', marginBottom: -4, whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Tabs + actions — desktop */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 2 }}>
          {TABS.map(({ key, label }) => {
            const tc = sectionColor(key);
            const active = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: '6px 10px', border: 'none',
                background: active ? `${tc}22` : 'transparent',
                fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                color: active ? tc : '#4a5aaa',
                borderBottom: active ? `3px solid ${tc}` : '3px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {label}
              </button>
            );
          })}

          <button onClick={onManage} title="Gérer" style={{
            marginLeft: 8, padding: '6px 8px',
            border: '2px solid #2a3aaa', background: 'transparent',
            cursor: 'pointer', color: '#4a5aaa', display: 'flex',
            boxShadow: '2px 2px 0 #000a',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = sec; e.currentTarget.style.color = sec; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a3aaa'; e.currentTarget.style.color = '#4a5aaa'; }}
          >
            <Settings size={14} />
          </button>

          <button onClick={onSignOut} title={`Déco (${userEmail})`} style={{
            marginLeft: 4, padding: '6px 8px',
            border: '2px solid #2a3aaa', background: 'transparent',
            cursor: 'pointer', color: '#4a5aaa', display: 'flex',
            boxShadow: '2px 2px 0 #000a',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FC5252'; e.currentTarget.style.color = '#FC5252'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a3aaa'; e.currentTarget.style.color = '#4a5aaa'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
