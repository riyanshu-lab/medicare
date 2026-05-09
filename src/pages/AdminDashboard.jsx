import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, UserCog, Building2, Users,
  LogOut, Plus, Trash2, Edit2, Check, X, Save,
  TrendingUp, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useNotification } from '../context/NotificationContext';
import '../styles/dashboard.css';
import '../styles/admin.css';

const AdminSidebar = ({ onLogout }) => {
  const navItems = [
    { to: '/admin',             label: 'Overview',     icon: LayoutDashboard, end: true },
    { to: '/admin/appointments',label: 'Appointments', icon: Calendar    },
    { to: '/admin/doctors',     label: 'Doctors',      icon: UserCog     },
    { to: '/admin/departments', label: 'Departments',  icon: Building2   },
    { to: '/admin/patients',    label: 'Patients',     icon: Users       },
  ];
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-user">
        <div className="avatar avatar-md" style={{ background: 'var(--primary)', color: '#fff' }}>A</div>
        <div>
          <div className="dsu-name">Admin Console</div>
          <div className="dsu-role">System Operations</div>
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

const StatusBadge = ({ status }) => {
  const map = { confirmed:'badge-success', pending:'badge-warning', cancelled:'badge-danger', completed:'badge-gray' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};
/* ─── Admin Overview ─────────────────────────────────────────────────────────── */
const AdminOverview = () => {
  const { appointments, doctors, departments } = useData();
  const today   = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === today);
  const pending   = appointments.filter(a => a.status === 'pending');

  return (
    <div className="dash-content fade-up">
      <div className="dash-page-header">
        <div>
          <h2>System Intelligence</h2>
          <p>Real-time hospital operations and resource metrics.</p>
        </div>
      </div>

      <div className="dash-stats-grid">
        {[
          { label: "Today's Bookings", value: todayApts.length,       icon: <Calendar size={18} />,     color:'var(--primary)' },
          { label: 'Active Doctors',   value: doctors.length,          icon: <UserCog size={18} />,      color:'hsl(142, 71%, 45%)' },
          { label: 'Pending Approval', value: pending.length,          icon: <AlertTriangle size={18} />,color:'hsl(38, 92%, 50%)' },
          { label: 'Total Volume',     value: appointments.length,     icon: <TrendingUp size={18} />,   color:'hsl(262, 83%, 58%)' },
        ].map(s => (
          <div key={s.label} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background:`${s.color}15`, color:s.color }}>{s.icon}</div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="card">
          <div className="dash-section-header" style={{ marginBottom: 'var(--s-6)' }}>
            <h4>Weekly Throughput</h4>
          </div>
          <div className="admin-chart">
            {[40, 65, 45, 80, 55, 90, 70].map((val, i) => (
              <div key={i} className="chart-bar-container">
                <div className="chart-bar" style={{ height: `${val}%` }} />
                <span className="chart-label">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-section-header" style={{ marginBottom: 'var(--s-6)' }}>
            <h4>Active Logs</h4>
            <NavLink to="/admin/appointments" className="btn btn-s btn-sm">Audit All</NavLink>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {appointments.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', paddingBottom: 'var(--s-3)', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-sm" style={{ background: 'var(--bg-muted)' }}>{a.patientName[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.patientName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>with {a.doctorName}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Admin Appointments Manager ─────────────────────────────────────────────── */
const AdminAppointments = () => {
  const { appointments, updateAppointmentStatus, deleteAppointment } = useData();
  const { addToast } = useToast();
  const { notify } = useNotification();
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const handleStatus = (id, status) => {
    const apt = appointments.find(a => a.id === id);
    updateAppointmentStatus(id, status);
    addToast(`Appointment ${status}.`, 'success');
    if (apt && apt.patientId) {
      notify(
        `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your appointment with ${apt.doctorName} on ${apt.date} has been ${status}.`,
        status === 'confirmed' ? 'success' : 'info',
        '/dashboard/appointments',
        apt.patientId
      );
    }
  };

  const handleDelete = () => {
    deleteAppointment(deleteId);
    addToast('Appointment deleted.', 'info');
    setDeleteId(null);
  };

  return (
    <div className="dash-content page-fade-in">
      <div className="dash-page-header">
        <div><h2>Appointment Manager</h2><p>Review and control all hospital bookings.</p></div>
      </div>

      {/* Filter tabs */}
      <div className="admin-filter-tabs">
        {['all','pending','confirmed','completed','cancelled'].map(f => (
          <button key={f} className={`admin-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="admin-tab-count">
              {f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Dept</th><th>Date</th><th>Time</th><th>Fee</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:'var(--space-10)', color:'var(--color-gray-400)' }}>No appointments found</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td><code style={{ fontSize:'0.75rem' }}>{a.id}</code></td>
                  <td>{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td><span className="badge badge-primary">{a.department}</span></td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td style={{ fontWeight:700, color:'var(--color-primary)' }}>₹{a.fee}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="admin-actions">
                      {a.status === 'pending' && (
                        <button className="btn btn-s btn-sm" style={{ color: 'hsl(142, 71%, 45%)' }} title="Approve" onClick={() => handleStatus(a.id, 'confirmed')}>
                          <Check size={13} />
                        </button>
                      )}
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <button className="btn btn-ghost btn-sm" title="Cancel" onClick={() => handleStatus(a.id, 'cancelled')}>
                          <X size={13} />
                        </button>
                      )}
                      <button className="btn btn-s btn-sm" style={{ color: 'var(--color-danger)' }} title="Delete" onClick={() => setDeleteId(a.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Delete Appointment</h3><button onClick={() => setDeleteId(null)} className="btn btn-icon btn-ghost">×</button></div>
            <div className="modal-body"><p>This will permanently remove the appointment record. Are you sure?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Admin Doctor Manager ───────────────────────────────────────────────────── */
const AdminDoctors = () => {
  const { doctors, departments, addDoctor, updateDoctor, deleteDoctor } = useData();
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoc,   setEditDoc]   = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const blankForm = { name:'', specialization:'', department:'', experience:'', fee:'', availability:[], bio:'', initials:'' };
  const [form, setForm] = useState(blankForm);

  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];

  const openAdd = () => { setForm(blankForm); setEditDoc(null); setModalOpen(true); };
  const openEdit = (doc) => {
    setForm({ ...doc, experience: String(doc.experience), fee: String(doc.fee), availability: [...doc.availability] });
    setEditDoc(doc);
    setModalOpen(true);
  };

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      availability: f.availability.includes(d) ? f.availability.filter(x => x !== d) : [...f.availability, d]
    }));
  };

  const handleSave = () => {
    if (!form.name || !form.department || !form.specialization) {
      addToast('Please fill in all required fields.', 'error'); return;
    }
    const data = { ...form, experience: Number(form.experience), fee: Number(form.fee), initials: form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() };
    if (editDoc) { updateDoctor(editDoc.id, data); addToast('Doctor updated successfully.', 'success'); }
    else { addDoctor(data); addToast('Doctor added successfully.', 'success'); }
    setModalOpen(false);
  };

  const handleDelete = () => {
    deleteDoctor(deleteId);
    addToast('Doctor removed.', 'info');
    setDeleteId(null);
  };

  return (
    <div className="dash-content page-fade-in">
      <div className="dash-page-header">
        <div><h2>Doctor Manager</h2><p>Add, edit, or remove doctors from the hospital roster.</p></div>
        <button className="btn btn-p" onClick={openAdd}><Plus size={16} /> Add Doctor</button>
      </div>

      <div className="doctor-manager-grid">
        {doctors.map(doc => (
          <div key={doc.id} className="dm-card card">
            <div className="dm-card-header">
              <div className="avatar avatar-md">{doc.initials}</div>
              <div>
                <div className="dm-name">{doc.name}</div>
                <div className="dm-spec">{doc.specialization}</div>
                <span className="badge badge-primary" style={{ marginTop:4 }}>{doc.department}</span>
              </div>
            </div>
            <div style={{ fontSize:'0.875rem', color:'var(--color-gray-600)' }}>
              {doc.experience} yrs · ₹{doc.fee}/visit · ⭐{doc.rating}
            </div>
            <div style={{ fontSize:'0.8125rem', color:'var(--color-gray-500)', marginTop:'var(--space-2)' }}>
              Available: {doc.availability.join(', ')}
            </div>
            <div className="dm-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(doc)}><Edit2 size={13} /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(doc.id)}><Trash2 size={13} /> Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:600 }}>
            <div className="modal-header">
              <h3>{editDoc ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
              <div className="admin-modal-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Dr. Jane Smith" />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <input className="form-input" value={form.specialization} onChange={e => setForm(f => ({...f, specialization:e.target.value}))} placeholder="Cardiology" />
                </div>
              </div>
              <div className="admin-modal-row">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-input form-select" value={form.department} onChange={e => setForm(f => ({...f, department:e.target.value}))}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" type="number" value={form.experience} onChange={e => setForm(f => ({...f, experience:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input className="form-input" type="number" value={form.fee} onChange={e => setForm(f => ({...f, fee:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Available Days</label>
                <div className="avail-days">
                  {DAYS.map(d => (
                    <button key={d} type="button"
                      className={`day-btn ${form.availability.includes(d) ? 'active' : ''}`}
                      onClick={() => toggleDay(d)}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={3} value={form.bio} onChange={e => setForm(f => ({...f, bio:e.target.value}))} style={{ resize:'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={15} /> {editDoc ? 'Save Changes' : 'Add Doctor'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Remove Doctor</h3><button className="btn btn-icon btn-ghost" onClick={() => setDeleteId(null)}>×</button></div>
            <div className="modal-body"><p>This will permanently remove this doctor. Are you sure?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Department Manager ─────────────────────────────────────────────────────── */
const AdminDepartments = () => {
  const { departments, addDepartment, deleteDepartment } = useData();
  const { addToast } = useToast();
  const [adding,   setAdding]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name:'', icon:'🏥', description:'' });

  const handleAdd = () => {
    if (!form.name) { addToast('Department name is required.', 'error'); return; }
    addDepartment(form);
    addToast('Department added!', 'success');
    setAdding(false);
    setForm({ name:'', icon:'🏥', description:'' });
  };

  return (
    <div className="dash-content page-fade-in">
      <div className="dash-page-header">
        <div><h2>Department Manager</h2><p>Manage hospital medical departments.</p></div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add Department</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize:'1.5rem' }}>{d.icon}</td>
                  <td style={{ fontWeight:700 }}>{d.name}</td>
                  <td style={{ color:'var(--color-gray-500)', fontSize:'0.875rem' }}>{d.description}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d.id)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adding && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Add Department</h3><button className="btn btn-icon btn-ghost" onClick={() => setAdding(false)}>×</button></div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
              <div className="admin-modal-row">
                <div className="form-group">
                  <label className="form-label">Icon (emoji)</label>
                  <input className="form-input" value={form.icon} onChange={e => setForm(f => ({...f, icon:e.target.value}))} style={{ fontSize:'1.5rem' }} maxLength={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="e.g. Cardiology" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} placeholder="Brief description of services" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}><Save size={15} /> Add Department</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Delete Department</h3><button className="btn btn-icon btn-ghost" onClick={() => setDeleteId(null)}>×</button></div>
            <div className="modal-body"><p>Are you sure you want to delete this department?</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteDepartment(deleteId); addToast('Department deleted.','info'); setDeleteId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Patients ───────────────────────────────────────────────────────────────── */
const AdminPatients = () => {
  const { getPatients, appointments } = useData();
  const patients = getPatients();

  return (
    <div className="dash-content page-fade-in">
      <div className="dash-page-header">
        <div><h2>Patient Records</h2><p>Overview of registered patients and their activity.</p></div>
      </div>
      {patients.length === 0 ? (
        <div className="empty-state card" style={{ padding:'var(--space-16)' }}>
          <div className="empty-state-icon">👥</div>
          <h3>No registered patients yet</h3>
          <p>Patients who sign up will appear here.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Total Bookings</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
                        <div className="avatar avatar-sm">{p.name?.charAt(0)}</div>
                        {p.name}
                      </div>
                    </td>
                    <td>{p.email}</td>
                    <td>{p.phone || '—'}</td>
                    <td>{p.joinedDate}</td>
                    <td>
                      <span className="badge badge-primary">{appointments.filter(a => a.patientId === p.id).length}</span>
                    </td>
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

/* ─── Admin Dashboard Shell ──────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-layout admin-dash page-fade-in">
      <AdminSidebar onLogout={handleLogout} />
      <main className="dash-main">
        <Routes>
          <Route index            element={<AdminOverview />}       />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="doctors"   element={<AdminDoctors />}        />
          <Route path="departments" element={<AdminDepartments />}  />
          <Route path="patients"  element={<AdminPatients />}       />
          <Route path="*"         element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
