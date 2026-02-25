import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Plus, Search, Filter, MoreHorizontal,
  Calendar, Users, CheckCircle, Clock, Trash2, Edit3,
  ArrowUpRight, Tag, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  active:    { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', label: 'Active'    },
  'on-hold': { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', label: 'On Hold'   },
  completed: { bg: 'rgba(99,102,241,0.1)',  color: '#818cf8', label: 'Completed' },
  archived:  { bg: 'rgba(100,116,139,0.1)', color: '#64748b', label: 'Archived'  },
};

const PROJECT_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#3b82f6','#ef4444','#14b8a6',
];

// ─── Shared style tokens ────────────────────────────────────────────────────
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
  fontSize: '13px',
  padding: '8px 12px',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px',
  background: '#6366f1', color: 'white',
  border: 'none', borderRadius: '8px',
  fontSize: '13.5px', fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 14px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text-secondary)',
  fontSize: '13px', fontWeight: '500',
  cursor: 'pointer', transition: 'all 0.15s ease',
};

// ─── Modal ──────────────────────────────────────────────────────────────────
const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '', description: '', deadline: '', color: '#6366f1', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const { data } = await api.post('/projects', payload);
      onCreated(data.data.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...card, width: '100%', maxWidth: '480px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
              New Project
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Set up your project workspace
            </p>
          </div>
          <button onClick={onClose} style={{ ...btnGhost, padding: '6px 10px' }}>✕</button>
        </div>

        {error && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', color: '#ef4444',
            fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center',
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Project Name *
            </label>
            <input
              style={{ ...inputStyle, width: '100%' }}
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              style={{ ...inputStyle, width: '100%', resize: 'vertical', minHeight: '80px' }}
              placeholder="What is this project about?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Deadline + Color row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Deadline
              </label>
              <input
                type="date"
                style={{ ...inputStyle, width: '100%' }}
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: '22px', height: '22px',
                      borderRadius: '50%', background: c,
                      border: form.color === c ? '2px solid white' : '2px solid transparent',
                      cursor: 'pointer',
                      boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Tags <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(comma separated)</span>
            </label>
            <input
              style={{ ...inputStyle, width: '100%' }}
              placeholder="design, frontend, api"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={onClose}>Cancel</button>
          <button
            style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
            onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'none'; }}
          >
            <Plus size={15} />
            {loading ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Project Card ────────────────────────────────────────────────────────────
const ProjectCard = ({ project, onDelete, onClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const sc = STATUS_STYLES[project.status] || STATUS_STYLES.active;
  const progress = project.progress ?? 0;
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';

  return (
    <div
      style={{
        ...card,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovering ? 'translateY(-2px)' : 'none',
        boxShadow: hovering ? 'var(--card-shadow-hover)' : 'var(--card-shadow)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => onClick(project._id)}
    >
      {/* Color bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: project.color || '#6366f1',
      }} />

      <div style={{ padding: '20px' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Project icon */}
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '8px',
              background: `${project.color || '#6366f1'}20`,
              border: `1px solid ${project.color || '#6366f1'}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FolderKanban size={16} color={project.color || '#6366f1'} />
            </div>
            <div>
              <h3 style={{
                fontSize: '14px', fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '2px',
              }}>
                {project.name}
              </h3>
              <span style={{
                fontSize: '11px', fontWeight: '600',
                background: sc.bg, color: sc.color,
                padding: '2px 7px', borderRadius: '999px',
              }}>
                {sc.label}
              </span>
            </div>
          </div>

          {/* Menu */}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: '4px', borderRadius: '6px',
                border: 'none', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%',
                marginTop: '4px', zIndex: 10,
                ...card,
                minWidth: '140px',
                padding: '4px',
              }}>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 10px',
                    background: 'transparent', border: 'none',
                    borderRadius: '6px', cursor: 'pointer',
                    fontSize: '13px', color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => { onClick(project._id); setMenuOpen(false); }}
                >
                  <ArrowUpRight size={14} /> Open
                </button>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 10px',
                    background: 'transparent', border: 'none',
                    borderRadius: '6px', cursor: 'pointer',
                    fontSize: '13px', color: '#ef4444',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => { onDelete(project._id); setMenuOpen(false); }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p style={{
            fontSize: '12.5px', color: 'var(--text-muted)',
            marginBottom: '14px', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: '11px', fontWeight: '500',
                padding: '2px 8px', borderRadius: '999px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: progress === 100 ? '#10b981' : 'var(--text-secondary)' }}>
              {progress}%
            </span>
          </div>
          <div style={{
            height: '5px', background: 'var(--bg-tertiary)',
            borderRadius: '999px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: progress === 100
                ? '#10b981'
                : `linear-gradient(90deg, ${project.color || '#6366f1'}, ${project.color || '#8b5cf6'})`,
              borderRadius: '999px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Footer row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
        }}>
          {/* Members */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex' }}>
              {project.members?.slice(0, 3).map((m, i) => (
                <img
                  key={m.user?._id || i}
                  src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'U')}&background=6366f1&color=fff&bold=true&size=64`}
                  alt={m.user?.name}
                  style={{
                    width: '22px', height: '22px',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-secondary)',
                    marginLeft: i > 0 ? '-6px' : 0,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Deadline */}
          {project.deadline && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: '500',
              color: isOverdue ? '#ef4444' : 'var(--text-muted)',
            }}>
              <Calendar size={11} />
              {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {isOverdue && <span style={{ color: '#ef4444' }}> · Overdue</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ onCreateClick }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 24px', gap: '16px', textAlign: 'center',
  }}>
    <div style={{
      width: '64px', height: '64px',
      borderRadius: '16px',
      background: 'rgba(99,102,241,0.1)',
      border: '1px solid rgba(99,102,241,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <FolderKanban size={28} color="#6366f1" />
    </div>
    <div>
      <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
        No projects yet
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
        Create your first project to start organizing tasks and collaborating with your team.
      </p>
    </div>
    <button
      style={btnPrimary}
      onClick={onCreateClick}
      onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'none'; }}
    >
      <Plus size={15} /> Create First Project
    </button>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
const Projects = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [projects, setProjects]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [viewMode, setViewMode]     = useState('grid'); // grid | list

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data.projects);
      setFiltered(data.data.projects);
    } catch { /* handled silently */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    let result = projects;
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    setFiltered(result);
  }, [search, statusFilter, projects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch { alert('Failed to delete project'); }
  };

  const handleCreated = (project) => {
    setProjects(prev => [project, ...prev]);
  };

  // Stats
  const stats = {
    total:     projects.length,
    active:    projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold:    projects.filter(p => p.status === 'on-hold').length,
  };

  const statCards = [
    { label: 'Total',     value: stats.total,     color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
    { label: 'Active',    value: stats.active,    color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
    { label: 'Completed', value: stats.completed, color: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
    { label: 'On Hold',   value: stats.onHold,    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Projects
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage and track all your team projects in one place.
          </p>
        </div>
        <button
          style={btnPrimary}
          onClick={() => setShowModal(true)}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* ── Stat Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.value}</span>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters Bar ── */}
      <div style={{
        ...card, padding: '12px 16px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            style={{ ...inputStyle, width: '100%', paddingLeft: '32px' }}
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'active', 'on-hold', 'completed', 'archived'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: '6px 12px', borderRadius: '999px',
                fontSize: '12px', fontWeight: '600',
                border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s',
                background: statusFilter === s ? '#6366f1' : 'var(--bg-tertiary)',
                color: statusFilter === s ? 'white' : 'var(--text-secondary)',
              }}
            >
              {s === 'all' ? 'All' : STATUS_STYLES[s]?.label || s}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{
          display: 'flex', gap: '2px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: '8px', padding: '3px',
        }}>
          {[{ v: 'grid', icon: '⊞' }, { v: 'list', icon: '☰' }].map(({ v, icon }) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                padding: '4px 10px', borderRadius: '6px',
                border: 'none', cursor: 'pointer',
                fontSize: '14px',
                background: viewMode === v ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === v ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === v ? 'var(--card-shadow)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div style={{
            width: '32px', height: '32px',
            border: '3px solid var(--border)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={card}>
          <EmptyState onCreateClick={() => setShowModal(true)} />
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              onDelete={handleDelete}
              onClick={id => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div style={{ ...card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Project', 'Status', 'Members', 'Progress', 'Deadline', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left',
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = STATUS_STYLES[p.status] || STATUS_STYLES.active;
                const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed';
                return (
                  <tr
                    key={p._id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => navigate(`/projects/${p._id}`)}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: p.color || '#6366f1', flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '999px', background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {p.members?.length}
                    </td>
                    <td style={{ padding: '14px 20px', minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '5px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p.progress ?? 0}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '999px' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '28px' }}>{p.progress ?? 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}>
                      {p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }} onClick={e => e.stopPropagation()}>
                      <button
                        style={{ ...btnGhost, padding: '5px 8px', color: '#ef4444', borderColor: 'transparent' }}
                        onClick={() => handleDelete(p._id)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default Projects;