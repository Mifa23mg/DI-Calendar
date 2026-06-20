const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  students: [],
  teachers: [
    { id: 't1', name: 'Lynda', created_at: new Date().toISOString() },
    { id: 't2', name: 'Miss Stephanie', created_at: new Date().toISOString() },
    { id: 't3', name: 'Miss Logan', created_at: new Date().toISOString() },
  ],
  classTypes: [
    { id: 'ct1', name: 'Ballet' },
    { id: 'ct2', name: 'Hip-Hop' },
    { id: 'ct3', name: 'Jazz' },
    { id: 'ct4', name: 'Contemporary' },
    { id: 'ct5', name: 'Tap' },
    { id: 'ct6', name: 'Lyrical' },
    { id: 'ct7', name: 'Acro' },
  ],
  classes: [],
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
    return DEFAULT_DATA;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function newId() {
  return uuidv4();
}

module.exports = { load, save, newId };
