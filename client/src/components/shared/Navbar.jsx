import { Menu, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, useMatches } from 'react-router-dom';

const STATIC_TITLES = {
  '/dashboard':  'Dashboard',
  '/projects':   'Projects',
  '/tasks':      'My Tasks',
  '/analytics':  'Analytics',
  '/settings':   'Settings',
};

const Navbar = ({ onMenuToggle, pageTitle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout }       = useAuth();
  const navigate               = useNavigate();
  const location               = useLocation();

  // Resolve title: prop override > static map > fallback
  const resolvedTitle =
    pageTitle ||
    STATIC_TITLES[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Project Detail' : 'TaskForge');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '64px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      gap: '16px',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuToggle}
          style={{
            padding: '6px', borderRadius: '6px',
            border: 'none', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            TaskForge
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {resolvedTitle}
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            padding: '7px', borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
        >
          {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button style={{
          padding: '7px', borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', position: 'relative',
        }}>
          <Bell size={15} />
          <span style={{
            position: 'absolute', top: '5px', right: '5px',
            width: '6px', height: '6px',
            background: '#ef4444', borderRadius: '50%',
            border: '1.5px solid var(--bg-secondary)',
          }} />
        </button>

        {/* Divider */}
        <div style={{
          width: '1px', height: '24px',
          background: 'var(--border)', margin: '0 4px',
        }} />

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`}
            alt={user?.name}
            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1.5px solid var(--border)' }}
          />
          <div style={{ lineHeight: 1.3 }}>
            <p style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            marginLeft: '4px', padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '13px', fontWeight: '500',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;