import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  AreaChart, Area, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, CheckCircle,
  Clock, AlertTriangle, FolderOpen,
  BarChart2, Target, Zap
} from 'lucide-react';
import api from '../services/api';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const card = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--card-shadow)',
};

const STATUS_COLORS = {
  'Todo':        '#94a3b8',
  'In Progress': '#6366f1',
  'Review':      '#f59e0b',
  'Done':        '#10b981',
};

const PRIORITY_COLORS = {
  'Low':    '#10b981',
  'Medium': '#f59e0b',
  'High':   '#ef4444',
};

const CHART_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '8px', padding: '10px 14px',
      fontSize: '12px', color: 'var(--text-primary)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      {label && <p style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: i > 0 ? '4px' : 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || p.fill }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name || p.dataKey}:</span>
          <span style={{ fontWeight: '700' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Section Header ──────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px',
      background: 'rgba(99,102,241,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={15} color="#6366f1" />
    </div>
    <div>
      <p style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{subtitle}</p>}
    </div>
  </div>
);

// ─── KPI Card ───────────────────────────────────────────────────────────────
const KPICard = ({ label, value, suffix, icon: Icon, color, bg, sub }) => (
  <div style={{
    ...card, padding: '20px',
    position: 'relative', overflow: 'hidden',
    cursor: 'default',
    transition: 'all 0.2s ease',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--card-shadow)';
    }}
  >
    {/* Accent top bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
      background: color, opacity: 0.7,
    }} />

    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{
          fontSize: '11px', fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: '10px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '30px', fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-1px', lineHeight: 1,
        }}>
          {value}<span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>{suffix}</span>
        </p>
        {sub && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{sub}</p>
        )}
      </div>
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  </div>
);

// ─── Empty Chart State ─────────────────────────────────────────────────────────
const EmptyChart = ({ message = 'No data yet' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '200px', gap: '10px',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px',
      background: 'var(--bg-tertiary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <BarChart2 size={18} color="var(--text-muted)" />
    </div>
    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>{message}</p>
  </div>
);

// ─── Legend Dot ───────────────────────────────────────────────────────────────
const LegendItem = ({ color, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{label}</span>
    {value !== undefined && (
      <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', marginLeft: 'auto', paddingLeft: '12px' }}>
        {value}
      </span>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Analytics = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load analytics data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid var(--border)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#ef4444', fontSize: '14px' }}>
      {error}
    </div>
  );

  const { summary, charts, projectStats } = data;

  // Build area chart data combining status + activity
  const areaData = charts.recentActivity.map(d => ({ ...d, Tasks: d.count }));

  // Project completion data for bar chart
  const projectBarData = projectStats.map(p => ({
    name: p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name,
    Total: p.totalTasks,
    Done: p.completedTasks,
    Pending: p.totalTasks - p.completedTasks,
  }));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: '800',
          color: 'var(--text-primary)', letterSpacing: '-0.5px',
        }}>
          Analytics
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Deep dive into your team's productivity and project health.
        </p>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <KPICard
          label="Total Projects"
          value={summary.totalProjects}
          suffix=""
          icon={FolderOpen}
          color="#6366f1"
          bg="rgba(99,102,241,0.1)"
          sub="Across all workspaces"
        />
        <KPICard
          label="Total Tasks"
          value={summary.totalTasks}
          suffix=""
          icon={CheckCircle}
          color="#10b981"
          bg="rgba(16,185,129,0.1)"
          sub={`${summary.completedTasks} completed`}
        />
        <KPICard
          label="Completion Rate"
          value={summary.completionRate}
          suffix="%"
          icon={Target}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.1)"
          sub={summary.completionRate >= 70 ? '🎯 Great progress!' : 'Keep pushing!'}
        />
        <KPICard
          label="Overdue Tasks"
          value={summary.overdueCount}
          suffix=""
          icon={AlertTriangle}
          color="#ef4444"
          bg="rgba(239,68,68,0.1)"
          sub={summary.overdueCount === 0 ? '✅ All on track' : 'Needs attention'}
        />
      </div>

      {/* ── Row 1: Status Donut + Priority Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Status Donut */}
        <div style={{ ...card, padding: '24px' }}>
          <SectionHeader icon={Zap} title="Task Status Breakdown" subtitle="Distribution across all statuses" />
          {charts.statusDistribution.length === 0 ? <EmptyChart /> : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3} dataKey="value"
                    strokeWidth={0}
                  >
                    {charts.statusDistribution.map(entry => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {charts.statusDistribution.map(entry => (
                  <LegendItem
                    key={entry.name}
                    color={STATUS_COLORS[entry.name] || '#6366f1'}
                    label={entry.name}
                    value={entry.value}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Priority Bar */}
        <div style={{ ...card, padding: '24px' }}>
          <SectionHeader icon={Flag} title="Priority Distribution" subtitle="Tasks grouped by urgency level" />
          {charts.priorityDistribution.length === 0 ? <EmptyChart /> : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts.priorityDistribution} barSize={52}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Tasks">
                    {charts.priorityDistribution.map(entry => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '20px', marginTop: '12px', justifyContent: 'center' }}>
                {charts.priorityDistribution.map(entry => (
                  <LegendItem
                    key={entry.name}
                    color={PRIORITY_COLORS[entry.name] || '#6366f1'}
                    label={entry.name}
                    value={entry.value}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: Activity Area Chart (full width) ── */}
      <div style={{ ...card, padding: '24px', marginBottom: '16px' }}>
        <SectionHeader
          icon={TrendingUp}
          title="Task Activity — Last 7 Days"
          subtitle="Number of tasks created per day"
        />
        {areaData.length === 0 ? <EmptyChart message="No activity in last 7 days" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="Tasks"
                stroke="#6366f1" strokeWidth={2.5}
                fill="url(#actGrad)"
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: 'var(--bg-secondary)' }}
                activeDot={{ r: 6, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Row 3: Project Completion Bar ── */}
      {projectBarData.length > 0 && (
        <div style={{ ...card, padding: '24px', marginBottom: '16px' }}>
          <SectionHeader
            icon={BarChart2}
            title="Project Task Completion"
            subtitle="Done vs pending tasks per project"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectBarData} barSize={20} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
              <Bar dataKey="Done" fill="#10b981" radius={[4, 4, 0, 0]} name="Done" />
              <Bar dataKey="Pending" fill="rgba(99,102,241,0.3)" radius={[4, 4, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', justifyContent: 'center' }}>
            <LegendItem color="#10b981" label="Done" />
            <LegendItem color="rgba(99,102,241,0.3)" label="Pending" />
          </div>
        </div>
      )}

      {/* ── Row 4: Project Health Table ── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Target size={15} color="#6366f1" />
            </div>
            <div>
              <p style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Project Health Overview
              </p>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Completion rate per project
              </p>
            </div>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: '700',
            padding: '3px 10px', borderRadius: '999px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
          }}>
            {projectStats.length} projects
          </span>
        </div>

        {projectStats.length === 0 ? (
          <EmptyChart message="No projects found" />
        ) : (
          <div style={{ padding: '8px 0' }}>
            {projectStats.map((p, i) => {
              const pct = p.totalTasks > 0
                ? Math.round((p.completedTasks / p.totalTasks) * 100)
                : 0;
              const health = pct >= 75 ? { color: '#10b981', label: 'Healthy' }
                           : pct >= 40 ? { color: '#f59e0b', label: 'At Risk' }
                           : { color: '#ef4444', label: 'Critical' };

              return (
                <div
                  key={p._id}
                  style={{
                    padding: '16px 24px',
                    borderBottom: i < projectStats.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Project name */}
                    <div style={{ minWidth: '180px' }}>
                      <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {p.completedTasks} / {p.totalTasks} tasks
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        flex: 1, height: '6px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '999px', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: pct === 100 ? '#10b981' : `linear-gradient(90deg, #6366f1, #8b5cf6)`,
                          borderRadius: '999px',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '13px', fontWeight: '800',
                        color: 'var(--text-primary)', minWidth: '36px',
                      }}>
                        {pct}%
                      </span>
                    </div>

                    {/* Health badge */}
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      padding: '3px 10px', borderRadius: '999px',
                      background: `${health.color}18`,
                      color: health.color,
                      minWidth: '64px', textAlign: 'center',
                    }}>
                      {health.label}
                    </span>

                    {/* Status badge */}
                    <span style={{
                      fontSize: '11px', fontWeight: '600',
                      padding: '3px 10px', borderRadius: '999px',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                      minWidth: '72px', textAlign: 'center',
                    }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// missing import fix
const Flag = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

export default Analytics;