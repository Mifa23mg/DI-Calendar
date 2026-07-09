import { useState } from 'react';
import { LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react';
import { useApp } from './hooks/useApp';
import { AppProvider } from './hooks/useApp';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import NationalsCalendar from './components/NationalsCalendar';
import AddClassModal from './components/AddClassModal';
import ManageStudentsModal from './components/ManageStudentsModal';
import StudentFilter from './components/StudentFilter';
import LoginPage from './pages/LoginPage';
import type { ClassEntry } from './types';

type Tab = 'dashboard' | 'calendar' | 'nationals';

const CLASS_TYPE_COLORS: Record<string, string> = {
  ct1: '#f472b6',
  ct2: '#fb923c',
  ct3: '#fbbf24',
  ct4: '#60a5fa',
  ct5: '#4ade80',
  ct6: '#c084fc',
  ct7: '#2dd4bf',
};

function AppShell() {
  const { loading, classTypes } = useApp();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAddClass, setShowAddClass] = useState(false);
  const [addClassDate, setAddClassDate] = useState<string | undefined>();
  const [editEntry, setEditEntry] = useState<ClassEntry | undefined>();
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const openAddClass = (date?: string) => {
    setEditEntry(undefined);
    setAddClassDate(date);
    setShowAddClass(true);
  };

  const openEditClass = (entry: ClassEntry) => {
    setEditEntry(entry);
    setAddClassDate(undefined);
    setShowAddClass(true);
  };

  const closeModal = () => {
    setShowAddClass(false);
    setEditEntry(undefined);
  };

  if (loading) {
    return (
      <div className="h-screen bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <Calendar size={24} className="text-white" />
          </div>
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface-900 flex flex-col max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 border-b border-white/10"
        style={{ height: '120px' }}
      >
        <div className="w-10" />
        <h1 className="text-white font-bold whitespace-nowrap" style={{ fontFamily: 'Michroma, sans-serif', lineHeight: 1, fontSize: 'clamp(24px, 5vw, 44px)' }}>
          DI Class Calendar
        </h1>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          title={`Signed in as ${user?.username}`}
          className="flex flex-col items-center justify-center gap-0.5 w-10 self-center text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </header>

      {/* Controls bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-4 border-b border-white/10">
        {tab === 'dashboard' ? (
          <>
            <StudentFilter />
            <div className="flex-1" />
            <button
              onClick={() => setShowManageStudents(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="New Student"
            >
              <Users size={18} />
              <span className="text-sm font-medium">New Student</span>
            </button>
          </>
        ) : tab === 'nationals' ? (
          <div className="flex items-center">
            <span className="text-sm font-bold text-gray-200">NYCDA - Phoenix, Az 2026</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
            {classTypes.map(ct => (
              <div key={ct.id} className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: CLASS_TYPE_COLORS[ct.id] ?? '#818cf8' }}
                />
                <span className="text-xs font-medium text-gray-300 whitespace-nowrap">{ct.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {tab === 'dashboard' ? (
          <Dashboard onAddClass={openAddClass} onEditClass={openEditClass} />
        ) : tab === 'calendar' ? (
          <CalendarView onAddClass={openAddClass} onEditClass={openEditClass} />
        ) : (
          <NationalsCalendar />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="flex border-t border-white/10 pb-safe flex-shrink-0">
        {([
          { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
          { id: 'calendar', label: 'Calendar', Icon: Calendar },
        ] as { id: Tab; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              tab === id ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={tab === id ? 2.5 : 1.5} />
            {label}
          </button>
        ))}
      </nav>

      {/* Modals */}
      {showAddClass && (
        <AddClassModal
          onClose={closeModal}
          initialDate={addClassDate}
          editEntry={editEntry}
        />
      )}
      {showManageStudents && (
        <ManageStudentsModal onClose={() => setShowManageStudents(false)} />
      )}

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-surface-800 rounded-2xl border border-white/10 shadow-2xl p-6 w-full max-w-xs animate-slide-up">
            <h3 className="text-white font-semibold text-base text-center">Sign out</h3>
            <p className="text-gray-400 text-sm text-center mt-2 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-600 text-gray-300 hover:bg-surface-500 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthGate() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
