import { useState } from 'react';
import { X, Plus, Pencil, Trash2, User } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import * as api from '../api';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#a855f7', '#f43f5e', '#10b981',
];

interface Props {
  onClose: () => void;
}

export default function ManageStudentsModal({ onClose }: Props) {
  const { students, refreshStudents } = useApp();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startAdd = () => { setName(''); setColor(PRESET_COLORS[0]); setEditId(null); setMode('add'); };
  const startEdit = (id: number) => {
    const s = students.find(s => s.id === id);
    if (!s) return;
    setName(s.name); setColor(s.color); setEditId(id); setMode('edit');
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (mode === 'edit' && editId) {
        await api.updateStudent(editId, { name: name.trim(), color });
      } else {
        await api.createStudent({ name: name.trim(), color });
      }
      await refreshStudents();
      setMode('list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this student and all their classes?')) return;
    await api.deleteStudent(id);
    await refreshStudents();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface-800 sm:rounded-2xl rounded-t-2xl shadow-2xl border border-white/10 animate-slide-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'list' ? 'Manage Students' : mode === 'add' ? 'Add Student' : 'Edit Student'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {mode === 'list' ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {students.length === 0 && (
              <p className="text-gray-500 text-center py-8">No students yet. Add one below.</p>
            )}
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-surface-700 rounded-xl border border-white/10">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + '33', border: `2px solid ${s.color}` }}>
                  <User size={16} style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{s.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-gray-500">{s.color}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(s.id)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={startAdd}
              className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} /> Add Student
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Student name"
                autoFocus
                className="w-full bg-surface-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-9 h-9 rounded-xl border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 p-3 bg-surface-700 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '33', border: `2px solid ${color}` }}>
                  <User size={14} style={{ color }} />
                </div>
                <span className="text-white text-sm">{name || 'Student Name'}</span>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setMode('list')} className="flex-1 py-3 rounded-xl bg-surface-600 text-gray-300 hover:bg-surface-500 transition-colors font-medium">
                Back
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
