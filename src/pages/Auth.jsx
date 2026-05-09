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
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob" style={{ top: '-10%', right: '-10%' }} />
      <div className="auth-blob" style={{ bottom: '-10%', left: '-10%', background: 'var(--color-accent)' }} />

      <div className="auth-card fade-up">
        <div className="auth-header">
          <div className="auth-logo">
            <HeartPulse size={24} strokeWidth={3} />
          </div>
          <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p>{isLogin ? 'Enter your details to access your dashboard' : 'Join thousands of patients receiving world-class care'}</p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <input 
                type="text" 
                className="input" 
                placeholder="Full Name" 
                required 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          )}
          <div className="form-group">
            <input 
              type="email" 
              className="input" 
              placeholder="Email address" 
              required 
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              className="input" 
              placeholder="Password" 
              required 
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-p" style={{ width: '100%', marginTop: 'var(--s-2)' }} disabled={loading}>
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button onClick={handleGoogle} className="btn btn-s" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '12px' }} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/split-screen/google.svg" alt="" width="18" />
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: 'var(--s-8)', fontSize: 14, color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
