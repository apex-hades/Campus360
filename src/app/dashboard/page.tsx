'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Ticket,
  CheckCircle2,
  Clock,
  Users,
  DoorOpen,
  Boxes,
  ArrowUpRight,
  Plus,
  Activity,
  Layers,
  ChevronRight,
  Wifi,
  Sparkles,
  Calendar,
  Wrench,
  CheckSquare,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Building,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRole } from '@/components/RoleContext';

const CATEGORY_COLORS = ['#2563EB', '#0284C7', '#16A36A', '#D97706', '#7C3AED', '#DC5252', '#64748B'];

export default function DashboardOverviewPage() {
  const { currentUser, role, roleConfig } = useRole();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [role]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/dashboard/metrics');
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
        <div className="badge badge-low" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
          Syncing operations telemetry from PostgreSQL...
        </div>
      </div>
    );
  }

  const { metrics, categoryDistribution, trendData, recentActivity, criticalTickets } = data;

  // ==========================================
  // 1. STUDENT VIEW (Clean, Consumer-Grade UI)
  // ==========================================
  if (role === 'STUDENT') {
    return (
      <div>
        {/* Welcome Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, {currentUser?.name?.split(' ')[0] || 'Aarav'}</h1>
            <p className="page-description">
              Campus living services • {currentUser?.department || 'School of Computing & AI'}
            </p>
          </div>
          <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span>Report an Issue</span>
          </Link>
        </div>

        {/* Natural Language AI Report Bar */}
        <div
          className="card"
          style={{
            padding: '24px',
            marginBottom: '28px',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              Campus AI Complaint Assistant
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Describe any facility issue in plain English. AI automatically extracts location, equipment, and urgency.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Link
              href="/dashboard/tickets/new?preset=wifi"
              style={{
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              ⚡ Wi-Fi disconnecting on Library 2nd floor
            </Link>
            <Link
              href="/dashboard/tickets/new?preset=water"
              style={{
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              💧 Water cooler leaking in Science Complex
            </Link>
            <Link
              href="/dashboard/tickets/new?preset=projector"
              style={{
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              📽️ Projector flickering in Block A Room 204
            </Link>
          </div>
        </div>

        {/* 2-Column: Active Tickets with Milestone Steppers & Facility Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Active Tickets with 4-Step Stepper */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  My Active Complaints
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Live repair progress from report to resolution
                </p>
              </div>
              <Link href="/dashboard/tickets" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {criticalTickets.slice(0, 2).map((t: any) => (
                <div
                  key={t.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {t.id}
                      </span>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)', marginTop: '2px' }}>
                        {t.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t.room?.building?.name || 'Block A'} • Room {t.room?.roomNumber || 'A-204'}
                      </p>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                      {t.status}
                    </span>
                  </div>

                  {/* 4-Step Milestone Stepper */}
                  <div className="milestone-stepper">
                    <div className="milestone-step done">
                      <div className="milestone-step-dot">✓</div>
                      <span>Reported</span>
                    </div>
                    <div className="milestone-line done" />
                    <div className="milestone-step done">
                      <div className="milestone-step-dot">✓</div>
                      <span>Assigned</span>
                    </div>
                    <div className="milestone-line" />
                    <div className="milestone-step active">
                      <div className="milestone-step-dot">3</div>
                      <span>In Progress</span>
                    </div>
                    <div className="milestone-line" />
                    <div className="milestone-step">
                      <div className="milestone-step-dot">4</div>
                      <span>Resolved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campus Facility Health Status */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
              Campus Facilities Status
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Real-time operational health across campus zones
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wifi size={15} color="var(--success)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-heading)' }}>Central Library Wi-Fi</span>
                </div>
                <span className="badge badge-success">99.4% Online</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DoorOpen size={15} color="var(--primary)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-heading)' }}>Study Halls (Block B)</span>
                  </div>
                <span className="badge badge-success">Open 24/7</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--critical-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} color="var(--critical)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--critical-text)' }}>Science Complex Room A-204</span>
                </div>
                <span className="badge badge-critical">Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. FACULTY VIEW (Academic Reliability)
  // ==========================================
  if (role === 'FACULTY') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Academic Operations & Hall Readiness</h1>
            <p className="page-description">
              Classroom equipment integrity, timetable failover, and lecture hall booking • {currentUser?.department}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/dashboard/rooms" className="btn btn-secondary btn-sm">
              <Calendar size={14} color="var(--purple)" />
              <span>Book a Hall</span>
            </Link>
            <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
              <Plus size={14} strokeWidth={2.5} />
              <span>Report Fault</span>
            </Link>
          </div>
        </div>

        {/* Examination Advisory Banner */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--critical-subtle)',
            border: '1px solid var(--critical-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={18} color="var(--critical)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--critical-text)' }}>
                Examination Venue Alert: Room A-204
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Scheduled for <strong>B.Sc AI & Data Science Exam (60 students)</strong> at 10:00 AM. Terminal power drop reported. Alternative venue <strong>Room C-301</strong> is staged for relocation.
              </div>
            </div>
          </div>
          <Link href="/dashboard/rooms" className="btn btn-secondary btn-sm" style={{ background: '#FFFFFF', fontSize: '0.75rem' }}>
            View Alternative Hall
          </Link>
        </div>

        {/* Classroom Equipment Readiness Grid */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Campus Lecture & Seminar Halls
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Live capacity and audiovisual status
              </p>
            </div>
            <Link href="/dashboard/rooms" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              Directory
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--critical-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-heading)' }}>Room A-204</span>
                <span className="badge badge-critical">Maintenance</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Science Complex • Capacity: 70 • 4K Laser Projector
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--critical-text)', fontWeight: 500 }}>
                ⚠️ Disruption risk: Power drop at student terminals
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-heading)' }}>Room C-301</span>
                <span className="badge badge-success">Available</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Technology Tower • Capacity: 80 • Dual Projectors, A/C
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 500 }}>
                ✓ Eligible exam relocation target
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-heading)' }}>Room C-302</span>
                <span className="badge badge-low">Occupied</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Technology Tower • Capacity: 75 • Smart Podium
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Machine Learning Lab Session (10:00 - 12:00)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. TECHNICIAN VIEW (Focused Work Orders)
  // ==========================================
  if (role === 'TECHNICIAN') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Technician Dispatch Console</h1>
            <p className="page-description">
              Lead Electrical Specialist • {currentUser?.name || 'Ramesh Kumar'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/dashboard/inventory" className="btn btn-secondary btn-sm">
              <Boxes size={14} color="var(--warning)" />
              <span>Reserve Parts</span>
            </Link>
            <Link href="/dashboard/tickets" className="btn btn-primary btn-sm">
              <Ticket size={14} strokeWidth={2.5} />
              <span>All Work Orders</span>
            </Link>
          </div>
        </div>

        {/* 3 Focused Hero Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-title">
              <span>Assigned Work Orders</span>
              <Ticket size={14} color="var(--primary)" />
            </div>
            <div className="kpi-value">{metrics.openTicketsCount || 3}</div>
            <div className="kpi-meta" style={{ color: 'var(--critical-text)' }}>
              1 Critical in Room A-204
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>SLA Target Remaining</span>
              <Clock size={14} color="var(--warning)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>
              1h 45m
            </div>
            <div className="kpi-meta">
              Target response: within 2 hours
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Depot Spare Parts</span>
              <Boxes size={14} color="var(--success)" />
            </div>
            <div className="kpi-value">140 in Stock</div>
            <div className="kpi-meta">
              {metrics.stockShortagesCount} items below reorder limit
            </div>
          </div>
        </div>

        {/* Active Work Orders Table */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '14px' }}>
            My Active Work Orders
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalTickets.map((t: any) => (
              <div
                key={t.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)' }}>
                      {t.id}
                    </span>
                    <span className="badge badge-critical" style={{ fontSize: '0.625rem' }}>{t.priority}</span>
                    <span className="badge badge-low" style={{ fontSize: '0.625rem' }}>{t.category}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Room {t.room?.roomNumber || 'A-204'} • SLA Target: 2h
                  </div>
                </div>

                <Link href={`/dashboard/tickets/${t.id}`} className="btn btn-primary btn-sm">
                  Update Status
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. PROCUREMENT APPROVER VIEW
  // ==========================================
  if (role === 'PROCUREMENT_APPROVER') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Procurement Sign-off Queue</h1>
            <p className="page-description">
              Finance & Material Supply Chain Governance
            </p>
          </div>
          <Link href="/dashboard/inventory" className="btn btn-secondary btn-sm">
            <Boxes size={14} />
            <span>Audit Warehouse</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-title">
              <span>Pending Sign-offs</span>
              <CheckSquare size={14} color="var(--warning)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>1 Request</div>
            <div className="kpi-meta">5x Ballast Transformers ($175.00)</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Low-Stock Alerts</span>
              <Boxes size={14} color="var(--critical)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--critical)' }}>{metrics.stockShortagesCount || 2} Items</div>
            <div className="kpi-meta">Below minimum reserve point</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Separation of Duties</span>
              <ShieldCheck size={14} color="var(--success)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--success)' }}>Enforced</div>
            <div className="kpi-meta">Self-approval strictly rejected</div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <CheckSquare size={32} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
            5x 40W Electronic Ballast Transformers
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', maxWidth: '480px', margin: '0 auto 16px' }}>
            Requisition raised by technician for Room A-204 restoration. Estimated budget cost: $175.00.
          </p>
          <Link href="/dashboard/approvals" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', width: 'auto' }}>
            <CheckSquare size={14} />
            <span>Open Decision Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. UNIFIED ENTERPRISE COMMAND (Admin & Manager)
  // Streamlined 4-Metric Hero + Telemetry Strip
  // ==========================================
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Operations Command</h1>
          <p className="page-description">
            Real-time university telemetry, incident triage, and workforce dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {/* 4 Focused Hero KPI Cards (Reduced from 8 cluttered cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Active Incidents</span>
            <Activity size={14} color="var(--primary)" />
          </div>
          <div className="kpi-value">{metrics.openTicketsCount} Open</div>
          <div className="kpi-meta" style={{ color: 'var(--critical-text)' }}>
            {metrics.criticalIncidentsCount} Critical priority
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Resolution Rate</span>
            <CheckCircle2 size={14} color="var(--success)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>
            94.2%
          </div>
          <div className="kpi-meta" style={{ color: 'var(--success-text)' }}>
            {metrics.resolvedTicketsCount} resolved • Average MTTR 2.1h
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Field Workforce</span>
            <Users size={14} color="var(--primary)" />
          </div>
          <div className="kpi-value">
            {metrics.availableTechniciansCount} Ready
          </div>
          <div className="kpi-meta">
            Available for immediate dispatch
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Classroom Utilization</span>
            <DoorOpen size={14} color="var(--primary)" />
          </div>
          <div className="kpi-value">
            {metrics.roomUtilization}%
          </div>
          <div className="kpi-meta">
            {metrics.occupiedRooms} occupied of {metrics.totalRooms} halls
          </div>
        </div>
      </div>

      {/* Quiet Secondary Telemetry Strip */}
      <div className="telemetry-strip">
        <div className="telemetry-item">
          <span>Depot Inventory:</span>
          <strong>140 parts ({metrics.stockShortagesCount} reorder items)</strong>
        </div>
        <div className="telemetry-divider" />
        <div className="telemetry-item">
          <span>SLA Threshold:</span>
          <strong style={{ color: 'var(--success)' }}>0 overdue breaches</strong>
        </div>
        <div className="telemetry-divider" />
        <div className="telemetry-item">
          <span>Classroom Failover:</span>
          <strong>A-204 ➔ C-301 Staged</strong>
        </div>
        <div className="telemetry-divider" />
        <div className="telemetry-item">
          <span>Cluster:</span>
          <strong style={{ color: 'var(--primary)' }}>PostgreSQL 5433 • Live</strong>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Incident Intake & Resolution Trend</div>
              <div className="chart-subtitle">7-day rolling window • PostgreSQL telemetry</div>
            </div>
            <Link href="/dashboard/analytics" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
              <span>Analytics</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A36A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A36A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.06)',
                    fontSize: '0.75rem',
                  }}
                />
                <Area type="monotone" dataKey="created" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" name="Tickets Raised" />
                <Area type="monotone" dataKey="resolved" stroke="#16A36A" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Tickets Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Category Distribution</div>
              <div className="chart-subtitle">Breakdown across campus facilities</div>
            </div>
          </div>
          <div style={{ height: '220px', width: '100%', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="category"
                >
                  {categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Incidents & Operations Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>Critical Incident Watch</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Immediate risk to academic examinations or building operations</p>
            </div>
            <Link href="/dashboard/tickets?priority=CRITICAL" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
              <span>View All</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalTickets.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No active critical tickets. All systems nominal.
              </div>
            ) : (
              criticalTickets.map((t: any) => (
                <div
                  key={t.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--critical-subtle)',
                    border: '1px solid var(--critical-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={15} color="var(--critical)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-heading)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                        {t.id} • {t.room?.building?.name || 'Block A'} • Room {t.room?.roomNumber || 'A-204'}
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/tickets/${t.id}`} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: '#FFFFFF' }}>
                    Triage
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>Live Activity Stream</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automated PostgreSQL audit trails</p>
            </div>
            <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>Audit Verified</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.slice(0, 5).map((log: any) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.75rem' }}>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    marginTop: '5px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    <span style={{ fontWeight: 600 }}>{log.user?.name || 'System Operator'}</span> {log.details}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
