import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/auth.css';

const Auth = () => {
  const { login, register, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const from = location.state?.from || '/dashboard';

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = isLogin 
      ? await login(form.email, form.password)
      : await register(form);

    setLoading(false);
    if (res.success) {
      addToast(isLogin ? 'Welcome back!' : 'Account created!', 'success');
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      addToast('Signed in with Google!', 'success');
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page page-fade-in">
      <div className="auth-card card glass">
        <div className="auth-header">
          <div className="auth-logo"><HeartPulse size={32} /></div>
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to manage your health' : 'Join Sanjeevani Hospital today'}</p>
        </div>

        {error && <div className="auth-error-alert"><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={handleAuth} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label><User size={16} /> Full Name</label>
                <input name="name" type="text" placeholder="John Doe" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label><Phone size={16} /> Phone</label>
                <input name="phone" type="tel" placeholder="+91 98765 43210" onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><Lock size={16} /> Password</label>
            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>

        <button onClick={handleGoogle} className="btn btn-outline google-btn" disabled={loading}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>

        <p className="auth-footer">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={handleToggle} className="toggle-btn">
            {isLogin ? 'Sign up here' : 'Sign in here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
