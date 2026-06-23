const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { load, save, newId } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'di-calendar-dev-secret-change-in-prod';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://mifa23mg.github.io',
  ],
  credentials: true,
}));
app.use(express.json());

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  const db = load();
  if (!db.users) db.users = [];

  if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = { id: newId(), username, password_hash, created_at: new Date().toISOString() };
  db.users.push(user);
  save(db);

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, username: user.username });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  const db = load();
  if (!db.users) db.users = [];

  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────

app.get('/api/students', verifyToken, (req, res) => {
  const db = load();
  const students = db.students
    .filter(s => s.user_id === req.userId)
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json(students);
});

app.post('/api/students', verifyToken, (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const db = load();
  const student = { id: newId(), name, color: color || '#6366f1', user_id: req.userId, created_at: new Date().toISOString() };
  db.students.push(student);
  save(db);
  res.status(201).json(student);
});

app.put('/api/students/:id', verifyToken, (req, res) => {
  const db = load();
  const idx = db.students.findIndex(s => s.id === req.params.id && s.user_id === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students[idx] = { ...db.students[idx], ...req.body };
  save(db);
  res.json(db.students[idx]);
});

app.delete('/api/students/:id', verifyToken, (req, res) => {
  const db = load();
  const student = db.students.find(s => s.id === req.params.id && s.user_id === req.userId);
  if (!student) return res.status(404).json({ error: 'Not found' });
  db.students = db.students.filter(s => s.id !== req.params.id);
  db.classes = db.classes.filter(c => c.student_id !== req.params.id);
  save(db);
  res.json({ success: true });
});

// ─── TEACHERS (public) ───────────────────────────────────────────────────────

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

// ─── CLASS TYPES (public) ────────────────────────────────────────────────────

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
    student_name: student?.name ?? 'All Students',
    student_color: student?.color ?? '#818cf8',
    teacher_name: teacher?.name ?? null,
    class_type_name: classType?.name ?? null,
  };
}

app.get('/api/classes', verifyToken, (req, res) => {
  const { student_id, date_from, date_to } = req.query;
  const db = load();

  // Get IDs of students belonging to this user
  const myStudentIds = new Set(db.students.filter(s => s.user_id === req.userId).map(s => s.id));

  let result = db.classes.filter(c =>
    c.student_id === null || myStudentIds.has(c.student_id)
  );

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

app.post('/api/classes', verifyToken, (req, res) => {
  const { student_id, teacher_id, class_type_id, title, date, start_time, end_time, is_recurring, recurrence_rule, color_override, location, notes } = req.body;
  if (!date || !start_time || !end_time) {
    return res.status(400).json({ error: 'date, start_time, end_time are required' });
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
        student_id: student_id || null,
        teacher_id: teacher_id || null,
        class_type_id: class_type_id || null,
        title: title || null,
        location: location || null,
        notes: notes || null,
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
    student_id: student_id || null,
    teacher_id: teacher_id || null,
    class_type_id: class_type_id || null,
    title: title || null,
    location: location || null,
    notes: notes || null,
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

app.put('/api/classes/:id', verifyToken, (req, res) => {
  const db = load();
  const idx = db.classes.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.classes[idx] = { ...db.classes[idx], ...req.body };
  save(db);
  res.json(enrichClass(db.classes[idx], db));
});

app.delete('/api/classes/:id', verifyToken, (req, res) => {
  const db = load();
  db.classes = db.classes.filter(c => c.id !== req.params.id);
  save(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`DI Calendar API running on http://localhost:${PORT}`);
});
