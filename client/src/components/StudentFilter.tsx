import { ChevronDown } from 'lucide-react';
import { useApp } from '../hooks/useApp';

export default function StudentFilter() {
  const { students, activeStudentId, setActiveStudentId } = useApp();

  return (
    <div className="relative inline-flex items-center">
      <select
        value={activeStudentId}
        onChange={e => setActiveStudentId(e.target.value)}
        className="appearance-none bg-surface-700 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <option value="all">All Students</option>
        {students.map(s => (
          <option key={s.id} value={String(s.id)}>{s.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 text-gray-400 pointer-events-none" />
    </div>
  );
}
