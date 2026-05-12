import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { signOut } from './lib/db';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TodayView from './components/today/TodayView';
import HistoryView from './components/history/HistoryView';
import DashboardView from './components/dashboard/DashboardView';
import ManageModal from './components/manage/ManageModal';
import Auth from './components/Auth';

export const TABS = [
  { key: 'today',     label: "Aujourd'hui" },
  { key: 'history',   label: 'Historique' },
  { key: 'dashboard', label: 'Dashboard' },
];

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FFFFFF',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)`,
      backgroundSize: '28px 28px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontWeight: 700, fontSize: 28, color: '#1C1917', marginBottom: 16,
        }}>
          Habits.
        </p>
        <div style={{
          width: 28, height: 28, border: '2.5px solid #E5E2DC',
          borderTopColor: '#B45309', borderRadius: '50%',
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
    <div style={{ minHeight: '100vh' }}>
      <Header
        space={space} setSpace={setSpace}
        tab={tab}     setTab={setTab}
        onManage={() => setManaging(true)}
        onSignOut={signOut}
        userEmail={user.email}
      />

      <main style={{ paddingTop: 60, paddingBottom: 72 }}>
        {tab === 'today'     && <TodayView     space={space} />}
        {tab === 'history'   && <HistoryView   space={space} />}
        {tab === 'dashboard' && <DashboardView space={space} />}
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
