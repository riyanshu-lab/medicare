import React, { createContext, useContext, useState, useEffect } from 'react';
import { sampleAppointments, doctors as initialDoctors, departments as initialDepts } from '../data/mockData';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(() => {
    const stored = localStorage.getItem('hms_appointments');
    return stored ? JSON.parse(stored) : sampleAppointments;
  });

  const [doctors, setDoctors] = useState(() => {
    const stored = localStorage.getItem('hms_doctors');
    return stored ? JSON.parse(stored) : initialDoctors;
  });

  const [departments, setDepartments] = useState(() => {
    const stored = localStorage.getItem('hms_departments');
    return stored ? JSON.parse(stored) : initialDepts;
  });

  useEffect(() => {
    localStorage.setItem('hms_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('hms_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('hms_departments', JSON.stringify(departments));
  }, [departments]);

  const bookAppointment = (data) => {
    const id  = `APT-${String(appointments.length + 1).padStart(3, '0')}-${Date.now().toString(36).toUpperCase()}`;
    const apt = { id, status: 'pending', bookedAt: new Date().toISOString(), ...data };
    setAppointments(prev => [apt, ...prev]);
    return apt;
  };

  const updateAppointmentStatus = (id, status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const cancelAppointment = (id) => updateAppointmentStatus(id, 'cancelled');

  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const getBookedSlots = (doctorId, date) =>
    appointments
      .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
      .map(a => a.time);

  const addDoctor = (doc) => {
    const newDoc = { ...doc, id: Date.now(), rating: 4.5, reviews: 0 };
    setDoctors(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDoctor = (id, updates) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDoctor = (id) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  const addDepartment = (dept) => {
    const newDept = { ...dept, id: Date.now() };
    setDepartments(prev => [...prev, newDept]);
  };

  const deleteDepartment = (id) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const getPatients = () => {
    const registered = JSON.parse(localStorage.getItem('hms_registered_users') || '[]');
    return registered;
  };

  return (
    <DataContext.Provider value={{
      appointments, doctors, departments,
      bookAppointment, updateAppointmentStatus, cancelAppointment, deleteAppointment,
      getBookedSlots,
      addDoctor, updateDoctor, deleteDoctor,
      addDepartment, deleteDepartment,
      getPatients,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
