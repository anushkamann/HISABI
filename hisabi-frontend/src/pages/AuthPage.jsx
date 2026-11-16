import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

// Safely extract token + user from various backend response shapes:
// { token, user }  |  { data: { token, user } }  |  { token, data: {...user} }
function parseAuthResponse(resData) {
  const token =
    resData?.token ||
    resData?.data?.token ||
    resData?.accessToken ||
    resData?.data?.accessToken ||
    null;

  const user =
    resData?.user ||
    resData?.data?.user ||
    resData?.data ||
    null;

  return { token, user };
}

export default function AuthPage() {
  const [mode, setMode]         = useState('login');
  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [apiError, setApiError] = useState('');

  const { loginUser } = useAuth();
  const navigate      = useNavigate();

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setApiError('');

    try {
      const res = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register({ name: form.name, email: form.email, password: form.password });

      const { token, user } = parseAuthResponse(res.data);

      if (!token) {
        setApiError('Login succeeded but no token was returned. Check backend response.');
        return;
      }

      // Build a safe user object even if backend returns minimal data
      const safeUser = {
        name:  user?.name  || user?.username || form.name || form.email.split('@')[0],
        email: user?.email || form.email,
        _id:   user?._id   || user?.id || null,
        ...(user || {}),
      };

      loginUser(safeUser, token);
      navigate('/dashboard');

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.response?.data?.msg     ||
        'Something went wrong. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: '' }));
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--neutral)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,240,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(191,90,242,0.04) 0%, transparent 50%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.4s ease' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, justifyContent: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary), var(--tertiary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#0a1015', fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 0 24px rgba(0,240,255,0.3)',
          }}>H</div>
          <div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>Hisabi</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Financial OS</div>
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--surface-3)', borderRadius: 10, padding: 4 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); setApiError(''); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, fontFamily: 'Manrope, sans-serif', transition: 'all 0.2s',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
                }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* API error banner */}
            {apiError && (
              <div style={{
                background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ff6b6b',
              }}>
                {apiError}
              </div>
            )}

            {/* Name — register only */}
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input className="input-field" placeholder="Alex Sterling" value={form.name}
                  onChange={set('name')} onKeyDown={handleKeyDown} />
                {errors.name && <span style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4, display: 'block' }}>{errors.name}</span>}
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input className="input-field" type="email" placeholder="alex@example.com" value={form.email}
                onChange={set('email')} onKeyDown={handleKeyDown} />
              {errors.email && <span style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4, display: 'block' }}>{errors.email}</span>}
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={set('password')} onKeyDown={handleKeyDown}
                  style={{ paddingRight: 40 }} />
                <button onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4, display: 'block' }}>{errors.password}</span>}
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: 4, fontSize: 14, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setApiError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
          Your financial data is encrypted end-to-end.
        </p>
      </div>
    </div>
  );
}
