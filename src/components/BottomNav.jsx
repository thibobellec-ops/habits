import { CheckSquare, BarChart2, Calendar, Settings } from 'lucide-react';
import { TABS } from '../App';

const tabIcons = { today: CheckSquare, history: Calendar, dashboard: BarChart2 };

export default function BottomNav({ tab, setTab, onManage }) {
  return (
    <nav className="sm:hidden" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(10px)',
      borderTop: '1.5px solid #E5E2DC',
    }}>
      <div style={{ display: 'flex', height: 58 }}>
        {TABS.map(({ key, label }) => {
          const Icon = tabIcons[key];
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: active ? '#B45309' : '#A8A29E',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10, fontWeight: 600,
              borderTop: active ? '2px solid #B45309' : '2px solid transparent',
              transition: 'all 0.18s',
            }}>
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
        <button onClick={onManage} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          border: 'none', borderTop: '2px solid transparent',
          background: 'transparent', cursor: 'pointer',
          color: '#A8A29E',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 10, fontWeight: 600,
        }}>
          <Settings size={18} strokeWidth={1.8} />
          <span>Gérer</span>
        </button>
      </div>
    </nav>
  );
}
