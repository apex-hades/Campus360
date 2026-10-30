'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { TicketCategory, Priority, TicketStatus } from '@prisma/client';
import { useRole } from '@/components/RoleContext';

function TicketsListContent() {
  const searchParams = useSearchParams();
  const { role, roleConfig } = useRole();
  const initialQ = searchParams?.get('q') || '';
  const initialPriority = searchParams?.get('priority') || '';

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQ);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriority || 'ALL');

  useEffect(() => {
    fetchTickets();
  }, [selectedStatus, selectedCategory, selectedPriority]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedPriority !== 'ALL') params.append('priority', selectedPriority);
      if (search.trim()) params.append('q', search.trim());

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className={`badge ${roleConfig.badgeClass}`}>{roleConfig.label} View</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLA Response Monitored</span>
          </div>
          <h1 className="page-title">
            {role === 'STUDENT'
              ? 'My Campus Complaints & Reports'
              : role === 'FACULTY'
              ? 'Academic Equipment & Classroom Tickets'
              : role === 'TECHNICIAN'
              ? 'Work Orders & Technical Dispatch'
              : 'Complaints & Work Orders'}
          </h1>
          <p className="page-description">
            {role === 'STUDENT'
              ? 'Track the status of your reported campus issues and watch technician repair milestones.'
              : role === 'FACULTY'
              ? 'Track equipment tickets affecting classrooms, seminar halls, and ongoing lectures.'
              : 'Track, triage, assign, and resolve campus operational incidents and service requests.'}
          </p>
        </div>

        {roleConfig.capabilities.canReportComplaints && (
          <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span>{role === 'STUDENT' ? 'Report Issue' : role === 'FACULTY' ? 'Report Fault' : 'Create Ticket'}</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ flex: '1', minWidth: '240px' }}>
            <div className="topbar-search">
              <Search size={15} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search ticket title, room number, description, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(TicketStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {Object.values(TicketCategory).map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button onClick={fetchTickets} className="btn btn-secondary btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading tickets from PostgreSQL...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Ticket size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>No tickets found</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '4px' }}>
              No complaints match the current filter criteria.
            </p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title & Description</th>
                <th>Category</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Countdown</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const now = new Date();
                const deadline = new Date(t.slaDeadline);
                const isOverdue = deadline < now && !['RESOLVED', 'CLOSED'].includes(t.status);
                const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / (1000 * 3600));

                return (
                  <tr key={t.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>
                        {t.id}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '2px' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-low">{t.category.replace('_', ' ')}</span>
                    </td>
                    <td>
                      {t.room ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{t.room.roomNumber}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{t.building?.code}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Campus</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'CRITICAL'
                            ? 'badge-critical'
                            : t.priority === 'HIGH'
                            ? 'badge-high'
                            : t.priority === 'MEDIUM'
                            ? 'badge-medium'
                            : 'badge-low'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === 'BLOCKED'
                            ? 'badge-critical'
                            : t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'badge-success'
                            : t.status === 'IN_PROGRESS'
                            ? 'badge-purple'
                            : 'badge-medium'
                        }`}
                      >
                        {t.status}
                      </span>
                      {t.blockedReason && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--critical-text)', marginTop: '2px', maxWidth: '140px' }}>
                          {t.blockedReason}
                        </div>
                      )}
                    </td>
                    <td>
                      {['RESOLVED', 'CLOSED'].includes(t.status) ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      ) : isOverdue ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--critical)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={13} /> Overdue ({Math.abs(hoursLeft)}h)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {hoursLeft}h left
                        </span>
                      )}
                    </td>
                    <td>
                      {t.assignedTo ? (
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-heading)' }}>{t.assignedTo.name}</div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/dashboard/tickets/${t.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                        <span>View</span>
                        <ChevronRight size={13} />
                      </Link>
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
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tickets...</div>}>
      <TicketsListContent />
    </Suspense>
  );
}
