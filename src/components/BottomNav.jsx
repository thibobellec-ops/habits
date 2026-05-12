import { TABS } from '../App';
import { sectionColor } from '../lib/stats';

const TAB_ICONS = {
  today:     '◉',
  history:   '▦',
  dashboard: '▲',
  avatar:    '♟',
};

export default function BottomNav({ tab, setTab, onManage }) {
  return (
    <nav className="sm:hidden" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#1220B0',
      borderTop: '3px solid #0a1880',
      boxShadow: '0 -4px 0 #000a',
    }}>
      <div style={{ display: 'flex', height: 60 }}>
        {TABS.map(({ key, label }) => {
          const active = tab === key;
          const tc = sectionColor(key);
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              border: 'none',
              borderTop: active ? `3px solid ${tc}` : '3px solid transparent',
              background: active ? `${tc}22` : 'transparent',
              cursor: 'pointer',
              color: active ? tc : '#4a5aaa',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              transition: 'all 0.15s',
              marginTop: -3,
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
          color: '#4a5aaa', marginTop: -3,
          fontFamily: "'Press Start 2P', monospace", fontSize: 5,
        }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>⚙</span>
          <span>GERER</span>
        </button>
      </div>
    </nav>
  );
}
