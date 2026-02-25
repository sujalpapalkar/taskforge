import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, AlertCircle, Check } from 'lucide-react';

const ROLES = [
  { value: 'Member',  label: 'Member',  desc: 'Can view and work on tasks'      },
  { value: 'Manager', label: 'Manager', desc: 'Can manage projects and members'  },
  { value: 'Admin',   label: 'Admin',   desc: 'Full access to everything'        },
];

const Register = () => {
  const [form, setForm]             = useState({ name: '', email: '', password: '', role: 'Member' });
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const { register }                = useAuth();
  const navigate                    = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: '',          color: 'var(--border)'  },
      { label: 'Weak',      color: '#ef4444'        },
      { label: 'Fair',      color: '#f59e0b'        },
      { label: 'Good',      color: '#6366f1'        },
      { label: 'Strong',    color: '#10b981'        },
      { label: 'Very Strong', color: '#10b981'      },
    ];
    return { score, ...levels[score] };
  };

  const strength = getStrength(form.password);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim())    { setError('Please enter your name');             return; }
    if (!form.email)          { setError('Please enter your email');            return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '13.5px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const handleFocus = e => {
    e.target.style.borderColor = '#6366f1';
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
  };

  const handleBlur = e => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'inherit',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '-100px', left: '-100px',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-120px', right: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '14px',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px', marginBottom: '6px',
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Join <span style={{ color: '#818cf8', fontWeight: '700' }}>TaskForge</span> and start building
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '11px 14px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: '#ef4444', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Name */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  style={inputBase}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  style={inputBase}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    style={{ ...inputBase, paddingRight: '40px' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      padding: '2px', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password strength */}
                {form.password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '999px',
                          background: i <= strength.score ? strength.color : 'var(--border)',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    {strength.label && (
                      <p style={{ fontSize: '11.5px', color: strength.color, fontWeight: '600' }}>
                        {strength.label} password
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Role selector */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Role
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {ROLES.map(role => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: role.value })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `1.5px solid ${form.role === role.value ? '#6366f1' : 'var(--border)'}`,
                        background: form.role === role.value ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div>
                        <p style={{
                          fontSize: '13px', fontWeight: '700',
                          color: form.role === role.value ? '#818cf8' : 'var(--text-primary)',
                          marginBottom: '1px',
                        }}>
                          {role.label}
                        </p>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {role.desc}
                        </p>
                      </div>
                      {form.role === role.value && (
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#6366f1', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={11} color="white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: loading ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.4)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)'; }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '14px', height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Creating account…
                  </>
                ) : 'Create Account'}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </form>

          {/* Sign in link */}
          <p style={{
            textAlign: 'center', fontSize: '13px',
            color: 'var(--text-muted)', marginTop: '24px',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: '700', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '12px', color: 'var(--text-muted)',
        }}>
          By creating an account, you agree to our{' '}
          <span style={{ color: '#818cf8', cursor: 'pointer' }}>Terms</span>
          {' '}and{' '}
          <span style={{ color: '#818cf8', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Register;