import { Clock, BookOpen, Trash2 } from 'lucide-react';
import type { ClassEntry } from '../types';
import * as api from '../api';
import { useApp } from '../hooks/useApp';

// Mid-tone class type colors (distinct from the student palette)
const CLASS_TYPE_COLORS: Record<string, string> = {
  ct1: '#f472b6', // Ballet — pink
  ct2: '#fb923c', // Hip-Hop — orange
  ct3: '#fbbf24', // Jazz — amber
  ct4: '#60a5fa', // Contemporary — blue
  ct5: '#4ade80', // Tap — green
  ct6: '#c084fc', // Lyrical — purple
  ct7: '#2dd4bf', // Acro — teal
};

function classTypeColor(id: string | null | undefined) {
  return id ? (CLASS_TYPE_COLORS[id] ?? '#818cf8') : '#818cf8';
}

function fmt12(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

interface Props {
  entries: ClassEntry[]; // all students sharing this slot
  onEdit: (entry: ClassEntry) => void;
  onDeleted: () => void;
}

export default function ClassGroupCard({ entries, onEdit, onDeleted }: Props) {
  const { refreshClasses } = useApp();
  const rep = entries[0];
  const color = classTypeColor(rep.class_type_id ? String(rep.class_type_id) : null);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this class?')) return;
    await api.deleteClass(id);
    await refreshClasses();
    onDeleted();
  };

  return (
    <div
      className="relative p-4 rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20"
      style={{ background: `linear-gradient(135deg, ${color}14 0%, transparent 60%)` }}
    >
      {/* Color accent bar — class type color */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: color }} />

      <div className="pl-3">
        {/* Title */}
        <h4 className="text-white font-semibold text-sm" style={{ color }}>
          {rep.class_type_name ?? 'Class'}
        </h4>

        <div className="mt-2 space-y-1.5">
          {/* Time */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} className="flex-shrink-0" />
            <span>{fmt12(rep.start_time)} – {fmt12(rep.end_time)}</span>
          </div>
          {/* Teacher */}
          {rep.teacher_name && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <BookOpen size={12} className="flex-shrink-0" />
              <span>{rep.teacher_name}</span>
            </div>
          )}
          {/* Students */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
            {entries.map(entry => (
              <button
                key={entry.id}
                onClick={() => onEdit(entry)}
                className="flex items-center gap-1.5 group/student"
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.student_color }} />
                <span className="text-xs text-gray-300 font-medium group-hover/student:text-white transition-colors">
                  {entry.student_name}
                </span>
                <button
                  onClick={(e) => handleDelete(entry.id, e)}
                  className="opacity-0 group-hover/student:opacity-100 ml-0.5 text-gray-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
