import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay
} from 'date-fns';
import { useApp } from '../hooks/useApp';
import ClassGroupCard from './ClassGroupCard';
import type { ClassEntry } from '../types';
import * as api from '../api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CLASS_TYPE_COLORS: Record<string, string> = {
  ct1: '#f472b6', // Ballet
  ct2: '#fb923c', // Hip-Hop
  ct3: '#fbbf24', // Jazz
  ct4: '#60a5fa', // Contemporary
  ct5: '#4ade80', // Tap
  ct6: '#c084fc', // Lyrical
  ct7: '#2dd4bf', // Acro
};

function fmtShort(time: string) {
  const [h, m] = time.split(':').map(Number);
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}` : `${hour}:${m.toString().padStart(2, '0')}`;
}

interface Props {
  onAddClass: (date: string) => void;
  onEditClass: (entry: ClassEntry) => void;
}

export default function CalendarView({ onAddClass, onEditClass }: Props) {
  const { refreshClasses } = useApp();
  const [allClasses, setAllClasses] = useState<ClassEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Always fetch ALL students — calendar is never filtered
  const fetchAll = async (from: string, to: string) => {
    const data = await api.getClasses({ date_from: from, date_to: to });
    setAllClasses(data);
  };

  useEffect(() => {
    const from = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const to = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    fetchAll(from, to);
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let d = gridStart;
  while (d <= gridEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const getClassesForDate = (date: Date) =>
    allClasses
      .filter(c => c.date === format(date, 'yyyy-MM-dd'))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Group by start_time + end_time + class_type_id + teacher_id
  const groupClasses = (classes: ClassEntry[]) => {
    const groups = new Map<string, ClassEntry[]>();
    classes.forEach(c => {
      const key = `${c.start_time}|${c.end_time}|${c.class_type_id ?? ''}|${c.teacher_id ?? ''}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    });
    return Array.from(groups.values()).sort((a, b) =>
      a[0].start_time.localeCompare(b[0].start_time)
    );
  };

  const selectedClasses = selectedDate ? getClassesForDate(selectedDate) : [];
  const selectedGroups = groupClasses(selectedClasses);

  const refreshDay = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    fetchAll(
      format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
      format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    );
    refreshClasses();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Month nav — fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-700 text-gray-300 hover:bg-surface-600 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable area: weekdays + grid + day detail */}
      <div className="flex-1 overflow-y-auto">
        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-4 mb-1">
          {WEEKDAYS.map(w => (
            <div key={w} className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-4 gap-px">
        {days.map(day => {
          const dayClasses = getClassesForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dateStr = format(day, 'yyyy-MM-dd');

          // Dedupe by time slot (start+end+classType) → one pill per unique slot
          const slotMap = new Map<string, ClassEntry>();
          dayClasses.forEach(cls => {
            const key = `${cls.start_time}|${cls.end_time}|${cls.class_type_id ?? ''}`;
            if (!slotMap.has(key)) slotMap.set(key, cls);
          });
          const slots = Array.from(slotMap.values());
          const visible = slots.slice(0, 4);
          const extra = slots.length - 4;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(prev => prev && isSameDay(prev, day) ? null : day)}
              className={`relative flex flex-col p-1 rounded-xl transition-all text-left min-h-[72px] ${
                isSelected
                  ? 'bg-indigo-600/30 ring-1 ring-indigo-500'
                  : isToday
                  ? 'bg-white/5 ring-1 ring-white/20'
                  : 'hover:bg-white/5'
              } ${!isCurrentMonth ? 'opacity-30' : ''}`}
            >
              <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${
                isToday ? 'bg-indigo-500 text-white' : isSelected ? 'text-indigo-300' : 'text-gray-400'
              }`}>
                {format(day, 'd')}
              </span>
              <div className="mt-0.5 flex flex-col gap-px w-full flex-1">
                {visible.map((cls, i) => {
                  const color = CLASS_TYPE_COLORS[String(cls.class_type_id)] ?? '#818cf8';
                  const startFmt = fmtShort(cls.start_time);
                  const endFmt = fmtShort(cls.end_time);
                  return (
                    <div
                      key={i}
                      className="w-full px-1 rounded text-white flex items-center"
                      style={{ backgroundColor: color, minHeight: '13px' }}
                    >
                      <span className="text-[10px] font-extrabold leading-none truncate">
                        {startFmt}-{endFmt}
                      </span>
                    </div>
                  );
                })}
                {extra > 0 && (
                  <p className="text-[8px] text-gray-500 text-right pr-0.5 mt-auto">{extra} more</p>
                )}
              </div>
            </button>
          );
        })}
        </div> {/* end calendar grid */}

        {/* Selected day detail — grouped by class slot */}
        {selectedDate && (
          <div className="px-4 pt-4 pb-6 border-t border-white/10 mt-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">{format(selectedDate, 'EEEE, MMMM d')}</h3>
                <p className="text-xs text-gray-500">{selectedGroups.length} class{selectedGroups.length !== 1 ? 'es' : ''}</p>
              </div>
              <button
                onClick={() => onAddClass(format(selectedDate, 'yyyy-MM-dd'))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Add Class
              </button>
            </div>
            {selectedGroups.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No classes on this day</p>
            ) : (
              <div className="space-y-3">
                {selectedGroups.map((group, i) => (
                  <ClassGroupCard
                    key={i}
                    entries={group}
                    onEdit={onEditClass}
                    onDeleted={refreshDay}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div> {/* end scroll container */}
    </div>
  );
}
