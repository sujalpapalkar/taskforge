import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn utility — merges Tailwind classes safely
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    ...options,
  });
};

export const formatDateShort = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Done') return false;
  return new Date(dueDate) < new Date();
};

export const timeAgo = (date) => {
  if (!date) return '—';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year',   seconds: 31536000 },
    { label: 'month',  seconds: 2592000  },
    { label: 'week',   seconds: 604800   },
    { label: 'day',    seconds: 86400    },
    { label: 'hour',   seconds: 3600     },
    { label: 'minute', seconds: 60       },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

// ─── String helpers ───────────────────────────────────────────────────────────
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '…' : str;
};

export const initials = (name = '') => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const slugify = (str = '') => {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

// ─── Color helpers ────────────────────────────────────────────────────────────
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#3b82f6',
  '#ef4444', '#14b8a6',
];

// ─── Progress helpers ─────────────────────────────────────────────────────────
export const calcProgress = (total, done) => {
  if (!total || total === 0) return 0;
  return Math.round((done / total) * 100);
};

export const getHealthLabel = (progress) => {
  if (progress >= 75) return { label: 'Healthy',  color: '#10b981' };
  if (progress >= 40) return { label: 'At Risk',  color: '#f59e0b' };
  return                      { label: 'Critical', color: '#ef4444' };
};

// ─── Priority / Status maps ───────────────────────────────────────────────────
export const PRIORITY_META = {
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
};

export const STATUS_META = {
  'Todo':        { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Todo'        },
  'In Progress': { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  label: 'In Progress' },
  'Review':      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Review'      },
  'Done':        { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Done'        },
};

export const PROJECT_STATUS_META = {
  active:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Active'    },
  'on-hold': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'On Hold'   },
  completed: { color: '#818cf8', bg: 'rgba(99,102,241,0.1)',  label: 'Completed' },
  archived:  { color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: 'Archived'  },
};

// ─── Avatar URL ───────────────────────────────────────────────────────────────
export const avatarUrl = (name, size = 64) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=6366f1&color=fff&bold=true&size=${size}`;
};

// ─── Local storage helpers ────────────────────────────────────────────────────
export const storage = {
  get: (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* silent */ }
  },
  remove: (key) => {
    try { localStorage.removeItem(key); }
    catch { /* silent */ }
  },
};