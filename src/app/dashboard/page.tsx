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
  Send,
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
  // 1. STUDENT VIEW
  // ==========================================
  if (role === 'STUDENT') {
    return (
      <div>
        {/* Student Page Header */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info">Student Portal</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentUser?.department || 'School of Computing & AI'}
              </span>
            </div>
            <h1 className="page-title">Welcome back, {currentUser?.name || 'Aarav'}</h1>
            <p className="page-description">
              Report campus maintenance issues, track resolution timelines in real-time, and check campus living notices.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
              <Plus size={14} strokeWidth={2.5} />
              <span>Report Campus Issue</span>
            </Link>
          </div>
        </div>

        {/* Student KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-title">
              <span>My Active Tickets</span>
              <Ticket size={15} color="var(--primary)" />
            </div>
            <div className="kpi-value">2</div>
            <div className="kpi-meta" style={{ color: 'var(--warning-text)' }}>
              1 Under active repair by technician
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Resolved Issues</span>
              <CheckCircle2 size={15} color="var(--success)" />
            </div>
            <div className="kpi-value">{metrics.resolvedTicketsCount || 1}</div>
            <div className="kpi-meta" style={{ color: 'var(--success-text)' }}>
              Average fix time: 2.1 hours
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Campus Wi-Fi & Facilities</span>
              <Wifi size={15} color="var(--success)" />
            </div>
            <div className="kpi-value" style={{ fontSize: '1.25rem', color: 'var(--success)' }}>
              99.4% Operational
            </div>
            <div className="kpi-meta">
              Science & Library clusters online
            </div>
          </div>
        </div>

        {/* AI Quick Complaint Bar for Students */}
        <div
          className="card"
          style={{
            padding: '24px',
            marginBottom: '24px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
              Campus AI Complaint Assistant
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Describe any campus issue in plain English (e.g. equipment, AC, Wi-Fi, plumbing) and our AI will automatically extract location, equipment, and urgency.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            <Link
              href="/dashboard/tickets/new?preset=wifi"
              className="badge badge-low"
              style={{ textDecoration: 'none', padding: '6px 12px', cursor: 'pointer' }}
            >
              💡 "Wi-Fi disconnecting on Library 2nd floor"
            </Link>
            <Link
              href="/dashboard/tickets/new?preset=projector"
              className="badge badge-low"
              style={{ textDecoration: 'none', padding: '6px 12px', cursor: 'pointer' }}
            >
              💡 "Projector lamp flickering in Block A Room 204"
            </Link>
            <Link
              href="/dashboard/tickets/new?preset=water"
              className="badge badge-low"
              style={{ textDecoration: 'none', padding: '6px 12px', cursor: 'pointer' }}
            >
              💡 "Water cooler in Computing Lab is leaking"
            </Link>
          </div>

          <Link href="/dashboard/tickets/new" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            <Plus size={15} />
            <span>Open AI Complaint Form</span>
          </Link>
        </div>

        {/* Student Active Tickets Tracking */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                My Submitted Complaints & Live Progress
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Track technician assignment and repair milestones
              </p>
            </div>
            <Link href="/dashboard/tickets" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {criticalTickets.slice(0, 3).map((t: any) => (
              <div
                key={t.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)' }}>
                      {t.id}
                    </span>
                    <span className="badge badge-low">{t.category}</span>
                    <span className="badge badge-warning">{t.status}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)', marginBottom: '2px' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Location: {t.room?.building?.name || 'Block A'} • Room {t.room?.roomNumber || 'A-204'}
                  </div>
                </div>

                <Link href={`/dashboard/tickets/${t.id}`} className="btn btn-secondary btn-sm">
                  View Status
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. FACULTY VIEW
  // ==========================================
  if (role === 'FACULTY') {
    return (
      <div>
        {/* Faculty Header */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple">Faculty Operations</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentUser?.department || 'Department of Computer Science & AI'}
              </span>
            </div>
            <h1 className="page-title">Academic Operations Center</h1>
            <p className="page-description">
              Classroom equipment health, examination venue integrity, lecture hall scheduling, and emergency fault escalation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/dashboard/rooms" className="btn btn-secondary btn-sm">
              <Calendar size={14} color="var(--purple)" />
              <span>Classroom Directory & Booking</span>
            </Link>
            <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
              <Plus size={14} strokeWidth={2.5} />
              <span>Report Academic Fault</span>
            </Link>
          </div>
        </div>

        {/* Faculty KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-title">
              <span>Campus Lecture Halls</span>
              <DoorOpen size={15} color="var(--primary)" />
            </div>
            <div className="kpi-value">{metrics.totalRooms || 6}</div>
            <div className="kpi-meta" style={{ color: 'var(--success-text)' }}>
              {metrics.totalRooms - metrics.occupiedRooms} Ready for immediate booking
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Classroom Equipment Alerts</span>
              <AlertTriangle size={15} color="var(--warning)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>
              1
            </div>
            <div className="kpi-meta" style={{ color: 'var(--critical-text)' }}>
              Block A Room 204: Projector / Power Drop Risk
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Today's Examination Venues</span>
              <Building size={15} color="var(--purple)" />
            </div>
            <div className="kpi-value">1 Active</div>
            <div className="kpi-meta">
              B.Sc AI & Data Science (60 students)
            </div>
          </div>
        </div>

        {/* Priority Academic Examination Warning Banner */}
        <div
          className="card"
          style={{
            padding: '20px 24px',
            marginBottom: '24px',
            backgroundColor: 'var(--critical-subtle)',
            border: '1px solid var(--critical-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'white',
                border: '1px solid var(--critical-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--critical)',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--critical-text)', marginBottom: '2px' }}>
                Classroom A-204 Examination Venue Advisory
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Scheduled venue for <strong>B.Sc AI & Data Science Core Systems Exam</strong> (60 students). Electrical failure reported on terminals. Alternative venue <strong>Room C-301</strong> is staged for relocation.
              </div>
            </div>
          </div>

          <Link href="/dashboard/rooms" className="btn btn-secondary btn-sm" style={{ backgroundColor: 'white' }}>
            Check Hall Availability
          </Link>
        </div>

        {/* Classroom Equipment & Status Matrix */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Campus Lecture & Seminar Hall Availability
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Real-time capacity, air conditioning, and 4K laser projection specs
              </p>
            </div>
            <Link href="/dashboard/rooms" className="btn btn-secondary btn-sm">
              <span>View All 6 Rooms</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--critical-border)', backgroundColor: 'var(--critical-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-heading)' }}>Room A-204</span>
                <span className="badge badge-critical">Power Maintenance</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Science Complex • Capacity: 70 • 4K Epson Projector
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--critical-text)', fontWeight: 600 }}>
                ⚠️ Disruption risk: Examination scheduled at 10:00 AM
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)', backgroundColor: 'var(--success-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-heading)' }}>Room C-301</span>
                <span className="badge badge-success">Available</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Technology Tower • Capacity: 80 • Dual Projectors, A/C
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--success-text)', fontWeight: 600 }}>
                ✓ Eligible alternative for 60-student examination
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-heading)' }}>Room C-302</span>
                <span className="badge badge-low">Occupied</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Technology Tower • Capacity: 75 • Smart Board, A/C
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Machine Learning Lab Session (In progress)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. TECHNICIAN VIEW
  // ==========================================
  if (role === 'TECHNICIAN') {
    return (
      <div>
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-warning">Technician Dispatch</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Lead Electrical Specialist • {currentUser?.name || 'Ramesh Kumar'}
              </span>
            </div>
            <h1 className="page-title">Work Order & Maintenance Console</h1>
            <p className="page-description">
              Assigned campus work orders, SLA resolution timers, warehouse parts reservation, and status progression.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/dashboard/inventory" className="btn btn-secondary btn-sm">
              <Boxes size={14} color="var(--warning)" />
              <span>Reserve Warehouse Parts</span>
            </Link>
            <Link href="/dashboard/tickets" className="btn btn-primary btn-sm">
              <Ticket size={14} strokeWidth={2.5} />
              <span>View All Work Orders</span>
            </Link>
          </div>
        </div>

        {/* Technician KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-title">
              <span>Assigned Work Orders</span>
              <Ticket size={15} color="var(--primary)" />
            </div>
            <div className="kpi-value">{metrics.openTicketsCount || 3}</div>
            <div className="kpi-meta" style={{ color: 'var(--critical-text)' }}>
              1 Critical priority in Block A Room 204
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Active SLA Deadline</span>
              <Clock size={15} color="var(--warning)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>
              1h 45m
            </div>
            <div className="kpi-meta">
              Electrical triage SLA: 2 hours total
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Spare Parts Available</span>
              <Boxes size={15} color="var(--success)" />
            </div>
            <div className="kpi-value">140 Parts</div>
            <div className="kpi-meta" style={{ color: 'var(--warning-text)' }}>
              {metrics.stockShortagesCount} items low in central depot
            </div>
          </div>
        </div>

        {/* Active Work Orders Table for Technician */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Active Work Orders Assigned to Me
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Click on any work order to progress status or log repair notes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalTickets.map((t: any) => (
              <div
                key={t.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)' }}>
                      {t.id}
                    </span>
                    <span className={`badge ${t.priority === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                      {t.priority}
                    </span>
                    <span className="badge badge-low">{t.category}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)', marginBottom: '2px' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Room {t.room?.roomNumber || 'A-204'} • SLA Target: 2 hours
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/dashboard/tickets/${t.id}`} className="btn btn-primary btn-sm">
                    Open Work Order
                  </Link>
                </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-success">Procurement Governance</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Finance & Material Supply Chain
              </span>
            </div>
            <h1 className="page-title">Procurement & Financial Sign-offs</h1>
            <p className="page-description">
              Review spare parts purchase requisitions, approve stock replenishments, and audit supplier lead times.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/dashboard/inventory" className="btn btn-secondary btn-sm">
              <Boxes size={14} color="var(--primary)" />
              <span>Audit Stock Warehouse</span>
            </Link>
            <Link href="/dashboard/approvals" className="btn btn-primary btn-sm">
              <CheckSquare size={14} />
              <span>Full Approvals Queue</span>
            </Link>
          </div>
        </div>

        {/* Procurement KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-title">
              <span>Pending Purchase Requests</span>
              <CheckSquare size={15} color="var(--warning)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>
              1
            </div>
            <div className="kpi-meta">
              Awaiting financial sign-off
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Low Stock Warehouse Items</span>
              <Boxes size={15} color="var(--critical)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--critical)' }}>
              {metrics.stockShortagesCount || 2}
            </div>
            <div className="kpi-meta" style={{ color: 'var(--critical-text)' }}>
              Ballast transformers & 4K Projector lamps
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">
              <span>Governance Separation</span>
              <ShieldCheck size={15} color="var(--success)" />
            </div>
            <div className="kpi-value" style={{ color: 'var(--success)' }}>
              100%
            </div>
            <div className="kpi-meta">
              Zero self-approvals permitted
            </div>
          </div>
        </div>

        {/* Quick Review Box */}
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <CheckSquare size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
            Purchase Request Sign-off Queue
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', maxWidth: '520px', margin: '0 auto 18px' }}>
            5x 40W Electronic Ballast Transformers requested for Room A-204 electrical restoration. Total estimated cost: <strong>$175.00</strong>.
          </p>
          <Link href="/dashboard/approvals" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            <CheckSquare size={15} />
            <span>Open Decision Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. FACILITIES ADMIN & SYSTEM ADMIN VIEW
  // (Full Unified Operations Dashboard)
  // ==========================================
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="status-dot status-dot-green" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Operations Live</span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span className={`badge ${roleConfig.badgeClass}`} style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
              {roleConfig.label}
            </span>
          </div>
          <h1 className="page-title">Campus Operations Command</h1>
          <p className="page-description">
            Real-time university telemetry, incident triage, facility health status, and workforce dispatch.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/dashboard/disruption" className="btn btn-secondary btn-sm" style={{ color: 'var(--critical-text)', borderColor: 'var(--critical-border)' }}>
            <AlertTriangle size={14} color="var(--critical)" />
            <span>Disruption Demo</span>
          </Link>
          <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      {/* 8 Compact KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">
            <span>Total Incidents</span>
            <Activity size={15} color="var(--primary)" />
          </div>
          <div className="kpi-value">{metrics.totalIncidents}</div>
          <div className="kpi-meta">Aggregated campus outages</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Open Tickets</span>
            <Ticket size={15} color="var(--primary)" />
          </div>
          <div className="kpi-value">{metrics.openTicketsCount}</div>
          <div className="kpi-meta" style={{ color: 'var(--warning-text)' }}>
            Active triage queue
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Critical Priority</span>
            <AlertTriangle size={15} color="var(--critical)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--critical)' }}>
            {metrics.criticalIncidentsCount}
          </div>
          <div className="kpi-meta" style={{ color: 'var(--critical-text)' }}>
            Requires immediate response
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Resolved Tickets</span>
            <CheckCircle2 size={15} color="var(--success)" />
          </div>
          <div className="kpi-value">{metrics.resolvedTicketsCount}</div>
          <div className="kpi-meta" style={{ color: 'var(--success-text)' }}>
            Completed & verified
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Overdue SLA</span>
            <Clock size={15} color="var(--warning)" />
          </div>
          <div className="kpi-value" style={{ color: metrics.overdueSlaCount > 0 ? 'var(--critical)' : 'var(--text-heading)' }}>
            {metrics.overdueSlaCount}
          </div>
          <div className="kpi-meta">Escalation threshold breaches</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Available Technicians</span>
            <Users size={15} color="var(--primary)" />
          </div>
          <div className="kpi-value">{metrics.availableTechniciansCount}</div>
          <div className="kpi-meta" style={{ color: 'var(--success-text)' }}>
            Ready for dispatch
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Room Utilisation</span>
            <DoorOpen size={15} color="var(--primary)" />
          </div>
          <div className="kpi-value">{metrics.roomUtilization}%</div>
          <div className="kpi-meta">
            {metrics.occupiedRooms} of {metrics.totalRooms} rooms occupied
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">
            <span>Stock Shortages</span>
            <Boxes size={15} color="var(--critical)" />
          </div>
          <div className="kpi-value" style={{ color: metrics.stockShortagesCount > 0 ? 'var(--critical)' : 'var(--text-heading)' }}>
            {metrics.stockShortagesCount}
          </div>
          <div className="kpi-meta">Items below reorder point</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        {/* Incident Intake & Resolution Performance Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Incident Intake & Resolution Trend</div>
              <div className="chart-subtitle">7-day rolling window • PostgreSQL telemetry</div>
            </div>
            <Link href="/dashboard/analytics" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
              <span>Deep Dive</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A36A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16A36A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF1" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5EAF1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                    fontSize: '0.75rem',
                  }}
                />
                <Area type="monotone" dataKey="created" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" name="Tickets Raised" />
                <Area type="monotone" dataKey="resolved" stroke="#16A36A" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Tickets Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Category Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Category Distribution</div>
              <div className="chart-subtitle">Breakdown across facilities</div>
            </div>
            <span className="badge badge-low">All Active</span>
          </div>
          <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
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
                    border: '1px solid #E5EAF1',
                    borderRadius: '8px',
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
        {/* Critical Incident Panel */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>Critical Incident Watch</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Immediate risk to academic examinations or building operations</p>
            </div>
            <Link href="/dashboard/tickets?priority=CRITICAL" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalTickets.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No active critical tickets. All campus systems nominal.
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
                    <AlertTriangle size={16} color="var(--critical)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-heading)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                        {t.id} • {t.room?.building?.name || 'Block A'} • Room {t.room?.roomNumber || 'A-204'}
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/tickets/${t.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#FFFFFF' }}>
                    Triage
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Operational Activity Timeline */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>Live Activity Stream</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automated PostgreSQL audit trails</p>
            </div>
            <span className="badge badge-low">Audit Verified</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.slice(0, 5).map((log: any) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.75rem' }}>
                <div
                  style={{
                    width: '7px',
                    height: '7px',
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
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Action: {log.action}
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
