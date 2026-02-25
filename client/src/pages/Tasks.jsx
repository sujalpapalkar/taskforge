import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Search, Calendar, Flag,
  User, MessageSquare, ArrowUpRight,
  Clock, CheckCircle, AlertTriangle,
  Circle, Loader, Eye, Filter
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const PRIORITY_META = {
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
};

const STATUS_META = {
  'Todo':        { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: Circle,   label: 'Todo'        },
  'In Progress': { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: Loader,   label: 'In Progress' },
  'Review':      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Eye,      label: 'Review'      },
  'Done':        { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle, label: 'Done'     },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px',
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{
        fontSize: '11px', fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: '2px',
      }}>
        {label}
      </p>
      <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ filtered }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '72px 24px', gap: '14px', textAlign: 'center',
  }}>
    <div style={{
      width: '56px', height: '56px', borderRadius: '14px',
      background: 'rgba(99,102,241,0.1)',
      border: '1px solid rgba(99,102,241,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CheckSquare size={24} color="#6366f1" />
    </div>
    <div>
      <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
        {filtered ? 'No matching tasks' : 'No tasks assigned to you'}
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.6 }}>
        {filtered
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Tasks assigned to you across all projects will appear here.'}
      </p>
    </div>
  </div>
);

// ─── Task Row ─────────────────────────────────────────────────────────────────
const TaskRow = ({ task, onNavigate }) => {
  const [hover, setHover] = useState(false);
  const pm = PRIORITY_META[task.priority] || PRIORITY_META.Medium;
  const sm = STATUS_META[task.status]   || STATUS_META['Todo'];
  const StatusIcon = sm.icon;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border)',
        background: hover ? 'var(--bg-tertiary)' : 'transparent',
        transition: 'background 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onNavigate(task.project?._id || task.project)}
    >
      {/* Task title */}
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <StatusIcon
            size={15}
            color={sm.color}
            style={{ marginTop: '1px', flexShrink: 0 }}
          />
          <div>
            <p style={{
              fontSize: '13.5px', fontWeight: '600',
              color: 'var(--text-primary)', marginBottom: '3px',
              textDecoration: task.status === 'Done' ? 'line-through' : 'none',
              opacity: task.status === 'Done' ? 0.6 : 1,
            }}>
              {task.title}
            </p>
            {task.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {task.tags.slice(0, 3).map(t => (
                  <span key={t} style={{
                    fontSize: '10px', fontWeight: '500',
                    padding: '1px 6px', borderRadius: '999px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Project */}
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: task.project?.color || '#6366f1', flexShrink: 0,
          }} />
          <span style={{
            fontSize: '12.5px', fontWeight: '500',
            color: 'var(--text-secondary)',
            maxWidth: '140px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {task.project?.name || '—'}
          </span>
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '14px 20px' }}>
        <span style={{
          fontSize: '11px', fontWeight: '700',
          padding: '3px 9px', borderRadius: '999px',
          background: sm.bg, color: sm.color,
        }}>
          {sm.label}
        </span>
      </td>

      {/* Priority */}
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flag size={12} color={pm.color} />
          <span style={{ fontSize: '12.5px', fontWeight: '600', color: pm.color }}>
            {task.priority}
          </span>
        </div>
      </td>

      {/* Due date */}
      <td style={{ padding: '14px 20px' }}>
        {task.dueDate ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '12.5px', fontWeight: '500',
            color: isOverdue ? '#ef4444' : 'var(--text-muted)',
          }}>
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && (
              <span style={{
                fontSize: '10px', fontWeight: '700',
                padding: '1px 5px', borderRadius: '999px',
                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              }}>
                Overdue
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
        )}
      </td>

      {/* Comments */}
      <td style={{ padding: '14px 20px' }}>
        {task.comments?.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <MessageSquare size={12} />
            {task.comments.length}
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
        )}
      </td>

      {/* Navigate arrow */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{
          opacity: hover ? 1 : 0,
          transition: 'opacity 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowUpRight size={15} color="#6366f1" />
        </div>
      </td>
    </tr>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allTasks, setAllTasks]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [priorityFilter, setPriority] = useState('all');
  const [sortBy, setSortBy]       = useState('dueDate');

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        // Fetch all projects user belongs to, then get tasks assigned to them
        const { data: projData } = await api.get('/projects');
        const projects = projData.data.projects;

        const taskArrays = await Promise.all(
          projects.map(p =>
            api.get(`/projects/${p._id}/tasks`)
              .then(r => r.data.data.tasks.map(t => ({
                ...t,
                project: { _id: p._id, name: p.name, color: p.color },
              })))
              .catch(() => [])
          )
        );

        const mine = taskArrays
          .flat()
          .filter(t => t.assignee?._id === user._id || t.reporter?._id === user._id);

        setAllTasks(mine);
        setFiltered(mine);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchMyTasks();
  }, [user._id]);

  useEffect(() => {
    let result = [...allTasks];

    if (search)
      result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all')
      result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all')
      result = result.filter(t => t.priority === priorityFilter);

    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'status') {
        const order = { 'Todo': 0, 'In Progress': 1, 'Review': 2, 'Done': 3 };
        return order[a.status] - order[b.status];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFiltered(result);
  }, [search, statusFilter, priorityFilter, sortBy, allTasks]);

  // Stats
  const stats = {
    total:      allTasks.length,
    inProgress: allTasks.filter(t => t.status === 'In Progress').length,
    overdue:    allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length,
    done:       allTasks.filter(t => t.status === 'Done').length,
  };

  const isFiltered = search || statusFilter !== 'all' || priorityFilter !== 'all';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: '800',
          color: 'var(--text-primary)', letterSpacing: '-0.5px',
        }}>
          My Tasks
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          All tasks assigned to you or reported by you across every project.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        <StatCard
          label="Total Tasks"
          value={stats.total}
          icon={CheckSquare}
          color="#6366f1"
          bg="rgba(99,102,241,0.1)"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Loader}
          color="#6366f1"
          bg="rgba(99,102,241,0.1)"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color="#ef4444"
          bg="rgba(239,68,68,0.1)"
        />
        <StatCard
          label="Completed"
          value={stats.done}
          icon={CheckCircle}
          color="#10b981"
          bg="rgba(16,185,129,0.1)"
        />
      </div>

      {/* ── Filter + Sort Bar ── */}
      <div style={{
        ...card,
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={13} style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }} />
          <input
            style={{ ...inputStyle, width: '100%', paddingLeft: '30px' }}
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {['all', 'Todo', 'In Progress', 'Review', 'Done'].map(s => {
            const sm = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: '5px 11px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: '600',
                  border: `1px solid ${statusFilter === s && sm ? sm.color : 'var(--border)'}`,
                  background: statusFilter === s ? (sm ? sm.bg : 'rgba(99,102,241,0.1)') : 'transparent',
                  color: statusFilter === s ? (sm ? sm.color : '#6366f1') : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            );
          })}
        </div>

        {/* Priority pills */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {['all', 'High', 'Medium', 'Low'].map(p => {
            const pm = PRIORITY_META[p];
            return (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  padding: '5px 11px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: '600',
                  border: `1px solid ${priorityFilter === p && pm ? pm.color : 'var(--border)'}`,
                  background: priorityFilter === p ? (pm ? pm.bg : 'rgba(99,102,241,0.1)') : 'transparent',
                  color: priorityFilter === p ? (pm ? pm.color : '#6366f1') : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {p === 'all' ? 'All' : p}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select
          style={{ ...inputStyle, minWidth: '130px' }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="status">Sort: Status</option>
          <option value="createdAt">Sort: Newest</option>
        </select>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p style={{
          fontSize: '12.5px', color: 'var(--text-muted)',
          marginBottom: '12px', paddingLeft: '4px',
        }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{allTasks.length}</strong> tasks
        </p>
      )}

      {/* ── Table ── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
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
          <EmptyState filtered={isFiltered} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
                {[
                  { label: 'Task',     width: 'auto' },
                  { label: 'Project',  width: '160px' },
                  { label: 'Status',   width: '130px' },
                  { label: 'Priority', width: '110px' },
                  { label: 'Due Date', width: '140px' },
                  { label: 'Comments', width: '90px' },
                  { label: '',         width: '48px' },
                ].map(({ label, width }) => (
                  <th key={label} style={{
                    padding: '10px 20px',
                    textAlign: 'left',
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width,
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onNavigate={projectId => navigate(`/projects/${projectId}`)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Status breakdown footer ── */}
      {!loading && allTasks.length > 0 && (
        <div style={{
          ...card,
          padding: '14px 20px',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Breakdown
          </p>
          {Object.entries(STATUS_META).map(([status, meta]) => {
            const count = allTasks.filter(t => t.status === status).length;
            const pct = allTasks.length > 0 ? Math.round((count / allTasks.length) * 100) : 0;
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color }} />
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {meta.label}
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {count}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({pct}%)</span>
              </div>
            );
          })}

          {/* Mini progress bar */}
          <div style={{ flex: 1, minWidth: '120px', height: '5px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
            {Object.entries(STATUS_META).map(([status, meta]) => {
              const count = allTasks.filter(t => t.status === status).length;
              const pct = allTasks.length > 0 ? (count / allTasks.length) * 100 : 0;
              return pct > 0 ? (
                <div key={status} style={{ height: '100%', width: `${pct}%`, background: meta.color, transition: 'width 0.6s ease' }} />
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;