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

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a1a',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 20, color: '#4a7cff', marginBottom: 24, letterSpacing: '0.05em' }}>
          HABITS.
        </p>
        <div style={{
          width: 24, height: 24, border: '3px solid #2a2a4a',
          borderTopColor: '#4a7cff', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, loading } = useApp();
  const [space,    setSpace]   = useState('pro');
  const [tab,      setTab]     = useState('today');
  const [managing, setManaging] = useState(false);

  if (loading) return <LoadingScreen />;
  if (!user)   return <Auth />;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a' }}>
      <Header
        space={space} setSpace={setSpace}
        tab={tab}     setTab={setTab}
        onManage={() => setManaging(true)}
        onSignOut={signOut}
        userEmail={user.email}
      />

      <main style={{ paddingTop: 64, paddingBottom: 76 }}>
        {tab === 'today'     && <TodayView     space={space} />}
        {tab === 'history'   && <HistoryView   space={space} />}
        {tab === 'dashboard' && <DashboardView space={space} />}
        {tab === 'avatar'    && <AvatarView    space={space} />}
      </main>

      <BottomNav tab={tab} setTab={setTab} onManage={() => setManaging(true)} />

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
