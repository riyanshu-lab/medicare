import React, { useState } from 'react';
import {
  MapPin, Phone, Mail, Clock, AlertCircle, Send, CheckCircle
} from 'lucide-react';
import '../styles/contact.css';

const validate = (form) => {
  const e = {};
  if (!form.name.trim())  e.name    = 'Name is required.';
  if (!form.email)        e.email   = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
  if (!form.message.trim() || form.message.length < 20) e.message = 'Please enter a message of at least 20 characters.';
  return e;
};

const FieldError = ({ msg }) =>
  msg ? <span className="form-error"><AlertCircle size={12} />{msg}</span> : null;

const Contact = () => {
  const [form,    setForm]    = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [errors,  setErrors]  = useState({});
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  const contactInfo = [
    {
      icon: <MapPin size={20} />,
      label: 'Address',
      value: 'Kolkata, West Bengal, India',
    },
    {
      icon: <Phone size={20} />,
      label: 'Phone',
      value: '+91 6201489802',
      href: 'tel:+916201489802',
    },
    {
      icon: <Mail size={20} />,
      label: 'Email',
      value: 'riyanshuakash@gmail.com',
      href: 'mailto:riyanshuakash@gmail.com',
    },
    {
      icon: <Clock size={20} />,
      label: 'Hours',
      value: 'Mon–Fri: 8:00 AM – 8:00 PM\nSat–Sun: 9:00 AM – 5:00 PM',
    },
  ];

  return (
    <div className="contact-page page-fade-in">
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Get In Touch</span>
          <h1>Contact & Support</h1>
          <p>We're here to help. Reach out to us with any questions, feedback, or appointment inquiries.</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className="contact-layout">
          {/* Left: Form */}
          <div className="contact-form-col">
            <div className="card contact-form-card">
              {sent ? (
                <div className="contact-success">
                  <div className="cs-icon"><CheckCircle size={36} /></div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button className="btn btn-outline" onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'', message:'' }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="contact-form-title">Send Us a Message</h3>
                  <form onSubmit={handleSubmit} noValidate className="contact-form">
                    <div className="contact-form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="c-name">Full Name *</label>
                        <input id="c-name" type="text" className={`form-input ${errors.name ? 'error' : ''}`}
                          value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="John Smith" />
                        <FieldError msg={errors.name} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="c-email">Email Address *</label>
                        <input id="c-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                          value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="you@example.com" />
                        <FieldError msg={errors.email} />
                      </div>
                    </div>
                    <div className="contact-form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="c-phone">Phone (optional)</label>
                        <input id="c-phone" type="tel" className="form-input"
                          value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 6201489802" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="c-subject">Subject</label>
                        <select id="c-subject" className="form-input form-select"
                          value={form.subject} onChange={e => handleChange('subject', e.target.value)}>
                          <option value="">Select a topic</option>
                          <option>Appointment Inquiry</option>
                          <option>Billing Question</option>
                          <option>Feedback</option>
                          <option>Medical Records</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="c-msg">Message *</label>
                      <textarea id="c-msg" className={`form-input ${errors.message ? 'error' : ''}`}
                        rows={5} style={{ resize:'vertical' }}
                        value={form.message} onChange={e => handleChange('message', e.target.value)}
                        placeholder="Tell us how we can help you…" />
                      <FieldError msg={errors.message} />
                    </div>
                    <button type="submit" className="btn btn-primary contact-submit" disabled={sending}>
                      {sending ? <><span className="spinner" /> Sending…</> : <><Send size={16} /> Send Message</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="contact-info-col">
            <div className="contact-info-list">
              {contactInfo.map(item => (
                <div key={item.label} className="contact-info-item card">
                  <div className="cii-icon">{item.icon}</div>
                  <div>
                    <div className="cii-label">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="cii-value link">{item.value}</a>
                    ) : (
                      <div className="cii-value" style={{ whiteSpace:'pre-line' }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency */}
            <div className="emergency-card card">
              <div className="emergency-card-icon">🚨</div>
              <div>
                <div className="emergency-card-label">24/7 Emergency Helpline</div>
                <a href="tel:+916201489802" className="emergency-card-number">+91 6201489802</a>
                <p className="emergency-card-note">For life-threatening emergencies, call 112 immediately.</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="map-placeholder card">
              <div className="map-inner">
                <MapPin size={32} className="map-icon" />
                <div className="map-label">Sanjeevani Hospital</div>
                <div className="map-addr">Kolkata, India</div>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop:'var(--space-3)' }}>
                  Open in Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
