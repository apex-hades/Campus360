'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  User,
  FileText,
  DollarSign,
  X,
} from 'lucide-react';
import { ApprovalStatus, ApprovalType } from '@prisma/client';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');

  // Decision Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [decisionComments, setDecisionComments] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, [filterStatus]);

  const fetchApprovals = async () => {
    try {
      const url = filterStatus === 'ALL' ? '/api/approvals' : `/api/approvals?status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    setDeciding(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/approvals/${selectedApproval.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: decisionAction,
          comments: decisionComments,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit decision');

      setFeedback({ type: 'success', text: data.message });
      setShowModal(false);
      setDecisionComments('');
      fetchApprovals();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setDeciding(false);
    }
  };

  return (
    <RoleGuard
      allowedRoles={['PROCUREMENT_APPROVER', 'FACILITIES_ADMIN', 'SYSTEM_ADMIN']}
      featureName="Approvals & Financial Sign-offs"
    >
      <div>
        <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-low">Governance & Compliance</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Separation of Duties Enforced</span>
          </div>
          <h1 className="page-title">Approval & Authorization Centre</h1>
          <p className="page-description">
            Review capital purchase orders, room relocations, and administrative overrides with role-based checks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Approvals</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Approvals Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading approvals from PostgreSQL...
          </div>
        ) : approvals.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <CheckSquare size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>No approvals in this queue</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '4px' }}>
              All purchase requests and room relocations have been addressed.
            </p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Entity Type</th>
                <th>Request ID</th>
                <th>Justification / Reason</th>
                <th>Requester</th>
                <th>Required Role</th>
                <th>Status</th>
                <th>Decision Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((app) => (
                <tr key={app.id}>
                  <td>
                    <span className="badge badge-purple">{app.entityType.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>
                      {app.entityId}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{app.reason}</div>
                    {app.comments && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Note: {app.comments}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{app.requester?.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{app.requester?.role}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
                      {app.entityType === 'PURCHASE_REQUEST'
                        ? 'Procurement Approver'
                        : app.entityType === 'ROOM_RELOCATION'
                        ? 'Facilities Admin'
                        : 'Dept Manager'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        app.status === 'APPROVED'
                          ? 'badge-success'
                          : app.status === 'REJECTED'
                          ? 'badge-critical'
                          : 'badge-high'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td>
                    {app.approver ? (
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>{app.approver.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {new Date(app.decidedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending Review</span>
                    )}
                  </td>
                  <td>
                    {app.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setSelectedApproval(app);
                            setDecisionAction('APPROVE');
                            setShowModal(true);
                          }}
                          className="btn btn-success btn-sm"
                          style={{ padding: '4px 8px' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApproval(app);
                            setDecisionAction('REJECT');
                            setShowModal(true);
                          }}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Decided</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Decision Modal */}
      {showModal && selectedApproval && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                  {decisionAction === 'APPROVE' ? 'Approve' : 'Reject'} {selectedApproval.entityType.replace('_', ' ')}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Request ID: {selectedApproval.entityId} | Requester: {selectedApproval.requester?.name}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleDecisionSubmit}>
              <div className="modal-body">
                <div style={{ padding: '12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reason</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginTop: '2px', fontSize: '0.875rem' }}>{selectedApproval.reason}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reviewer Comments / Audit Note</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter compliance justification, conditions, or rejection reason..."
                    value={decisionComments}
                    onChange={(e) => setDecisionComments(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deciding}
                  className={decisionAction === 'APPROVE' ? 'btn btn-success btn-sm' : 'btn btn-danger btn-sm'}
                >
                  {deciding ? 'Recording...' : `Confirm ${decisionAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </RoleGuard>
  );
}
