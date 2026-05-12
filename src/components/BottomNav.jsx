import { TABS } from '../App';
import { accentColor } from '../lib/stats';

const TAB_ICONS = {
  today:     '◉',
  history:   '▦',
  dashboard: '▲',
  avatar:    '♟',
};

export default function BottomNav({ tab, setTab, onManage, space = 'pro' }) {
  const accent = accentColor(space);

  return (
    <nav className="sm:hidden" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#0d0d20',
      borderTop: `2px solid #2a2a4a`,
      boxShadow: '0 -4px 0 #000',
    }}>
      <div style={{ display: 'flex', height: 60 }}>
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              border: 'none',
              borderTop: active ? `3px solid ${accent}` : '3px solid transparent',
              background: active ? `${accent}11` : 'transparent',
              cursor: 'pointer',
              color: active ? accent : '#3a3a6a',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{TAB_ICONS[key]}</span>
              <span>{label}</span>
            </button>
          );
        })}

        <button onClick={onManage} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
          border: 'none', borderTop: '3px solid transparent',
          background: 'transparent', cursor: 'pointer',
          color: '#3a3a6a',
          fontFamily: "'Press Start 2P', monospace", fontSize: 5,
        }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>⚙</span>
          <span>GERER</span>
        </button>
      </div>
    </nav>
  );
}
