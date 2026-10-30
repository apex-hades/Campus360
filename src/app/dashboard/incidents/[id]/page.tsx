'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Building,
  DoorOpen,
  Users,
  History,
  Send,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { IncidentStatus } from '@prisma/client';

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>('');
  const [timelineNote, setTimelineNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`/api/incidents/${id}`);
      const data = await res.json();
      if (data.incident) {
        setIncident(data.incident);
        setNewStatus(data.incident.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus !== incident.status ? newStatus : undefined,
          timelineNote: timelineNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update incident');

      setFeedback('Incident intelligence and timeline updated.');
      setTimelineNote('');
      fetchIncident();
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !incident) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div className="badge badge-low">Loading incident details from PostgreSQL...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/dashboard/incidents" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500 }}>
          <ArrowLeft size={15} /> Back to incidents
        </Link>
      </div>

      {feedback && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', color: 'var(--success-text)', fontSize: '0.8125rem', fontWeight: 500 }}>
          {feedback}
        </div>
      )}

      {/* Incident Header Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>
                {incident.id}
              </span>
              <span className={`badge ${incident.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                {incident.severity}
              </span>
              <span className="badge badge-low">{incident.status}</span>
            </div>

            <h1 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{incident.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', maxWidth: '850px' }}>
              {incident.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/dashboard/disruption" className="btn btn-secondary btn-sm" style={{ color: 'var(--critical-text)', borderColor: 'var(--critical-border)' }}>
              <AlertTriangle size={14} color="var(--critical)" />
              <span>Launch Disruption Scenario</span>
            </Link>
          </div>
        </div>

        {/* Location & Impact Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Affected Room</div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
              {incident.affectedRoom?.roomNumber || 'General Facility'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Affected Building</div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
              {incident.affectedBuilding?.name || 'Multiple Blocks'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Linked Complaints</div>
            <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>
              {incident.tickets?.length || 0} Open Tickets
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Declared At</div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>
              {new Date(incident.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Command View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left: Linked Tickets & Event Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Linked Tickets */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Correlated Complaints</h3>
              </div>
              <span className="badge badge-low">{incident.tickets?.length || 0}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!incident.tickets || incident.tickets.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '16px' }}>
                  No individual tickets linked to this incident.
                </div>
              ) : (
                incident.tickets.map((it: any) => (
                  <Link
                    key={it.ticketId}
                    href={`/dashboard/tickets/${it.ticket.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>
                          {it.ticket.id}
                        </span>
                        <span className={`badge ${it.ticket.priority === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                          {it.ticket.priority}
                        </span>
                        <span className="badge badge-low">{it.ticket.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-heading)' }}>{it.ticket.title}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Incident Timeline */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <History size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Incident Action Timeline</h3>
            </div>

            <div className="timeline">
              {((incident.timeline as any[]) || []).map((t: any, i: number) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {t.author || 'Operator'}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{typeof t.event === 'object' ? JSON.stringify(t.event) : String(t.event || '')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Status Update */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '12px' }}>Update Status</h3>

            <form onSubmit={handleUpdateIncident}>
              <div className="form-group">
                <label className="form-label">Incident Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.values(IncidentStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Append Timeline Event Note</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Record tactical decisions, response team arrivals, or inspection findings..."
                  value={timelineNote}
                  onChange={(e) => setTimelineNote(e.target.value)}
                />
              </div>

              <button type="submit" disabled={updating} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                {updating ? 'Updating...' : 'Commit Incident Update'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
