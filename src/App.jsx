import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TodayView from './components/today/TodayView';
import HistoryView from './components/history/HistoryView';
import DashboardView from './components/dashboard/DashboardView';
import ManageModal from './components/manage/ManageModal';

// Tab keys: 'today' | 'history' | 'dashboard'
export const TABS = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'history', label: 'Historique' },
  { key: 'dashboard', label: 'Dashboard' },
];

function AppInner() {
  const [space, setSpace] = useState('pro');
  const [tab, setTab] = useState('today');
  const [managing, setManaging] = useState(false);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        space={space}
        setSpace={setSpace}
        tab={tab}
        setTab={setTab}
        onManage={() => setManaging(true)}
      />

      <main style={{ paddingTop: 88, paddingBottom: 80 }}>
        {tab === 'today' && <TodayView space={space} />}
        {tab === 'history' && <HistoryView space={space} />}
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
