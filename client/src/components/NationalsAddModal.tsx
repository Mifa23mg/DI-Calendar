import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import * as api from '../api';
import { useApp } from '../hooks/useApp';
import type { ClassEntry, ClassFormData } from '../types';

const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) =>
  ['00', '30'].map(m => {
    const hh = h.toString().padStart(2, '0');
    const period = h < 12 ? 'AM' : 'PM';
    const label = `${h % 12 === 0 ? 12 : h % 12}:${m} ${period}`;
    return { value: `${hh}:${m}`, label };
  })
).flat();

interface Props {
  onClose: () => void;
  initialDate?: string;
  editEntry?: ClassEntry;
}

export default function NationalsAddModal({ onClose, initialDate, editEntry }: Props) {
  const { refreshClasses } = useApp();
  const isEdit = !!editEntry;

  const [form, setForm] = useState<ClassFormData>({
    student_id: '',
    teacher_id: null,
    class_type_id: null,
    title: editEntry?.title ?? '',
    location: editEntry?.location ?? '',
    notes: editEntry?.notes ?? '',
    date: editEntry?.date ?? initialDate ?? new Date().toISOString().split('T')[0],
    start_time: editEntry?.start_time ?? '09:00',
    end_time: editEntry?.end_time ?? '10:00',
    is_recurring: false,
    recurrence_rule: 'weekly',
    color_override: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof ClassFormData>(key: K, val: ClassFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit && editEntry) {
        await api.updateClass(editEntry.id, { ...form, student_id: editEntry.student_id ? String(editEntry.student_id) : '' });
      } else {
        await api.createClass(form);
      }
      await refreshClasses();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-surface-800 sm:rounded-2xl rounded-t-2xl shadow-2xl border border-white/10 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Event' : 'Add Nationals Event'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Student — disabled, shows All */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Student</label>
            <div className="w-full bg-surface-700/50 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed select-none">
              All Students
            </div>
          </div>

          {/* Class — free text (e.g. "Mini OD Opening Number Rehearsal") */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Class *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="e.g. Mini OD Opening Number Rehearsal"
              required
              className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Location — venue in parentheses on the schedule */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => update('location', e.target.value)}
              placeholder="e.g. McArthur Ballroom 1-4"
              className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="Optional notes or annotations…"
              rows={3}
              className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => update('date', e.target.value)}
              required
              className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Start Time *</label>
              <div className="relative">
                <select
                  value={form.start_time}
                  onChange={e => update('start_time', e.target.value)}
                  required
                  className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                >
                  <option value="">Select</option>
                  {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">End Time *</label>
              <div className="relative">
                <select
                  value={form.end_time}
                  onChange={e => update('end_time', e.target.value)}
                  required
                  className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                >
                  <option value="">Select</option>
                  {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-600 text-gray-300 hover:bg-surface-500 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
