import { useState } from 'react';
import { LayoutDashboard, Calendar, Users } from 'lucide-react';
import { useApp } from './hooks/useApp';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import AddClassModal from './components/AddClassModal';
import ManageStudentsModal from './components/ManageStudentsModal';
import StudentFilter from './components/StudentFilter';
import type { ClassEntry } from './types';

type Tab = 'dashboard' | 'calendar';

const CLASS_TYPE_COLORS: Record<string, string> = {
  ct1: '#f472b6',
  ct2: '#fb923c',
  ct3: '#fbbf24',
  ct4: '#60a5fa',
  ct5: '#4ade80',
  ct6: '#c084fc',
  ct7: '#2dd4bf',
};

export default function App() {
  const { loading, classTypes } = useApp();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAddClass, setShowAddClass] = useState(false);
  const [addClassDate, setAddClassDate] = useState<string | undefined>();
  const [editEntry, setEditEntry] = useState<ClassEntry | undefined>();
  const [showManageStudents, setShowManageStudents] = useState(false);

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
      {/* Header — title only */}
      <header
        className="flex-shrink-0 flex items-center justify-center border-b border-white/10"
        style={{ height: '120px' }}
      >
        <h1 className="text-white font-bold" style={{ fontSize: '40px', lineHeight: 1 }}>
          DI Class Calendar
        </h1>
      </header>

      {/* Controls bar — Dashboard: student filter / Calendar: class type legend */}
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
        ) : (
          <CalendarView onAddClass={openAddClass} onEditClass={openEditClass} />
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
    </div>
  );
}
