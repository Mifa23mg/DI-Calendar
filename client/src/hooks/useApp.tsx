import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Student, Teacher, ClassType, ClassEntry } from '../types';
import * as api from '../api';

interface AppContextValue {
  students: Student[];
  teachers: Teacher[];
  classTypes: ClassType[];
  classes: ClassEntry[];
  activeStudentId: string; // 'all' or student id string
  setActiveStudentId: (id: string) => void;
  refreshStudents: () => Promise<void>;
  refreshTeachers: () => Promise<void>;
  refreshClasses: (from?: string, to?: string) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const refreshStudents = useCallback(async () => {
    const data = await api.getStudents();
    setStudents(data);
  }, []);

  const refreshTeachers = useCallback(async () => {
    const data = await api.getTeachers();
    setTeachers(data);
  }, []);

  const refreshClasses = useCallback(async (from?: string, to?: string) => {
    const params: { student_id?: string; date_from?: string; date_to?: string } = {};
    if (activeStudentId !== 'all') params.student_id = activeStudentId;
    if (from) params.date_from = from;
    if (to) params.date_to = to;
    const data = await api.getClasses(params);
    setClasses(data);
  }, [activeStudentId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [s, t, ct] = await Promise.all([api.getStudents(), api.getTeachers(), api.getClassTypes()]);
        setStudents(s);
        setTeachers(t);
        setClassTypes(ct);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    refreshClasses();
  }, [refreshClasses]);

  return (
    <AppContext.Provider value={{ students, teachers, classTypes, classes, activeStudentId, setActiveStudentId, refreshStudents, refreshTeachers, refreshClasses, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
