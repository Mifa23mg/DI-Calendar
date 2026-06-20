import type { ClassEntry, ClassFormData, Student, Teacher, ClassType } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Students
export const getStudents = () => request<Student[]>('/students');
export const createStudent = (data: { name: string; color: string }) =>
  request<Student>('/students', { method: 'POST', body: JSON.stringify(data) });
export const updateStudent = (id: number, data: { name: string; color: string }) =>
  request<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteStudent = (id: number) =>
  request<{ success: boolean }>(`/students/${id}`, { method: 'DELETE' });

// Teachers
export const getTeachers = () => request<Teacher[]>('/teachers');
export const createTeacher = (data: { name: string }) =>
  request<Teacher>('/teachers', { method: 'POST', body: JSON.stringify(data) });
export const updateTeacher = (id: number, data: { name: string }) =>
  request<Teacher>(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTeacher = (id: number) =>
  request<{ success: boolean }>(`/teachers/${id}`, { method: 'DELETE' });

// Class Types
export const getClassTypes = () => request<ClassType[]>('/class-types');
export const createClassType = (data: { name: string }) =>
  request<ClassType>('/class-types', { method: 'POST', body: JSON.stringify(data) });

// Classes
export const getClasses = (params?: { student_id?: string; date_from?: string; date_to?: string }) => {
  const q = new URLSearchParams();
  if (params?.student_id) q.set('student_id', params.student_id);
  if (params?.date_from) q.set('date_from', params.date_from);
  if (params?.date_to) q.set('date_to', params.date_to);
  return request<ClassEntry[]>(`/classes?${q.toString()}`);
};
export const createClass = (data: ClassFormData) =>
  request<ClassEntry | ClassEntry[]>('/classes', { method: 'POST', body: JSON.stringify(data) });
export const updateClass = (id: number, data: Partial<ClassFormData>) =>
  request<ClassEntry>(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteClass = (id: number) =>
  request<{ success: boolean }>(`/classes/${id}`, { method: 'DELETE' });
