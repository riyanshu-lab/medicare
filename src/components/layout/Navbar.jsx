import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HeartPulse, Phone, Menu, X, LayoutDashboard,
  LogOut, User, Settings, ChevronDown, Shield, Bell, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import '../../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, requestBrowserPermission } = useNotification();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setNotifOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  const navLinks = [
    { to: '/',           label: 'Home'        },
    { to: '/doctors',    label: 'Doctors'     },
    { to: '/departments', label: 'Departments' },
    { to: '/contact',    label: 'Contact'     },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container navbar-inner">
          {/* Brand */}
          <NavLink to="/" className="navbar-brand" aria-label="Sanjeevani Hospital Home">
            <div className="navbar-logo-icon">
              <HeartPulse size={20} />
            </div>
            <div className="navbar-brand-text">
              <strong>Sanjeevani</strong>
              <span>Hospital & Clinic</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="navbar-nav" aria-label="Site navigation">
            {navLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            <a href="tel:+916201489802" className="emergency-btn" aria-label="Emergency contact: +91 6201489802">
              <Phone size={13} />
              <span className="emergency-text">Emergency: +91 6201489802</span>
            </a>

            {user ? (
              <>
                <div className="notif-menu" ref={notifRef}>
                  <button
                    className="notif-trigger"
                    onClick={() => {
                      setNotifOpen(o => !o);
                      setDropdownOpen(false);
                      requestBrowserPermission();
                    }}
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>
                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                          <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="notif-body">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`notif-item ${n.read ? 'read' : ''}`}>
                              <div className="notif-content" onClick={() => markAsRead(n.id)}>
                                <strong>{n.title}</strong>
                                <p>{n.message}</p>
                                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                              </div>
                              <button className="notif-close" onClick={() => removeNotification(n.id)} aria-label="Remove">
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-trigger"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="avatar avatar-sm">{user.name?.charAt(0)}</div>
                  <span>{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-header">
                      <div className="name">{user.name}</div>
                      <div className="email">{user.email}</div>
                    </div>
                    <button
                      className="user-dropdown-item"
                      onClick={() => { navigate(dashboardPath); setDropdownOpen(false); }}
                      role="menuitem"
                    >
                      {user.role === 'admin' ? <Shield size={16} /> : <LayoutDashboard size={16} />}
                      {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        className="user-dropdown-item"
                        onClick={() => { navigate('/dashboard/profile'); setDropdownOpen(false); }}
                        role="menuitem"
                      >
                        <User size={16} /> My Profile
                      </button>
                    )}
                    <button className="user-dropdown-item danger" onClick={handleLogout} role="menuitem">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <NavLink to="/login"    className="btn btn-ghost btn-sm">Login</NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">Sign Up</NavLink>
              </>
            )}

            {/* Hamburger */}
            <button
              className={`hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        {navLinks.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {l.label}
          </NavLink>
        ))}
        <div className="mobile-menu-divider" />
        {user ? (
          <>
            <NavLink to={dashboardPath} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
              {user.role === 'admin' ? '🛡️ Admin Panel' : '📊 Dashboard'}
            </NavLink>
            <button className="mobile-nav-link" style={{ color: 'var(--color-danger)', textAlign:'left' }} onClick={handleLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login"    className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Login</NavLink>
            <NavLink to="/register" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Sign Up</NavLink>
          </>
        )}
        <div className="mobile-menu-divider" />
        <a href="tel:+916201489802" className="emergency-btn" style={{ alignSelf:'flex-start' }}>
          <Phone size={13} />
          Emergency: +91 6201489802
        </a>
      </div>
    </>
  );
};

export default Navbar;
