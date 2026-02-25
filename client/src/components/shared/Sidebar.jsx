import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  BarChart2, Settings, Zap, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  return (
    <aside
      style={{
        width: isOpen ? '228px' : '60px',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        minHeight: '64px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 12px rgba(99,102,241,0.4)',
        }}>
          <Zap size={15} color="white" fill="white" />
        </div>
        {isOpen && (
          <span style={{
            fontSize: '15px',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
          }}>
            Task<span style={{ color: '#818cf8' }}>Forge</span>
          </span>
        )}
      </div>

      {/* Nav section label */}
      {isOpen && (
        <div style={{
          padding: '20px 16px 8px',
          fontSize: '10px',
          fontWeight: '700',
          color: '#334155',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Main Menu
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: isOpen ? '9px 12px' : '9px',
              justifyContent: isOpen ? 'flex-start' : 'center',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#a5b4fc' : '#64748b',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.style.borderLeft.includes('6366f1')) {
                e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                e.currentTarget.style.color = '#c7d2fe';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.borderLeft.includes('6366f1')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }
            }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {isOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`}
            alt={user?.name}
            style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              flexShrink: 0,
              border: '1.5px solid rgba(99,102,241,0.4)',
            }}
          />
          {isOpen && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p style={{
                fontSize: '13px', fontWeight: '600',
                color: '#e2e8f0', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '11px', color: '#475569' }}>{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;