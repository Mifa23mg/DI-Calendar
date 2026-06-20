const express = require('express');
const cors = require('cors');
const { load, save, newId } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://mifa23mg.github.io',
  ],
  credentials: true,
}));
app.use(express.json());

// ─── STUDENTS ────────────────────────────────────────────────────────────────

app.get('/api/students', (_req, res) => {
  const db = load();
  res.json(db.students.sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/students', (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const db = load();
  const student = { id: newId(), name, color: color || '#6366f1', created_at: new Date().toISOString() };
  db.students.push(student);
  save(db);
  res.status(201).json(student);
});

app.put('/api/students/:id', (req, res) => {
  const db = load();
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students[idx] = { ...db.students[idx], ...req.body };
  save(db);
  res.json(db.students[idx]);
});

app.delete('/api/students/:id', (req, res) => {
  const db = load();
  db.students = db.students.filter(s => s.id !== req.params.id);
  db.classes = db.classes.filter(c => c.student_id !== req.params.id);
  save(db);
  res.json({ success: true });
});

// ─── TEACHERS ────────────────────────────────────────────────────────────────

app.get('/api/teachers', (_req, res) => {
  const db = load();
  res.json(db.teachers.sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/teachers', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const db = load();
  const teacher = { id: newId(), name, created_at: new Date().toISOString() };
  db.teachers.push(teacher);
  save(db);
  res.status(201).json(teacher);
});

app.put('/api/teachers/:id', (req, res) => {
  const db = load();
  const idx = db.teachers.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.teachers[idx] = { ...db.teachers[idx], ...req.body };
  save(db);
  res.json(db.teachers[idx]);
});

app.delete('/api/teachers/:id', (req, res) => {
  const db = load();
  db.teachers = db.teachers.filter(t => t.id !== req.params.id);
  save(db);
  res.json({ success: true });
});

// ─── CLASS TYPES ─────────────────────────────────────────────────────────────

app.get('/api/class-types', (_req, res) => {
  const db = load();
  res.json(db.classTypes.sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/class-types', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const db = load();
  const classType = { id: newId(), name };
  db.classTypes.push(classType);
  save(db);
  res.status(201).json(classType);
});

// ─── CLASSES ─────────────────────────────────────────────────────────────────

function enrichClass(cls, db) {
  const student = db.students.find(s => s.id === cls.student_id);
  const teacher = db.teachers.find(t => t.id === cls.teacher_id);
  const classType = db.classTypes.find(ct => ct.id === cls.class_type_id);
  return {
    ...cls,
    student_name: student?.name ?? 'Unknown',
    student_color: student?.color ?? '#6366f1',
    teacher_name: teacher?.name ?? null,
    class_type_name: classType?.name ?? null,
  };
}

app.get('/api/classes', (req, res) => {
  const { student_id, date_from, date_to } = req.query;
  const db = load();
  let result = db.classes;

  if (student_id && student_id !== 'all') {
    result = result.filter(c => c.student_id === student_id);
  }
  if (date_from) result = result.filter(c => c.date >= date_from);
  if (date_to) result = result.filter(c => c.date <= date_to);

  result = result
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
    .map(c => enrichClass(c, db));

  res.json(result);
});

app.post('/api/classes', (req, res) => {
  const { student_id, teacher_id, class_type_id, title, date, start_time, end_time, is_recurring, recurrence_rule, color_override } = req.body;
  if (!student_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'student_id, date, start_time, end_time are required' });
  }

  const db = load();

  if (is_recurring && recurrence_rule === 'weekly') {
    const created = [];
    const baseDate = new Date(date + 'T12:00:00');
    for (let i = 0; i < 52; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i * 7);
      const dateStr = d.toISOString().split('T')[0];
      const cls = {
        id: newId(),
        student_id,
        teacher_id: teacher_id || null,
        class_type_id: class_type_id || null,
        title: title || null,
        date: dateStr,
        start_time,
        end_time,
        is_recurring: 1,
        recurrence_rule: 'weekly',
        color_override: color_override || null,
        created_at: new Date().toISOString(),
      };
      db.classes.push(cls);
      created.push(cls);
    }
    save(db);
    return res.status(201).json(created.map(c => enrichClass(c, db)));
  }

  const cls = {
    id: newId(),
    student_id,
    teacher_id: teacher_id || null,
    class_type_id: class_type_id || null,
    title: title || null,
    date,
    start_time,
    end_time,
    is_recurring: 0,
    recurrence_rule: null,
    color_override: color_override || null,
    created_at: new Date().toISOString(),
  };
  db.classes.push(cls);
  save(db);
  res.status(201).json(enrichClass(cls, db));
});

app.put('/api/classes/:id', (req, res) => {
  const db = load();
  const idx = db.classes.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.classes[idx] = { ...db.classes[idx], ...req.body };
  save(db);
  res.json(enrichClass(db.classes[idx], db));
});

app.delete('/api/classes/:id', (req, res) => {
  const db = load();
  db.classes = db.classes.filter(c => c.id !== req.params.id);
  save(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`DI Calendar API running on http://localhost:${PORT}`);
});
