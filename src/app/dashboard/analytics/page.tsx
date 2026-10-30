'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Users,
  DoorOpen,
  Boxes,
} from 'lucide-react';

const COLORS = ['#2563EB', '#0284C7', '#16A36A', '#D97706', '#7C3AED', '#DC5252'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <div className="badge badge-low">Aggregating PostgreSQL Telemetry...</div>
      </div>
    );
  }

  const { summary, technicianWorkload, recurringLocations, roomUtilisation, categoryBreakdown } = data;

  return (
    <RoleGuard
      allowedRoles={['DEPARTMENT_MANAGER', 'FACILITIES_ADMIN', 'SYSTEM_ADMIN']}
      featureName="Campus Operations Analytics"
    >
      <div>
        <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-low">Operations Intelligence</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time PostgreSQL Computations</span>
          </div>
          <h1 className="page-title">Operational Analytics & SLA Metrics</h1>
          <p className="page-description">
            SLA compliance benchmarks, Mean Time To Resolution (MTTR), technician utilization, and recurring fault hotspots.
          </p>
        </div>
      </div>

      {/* KPI Performance Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <span>SLA Compliance Rate</span>
            <ShieldCheck size={15} color="var(--success)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>
            {summary.slaCompliancePct}%
          </div>
          <div className="kpi-subtitle">Resolved within target timeframes</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Mean Time To Resolution (MTTR)</span>
            <Clock size={15} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>
            {summary.avgResolutionHours}h
          </div>
          <div className="kpi-subtitle">Average hours per resolved ticket</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Logged Incidents</span>
            <TrendingUp size={15} color="var(--text-heading)" />
          </div>
          <div className="kpi-value">{summary.totalComplaints}</div>
          <div className="kpi-subtitle">All-time operations requests</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Active Dispatch Workforce</span>
            <Users size={15} color="var(--purple)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--purple)' }}>
            {summary.activeWorkforce}
          </div>
          <div className="kpi-subtitle">Certified technicians on roster</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Technician Workload Distribution */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '2px' }}>Technician Capacity & Workload</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Active work orders assigned vs maximum concurrent threshold
          </p>

          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={technicianWorkload} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF1" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5EAF1' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5EAF1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                    fontSize: '0.8125rem',
                    color: '#1E293B',
                  }}
                />
                <Bar dataKey="active" name="Active Tasks" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Max Capacity" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
              <span>Active Tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E2E8F0' }} />
              <span>Max Limit</span>
            </div>
          </div>
        </div>

        {/* Room Utilisation Breakdown */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '2px' }}>Campus Room State Allocation</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Real-time classroom & laboratory availability status
          </p>

          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={roomUtilisation}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={48}
                  paddingAngle={4}
                >
                  {roomUtilisation.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5EAF1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                    fontSize: '0.8125rem',
                    color: '#1E293B',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
            {roomUtilisation.map((r: any, idx: number) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                <span>{r.name} ({r.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recurring Hotspot Locations */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '2px' }}>Recurring Incident Hotspot Analysis</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Campus locations exhibiting repeated infrastructure and utility faults
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
          {recurringLocations.map((loc: any, idx: number) => (
            <div
              key={idx}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Hotspot Location
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: '3px 0' }}>
                {loc.location}
              </div>
              <span className="badge badge-high">{loc.count} Fault Reports</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </RoleGuard>
  );
}
