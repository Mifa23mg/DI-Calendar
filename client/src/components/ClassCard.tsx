import { Clock, User, BookOpen, Trash2 } from 'lucide-react';
import type { ClassEntry } from '../types';
import * as api from '../api';
import { useApp } from '../hooks/useApp';

interface Props {
  entry: ClassEntry;
  compact?: boolean;
  onEdit?: (entry: ClassEntry) => void;
}

function fmt12(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function ClassCard({ entry, compact = false, onEdit }: Props) {
  const { refreshClasses } = useApp();
  const color = entry.color_override || entry.student_color;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this class?')) return;
    await api.deleteClass(entry.id);
    await refreshClasses();
  };

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium group relative overflow-hidden"
        style={{ backgroundColor: color + '22', borderLeft: `3px solid ${color}` }}
      >
        <span style={{ color }} className="truncate">{entry.title || entry.class_type_name || 'Class'}</span>
        <span className="text-gray-500 whitespace-nowrap">{fmt12(entry.start_time)}</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onEdit?.(entry)}
      className={`relative p-4 rounded-2xl border border-white/10 group overflow-hidden transition-all hover:border-white/20 ${onEdit ? 'cursor-pointer hover:ring-1 hover:ring-indigo-500/50' : ''}`}
      style={{ background: `linear-gradient(135deg, ${color}18 0%, transparent 60%)` }}
    >
      {/* Color accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: color }} />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm truncate">
              {entry.title || entry.class_type_name || 'Class'}
            </h4>
            {entry.class_type_name && entry.title && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-md mt-1 inline-block" style={{ backgroundColor: color + '33', color }}>
                {entry.class_type_name}
              </span>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} className="flex-shrink-0" />
            <span>{fmt12(entry.start_time)} – {fmt12(entry.end_time)}</span>
          </div>
          {entry.teacher_name && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <BookOpen size={12} className="flex-shrink-0" />
              <span>{entry.teacher_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <User size={12} className="flex-shrink-0" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.student_color }} />
              <span>{entry.student_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
