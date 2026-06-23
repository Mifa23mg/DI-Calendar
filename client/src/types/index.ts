export interface Student {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  created_at: string;
}

export interface ClassType {
  id: number;
  name: string;
}

export interface ClassEntry {
  id: number;
  student_id: number;
  teacher_id: number | null;
  class_type_id: number | null;
  title: string | null;      // event name (nationals) or class label
  location: string | null;   // venue (nationals only)
  notes: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_recurring: number;
  recurrence_rule: string | null;
  color_override: string | null;
  created_at: string;
  // joined fields
  student_name: string;
  student_color: string;
  teacher_name: string | null;
  class_type_name: string | null;
}

export interface ClassFormData {
  student_id: string;
  teacher_id: string | null;
  class_type_id: string | null;
  title: string;
  location: string;
  notes: string;
  date: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string;
  color_override: string;
}
