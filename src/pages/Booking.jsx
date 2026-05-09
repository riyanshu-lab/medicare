import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Check, Calendar, Clock,
  User, Stethoscope, FileText, Star
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotification } from '../context/NotificationContext';
import { generateTimeSlots } from '../data/mockData';
import '../styles/booking.css';

const STEPS = [
  { id: 1, label: 'Department', icon: Stethoscope },
  { id: 2, label: 'Doctor',     icon: User       },
  { id: 3, label: 'Date & Time',icon: Calendar   },
  { id: 4, label: 'Confirm',    icon: FileText   },
];

const generateCalendarDays = (year, month) => {
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth= new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
};

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

const Booking = () => {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { departments, doctors, bookAppointment, getBookedSlots } = useData();
  const { addToast } = useToast();
  const { notify } = useNotification();

  const preDoctor = params.get('doctorId') ? doctors.find(d => d.id === Number(params.get('doctorId'))) : null;
  const preDept   = preDoctor?.department || '';

  const [step, setStep] = useState(preDoctor ? 2 : 1);
  const [selected, setSelected] = useState({
    department: preDept,
    doctor: preDoctor || null,
    date: '',
    time: '',
    reason: '',
  });
  const [calYear, setCalYear]   = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [booking, setBooking]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not auth'd
  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/booking' } });
  }, [user]);

  const filteredDoctors = selected.department
    ? doctors.filter(d => d.department === selected.department)
    : doctors;

  const bookedSlots = selected.doctor && selected.date
    ? getBookedSlots(selected.doctor.id, selected.date)
    : [];
  const allSlots = generateTimeSlots();

  const today = new Date();
  today.setHours(0,0,0,0);

  const { firstDay, daysInMonth } = generateCalendarDays(calYear, calMonth);

  const isDayDisabled = (day) => {
    const d = new Date(calYear, calMonth, day);
    if (d < today) return true;
    const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    return selected.doctor && !selected.doctor.availability.includes(dayName);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${MONTH_NAMES[Number(m)-1]} ${Number(d)}, ${y}`;
  };

  const handleSelectDate = (day) => {
    if (isDayDisabled(day)) return;
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setSelected(s => ({ ...s, date: dateStr, time: '' }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    const apt = bookAppointment({
      patientId:    user.id,
      patientName:  user.name,
      patientEmail: user.email,
      doctorId:     selected.doctor.id,
      doctorName:   selected.doctor.name,
      department:   selected.department,
      date:         selected.date,
      time:         selected.time,
      reason:       selected.reason || 'General consultation',
      fee:          selected.doctor.fee,
    });
    setBooking(apt);
    setSubmitting(false);
    setStep(5); // Success step
    addToast('Appointment booked successfully! 🎉', 'success');
    
    notify(
      'Appointment Confirmed',
      `Your appointment with ${selected.doctor.name} on ${formatDate(selected.date)} at ${selected.time} has been booked.`,
      'success'
    );
  };

  const canNext = () => {
    if (step === 1) return !!selected.department;
    if (step === 2) return !!selected.doctor;
    if (step === 3) return !!selected.date && !!selected.time;
    return true;
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (step === 5 && booking) return (
    <div className="booking-page page-fade-in">
      <div className="container booking-success-wrap">
        <div className="booking-success card">
          <div className="success-icon-wrap">
            <div className="success-icon"><Check size={32} /></div>
          </div>
          <div className="success-confetti" aria-hidden="true">🎉</div>
          <h2>Appointment Confirmed!</h2>
          <p className="success-subtitle">Your appointment has been successfully booked. A confirmation has been sent to your email.</p>

          <div className="success-id-box">
            <span className="success-id-label">Appointment ID</span>
            <span className="success-id">{booking.id}</span>
          </div>

          <div className="success-details">
            <div className="success-detail-row">
              <User size={16} />
              <div>
                <div className="sd-label">Doctor</div>
                <div className="sd-value">{booking.doctorName}</div>
              </div>
            </div>
            <div className="success-detail-row">
              <Stethoscope size={16} />
              <div>
                <div className="sd-label">Department</div>
                <div className="sd-value">{booking.department}</div>
              </div>
            </div>
            <div className="success-detail-row">
              <Calendar size={16} />
              <div>
                <div className="sd-label">Date</div>
                <div className="sd-value">{formatDate(booking.date)}</div>
              </div>
            </div>
            <div className="success-detail-row">
              <Clock size={16} />
              <div>
                <div className="sd-label">Time</div>
                <div className="sd-value">{booking.time}</div>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              View My Appointments
            </button>
            <button className="btn btn-ghost" onClick={() => { setStep(1); setSelected({ department:'', doctor:null, date:'', time:'', reason:'' }); setBooking(null); }}>
              Book Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="booking-page page-fade-in">
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Appointment Booking</span>
          <h1>Book an Appointment</h1>
          <p>Follow the steps below to schedule your visit with one of our specialists.</p>
        </div>
      </div>

      <div className="container booking-inner">
        <div className="steps-indicator">
          {STEPS.map((s, i) => {
            const done    = step > s.id;
            const current = step === s.id;
            const Icon    = s.icon;
            return (
              <React.Fragment key={s.id}>
                <div className={`step-item ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                  <Icon size={16} strokeWidth={done || current ? 3 : 2} />
                  <span>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`step-line ${done ? 'done' : ''}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="booking-body">
          {/* ── Step 1: Department ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="booking-step">
              <h3 className="step-heading">Select a Department</h3>
              <p className="step-sub">Choose the medical specialty you need.</p>
              <div className="dept-select-grid">
                {departments.map(d => (
                  <button
                    key={d.id}
                    className={`dept-option ${selected.department === d.name ? 'selected' : ''}`}
                    onClick={() => setSelected(s => ({ ...s, department: d.name, doctor: null }))}
                    aria-pressed={selected.department === d.name}
                  >
                    <span className="dept-option-icon">{d.icon}</span>
                    <span className="dept-option-name">{d.name}</span>
                    <span className="dept-option-desc">{d.description}</span>
                    <div className="dept-option-check">
                      {selected.department === d.name && <Check size={14} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Doctor ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="booking-step">
              <h3 className="step-heading">Choose Your Doctor</h3>
              <p className="step-sub">
                {selected.department ? `Showing ${selected.department} specialists` : 'All available doctors'}
              </p>
              <div className="doctor-select-grid">
                {filteredDoctors.map(doc => (
                  <button
                    key={doc.id}
                    className={`doctor-option ${selected.doctor?.id === doc.id ? 'selected' : ''}`}
                    onClick={() => setSelected(s => ({ ...s, doctor: doc, date:'', time:'' }))}
                    aria-pressed={selected.doctor?.id === doc.id}
                  >
                    <div className="do-left">
                      <div className="avatar avatar-lg">{doc.initials}</div>
                      <div className="do-info">
                        <div className="do-name">{doc.name}</div>
                        <div className="do-spec">{doc.specialization}</div>
                        <div className="do-avail">Available: {doc.availability.join(', ')}</div>
                      </div>
                    </div>
                    <div className="do-right">
                      <div className="do-fee">₹{doc.fee}</div>
                      <div className="do-fee-label">per visit</div>
                      <div className="stars" style={{ justifyContent:'flex-end', marginTop: 4 }}>
                        <Star size={12} fill="#F59E0B" /><span>{doc.rating}</span>
                      </div>
                    </div>
                    {selected.doctor?.id === doc.id && <div className="option-selected-badge"><Check size={12} /></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Date & Time ──────────────────────────────────────── */}
          {step === 3 && (
            <div className="booking-step booking-step-dt">
              {/* Calendar */}
              <div className="cal-section">
                <h3 className="step-heading">Pick a Date</h3>
                {selected.doctor && (
                  <p className="step-sub">
                    {selected.doctor.name} is available on: <strong>{selected.doctor.availability.join(', ')}</strong>
                  </p>
                )}
                <div className="calendar card">
                  <div className="cal-header">
                    <button
                      className="cal-nav"
                      onClick={() => {
                        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                        else setCalMonth(m => m - 1);
                      }}
                      aria-label="Previous month"
                    >‹</button>
                    <span className="cal-title">{MONTH_NAMES[calMonth]} {calYear}</span>
                    <button
                      className="cal-nav"
                      onClick={() => {
                        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                        else setCalMonth(m => m + 1);
                      }}
                      aria-label="Next month"
                    >›</button>
                  </div>
                  <div className="cal-days-header">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} className="cal-day-name">{d}</div>
                    ))}
                  </div>
                  <div className="cal-grid">
                    {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day     = i + 1;
                      const disabled = isDayDisabled(day);
                      const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      const isSelected = selected.date === dateStr;
                      const isToday    = new Date().toISOString().startsWith(dateStr);
                      return (
                        <button
                          key={day}
                          className={`cal-day ${disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                          onClick={() => handleSelectDate(day)}
                          disabled={disabled}
                          aria-label={`${MONTH_NAMES[calMonth]} ${day}, ${calYear}${disabled ? ' — unavailable' : ''}`}
                          aria-pressed={isSelected}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="slots-section">
                <h3 className="step-heading">Select a Time Slot</h3>
                {selected.date ? (
                  <>
                    <p className="step-sub">Showing slots for <strong>{formatDate(selected.date)}</strong></p>
                    <div className="slots-grid" role="group" aria-label="Available time slots">
                      {allSlots.map(slot => {
                        const booked   = bookedSlots.includes(slot);
                        const isActive = selected.time === slot;
                        return (
                          <button
                            key={slot}
                            className={`slot-btn ${booked ? 'booked' : ''} ${isActive ? 'selected' : ''}`}
                            onClick={() => !booked && setSelected(s => ({ ...s, time: slot }))}
                            disabled={booked}
                            aria-pressed={isActive}
                            aria-label={`${slot}${booked ? ' — booked' : ''}`}
                          >
                            <Clock size={12} />
                            {slot}
                            {booked && <span className="slot-booked-label">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="slots-placeholder">
                    <Calendar size={32} className="placeholder-icon" />
                    <p>Please select a date first to see available slots.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 4: Confirm ──────────────────────────────────────────── */}
          {step === 4 && (
            <div className="booking-step">
              <h3 className="step-heading">Confirm Your Appointment</h3>
              <p className="step-sub">Review your details before submitting.</p>
              <div className="confirm-card card">
                <div className="confirm-header">
                  <div className="avatar avatar-xl">{selected.doctor?.initials}</div>
                  <div>
                    <h4>{selected.doctor?.name}</h4>
                    <p style={{ margin:0 }}>{selected.doctor?.specialization}</p>
                    <span className="badge badge-primary" style={{ marginTop: 6 }}>{selected.department}</span>
                  </div>
                </div>
                <div className="divider" />
                <div className="confirm-details">
                  {[
                    { icon: <Calendar size={16} />, label: 'Date',           value: formatDate(selected.date) },
                    { icon: <Clock size={16} />,    label: 'Time',           value: selected.time },
                    { icon: <User size={16} />,     label: 'Patient',        value: user?.name },
                    { icon: <FileText size={16} />, label: 'Consult. Fee',  value: `₹${selected.doctor?.fee}` },
                  ].map(item => (
                    <div key={item.label} className="confirm-row">
                      <div className="confirm-row-icon">{item.icon}</div>
                      <div className="confirm-row-label">{item.label}</div>
                      <div className="confirm-row-value">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="divider" />
                <div className="form-group">
                  <label className="form-label" htmlFor="reason">Reason for Visit (optional)</label>
                  <textarea
                    id="reason"
                    className="form-input"
                    rows={3}
                    placeholder="Briefly describe your symptoms or reason for the appointment…"
                    value={selected.reason}
                    onChange={e => setSelected(s => ({ ...s, reason: e.target.value }))}
                    style={{ resize:'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="booking-nav" style={{ display: 'flex', marginTop: 'var(--s-10)' }}>
            {step > 1 && (
              <button className="btn btn-s" onClick={() => setStep(s => s - 1)}>
                ← Previous
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 4 ? (
              <button
                className="btn btn-p"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button
                className="btn btn-p btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Confirm Appointment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
