import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import api from '../services/api';
import { CheckCircle, Clock, AlertTriangle, FolderOpen, TrendingUp, ArrowUpRight } from 'lucide-react';

const STATUS_COLORS = {
  'Todo': '#94a3b8',
  'In Progress': '#6366f1',
  'Review': '#f59e0b',
  'Done': '#10b981',
};
const PRIORITY_COLORS = {
  'Low': '#10b981',
  'Medium': '#f59e0b',
  'High': '#ef4444',
};

const StatCard = ({ icon: Icon, label, value, iconBg, suffix = '', trend }) => (
  <div className="stat-card card p-5 cursor-default">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
          fontSize: '28px', fontWeight: '800',
          color: 'var(--text-primary)',
          lineHeight: 1,
          letterSpacing: '-0.5px',
        }}>
          {value}{suffix}
        </p>
      </div>
      <div style={{
        width: '40px', height: '40px',
        borderRadius: '10px',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color="white" />
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, span }) => (
  <div
    className="card p-5"
    style={{ gridColumn: span ? `span ${span}` : 'span 1' }}
  >
    <p style={{
      fontSize: '13px', fontWeight: '700',
      color: 'var(--text-primary)',
      marginBottom: '20px',
      letterSpacing: '-0.1px',
    }}>
      {title}
    </p>
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '180px', gap: '8px',
  }}>
    <div style={{
      width: '40px', height: '40px',
      borderRadius: '10px',
      background: 'var(--bg-tertiary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <TrendingUp size={18} color="var(--text-muted)" />
    </div>
    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
      {message}
    </p>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6 }}>
      Data will appear here once you add tasks
    </p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        color: 'var(--text-primary)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <p style={{ fontWeight: '600' }}>{label || payload[0].name}</p>
        <p style={{ color: '#6366f1', marginTop: '2px' }}>
          {payload[0].value} tasks
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setAnalytics(data.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: '36px', height: '36px',
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

  const { summary, charts, projectStats } = analytics;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Here's what's happening across your projects today.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatCard
          icon={FolderOpen}
          label="Total Projects"
          value={summary.totalProjects}
          iconBg="linear-gradient(135deg, #6366f1, #8b5cf6)"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={summary.completionRate}
          suffix="%"
          iconBg="linear-gradient(135deg, #10b981, #059669)"
        />
        <StatCard
          icon={Clock}
          label="Total Tasks"
          value={summary.totalTasks}
          iconBg="linear-gradient(135deg, #3b82f6, #2563eb)"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={summary.overdueCount}
          iconBg="linear-gradient(135deg, #ef4444, #dc2626)"
        />
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Status Pie */}
        <ChartCard title="Task Status">
          {charts.statusDistribution.length === 0
            ? <EmptyState message="No tasks yet" />
            : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={charts.statusDistribution}
                      cx="50%" cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {charts.statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
                  {charts.statusDistribution.map(entry => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: STATUS_COLORS[entry.name] || '#6366f1',
                      }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </ChartCard>

        {/* Priority Bar */}
        <ChartCard title="Priority Breakdown">
          {charts.priorityDistribution.length === 0
            ? <EmptyState message="No tasks yet" />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={charts.priorityDistribution} barSize={48}>
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
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {charts.priorityDistribution.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        {/* Activity Line — Full Width */}
        <div className="card p-5" style={{ gridColumn: 'span 2' }}>
          <p style={{
            fontSize: '13px', fontWeight: '700',
            color: 'var(--text-primary)', marginBottom: '20px',
          }}>
            Tasks Created — Last 7 Days
          </p>
          {charts.recentActivity.length === 0
            ? <EmptyState message="No recent activity" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={charts.recentActivity}>
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
                  <Line
                    type="monotone" dataKey="count"
                    stroke="#6366f1" strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: 'var(--bg-secondary)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Project Overview
          </p>
          <span style={{
            fontSize: '11px', fontWeight: '600',
            color: 'var(--text-muted)',
            background: 'var(--bg-tertiary)',
            padding: '3px 8px', borderRadius: '999px',
          }}>
            {projectStats.length} projects
          </span>
        </div>

        {projectStats.length === 0 ? (
          <EmptyState message="No projects yet" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Project', 'Status', 'Tasks', 'Done', 'Progress'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px',
                    textAlign: 'left',
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectStats.map((project, i) => {
                const progress = project.totalTasks > 0
                  ? Math.round((project.completedTasks / project.totalTasks) * 100)
                  : 0;
                const statusColors = {
                  active: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
                  completed: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
                  'on-hold': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
                  archived: { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
                };
                const sc = statusColors[project.status] || statusColors.active;
                return (
                  <tr
                    key={project._id}
                    style={{
                      borderBottom: i < projectStats.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{
                      padding: '14px 20px',
                      fontSize: '13.5px', fontWeight: '600',
                      color: 'var(--text-primary)',
                    }}>
                      {project.name}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '11px', fontWeight: '600',
                        background: sc.bg,
                        color: sc.color,
                      }}>
                        {project.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '14px 20px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}>
                      {project.totalTasks}
                    </td>
                    <td style={{
                      padding: '14px 20px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}>
                      {project.completedTasks}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          flex: 1,
                          height: '5px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '999px',
                          overflow: 'hidden',
                          minWidth: '80px',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: progress === 100
                              ? '#10b981'
                              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: '999px',
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: '600',
                          color: 'var(--text-muted)',
                          minWidth: '32px',
                        }}>
                          {progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;