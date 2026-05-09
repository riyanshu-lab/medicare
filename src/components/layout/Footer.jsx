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

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={16} className="footer-contact-icon" />
                <span>Kolkata, West Bengal, India</span>
              </li>
              <li>
                <Phone size={16} className="footer-contact-icon" />
                <a href="tel:+916201489802">+91 6201489802</a>
              </li>
              <li>
                <Mail size={16} className="footer-contact-icon" />
                <a href="mailto:riyanshuakash@gmail.com">riyanshuakash@gmail.com</a>
              </li>
            </ul>
            <div className="footer-emergency">
              <Phone size={14} />
              <div>
                <div className="footer-emergency-label">Emergency Helpline</div>
                <a href="tel:+916201489802" className="footer-emergency-number">+91 6201489802</a>
              </div>
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
