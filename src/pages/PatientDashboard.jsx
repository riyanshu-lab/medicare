import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, History as HistoryIcon, User, LogOut,
  Bell, Clock, XCircle, CheckCircle, Edit2, Trash2,
  ArrowRight, AlertTriangle, Save, Phone, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useNotification } from '../context/NotificationContext';
import '../styles/dashboard.css';

/* ─── Sidebar ────────────────────────────────────────────────────────────────── */
const Sidebar = ({ onLogout }) => {
  const { user } = useAuth();
  const navItems = [
    { to: '/dashboard',          label: 'Overview',    icon: LayoutDashboard, end: true },
    { to: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
    { to: '/dashboard/history',  label: 'History',     icon: HistoryIcon  },
    { to: '/dashboard/profile',  label: 'My Profile',  icon: User     },
  ];
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-user">
        <div className="avatar avatar-md" style={{ background: 'var(--primary)', color: '#fff' }}>{user?.name?.charAt(0)}</div>
        <div>
          <div className="dsu-name">{user?.name}</div>
          <div className="dsu-role">Patient Profile</div>
        </div>
      </div>
      <nav className="dash-nav">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={2.5} /> {label}
          </NavLink>
        ))}
      </nav>
      <button className="dash-nav-item dash-logout" onClick={onLogout}>
        <LogOut size={18} strokeWidth={2.5} /> Sign Out
      </button>
    </aside>
  );
};

/* ─── Status Badge ───────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    confirmed: 'badge-success',
    pending:   'badge-warning',
    cancelled: 'badge-danger',
    completed: 'badge-gray',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

/* ─── Overview ───────────────────────────────────────────────────────────────── */
const Overview = () => {
  const { user }         = useAuth();
  const { appointments } = useData();
  const navigate         = useNavigate();
  const userApts = appointments.filter(a => a.patientId === user?.id);
  const upcoming = userApts.filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.date >= new Date().toISOString().split('T')[0]);

  return (
    <div className="dash-content fade-up">
      <div className="dash-page-header">
        <div>
          <h2>Hello, {user?.name?.split(' ')[0]}</h2>
          <p>You have {upcoming.length} scheduled visits this month.</p>
        </div>
        <button className="btn btn-p" onClick={() => navigate('/booking')}>
          + Book Appointment
        </button>
      </div>

      <div className="dash-stats-grid">
        {[
          { label: 'Upcoming',   value: upcoming.length, icon: <Clock size={18} />,         color: 'var(--primary)' },
          { label: 'Completed',  value: userApts.filter(a => a.status === 'completed').length, icon: <CheckCircle size={18} />, color: 'hsl(142, 71%, 45%)' },
          { label: 'Cancelled',  value: userApts.filter(a => a.status === 'cancelled').length, icon: <XCircle size={18} />,    color: 'hsl(0, 84%, 60%)' },
          { label: 'Total Visits',value: userApts.length, icon: <Calendar size={18} />,      color: 'hsl(262, 83%, 58%)' },
        ].map(s => (
          <div key={s.label} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--s-6)', marginTop: 'var(--s-6)' }}>
        <div className="card">
          <div className="dash-section-header" style={{ marginBottom: 'var(--s-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Upcoming Appointments</h4>
            <NavLink to="/dashboard/appointments" className="btn btn-s btn-sm">See all</NavLink>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} strokeWidth={1} style={{ marginBottom: 'var(--s-4)', opacity: 0.5 }} />
              <h3>No upcoming appointments</h3>
              <p>Schedule your next visit with our specialists.</p>
            </div>
          ) : (
            <div className="apt-list">
              {upcoming.slice(0, 3).map(a => (
                <div key={a.id} className="apt-item" style={{ display: 'flex', gap: 'var(--s-4)', padding: 'var(--s-4) 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-muted)', borderRadius: 'var(--r-md)', textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{a.date.split('-')[1] && ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(a.date.split('-')[1])-1]}</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{Number(a.date.split('-')[2])}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{a.doctorName}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{a.department} · {a.time}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="dash-section-header" style={{ marginBottom: 'var(--s-6)' }}>
            <h4>Health Snapshot</h4>
          </div>
          <div className="health-metrics" style={{ display: 'grid', gap: 'var(--s-4)' }}>
            {[
              { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'Normal', color: 'hsl(142, 71%, 45%)' },
              { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'Optimal', color: 'hsl(142, 71%, 45%)' },
              { label: 'Body Temp', value: '98.6', unit: '°F', status: 'Normal', color: 'hsl(142, 71%, 45%)' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s-3) var(--s-4)', background: 'var(--bg-muted)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{m.value} <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.5 }}>{m.unit}</span></div>
                </div>
                <span className="badge" style={{ background: `${m.color}15`, color: m.color }}>{m.status}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--s-6)', padding: 'var(--s-4)', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
             Next check-up recommended in 2 weeks.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Appointments ───────────────────────────────────────────────────────────── */
const Appointments = () => {
  const { user }         = useAuth();
  const { appointments, cancelAppointment } = useData();
  const { addToast }     = useToast();
  const { notify }       = useNotification();
  const navigate         = useNavigate();
  const [cancelId, setCancelId] = useState(null);

  const upcoming = appointments.filter(a =>
    a.patientId === user?.id &&
    a.status !== 'cancelled' &&
    a.status !== 'completed' &&
    a.date >= new Date().toISOString().split('T')[0]
  ).sort((a,b) => a.date.localeCompare(b.date));

  const doCancel = () => {
    const apt = appointments.find(a => a.id === cancelId);
    cancelAppointment(cancelId);
    addToast('Appointment cancelled successfully.', 'info');
    notify(
      'Appointment Cancelled',
      `Your appointment with ${apt?.doctorName} on ${apt?.date} has been cancelled.`,
      'info'
    );
    setCancelId(null);
  };

  return (
    <div className="dash-content page-fade-in">
      <div className="dash-page-header">
        <div>
          <h2>My Appointments</h2>
          <p>Manage your upcoming scheduled visits.</p>
        </div>
        <button className="btn btn-p" onClick={() => navigate('/booking')}>+ New Appointment</button>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state card" style={{ padding: 'var(--space-16)' }}>
          <div className="empty-state-icon">📅</div>
          <h3>No upcoming appointments</h3>
          <p>You have no active bookings at the moment.</p>
          <button className="btn btn-p" style={{ marginTop:'var(--s-4)' }} onClick={() => navigate('/booking')}>Book Appointment</button>
        </div>
      ) : (
        <div className="apt-cards">
          {upcoming.map(a => (
            <div key={a.id} className="apt-card card">
              <div className="apt-card-header">
                <div className="apt-card-doctor">
                  <div className="avatar avatar-md">{a.doctorName?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                  <div>
                    <div className="acd-name">{a.doctorName}</div>
                    <div className="acd-dept">{a.department}</div>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="apt-card-details">
                <div className="acd-row"><Clock size={14} /> {a.time}</div>
                <div className="acd-row"><Calendar size={14} /> {a.date}</div>
                <div className="acd-id">Ref: {a.id}</div>
              </div>
              {a.reason && <p className="apt-reason">"{a.reason}"</p>}
              <div className="apt-card-actions">
                <button className="btn btn-s btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setCancelId(a.id)}>
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelId && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Cancel appointment">
          <div className="modal">
            <div className="modal-header">
              <h3>Cancel Appointment</h3>
              <button onClick={() => setCancelId(null)} className="btn btn-icon btn-ghost" aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', gap:'var(--space-4)', alignItems:'flex-start' }}>
                <AlertTriangle size={24} style={{ color:'var(--color-warning)', flexShrink:0, marginTop:2 }} />
                <div>
                  <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCancelId(null)}>Keep Appointment</button>
              <button className="btn btn-danger" onClick={doCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── History ────────────────────────────────────────────────────────────────── */
const History = () => {
  const { user }         = useAuth();
  const { appointments } = useData();
  const history = appointments.filter(a =>
    a.patientId === user?.id &&
    (a.status === 'completed' || a.status === 'cancelled' || a.date < new Date().toISOString().split('T')[0])
  ).sort((a,b) => b.date.localeCompare(a.date));

  return (
    <div className="dash-content page-fade-in">
      <div className="dash-page-header">
        <div><h2>Appointment History</h2><p>Your past and cancelled visits.</p></div>
      </div>
      {history.length === 0 ? (
        <div className="empty-state card" style={{ padding: 'var(--space-12)' }}>
          <div className="empty-state-icon">📋</div>
          <h3>No history yet</h3>
          <p>Your past appointments will appear here.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(a => (
                  <tr key={a.id}>
                    <td><code style={{ fontSize:'0.8125rem' }}>{a.id}</code></td>
                    <td>{a.doctorName}</td>
                    <td><span className="badge badge-primary">{a.department}</span></td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td style={{ fontWeight:700, color:'var(--color-primary)' }}>₹{a.fee}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Profile ────────────────────────────────────────────────────────────────── */
const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name:       user?.name       || '',
    phone:      user?.phone      || '',
    dob:        user?.dob        || '',
    bloodGroup: user?.bloodGroup || '',
    address:    user?.address    || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateProfile(form);
    setSaving(false);
    addToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="dash-content page-fade-in">
      <div className="dash-page-header">
        <div><h2>My Profile</h2><p>Manage your personal information.</p></div>
      </div>
      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="avatar avatar-2xl" style={{ margin:'0 auto var(--space-5)' }}>{user?.name?.charAt(0)}</div>
          <h3 style={{ textAlign:'center', marginBottom:'var(--space-1)' }}>{user?.name}</h3>
          <p style={{ textAlign:'center', marginBottom:'var(--space-5)' }}>{user?.email}</p>
          <div className="profile-info-list">
            <div className="pil-item"><Mail size={14} /><span>{user?.email}</span></div>
            <div className="pil-item"><Phone size={14} /><span>{user?.phone || 'Not set'}</span></div>
            <div className="pil-item"><Calendar size={14} /><span>Member since {user?.joinedDate}</span></div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card" style={{ padding:'var(--space-8)' }}>
          <h4 style={{ marginBottom:'var(--space-6)' }}>Edit Information</h4>
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label className="form-label" htmlFor="p-name">Full Name</label>
              <input id="p-name" type="text" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="profile-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="p-phone">Phone</label>
                <input id="p-phone" type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p-dob">Date of Birth</label>
                <input id="p-dob" type="date" className="input" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="p-blood">Blood Group</label>
              <select id="p-blood" className="input" value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="p-addr">Address</label>
              <textarea id="p-addr" className="input" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ resize:'vertical' }} />
            </div>
            <button type="submit" className="btn btn-p" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─── Patient Dashboard (Shell) ──────────────────────────────────────────────── */
const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout page-fade-in">
      <Sidebar onLogout={handleLogout} />
      <main className="dash-main">
        <Routes>
          <Route index       element={<Overview />}      />
          <Route path="appointments" element={<Appointments />} />
          <Route path="history"  element={<History />}  />
          <Route path="profile"  element={<Profile />}  />
          <Route path="*"        element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default PatientDashboard;
