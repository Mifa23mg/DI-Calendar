// Run: node seed-nationals.js
// Adds all events from the Nationals schedule (June 25 – July 2, 2026)
const { load, save, newId } = require('./db');

const events = [
  // ── THURSDAY 6/25 ─────────────────────────────────────────────
  { date: '2026-06-25', start: '11:00', end: '12:00', title: 'Mini OD Check-In',                             location: 'McArthur Ballroom 1-4' },
  { date: '2026-06-25', start: '12:00', end: '13:30', title: 'Mini OD Orientation',                          location: 'McArthur Ballroom 1-4' },
  { date: '2026-06-25', start: '13:30', end: '14:30', title: 'Injury Prevention with Sugarfoot Therapy',     location: 'McArthur Ballroom 1-4' },
  { date: '2026-06-25', start: '14:45', end: '21:30', title: 'Mini OD Opening Number Rehearsal',             location: 'McArthur Ballroom 1-4',   notes: 'Dinner Break 6:30 PM – 7:00 PM' },

  // ── FRIDAY 6/26 ────────────────────────────────────────────────
  { date: '2026-06-26', start: '10:30', end: '15:30', title: 'Mini OD Opening Number Rehearsal',             location: 'Grand Ballroom' },
  { date: '2026-06-26', start: '17:00', end: '19:00', title: 'Mini OD Jazz Audition',                        location: 'Arizona Ballroom' },

  // ── SATURDAY 6/27 ─────────────────────────────────────────────
  { date: '2026-06-27', start: '07:00', end: '20:00', title: 'Mini Solo Competition',                        location: 'Frank Lloyd Wright A-F',  notes: 'MOD solos starting at 12:15 PM' },
  { date: '2026-06-27', start: '10:00', end: '13:00', title: 'Costume Fittings',                             location: 'Superstition Mountain, 2nd floor', notes: 'Please arrive anytime during this time frame, you will not be needed the whole time.' },

  // ── SUNDAY 6/28 ───────────────────────────────────────────────
  { date: '2026-06-28', start: '09:00', end: '15:30', title: 'Mini OD Opening Number Rehearsal',             location: 'Grand Ballroom' },
  { date: '2026-06-28', start: '16:30', end: '18:30', title: 'Mini OD Ballet Audition',                     location: 'Arizona Ballroom' },

  // ── MONDAY 6/29 ───────────────────────────────────────────────
  { date: '2026-06-29', start: '07:30', end: '11:15', title: 'Workshop Classes',                             location: 'McArthur Ballroom 1-4' },
  { date: '2026-06-29', start: '18:00', end: '20:00', title: 'Mini OD Opening Number Rehearsal',             location: 'Grand Ballroom' },

  // ── TUESDAY 6/30 ──────────────────────────────────────────────
  { date: '2026-06-30', start: '07:30', end: '11:15', title: 'Workshop Classes',                             location: 'McArthur Ballroom 1-4' },
  { date: '2026-06-30', start: '11:40', end: '12:40', title: 'Mini OD Opening Number ON STAGE Rehearsal',   location: 'Frank Lloyd Wright A-F',  notes: '*Mandatory' },
  { date: '2026-06-30', start: '13:45', end: '15:00', title: 'Mini OD Workshop Audition',                   location: 'Arizona Biltmore Ballroom' },
  { date: '2026-06-30', start: '15:30', end: '18:30', title: 'Mini OD Opening Number Rehearsal',            location: 'Arizona Biltmore Ballroom' },

  // ── WEDNESDAY 7/1 ─────────────────────────────────────────────
  { date: '2026-07-01', start: '07:30', end: '11:15', title: 'Workshop Classes',                             location: 'McArthur Ballroom 1-4' },
  { date: '2026-07-01', start: '13:00', end: '14:30', title: 'Mini OD Opening Number Tech',                  location: 'Frank Lloyd Wright A-F' },
  { date: '2026-07-01', start: '19:30', end: '23:00', title: 'Junior Gala',                                  location: 'Frank Lloyd Wright A-F',  notes: 'Call time 6:30 PM' },

  // ── THURSDAY 7/2 ──────────────────────────────────────────────
  { date: '2026-07-02', start: '07:45', end: '11:30', title: 'Workshop Classes',                             location: 'McArthur Ballroom 1-4' },
  { date: '2026-07-02', start: '18:30', end: '23:00', title: 'Closing Gala',                                 location: 'Frank Lloyd Wright A-F' },
];

const db = load();

// Remove previously seeded nationals events to prevent duplicates
db.classes = db.classes.filter(c =>
  !(c.student_id === null && c.date >= '2026-06-25' && c.date <= '2026-07-02')
);

for (const e of events) {
  db.classes.push({
    id: newId(),
    student_id: null,
    teacher_id: null,
    class_type_id: null,
    title: e.title,
    location: e.location,
    notes: e.notes ?? null,
    date: e.date,
    start_time: e.start,
    end_time: e.end,
    is_recurring: 0,
    recurrence_rule: null,
    color_override: null,
    created_at: new Date().toISOString(),
  });
}

save(db);
console.log(`✅ Seeded ${events.length} nationals events into data.json`);
