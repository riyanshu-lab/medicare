import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CalendarCheck, Users, Award, Clock,
  Star, ChevronRight, Shield, BadgeCheck
} from 'lucide-react';
import { departments, doctors, testimonials } from '../data/mockData';
import '../styles/home.css';

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="stat-card">
    <div className="stat-icon"><Icon size={24} /></div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const DoctorCard = ({ doctor, onClick }) => (
  <div className="home-doctor-card card" onClick={onClick} role="button" tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick()}
    aria-label={`Book appointment with ${doctor.name}`}
  >
    <div className="home-doctor-avatar avatar avatar-xl" style={{ margin: '0 auto var(--space-4)' }}>
      {doctor.initials}
    </div>
    <div className="home-doctor-info">
      <h4>{doctor.name}</h4>
      <p className="doctor-spec">{doctor.specialization}</p>
      <span className="badge badge-primary">{doctor.department}</span>
      <div className="doctor-meta">
        <div className="stars">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < Math.floor(doctor.rating) ? '#F59E0B' : 'none'} />
          ))}
          <span>{doctor.rating}</span>
        </div>
        <span className="doctor-exp">{doctor.experience}y exp</span>
      </div>
    </div>
  </div>
);

const TestimonialCard = ({ t }) => (
  <div className="testimonial-card card">
    <div className="testimonial-rating stars">
      {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" />)}
    </div>
    <p className="testimonial-text">"{t.text}"</p>
    <div className="testimonial-author">
      <div className="avatar avatar-sm">{t.name.charAt(0)}</div>
      <div>
        <div className="author-name">{t.name}</div>
        <div className="author-dept">{t.department} Patient</div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const featuredDoctors = doctors.slice(0, 4);

  return (
    <main className="home-page page-fade-in">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container hero-inner">
          <div className="hero-content fade-up">
            <div className="hero-badge">
              <BadgeCheck size={14} />
              <span>Next-Gen Medical Platform</span>
            </div>
            <h1>
              Healthcare<br />
              <span style={{ color: 'var(--primary)' }}>Redefined.</span>
            </h1>
            <p className="hero-subtitle">
              Sanjeevani Hospital combines cutting-edge technology with world-class medical expertise to provide a seamless care experience.
            </p>
            <div className="hero-actions">
              <Link to="/booking" className="btn btn-p btn-lg">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/doctors" className="btn btn-s btn-lg">
                Explore Specialists
              </Link>
            </div>
          </div>
          <div className="hero-visual fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="preview-card">
              <div className="hero-card-header">
                <CalendarCheck size={18} />
                <span>Live Status</span>
              </div>
              <div className="hero-card-doctor">
                <div className="avatar avatar-md" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>SM</div>
                <div>
                  <div className="hc-name">Dr. Sarah Mitchell</div>
                  <div className="hc-spec">Cardiology · Available Now</div>
                </div>
              </div>
              <div className="hc-chart">
                {[30, 50, 70, 45, 90, 65, 80].map((h, i) => (
                  <div key={i} className="hc-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── Trusted By ────────────────────────────────────────────────────── */}
      <section className="trusted-section">
        <div className="container">
          <div className="trusted-inner">
            <span className="trusted-text">Recognized By</span>
            <div className="marquee">
              <div className="marquee-content">
                {['WHO', 'Medical Council', 'Health Ministry', 'Red Cross', 'UNICEF', 'ISO Certified'].map(b => (
                  <span key={b} className="trusted-brand">{b}</span>
                ))}
                {/* Duplicate for infinite loop */}
                {['WHO', 'Medical Council', 'Health Ministry', 'Red Cross', 'UNICEF', 'ISO Certified'].map(b => (
                  <span key={b + '_2'} className="trusted-brand">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="stats-grid">
          <div className="premium-stat fade-up" style={{ animationDelay: '0.3s' }}>
            <span className="stat-val">50k+</span>
            <span className="stat-lbl">Patients</span>
          </div>
          <div className="premium-stat fade-up" style={{ animationDelay: '0.4s' }}>
            <span className="stat-val">120+</span>
            <span className="stat-lbl">Specialists</span>
          </div>
          <div className="premium-stat fade-up" style={{ animationDelay: '0.5s' }}>
            <span className="stat-val">98%</span>
            <span className="stat-lbl">Satisfaction</span>
          </div>
          <div className="premium-stat fade-up" style={{ animationDelay: '0.6s' }}>
            <span className="stat-val">24/7</span>
            <span className="stat-lbl">Emergency</span>
          </div>
        </div>
      </section>

      {/* ── Departments ───────────────────────────────────────────────────── */}
      <section className="section departments-section" aria-labelledby="departments-heading">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Specialties</span>
            <h2 id="departments-heading">World-Class Departments</h2>
            <p>Comprehensive care across all major medical disciplines, delivered by leading specialists.</p>
          </div>
          <div className="dept-grid">
            {departments.map(d => (
              <Link
                key={d.id}
                to={`/doctors?dept=${d.name}`}
                className="dept-card card"
                aria-label={`${d.name} department`}
              >
                <div className="dept-icon">{d.icon}</div>
                <h4>{d.name}</h4>
                <p>{d.description}</p>
                <div className="dept-arrow"><ChevronRight size={16} /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────────────────────── */}
      <section className="section why-section" aria-labelledby="why-heading">
        <div className="container why-inner">
          <div className="why-content">
            <span className="eyebrow">Why Choose Us</span>
            <h2 id="why-heading">Healthcare Built Around You</h2>
            <p>We combine cutting-edge technology with compassionate care to deliver an experience unlike any other.</p>
            <div className="why-features">
              {[
                { icon: '🩺', title: 'Expert Specialists', desc: 'Board-certified doctors from world-renowned institutions.' },
                { icon: '⚡', title: 'Instant Booking',    desc: 'Book appointments in under 60 seconds, any time of day.' },
                { icon: '🔒', title: 'Your Data is Safe', desc: 'HIPAA-compliant platform with enterprise-grade security.' },
                { icon: '💬', title: 'Ongoing Support',   desc: 'Dedicated patient coordinators available around the clock.' },
              ].map(f => (
                <div key={f.title} className="why-feature">
                  <span className="why-feature-icon">{f.icon}</span>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/booking" className="btn btn-p">
              Book Your Appointment <ArrowRight size={16} />
            </Link>
          </div>
          <div className="why-visual" aria-hidden="true">
            <div className="why-grid-cards">
              {[
                { color: '#EFF6FF', label: 'Board Certified',   val: '100%', icon: '🏆' },
                { color: '#F0FDF4', label: 'Satisfaction Rate',  val: '98%',  icon: '⭐' },
                { color: '#FFF7ED', label: 'Years of Service',   val: '39+',  icon: '📅' },
                { color: '#FDF4FF', label: 'Avg Wait Time',      val: '<5min',icon: '⏱️' },
              ].map(c => (
                <div key={c.label} className="why-mini-card" style={{ background: c.color }}>
                  <span className="why-mini-icon">{c.icon}</span>
                  <span className="why-mini-val">{c.val}</span>
                  <span className="why-mini-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Doctors ───────────────────────────────────────────────────── */}
      <section className="section doctors-section" aria-labelledby="doctors-heading">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Team</span>
            <h2 id="doctors-heading">Meet Our Top Specialists</h2>
            <p>Highly qualified, experienced physicians dedicated to your wellbeing.</p>
          </div>
          <div className="home-doctors-grid">
            {featuredDoctors.map(d => (
              <DoctorCard
                key={d.id}
                doctor={d}
                onClick={() => navigate(`/booking?doctorId=${d.id}`)}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--s-10)' }}>
            <Link to="/doctors" className="btn btn-s btn-lg">
              View All Doctors <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="section testimonials-section" aria-labelledby="testimonials-heading">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Patient Stories</span>
            <h2 id="testimonials-heading">Voices of Trust</h2>
            <p>Real experiences from our patients who've put their trust in our care.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(t => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="container cta-inner">
          <div className="cta-content">
            <h2 id="cta-heading">Ready to Take Control of Your Health?</h2>
            <p>Join thousands of patients who've simplified their healthcare journey with Sanjeevani Hospital.</p>
          </div>
          <div className="cta-actions">
            <Link to="/booking"  className="btn btn-s btn-lg" style={{ background: 'white', color: 'var(--primary)' }}>Book Appointment</Link>
            <Link to="/register" className="btn btn-s btn-lg" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
