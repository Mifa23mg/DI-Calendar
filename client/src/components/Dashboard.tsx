import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, isSameDay } from 'date-fns';
import { useApp } from '../hooks/useApp';
import ClassCard from './ClassCard';
import type { ClassEntry } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  onAddClass: (date: string) => void;
  onEditClass: (entry: ClassEntry) => void;
}

export default function Dashboard({ onAddClass, onEditClass }: Props) {
  const { classes, activeStudentId, refreshClasses } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const d = selectedDate;
    const from = format(d, 'yyyy-MM-dd');
    const to = format(d, 'yyyy-MM-dd');
    refreshClasses(from, to);
  }, [selectedDate, activeStudentId]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayClasses = classes.filter(c => c.date === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const dayLabel = isSameDay(selectedDate, new Date())
    ? 'Today'
    : format(selectedDate, 'EEEE, MMMM d');

  return (
    <div className="flex flex-col h-full">
      {/* Week strip */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white">{format(selectedDate, 'MMMM yyyy')}</h2>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedDate(d => subDays(d, 7))}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-700 text-gray-300 hover:bg-surface-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(d => addDays(d, 7))}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Day tabs */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dateStr = format(day, 'yyyy-MM-dd');
            const hasCls = classes.some(c => c.date === dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : isToday
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide">{DAYS[day.getDay()]}</span>
                <span className={`text-base font-bold mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasCls && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white/60' : 'bg-indigo-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex items-center justify-between py-4">
          <div>
            <h3 className="text-base font-semibold text-white">{dayLabel}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{todayClasses.length} class{todayClasses.length !== 1 ? 'es' : ''}</p>
          </div>
          <button
            onClick={() => onAddClass(format(selectedDate, 'yyyy-MM-dd'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Class
          </button>
        </div>

        {todayClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center mb-4">
              <CalendarDays size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-500 font-medium">No classes scheduled</p>
            <p className="text-gray-600 text-sm mt-1">Tap Add to schedule a class</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayClasses.map(c => <ClassCard key={c.id} entry={c} onEdit={onEditClass} />)}
          </div>
        )}
      </div>
    </div>
  );
}
