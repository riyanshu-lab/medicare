import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, HeartPulse, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/auth.css';

/* ── Validation Helpers ─────────────────────────────────────────────────────── */
const validateEmail    = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.';
const validatePassword = v => v.length < 8 ? 'Password must be at least 8 characters.' :
  !/[A-Z]/.test(v) ? 'Password must include at least one uppercase letter.' :
  !/[0-9]/.test(v) ? 'Password must include at least one number.' : '';
const validatePhone = v => /^\+?[\d\s\-()]{7,15}$/.test(v) ? '' : 'Please enter a valid phone number.';

const FieldError = ({ msg }) =>
  msg ? <span className="form-error"><AlertCircle size={12} />{msg}</span> : null;

/* ══════════════════════════════════════════════════════════════════════════════ */
/*  LOGIN FORM                                                                   */
/* ══════════════════════════════════════════════════════════════════════════════ */
export const Login = () => {
  const { login, loginWithGoogle }  = useAuth();
  const { addToast } = useToast();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || '/dashboard';

  const [form,   setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot]  = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent]   = useState(false);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required.';
    else { const err = validateEmail(form.email); if (err) e.email = err; }
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      addToast(`Welcome back, ${result.user.name?.split(' ')[0]}!`, 'success');
      navigate(result.user.role === 'admin' ? '/admin' : from, { replace: true });
    } else {
      setErrors({ general: result.message });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (result.success) {
      addToast(`Welcome, ${result.user.name?.split(' ')[0]}!`, 'success');
      navigate(result.user.role === 'admin' ? '/admin' : from, { replace: true });
    } else {
      setErrors({ general: result.message });
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!validateEmail(resetEmail)) {
      setResetSent(true);
      addToast('Password reset link sent to your email!', 'info');
    }
  };

  /* Forgot Password UI */
  if (forgot) return (
    <div className="auth-page page-fade-in">
      <div className="auth-card card">
        <div className="auth-logo"><HeartPulse size={28} /></div>
        <h2 className="auth-title">{resetSent ? 'Check Your Email' : 'Forgot Password'}</h2>
        {resetSent ? (
          <>
            <p className="auth-subtitle">We've sent a password reset link to <strong>{resetEmail}</strong>.</p>
            <button className="btn btn-primary" style={{ width:'100%', marginTop:'var(--space-5)' }} onClick={() => { setForgot(false); setResetSent(false); }}>
              Back to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleForgot} noValidate>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
            <div className="form-group" style={{ margin:'var(--space-5) 0' }}>
              <label className="form-label" htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email" type="email" className="form-input"
                value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                placeholder="you@example.com" required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%' }}>Send Reset Link</button>
            <button type="button" className="auth-link" onClick={() => setForgot(false)} style={{ marginTop:'var(--space-4)', display:'block' }}>
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="auth-page page-fade-in">
      <div className="auth-card card">
        <div className="auth-logo"><HeartPulse size={28} /></div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to manage your appointments</p>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {errors.general && (
            <div className="auth-alert" role="alert">
              <AlertCircle size={16} />{errors.general}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email" type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FieldError msg={errors.email} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-pw">Password</label>
            <div className="input-pw-wrapper">
              <input
                id="login-pw"
                type={showPw ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" /> Remember me
            </label>
            <button type="button" className="auth-link" onClick={() => setForgot(true)}>
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="btn btn-outline auth-google-btn" onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register" className="auth-link">Create one →</Link>
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════ */
/*  REGISTER FORM                                                                */
/* ══════════════════════════════════════════════════════════════════════════════ */
export const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email)       e.email = 'Email is required.';
    else { const err = validateEmail(form.email); if (err) e.email = err; }
    if (!form.phone)       e.phone = 'Phone number is required.';
    else { const err = validatePhone(form.phone); if (err) e.phone = err; }
    if (!form.password)    e.password = 'Password is required.';
    else { const err = validatePassword(form.password); if (err) e.password = err; }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)   s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const { confirmPassword, ...data } = form;
    const result = await register(data);
    setLoading(false);
    if (result.success) {
      addToast('Account created successfully! Welcome to Sanjeevani Hospital.', 'success');
      navigate('/dashboard');
    } else {
      setErrors({ general: result.message });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (result.success) {
      addToast(`Welcome, ${result.user.name?.split(' ')[0]}!`, 'success');
      navigate('/dashboard');
    } else {
      setErrors({ general: result.message });
    }
  };

  return (
    <div className="auth-page page-fade-in">
      <div className="auth-card auth-card-lg card">
        <div className="auth-logo"><HeartPulse size={28} /></div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Sanjeevani Hospital for seamless healthcare booking</p>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {errors.general && (
            <div className="auth-alert" role="alert">
              <AlertCircle size={16} />{errors.general}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name" type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name} onChange={e => handleChange('name', e.target.value)}
              placeholder="John Smith" autoComplete="name"
            />
            <FieldError msg={errors.name} />
          </div>

          <div className="auth-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email" type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={form.email} onChange={e => handleChange('email', e.target.value)}
                placeholder="you@example.com" autoComplete="email"
              />
              <FieldError msg={errors.email} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone" type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                placeholder="+1 555-0100" autoComplete="tel"
              />
              <FieldError msg={errors.phone} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-pw">Password</label>
            <div className="input-pw-wrapper">
              <input
                id="reg-pw" type={showPw ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={form.password} onChange={e => handleChange('password', e.target.value)}
                placeholder="Min 8 chars, uppercase & number" autoComplete="new-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} aria-label="Toggle password visibility">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="pw-strength">
                <div className="pw-strength-bars">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i <= strength ? strengthColors[strength] : 'var(--color-gray-200)' }} />
                  ))}
                </div>
                <span style={{ color: strengthColors[strength], fontSize:'0.8125rem', fontWeight:600 }}>{strengthLabels[strength]}</span>
              </div>
            )}
            <FieldError msg={errors.password} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-cpw">Confirm Password</label>
            <input
              id="reg-cpw" type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)}
              placeholder="Re-enter your password" autoComplete="new-password"
            />
            <FieldError msg={errors.confirmPassword} />
          </div>

          <p className="auth-terms">
            By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="btn btn-outline auth-google-btn" onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};
