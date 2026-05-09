import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, Mail, MapPin, Globe, MessageCircle, Camera, Briefcase, ArrowRight } from 'lucide-react';
import '../../styles/footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  const quickLinks = [
    { to: '/',            label: 'Home'         },
    { to: '/doctors',     label: 'Our Doctors'  },
    { to: '/departments', label: 'Departments'  },
    { to: '/booking',     label: 'Book Appointment' },
    { to: '/contact',     label: 'Contact Us'   },
  ];

  const services = [
    'Emergency Care', 'Cardiology', 'Neurology',
    'Pediatrics', 'Orthopedics', 'Dermatology',
  ];

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon"><HeartPulse size={18} strokeWidth={3} /></div>
              <strong>Sanjeevani</strong>
            </Link>
            <p className="footer-tagline">
              Next-generation healthcare platform combining medical expertise with cutting-edge technology.
            </p>
            <div className="footer-socials">
              {[
                { Icon: Globe,          href: '#', label: 'Website'   },
                { Icon: MessageCircle,  href: '#', label: 'Twitter'   },
                { Icon: Camera,         href: '#', label: 'Instagram' },
                { Icon: Briefcase,      href: '#', label: 'LinkedIn'  },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} className="social-icon" aria-label={label}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">
                    <ArrowRight size={14} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">Departments</h4>
            <ul className="footer-links">
              {services.map(s => (
                <li key={s}>
                  <Link to="/departments" className="footer-link">
                    <ArrowRight size={14} /> {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col">
            <h4 className="footer-col-title">Newsletter</h4>
            <p className="footer-tagline" style={{ fontSize: 14 }}>
              Subscribe to get the latest health tips and hospital updates.
            </p>
            <div className="footer-newsletter">
              <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
                <input type="email" className="input" placeholder="Email address" style={{ padding: '10px 14px', fontSize: 13 }} />
                <button type="submit" className="btn btn-p btn-sm">Join</button>
              </form>
            </div>
            
            <div className="footer-emergency" style={{ marginTop: 'var(--s-8)', background: 'var(--primary-soft)', padding: 'var(--s-4)', borderRadius: 'var(--r-md)' }}>
              <div className="footer-emergency-label" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 12, textTransform: 'uppercase' }}>Emergency 24/7</div>
              <a href="tel:+916201489802" className="footer-emergency-number" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>+91 6201489802</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} Sanjeevani Hospital & Clinic. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
