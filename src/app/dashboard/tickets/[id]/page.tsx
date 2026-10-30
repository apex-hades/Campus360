'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Building,
  DoorOpen,
  Wrench,
  Send,
  MessageSquare,
  History,
  ShieldCheck,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { TicketStatus } from '@prisma/client';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<any[]>([]);

  // State update form
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [blockedReason, setBlockedReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assignment form
  const [selectedTech, setSelectedTech] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Comment form
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commenting, setCommenting] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchTicketDetail();
    fetchStaff();
  }, [id]);

  const fetchTicketDetail = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = await res.json();
      if (data.ticket) {
        setTicket(data.ticket);
        setNewStatus(data.ticket.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.staff) {
        setTechnicians(data.staff);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || newStatus === ticket.status) return;
    setUpdatingStatus(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          note: statusNote,
          blockedReason: newStatus === 'BLOCKED' ? blockedReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setFeedback({ type: 'success', message: `Status updated to ${newStatus}` });
      setStatusNote('');
      setBlockedReason('');
      fetchTicketDetail();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;
    setAssigning(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/tickets/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: selectedTech }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign technician');

      setFeedback({ type: 'success', message: 'Work order dispatched to technician' });
      fetchTicketDetail();
      fetchStaff();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setAssigning(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommenting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commentText.trim(), isInternal }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');

      setCommentText('');
      fetchTicketDetail();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setCommenting(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div className="badge badge-low">Loading ticket details from PostgreSQL...</div>
      </div>
    );
  }

  const now = new Date();
  const deadline = new Date(ticket.slaDeadline);
  const isOverdue = deadline < now && !['RESOLVED', 'CLOSED'].includes(ticket.status);
  const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / (1000 * 3600));

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <Link href="/dashboard/tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500 }}>
          <ArrowLeft size={15} /> Back to tickets
        </Link>
      </div>

      {feedback && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '18px',
            background: feedback.type === 'success' ? 'var(--success-subtle)' : 'var(--critical-subtle)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--success-border)' : 'var(--critical-border)'}`,
            color: feedback.type === 'success' ? 'var(--success-text)' : 'var(--critical-text)',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Ticket Header Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>
                {ticket.id}
              </span>
              <span className={`badge ${ticket.priority === 'CRITICAL' ? 'badge-critical' : ticket.priority === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                {ticket.priority}
              </span>
              <span className={`badge ${ticket.status === 'BLOCKED' ? 'badge-critical' : ticket.status === 'RESOLVED' ? 'badge-success' : 'badge-purple'}`}>
                {ticket.status}
              </span>
              <span className="badge badge-low">{ticket.category.replace('_', ' ')}</span>
            </div>

            <h1 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{ticket.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', maxWidth: '850px' }}>
              {ticket.description}
            </p>
          </div>

          {/* SLA Countdown Widget */}
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              minWidth: '200px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '2px' }}>
              SLA Clock
            </div>
            {['RESOLVED', 'CLOSED'].includes(ticket.status) ? (
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Completed
              </div>
            ) : isOverdue ? (
              <div style={{ color: 'var(--critical)', fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Breached ({Math.abs(hoursLeft)}h)
              </div>
            ) : (
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Clock size={16} /> {hoursLeft}h Remaining
              </div>
            )}
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Target: {new Date(ticket.slaDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>
        </div>

        {/* Location & Reporter details strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
              {ticket.room ? `${ticket.room.roomNumber} (${ticket.building?.name || 'Block'})` : 'Campus Facility'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Affected Asset</div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
              {ticket.equipment ? ticket.equipment.name : ticket.affectedEquipment || 'General Infrastructure'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reporter</div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>{ticket.reporter?.name || 'Aarav Sharma'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Technician</div>
            <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>
              {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Management Controls & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left Column: Lifecycle Transition & Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Transition Box */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '12px' }}>Lifecycle Transition Pipeline</h3>

            <form onSubmit={handleStatusChange}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Next Target Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {Object.values(TicketStatus).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Transition Note</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Technician arriving on site..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </div>

              {newStatus === 'BLOCKED' && (
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--critical-text)' }}>
                    Blocked Reason (Mandatory)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Awaiting spare circuit breaker delivery from warehouse..."
                    value={blockedReason}
                    onChange={(e) => setBlockedReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={updatingStatus || newStatus === ticket.status}
                className="btn btn-primary btn-sm"
              >
                {updatingStatus ? 'Updating...' : 'Commit Status Transition'}
              </button>
            </form>
          </div>

          {/* Technician Assignment Box */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '12px' }}>Technician Dispatch</h3>
            <form onSubmit={handleAssignTechnician} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Assign Technician</label>
                <select
                  className="form-select"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                >
                  <option value="">Select Technician...</option>
                  {technicians.map((t) => (
                    <option key={t.user.id} value={t.user.id} disabled={!t.isAvailable}>
                      {t.user.name} ({t.department}) - {t.activeAssignmentsCount}/{t.maxConcurrentTickets} active tasks {!t.isAvailable ? '[OFF-SHIFT]' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={assigning || !selectedTech} className="btn btn-secondary btn-sm">
                {assigning ? 'Dispatching...' : 'Dispatch'}
              </button>
            </form>
          </div>

          {/* Comments & Updates Section */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Diagnostic Comments</h3>
              </div>
              <span className="badge badge-low">{ticket.comments?.length || 0}</span>
            </div>

            {/* Comment List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', maxHeight: '280px', overflowY: 'auto' }}>
              {ticket.comments?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '16px' }}>
                  No comments logged yet.
                </div>
              ) : (
                ticket.comments.map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: c.isInternal ? 'var(--purple-subtle)' : 'var(--bg-surface-subtle)',
                      border: `1px solid ${c.isInternal ? 'var(--purple-border)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-heading)' }}>
                          {c.user?.name}
                        </span>
                        <span className="badge badge-low">{c.user?.role}</span>
                        {c.isInternal && <span className="badge badge-purple">Internal</span>}
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{c.message}</div>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment}>
              <textarea
                className="form-textarea"
                style={{ minHeight: '64px', marginBottom: '8px' }}
                placeholder="Post a diagnostic note or technician update..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  <span>Internal Staff Only</span>
                </label>
                <button type="submit" disabled={commenting || !commentText.trim()} className="btn btn-primary btn-sm">
                  <Send size={13} />
                  <span>{commenting ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: History Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <History size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Audit History Trail</h3>
            </div>

            <div className="timeline">
              {ticket.history?.map((h: any) => (
                <div key={h.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--primary)' }}>
                        {h.newStatus}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {h.note || 'Status transitioned'}
                    </div>
                    {h.user && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        By {h.user.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
