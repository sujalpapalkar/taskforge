import { useState, useRef } from 'react';
import {
  User, Lock, Bell, Palette, Shield,
  Camera, Check, AlertCircle, Eye, EyeOff,
  Moon, Sun, Monitor, Save, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const card = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--card-shadow)',
};

const inputStyle = {
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '13.5px',
  padding: '9px 13px',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '9px 18px',
  background: '#6366f1', color: 'white',
  border: 'none', borderRadius: '8px',
  fontSize: '13.5px', fontWeight: '600',
  cursor: 'pointer', transition: 'all 0.15s ease',
  fontFamily: 'inherit',
};

const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '9px 16px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text-secondary)',
  fontSize: '13.5px', fontWeight: '500',
  cursor: 'pointer', transition: 'all 0.15s ease',
  fontFamily: 'inherit',
};

// ─── Reusable Field ───────────────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <div>
    <label style={{
      fontSize: '12.5px', fontWeight: '600',
      color: 'var(--text-secondary)',
      display: 'block', marginBottom: '6px',
    }}>
      {label}
    </label>
    {children}
    {hint && (
      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '5px' }}>
        {hint}
      </p>
    )}
  </div>
);

// ─── Alert Banner ──────────────────────────────────────────────────────────────
const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#10b981' },
    error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  color: '#ef4444' },
  };
  const s = styles[type];
  return (
    <div style={{
      padding: '10px 14px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: '8px',
      color: s.color,
      fontSize: '13px',
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '20px',
    }}>
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      {message}
    </div>
  );
};

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div style={{ ...card, overflow: 'hidden' }}>
    {/* Section header */}
    <div style={{
      padding: '20px 24px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px',
        background: 'rgba(99,102,241,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={16} color="#6366f1" />
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>

    {/* Section body */}
    <div style={{ padding: '24px' }}>
      {children}
    </div>
  </div>
);

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      width: '100%', padding: '9px 14px',
      borderRadius: '8px', border: 'none',
      background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
      color: active ? '#818cf8' : 'var(--text-secondary)',
      fontSize: '13.5px', fontWeight: active ? '600' : '500',
      cursor: 'pointer', transition: 'all 0.15s',
      textAlign: 'left', fontFamily: 'inherit',
      borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
  >
    <Icon size={15} />
    {label}
  </button>
);

// ─── Theme Option Card ────────────────────────────────────────────────────────
const ThemeOption = ({ icon: Icon, label, desc, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '16px',
      borderRadius: '10px',
      border: `1.5px solid ${active ? '#6366f1' : 'var(--border)'}`,
      background: active ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
      cursor: 'pointer', transition: 'all 0.15s',
      textAlign: 'left', fontFamily: 'inherit',
      position: 'relative',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
  >
    {active && (
      <div style={{
        position: 'absolute', top: '8px', right: '8px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Check size={10} color="white" />
      </div>
    )}
    <Icon size={20} color={active ? '#6366f1' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
    <p style={{ fontSize: '13px', fontWeight: '700', color: active ? '#818cf8' : 'var(--text-primary)', marginBottom: '3px' }}>
      {label}
    </p>
    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{desc}</p>
  </button>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       icon: User,    label: 'Profile'        },
  { id: 'security',      icon: Lock,    label: 'Security'       },
  { id: 'appearance',    icon: Palette, label: 'Appearance'     },
  { id: 'notifications', icon: Bell,    label: 'Notifications'  },
  { id: 'account',       icon: Shield,  label: 'Account'        },
];

const Settings = () => {
  const { user, logout, fetchUser } = useAuth();
  const { theme, toggleTheme }      = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profile, setProfile]   = useState({ name: user?.name || '', email: user?.email || '' });
  const [profStatus, setProfStatus] = useState({ type: '', msg: '' });
  const [profLoading, setProfLoading] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass]   = useState({ current: false, newPass: false, confirm: false });
  const [passStatus, setPassStatus] = useState({ type: '', msg: '' });
  const [passLoading, setPassLoading] = useState(false);

  // Notifications (local only — extend with API later)
  const [notifs, setNotifs] = useState({
    taskAssigned:  true,
    taskDue:       true,
    projectUpdate: false,
    weeklyDigest:  true,
    mentions:      true,
  });

  // ── Profile save ───────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!profile.name.trim()) {
      setProfStatus({ type: 'error', msg: 'Name cannot be empty' });
      return;
    }
    setProfLoading(true);
    setProfStatus({ type: '', msg: '' });
    try {
      await api.put('/auth/profile', profile);
      await fetchUser();
      setProfStatus({ type: 'success', msg: 'Profile updated successfully!' });
    } catch (err) {
      setProfStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfLoading(false);
    }
  };

  // ── Password save ──────────────────────────────────────────────────────────
  const handlePasswordSave = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPassStatus({ type: 'error', msg: 'All fields are required' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setPassStatus({ type: 'error', msg: 'New password must be at least 6 characters' });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPassStatus({ type: 'error', msg: 'New passwords do not match' });
      return;
    }
    setPassLoading(true);
    setPassStatus({ type: '', msg: '' });
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPasswords({ current: '', newPass: '', confirm: '' });
      setPassStatus({ type: 'success', msg: 'Password changed successfully!' });
    } catch (err) {
      setPassStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPassLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ── Password Field helper ──────────────────────────────────────────────────
  const PasswordField = ({ label, field, placeholder }) => (
    <Field label={label}>
      <div style={{ position: 'relative' }}>
        <input
          type={showPass[field] ? 'text' : 'password'}
          style={{ ...inputStyle, paddingRight: '40px' }}
          placeholder={placeholder}
          value={passwords[field]}
          onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          type="button"
          onClick={() => setShowPass(p => ({ ...p, [field]: !p[field] }))}
          style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            padding: '2px',
          }}
        >
          {showPass[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </Field>
  );

  // ── Toggle switch ──────────────────────────────────────────────────────────
  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '42px', height: '24px',
        borderRadius: '999px',
        background: checked ? '#6366f1' : 'var(--bg-tertiary)',
        border: `1.5px solid ${checked ? '#6366f1' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.2s ease',
        position: 'relative', flexShrink: 0,
        padding: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: checked ? 'calc(100% - 20px)' : '2px',
        width: '18px', height: '18px',
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  // ── Render active tab content ───────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {

      // ── Profile ──────────────────────────────────────────────────────────
      case 'profile': return (
        <Section icon={User} title="Profile Information" subtitle="Update your name and email address">
          <Alert type={profStatus.type} message={profStatus.msg} />

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true&size=128`}
                style={{
                  width: '76px', height: '76px', borderRadius: '16px',
                  border: '2px solid var(--border)', objectFit: 'cover',
                }}
                alt={user?.name}
              />
              <div style={{
                position: 'absolute', bottom: '-6px', right: '-6px',
                width: '26px', height: '26px', borderRadius: '50%',
                background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-secondary)',
                cursor: 'pointer',
              }}>
                <Camera size={12} color="white" />
              </div>
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {user?.email}
              </p>
              <span style={{
                display: 'inline-block', marginTop: '6px',
                fontSize: '11px', fontWeight: '700',
                padding: '2px 8px', borderRadius: '999px',
                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
              }}>
                {user?.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Field label="Full Name">
              <input
                style={inputStyle}
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            <Field label="Email Address" hint="Changing your email may require re-verification.">
              <input
                style={inputStyle}
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                placeholder="you@example.com"
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            <Field label="Role">
              <input
                style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                value={user?.role}
                disabled
              />
            </Field>

            <Field label="Auth Provider">
              <input
                style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                value={user?.authProvider === 'google' ? 'Google OAuth' : 'Email & Password'}
                disabled
              />
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '10px' }}>
            <button
              style={btnGhost}
              onClick={() => setProfile({ name: user?.name, email: user?.email })}
            >
              Reset
            </button>
            <button
              style={{ ...btnPrimary, opacity: profLoading ? 0.7 : 1 }}
              onClick={handleProfileSave}
              disabled={profLoading}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'none'; }}
            >
              <Save size={14} />
              {profLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Section>
      );

      // ── Security ───────────────────────────────────────────────────────────
      case 'security': return (
        <Section icon={Lock} title="Security Settings" subtitle="Manage your password and account security">
          <Alert type={passStatus.type} message={passStatus.msg} />

          {user?.authProvider === 'google' ? (
            <div style={{
              padding: '20px', borderRadius: '10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={18} color="#6366f1" />
              </div>
              <div>
                <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '3px' }}>
                  Google OAuth Account
                </p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Your account is secured via Google. Password management is handled by Google.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <PasswordField label="Current Password" field="current" placeholder="Enter current password" />
              <PasswordField label="New Password" field="newPass" placeholder="Min. 6 characters" />
              <PasswordField label="Confirm New Password" field="confirm" placeholder="Repeat new password" />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', gap: '10px' }}>
                <button style={btnGhost} onClick={() => setPasswords({ current: '', newPass: '', confirm: '' })}>
                  Clear
                </button>
                <button
                  style={{ ...btnPrimary, opacity: passLoading ? 0.7 : 1 }}
                  onClick={handlePasswordSave}
                  disabled={passLoading}
                  onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'none'; }}
                >
                  <Lock size={14} />
                  {passLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {/* Session info */}
          <div style={{
            marginTop: '24px', padding: '16px 18px',
            borderRadius: '10px', background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              Active Session
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Login method', value: user?.authProvider === 'google' ? 'Google OAuth' : 'Email/Password' },
                { label: 'Account status', value: user?.isActive ? '✅ Active' : '❌ Inactive' },
                { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      );

      // ── Appearance ─────────────────────────────────────────────────────────
      case 'appearance': return (
        <Section icon={Palette} title="Appearance" subtitle="Customize how TaskForge looks for you">
          <div style={{ marginBottom: '28px' }}>
            <p style={{
              fontSize: '12.5px', fontWeight: '600',
              color: 'var(--text-secondary)', marginBottom: '14px',
            }}>
              Theme
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ThemeOption
                icon={Sun}
                label="Light"
                desc="Clean white interface"
                active={theme === 'light'}
                onClick={() => theme !== 'light' && toggleTheme()}
              />
              <ThemeOption
                icon={Moon}
                label="Dark"
                desc="Easy on the eyes"
                active={theme === 'dark'}
                onClick={() => theme !== 'dark' && toggleTheme()}
              />
            </div>
          </div>

          {/* Preview card */}
          <div style={{
            padding: '20px',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Preview
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { color: '#6366f1', label: 'Primary'  },
                { color: '#10b981', label: 'Success'  },
                { color: '#f59e0b', label: 'Warning'  },
                { color: '#ef4444', label: 'Danger'   },
                { color: '#8b5cf6', label: 'Purple'   },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: color }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Active', 'On Hold', 'Completed', 'Archived'].map((s, i) => {
                const colors = ['#10b981', '#f59e0b', '#6366f1', '#64748b'];
                return (
                  <span key={s} style={{
                    fontSize: '11px', fontWeight: '700',
                    padding: '3px 10px', borderRadius: '999px',
                    background: `${colors[i]}18`, color: colors[i],
                  }}>
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        </Section>
      );

      // ── Notifications ──────────────────────────────────────────────────────
      case 'notifications': return (
        <Section icon={Bell} title="Notifications" subtitle="Choose what you want to be notified about">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { key: 'taskAssigned',  label: 'Task assigned to me',     desc: 'When someone assigns a task to you'           },
              { key: 'taskDue',       label: 'Task due reminders',       desc: 'Reminders when tasks are approaching deadline' },
              { key: 'projectUpdate', label: 'Project updates',          desc: 'When a project status changes'                },
              { key: 'weeklyDigest',  label: 'Weekly digest email',      desc: 'A summary of your week every Monday'          },
              { key: 'mentions',      label: 'Mentions in comments',     desc: 'When someone @mentions you in a comment'      },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1, paddingRight: '24px' }}>
                  <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                <Toggle
                  checked={notifs[key]}
                  onChange={val => setNotifs(p => ({ ...p, [key]: val }))}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              style={btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'none'; }}
            >
              <Save size={14} />
              Save Preferences
            </button>
          </div>
        </Section>
      );

      // ── Account ────────────────────────────────────────────────────────────
      case 'account': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Account info */}
          <Section icon={Shield} title="Account Details" subtitle="Your TaskForge account information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Account ID',    value: user?._id || '—'         },
                { label: 'Display Name',  value: user?.name || '—'        },
                { label: 'Email',         value: user?.email || '—'       },
                { label: 'Role',          value: user?.role || '—'        },
                { label: 'Auth Provider', value: user?.authProvider === 'google' ? 'Google OAuth' : 'Email/Password' },
                { label: 'Account Status',value: user?.isActive ? 'Active' : 'Inactive' },
                { label: 'Member Since',  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      maxWidth: '260px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontFamily: label === 'Account ID' ? 'JetBrains Mono, monospace' : 'inherit',
                      fontSize: label === 'Account ID' ? '11px' : '13px',

                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Danger zone */}
          <div style={{
            ...card,
            border: '1px solid rgba(239,68,68,0.2)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(239,68,68,0.15)',
              background: 'rgba(239,68,68,0.04)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>
                Danger Zone
              </p>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Logout all sessions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    Sign out of all sessions
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    This will log you out of all devices and sessions.
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    ...btnGhost,
                    color: '#ef4444',
                    borderColor: 'rgba(239,68,68,0.3)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: '800',
          color: 'var(--text-primary)', letterSpacing: '-0.5px',
        }}>
          Settings
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage your profile, security, and preferences.
        </p>
      </div>

      {/* ── Two column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Sidebar nav */}
        <div style={{ ...card, padding: '8px' }}>
          {/* User mini profile */}
          <div style={{
            padding: '14px 12px 12px',
            borderBottom: '1px solid var(--border)',
            marginBottom: '8px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true&size=64`}
              style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0 }}
              alt={user?.name}
            />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role}</p>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {TABS.map(tab => (
              <NavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Branding */}
          <div style={{
            marginTop: '12px', paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '12px 14px 6px',
          }}>
            <Zap size={12} color="#6366f1" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
              Task<span style={{ color: '#818cf8' }}>Forge</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;