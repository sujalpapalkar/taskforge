import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Filter, MoreHorizontal,
  Calendar, User, Flag, MessageSquare, Trash2,
  CheckCircle, Clock, AlertTriangle, Users,
  X, AlertCircle, Tag, ChevronDown
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
  width: '100%',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px',
  background: '#6366f1', color: 'white',
  border: 'none', borderRadius: '8px',
  fontSize: '13.5px', fontWeight: '600',
  cursor: 'pointer', transition: 'all 0.15s ease',
  fontFamily: 'inherit',
};

const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '7px 13px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text-secondary)',
  fontSize: '13px', fontWeight: '500',
  cursor: 'pointer', transition: 'all 0.15s ease',
  fontFamily: 'inherit',
};

// ─── Constants ────────────────────────────────────────────────────────────────
const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done'];

const COLUMN_META = {
  'Todo':        { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: '○' },
  'In Progress': { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: '◑' },
  'Review':      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: '◐' },
  'Done':        { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '●' },
};

const PRIORITY_META = {
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Low'    },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Medium' },
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'High'   },
};
// ─── Reusable Field ───────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label style={{
      fontSize: '12px', fontWeight: '600',
      color: 'var(--text-secondary)',
      display: 'block', marginBottom: '6px',
    }}>
      {label}
    </label>
    {children}
  </div>
);
// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onOpen, onDelete }) => {
  const [hover, setHover] = useState(false);
  const pm = PRIORITY_META[task.priority] || PRIORITY_META.Medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover ? 'var(--card-shadow-hover)' : 'none',
        position: 'relative',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(task)}
    >
      {/* Priority + delete row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{
          fontSize: '10.5px', fontWeight: '700',
          padding: '2px 7px', borderRadius: '999px',
          background: pm.bg, color: pm.color,
        }}>
          {pm.label}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(task._id); }}
          style={{
            padding: '3px', borderRadius: '5px',
            border: 'none', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer',
            opacity: hover ? 1 : 0, transition: 'opacity 0.15s',
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Title */}
      <p style={{
        fontSize: '13.5px', fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '8px', lineHeight: 1.4,
      }}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p style={{
          fontSize: '12px', color: 'var(--text-muted)',
          marginBottom: '10px', lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
          {task.tags.slice(0, 2).map(t => (
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

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '10px',
        borderTop: '1px solid var(--border)',
      }}>
        {/* Assignee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {task.assignee ? (
            <>
              <img
                src={task.assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.name)}&background=6366f1&color=fff&bold=true&size=64`}
                alt={task.assignee.name}
                style={{ width: '20px', height: '20px', borderRadius: '50%' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {task.assignee.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unassigned</span>
          )}
        </div>

        {/* Due date + comments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {task.comments?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <MessageSquare size={11} />
              {task.comments.length}
            </div>
          )}
          {task.dueDate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '11px', fontWeight: '500',
              color: isOverdue ? '#ef4444' : 'var(--text-muted)',
            }}>
              <Calendar size={11} />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Create Task Modal ────────────────────────────────────────────────────────
const CreateTaskModal = ({ projectId, members, defaultStatus, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'Medium',
    status: defaultStatus || 'Todo',
    assignee: '', dueDate: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Task title is required'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        assignee: form.assignee || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
      onCreated(data.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...card, width: '100%', maxWidth: '500px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
              New Task
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Add a task to this project
            </p>
          </div>
          <button onClick={onClose} style={{ ...btnGhost, padding: '6px 10px' }}>
            <X size={14} />
          </button>
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
          <Field label="Title *">
            <input
              style={inputStyle}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </Field>

          <Field label="Description">
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              placeholder="Add more details…"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Priority">
              <select
                style={{ ...inputStyle }}
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                {['Low', 'Medium', 'High'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                style={{ ...inputStyle }}
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {COLUMNS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Assignee">
              <select
                style={{ ...inputStyle }}
                value={form.assignee}
                onChange={e => setForm({ ...form, assignee: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user?._id} value={m.user?._id}>
                    {m.user?.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Due Date">
              <input
                type="date"
                style={inputStyle}
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Tags (comma separated)">
            <input
              style={inputStyle}
              placeholder="frontend, bug, urgent"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </Field>
        </div>

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
            {loading ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Task Detail Modal ────────────────────────────────────────────────────────
const TaskDetailModal = ({ task, members, onClose, onUpdated }) => {
  const [status, setStatus]     = useState(task.status);
  const [comment, setComment]   = useState('');
  const [comments, setComments] = useState(task.comments || []);
  const [saving, setSaving]     = useState(false);
  const [closing, setClosing]   = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const pm = PRIORITY_META[task.priority] || PRIORITY_META.Medium;

  // Just update local state — don't call API yet
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setStatusChanged(newStatus !== task.status);
  };

  // Save status + close
  const handleSaveAndClose = async () => {
    setClosing(true);
    try {
      if (statusChanged) {
        const { data } = await api.put(`/tasks/${task._id}`, { status });
        const updatedTask = data.data?.task || data.task || data;
        onUpdated(updatedTask);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save:', err.response?.data);
      setClosing(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { content: comment });
      setComments(data.data.comments);
      setComment('');
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => e.target === e.currentTarget && handleSaveAndClose()}
    >
      <div style={{ ...card, width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '2px 7px', borderRadius: '999px', background: pm.bg, color: pm.color }}>
                  {pm.label}
                </span>
                {task.tags?.map(t => (
                  <span key={t} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {t}
                  </span>
                ))}
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {task.title}
              </h2>
            </div>
            {/* Save & Close button */}
            <button
              onClick={handleSaveAndClose}
              disabled={closing}
              style={{
                ...btnPrimary,
                padding: '7px 14px',
                fontSize: '13px',
                opacity: closing ? 0.7 : 1,
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; }}
            >
              {closing ? 'Saving…' : statusChanged ? '💾 Save & Close' : 'Close'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          
          {/* Status selector */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Status
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {COLUMNS.map(s => {
                const cm = COLUMN_META[s];
                const isActive = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    style={{
                      padding: '5px 12px', borderRadius: '999px',
                      fontSize: '12px', fontWeight: '600',
                      border: `1px solid ${isActive ? cm.color : 'var(--border)'}`,
                      background: isActive ? cm.bg : 'transparent',
                      color: isActive ? cm.color : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {/* Status changed hint */}
            {statusChanged && (
              <p style={{ fontSize: '11.5px', color: '#f59e0b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⚠️ Status changed to <strong>{status}</strong> — click Save & Close to apply
              </p>
            )}
          </div>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Assignee</p>
              {task.assignee ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={task.assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.name)}&background=6366f1&color=fff&bold=true`} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt={task.assignee.name} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{task.assignee.name}</span>
                </div>
              ) : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Unassigned</span>}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Due Date</p>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No due date'}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Reporter</p>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{task.reporter?.name || '—'}</span>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Created</p>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Description</p>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                {task.description}
              </p>
            </div>
          )}

          {/* Comments */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Comments ({comments.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet.</p>
              ) : comments.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <img
                    src={c.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.name || 'U')}&background=6366f1&color=fff&bold=true`}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0 }}
                    alt={c.author?.name}
                  />
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{c.author?.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Add a comment…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}
                onClick={handleComment}
                disabled={saving}
              >
                {saving ? '…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Kanban Column ────────────────────────────────────────────────────────────
const KanbanColumn = ({ status, tasks, onAddTask, onOpenTask, onDeleteTask }) => {
  const meta = COLUMN_META[status];
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minWidth: '280px', flex: 1,
      background: 'var(--bg-tertiary)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      height: 'calc(100vh - 300px)',
      minHeight: '400px',
    }}>
      {/* Column header */}
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: meta.color }}>{meta.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {status}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: '700',
            padding: '1px 7px', borderRadius: '999px',
            background: meta.bg, color: meta.color,
          }}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          style={{
            padding: '3px', borderRadius: '5px',
            border: 'none', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = '#6366f1'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Tasks */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '300px' }}>

        {tasks.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px 16px', gap: '8px',
            border: '2px dashed var(--border)',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>{meta.icon}</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              No tasks here
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onOpen={onOpenTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
// ─── Manage Members Modal ─────────────────────────────────────────────────────
const MEMBER_ROLES = ['Member', 'Manager', 'Admin'];

const ManageMembersModal = ({ project, onClose, onUpdated }) => {
  const [email, setEmail]       = useState('');
  const [role, setRole]         = useState('Member');
  const [loading, setLoading]   = useState(false);
  const [removing, setRemoving] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleAdd = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const { data } = await api.post(`/projects/${project._id}/members`, { email, role });
      onUpdated(data.data.project);
      setSuccess(`${email} added successfully!`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this project?`)) return;
    setRemoving(userId); setError(''); setSuccess('');
    try {
      const { data } = await api.delete(`/projects/${project._id}/members/${userId}`);
      onUpdated(data.data.project);
      setSuccess(`${userName} removed.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally { setRemoving(''); }
  };

  const ROLE_COLORS = {
    Admin:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
    Manager: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
    Member:  { color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        ...card,
        width: '100%', maxWidth: '480px',
        padding: '28px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Manage Members
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {project.name} · {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ ...btnGhost, padding: '6px 10px' }}>
            <X size={14} />
          </button>
        </div>

        {/* Alerts */}
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
        {success && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '8px', color: '#10b981',
            fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center',
          }}>
            <CheckCircle size={14} /> {success}
          </div>
        )}

        {/* Add member form */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          marginBottom: '20px',
        }}>
          <p style={{
            fontSize: '12px', fontWeight: '700',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            Add New Member
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              style={inputStyle}
              placeholder="member@email.com"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            {/* Role selector */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {MEMBER_ROLES.map(r => {
                const rc = ROLE_COLORS[r];
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1, padding: '7px',
                      borderRadius: '8px',
                      border: `1.5px solid ${role === r ? rc.color : 'var(--border)'}`,
                      background: role === r ? rc.bg : 'transparent',
                      color: role === r ? rc.color : 'var(--text-muted)',
                      fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleAdd}
              disabled={loading}
              style={{
                ...btnPrimary,
                width: '100%', justifyContent: 'center',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; }}
            >
              <Plus size={14} />
              {loading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </div>

        {/* Current members list */}
        <div>
          <p style={{
            fontSize: '12px', fontWeight: '700',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '10px',
          }}>
            Current Members ({project.members?.length})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {project.members?.map((m, i) => {
              const rc = ROLE_COLORS[m.role] || ROLE_COLORS.Member;
              const isOwner = project.owner === m.user?._id ||
                              project.owner?._id === m.user?._id;
              return (
                <div
                  key={m.user?._id || i}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                >
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'U')}&background=6366f1&color=fff&bold=true&size=64`}
                      style={{
                        width: '34px', height: '34px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border)',
                      }}
                      alt={m.user?.name}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {m.user?.name}
                        </p>
                        {isOwner && (
                          <span style={{
                            fontSize: '10px', fontWeight: '700',
                            padding: '1px 6px', borderRadius: '999px',
                            background: 'rgba(99,102,241,0.1)',
                            color: '#818cf8',
                          }}>
                            Owner
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {m.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Role + remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      padding: '3px 8px', borderRadius: '999px',
                      background: rc.bg, color: rc.color,
                    }}>
                      {m.role}
                    </span>
                    {!isOwner && (
                      <button
                        onClick={() => handleRemove(m.user?._id, m.user?.name)}
                        disabled={removing === m.user?._id}
                        style={{
                          padding: '5px', borderRadius: '6px',
                          border: 'none', background: 'transparent',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          transition: 'all 0.15s',
                          opacity: removing === m.user?._id ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        title="Remove member"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
// ─── Main Page ────────────────────────────────────────────────────────────────
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPageTitle } = useOutletContext() || {};


  const [project, setProject]         = useState(null);
  const [grouped, setGrouped]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('Todo');
  const [activeTask, setActiveTask]   = useState(null);
  const [search, setSearch]           = useState('');
  const [priorityFilter, setPriority] = useState('all');
  const [showMembers, setShowMembers] = useState(false);

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);
      setProject(projRes.data.data.project);
      setGrouped(taskRes.data.data.grouped);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  useEffect(() => {
  if (project?.name && setPageTitle) {
    setPageTitle(project.name);
  }
  return () => { if (setPageTitle) setPageTitle(''); };
}, [project?.name]);


  const handleTaskCreated = (task) => {
    setGrouped(prev => ({
      ...prev,
      [task.status]: [task, ...(prev[task.status] || [])],
    }));
  };

  const handleTaskUpdated = (updated) => {
    setGrouped(prev => {
      const next = { ...prev };
      COLUMNS.forEach(col => {
        next[col] = (next[col] || []).filter(t => t._id !== updated._id);
      });
      next[updated.status] = [updated, ...(next[updated.status] || [])];
      return next;
    });
    setActiveTask(updated);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setGrouped(prev => {
        const next = { ...prev };
        COLUMNS.forEach(col => {
          next[col] = (next[col] || []).filter(t => t._id !== taskId);
        });
        return next;
      });
      if (activeTask?._id === taskId) setActiveTask(null);
    } catch { alert('Failed to delete task'); }
  };

  const handleAddTask = (status) => {
    setDefaultStatus(status);
    setShowCreate(true);
  };

  // Filter tasks
  const getFilteredTasks = (tasks = []) => {
    return tasks.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  };

  const totalTasks = COLUMNS.reduce((sum, col) => sum + (grouped[col]?.length || 0), 0);
  const doneTasks  = grouped['Done']?.length || 0;
  const progress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!project) return null;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{ ...btnGhost, padding: '6px 12px', marginBottom: '16px', fontSize: '12.5px' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        >
          <ArrowLeft size={13} /> Back to Projects
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
              background: `${project.color || '#6366f1'}20`,
              border: `1px solid ${project.color || '#6366f1'}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: project.color || '#6366f1' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
                {project.name}
              </h1>
              {project.description && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              style={btnGhost}
              onClick={() => setShowMembers(true)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            >
              <Users size={15} /> Members
            </button>
            <button
              style={btnPrimary}
              onClick={() => handleAddTask('Todo')}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Plus size={15} /> Add Task
            </button>
          </div>
        </div>

        {/* Project meta strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          marginTop: '16px', flexWrap: 'wrap',
        }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
            <div style={{ flex: 1, height: '5px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: progress === 100 ? '#10b981' : `linear-gradient(90deg, ${project.color || '#6366f1'}, #8b5cf6)`,
                borderRadius: '999px', transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', minWidth: '32px' }}>
              {progress}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <CheckCircle size={13} color="#10b981" />
            <span>{doneTasks}/{totalTasks} tasks done</span>
          </div>

          {project.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              <Calendar size={13} />
              <span>Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <Users size={13} />
            <div style={{ display: 'flex' }}>
              {project.members?.slice(0, 4).map((m, i) => (
                <img
                  key={m.user?._id || i}
                  src={m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'U')}&background=6366f1&color=fff&bold=true&size=64`}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--bg-secondary)', marginLeft: i > 0 ? '-6px' : 0 }}
                  alt={m.user?.name}
                />
              ))}
            </div>
            <span>{project.members?.length} members</span>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        ...card, padding: '10px 14px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            style={{ ...inputStyle, paddingLeft: '30px' }}
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'Low', 'Medium', 'High'].map(p => {
            const pm = PRIORITY_META[p];
            return (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  padding: '5px 11px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: '600',
                  border: `1px solid ${priorityFilter === p && pm ? pm.color : 'var(--border)'}`,
                  background: priorityFilter === p ? (pm ? pm.bg : '#6366f120') : 'transparent',
                  color: priorityFilter === p ? (pm ? pm.color : '#6366f1') : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {p === 'all' ? 'All Priority' : p}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
        gap: '14px',
        paddingBottom: '16px',
        overflowX: 'auto',
        alignItems: 'start',
      }}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col}
            status={col}
            tasks={getFilteredTasks(grouped[col] || [])}
            onAddTask={handleAddTask}
            onOpenTask={setActiveTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateTaskModal
          projectId={id}
          members={project.members || []}
          defaultStatus={defaultStatus}
          onClose={() => setShowCreate(false)}
          onCreated={handleTaskCreated}
        />
      )}
      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          members={project.members || []}
          onClose={() => setActiveTask(null)}
          onUpdated={handleTaskUpdated}
        />
      )}
      {showMembers && (
        <ManageMembersModal
          project={project}
          onClose={() => setShowMembers(false)}
          onUpdated={(updatedProject) => {
            setProject(updatedProject);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;