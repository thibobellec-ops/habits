import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { signOut } from './lib/db';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TodayView from './components/today/TodayView';
import HistoryView from './components/history/HistoryView';
import DashboardView from './components/dashboard/DashboardView';
import AvatarView from './components/avatar/AvatarView';
import ManageModal from './components/manage/ManageModal';
import Auth from './components/Auth';

export const TABS = [
  { key: 'today',     label: 'TODAY' },
  { key: 'history',   label: 'HISTOIRE' },
  { key: 'dashboard', label: 'STATS' },
  { key: 'avatar',    label: 'AVATAR' },
];

// ── Nuage pixel art ───────────────────────────────────────────────
function PixelCloud({ left, top, scale = 1 }) {
  const S = Math.round(8 * scale);
  const rows = [
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
  ];
  return (
    <div style={{ position: 'absolute', left, top, pointerEvents: 'none' }}>
      <svg width={8 * S} height={5 * S} style={{ imageRendering: 'pixelated', display: 'block' }}>
        {rows.flatMap((row, y) =>
          row.map((on, x) => on
            ? <rect key={`${x}-${y}`} x={x * S} y={y * S} width={S} height={S} fill="rgba(255,255,255,0.92)" />
            : null
          )
        )}
      </svg>
    </div>
  );
}

// ── Fond Mario ────────────────────────────────────────────────────
function GameBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Nuages */}
      <PixelCloud left="6%"  top="7%"  scale={1.2} />
      <PixelCloud left="30%" top="4%"  scale={0.9} />
      <PixelCloud left="58%" top="9%"  scale={1.4} />
      <PixelCloud left="80%" top="5%"  scale={1.0} />

      {/* Collines en arrière-plan */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 140 }}
        viewBox="0 0 1440 140" preserveAspectRatio="none">
        {/* Collines loin */}
        <ellipse cx="300" cy="140" rx="300" ry="80" fill="#4aa840" />
        <ellipse cx="900" cy="140" rx="260" ry="70" fill="#4aa840" />
        <ellipse cx="1300" cy="140" rx="220" ry="60" fill="#4aa840" />
        {/* Sol pixel */}
        <rect x="0" y="100" width="1440" height="40" fill="#5AC54F" />
        <rect x="0" y="116" width="1440" height="24" fill="#2D7B23" />
        {/* Brique de sol */}
        {Array.from({ length: 90 }).map((_, i) => (
          <rect key={i} x={i * 16} y={116} width={15} height={1} fill="#1D6018" />
        ))}
      </svg>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#5C94FC', position: 'relative',
    }}>
      <GameBackground />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{
          fontFamily: "'Press Start 2P',monospace", fontSize: 22,
          color: '#ffffff', textShadow: '3px 3px 0 #1220B0',
          marginBottom: 24, letterSpacing: '0.05em',
          animation: 'pxBounce 0.8s ease-in-out infinite',
        }}>
          HABITS.
        </p>
        <div style={{
          width: 24, height: 24,
          border: '3px solid #1220B0', borderTopColor: '#F8D000',
          animation: 'spin 0.8s linear infinite', margin: '0 auto',
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pxBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        `}</style>
      </div>
    </div>
  );
}

// ── App principale ────────────────────────────────────────────────
function AppInner() {
  const { user, loading } = useApp();
  const [space,    setSpace]   = useState('pro');
  const [tab,      setTab]     = useState('today');
  const [managing, setManaging] = useState(false);

  if (loading) return <LoadingScreen />;
  if (!user)   return <Auth />;

  return (
    <div style={{ minHeight: '100vh', background: '#5C94FC', position: 'relative' }}>
      <GameBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header
          space={space} setSpace={setSpace}
          tab={tab}     setTab={setTab}
          onManage={() => setManaging(true)}
          onSignOut={signOut}
          userEmail={user.email}
        />

        <main style={{ paddingTop: 68, paddingBottom: 80 }}>
          {tab === 'today'     && <TodayView     space={space} />}
          {tab === 'history'   && <HistoryView   space={space} />}
          {tab === 'dashboard' && <DashboardView space={space} />}
          {tab === 'avatar'    && <AvatarView    space={space} />}
        </main>

        <BottomNav tab={tab} setTab={setTab} onManage={() => setManaging(true)} />
      </div>

      {managing && (
        <ManageModal space={space} onClose={() => setManaging(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
