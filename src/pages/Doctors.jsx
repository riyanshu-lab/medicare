import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, Award, ChevronRight, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import '../styles/doctors.css';

const Stars = ({ rating }) => (
  <div className="stars">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={12} fill={i < Math.floor(rating) ? '#F59E0B' : 'none'} stroke={i < Math.floor(rating) ? '#F59E0B' : '#CBD5E1'} />
    ))}
    <span style={{ marginLeft: 4, fontWeight: 600, color: 'var(--color-gray-700)' }}>{rating}</span>
  </div>
);

const DoctorCard = ({ doctor, onBook }) => (
  <article className="doctor-card card" aria-label={`${doctor.name}, ${doctor.specialization}`}>
    <div className="dc-header">
      <div className="avatar avatar-xl dc-avatar">{doctor.initials}</div>
      <div className="dc-rating">
        <Stars rating={doctor.rating} />
        <span className="dc-reviews">{doctor.reviews} reviews</span>
      </div>
    </div>
    <div className="dc-body">
      <h3 className="dc-name">{doctor.name}</h3>
      <p className="dc-spec">{doctor.specialization}</p>
      <span className="badge badge-primary dc-dept">{doctor.department}</span>
      <div className="dc-stats">
        <div className="dc-stat">
          <Award size={14} />
          <span>{doctor.experience} yrs exp</span>
        </div>
        <div className="dc-stat">
          <Clock size={14} />
          <span>{doctor.availability.join(', ')}</span>
        </div>
      </div>
      <div className="dc-fee">
        <span className="dc-fee-label">Consultation Fee</span>
        <span className="dc-fee-value">₹{doctor.fee}</span>
      </div>
    </div>
    <div className="dc-footer">
      <button className="btn btn-p" style={{ width:'100%' }} onClick={() => onBook(doctor)}>
        Book Appointment
      </button>
    </div>
  </article>
);

const Doctors = () => {
  const { doctors, departments } = useData();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const [search,   setSearch]   = useState('');
  const [activeDept, setActiveDept] = useState(params.get('dept') || 'All');
  const [sortBy,   setSortBy]   = useState('rating');

  // Sync URL department param
  useEffect(() => {
    const d = params.get('dept');
    if (d) setActiveDept(d);
  }, [params]);

  const filtered = doctors
    .filter(d => activeDept === 'All' || d.department === activeDept)
    .filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating')     return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'fee-low')    return a.fee - b.fee;
      if (sortBy === 'fee-high')   return b.fee - a.fee;
      return 0;
    });

  return (
    <div className="doctors-page page-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Our Medical Team</span>
          <h1>Find Your Specialist</h1>
          <p>Browse our team of experienced, board-certified physicians and book your appointment today.</p>
        </div>
      </div>

      <div className="container doctors-layout">
        {/* Filters */}
        <aside className="doctors-sidebar" aria-label="Filter doctors">
          <div className="filter-card card">
            <h4 className="filter-title"><Filter size={16} /> Departments</h4>
            <div className="filter-dept-list">
              {['All', ...departments.map(d => d.name)].map(dept => (
                <button
                  key={dept}
                  className={`filter-dept-btn ${activeDept === dept ? 'active' : ''}`}
                  onClick={() => setActiveDept(dept)}
                  aria-pressed={activeDept === dept}
                >
                  {dept}
                  <span className="filter-dept-count">
                    {dept === 'All' ? doctors.length : doctors.filter(d => d.department === dept).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-card card" style={{ marginTop: 'var(--s-4)' }}>
            <h4 className="filter-title">Sort By</h4>
            <select
              className="input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="rating">Highest Rating</option>
              <option value="experience">Most Experience</option>
              <option value="fee-low">Fee: Low to High</option>
              <option value="fee-high">Fee: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Main content */}
        <div className="doctors-main">
          {/* Search bar */}
          <div className="doctors-toolbar">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="search"
                className="input"
                placeholder="Search by name, specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="results-count">
              {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
              {activeDept !== 'All' && ` in ${activeDept}`}
            </span>
          </div>

          {/* Active filter pill */}
          {activeDept !== 'All' && (
            <div className="active-filter">
              <span>Showing: <strong>{activeDept}</strong></span>
              <button onClick={() => setActiveDept('All')} className="active-filter-clear" aria-label="Clear department filter">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Doctors grid */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No doctors found</h3>
              <p>Try adjusting your search or filter criteria.</p>
              <button className="btn btn-outline" style={{ marginTop:'var(--space-4)' }} onClick={() => { setSearch(''); setActiveDept('All'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="doctors-grid">
              {filtered.map(d => (
                <DoctorCard
                  key={d.id}
                  doctor={d}
                  onBook={doc => navigate(`/booking?doctorId=${doc.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
