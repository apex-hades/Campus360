'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import {
  AlertTriangle,
  CheckCircle2,
  Building,
  DoorOpen,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Bell,
  History,
  XCircle,
  FileCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function DisruptionScenarioPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [executing, setExecuting] = useState(false);
  const [dbState, setDbState] = useState<any>(null);
  const [eligibleRooms, setEligibleRooms] = useState<any[]>([]);
  const [rejectedRooms, setRejectedRooms] = useState<any[]>([]);
  const [selectedDestinationRoomId, setSelectedDestinationRoomId] = useState<string>('');
  const [stepLogs, setStepLogs] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetchCurrentDbState();
  }, []);

  const fetchCurrentDbState = async () => {
    try {
      const res = await fetch('/api/disruption/scenario-step');
      const data = await res.json();
      setDbState(data);

      if (data.examination?.status === 'RELOCATED') {
        setCurrentStep(12);
      } else if (data.roomA204?.status === 'UNAVAILABLE') {
        setCurrentStep(2);
      } else if (data.relatedIncident) {
        setCurrentStep(1);
      } else {
        setCurrentStep(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeScenarioStep = async (stepToRun: number) => {
    setExecuting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/disruption/scenario-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepNumber: stepToRun,
          selectedDestinationRoomId: selectedDestinationRoomId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scenario step execution failed');

      setStepLogs((prev) => [`[Step ${stepToRun}] ${data.message}`, ...prev]);
      setFeedback({ type: 'success', text: data.message });

      if (stepToRun === 5 || stepToRun === 7) {
        setEligibleRooms(data.eligible || []);
        setRejectedRooms(data.rejected || []);
        if (data.eligible && data.eligible.length > 0) {
          setSelectedDestinationRoomId(data.eligible[0].id);
        }
      }

      setCurrentStep(stepToRun >= 8 ? 12 : stepToRun);
      fetchCurrentDbState();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setExecuting(false);
    }
  };

  const handleResetScenario = async () => {
    setExecuting(true);
    try {
      const res = await fetch('/api/disruption/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentStep(0);
        setStepLogs(['[Scenario Reset] Campus database reverted to initial baseline.']);
        setFeedback({ type: 'info', text: 'Scenario successfully reset to baseline state.' });
        setEligibleRooms([]);
        setRejectedRooms([]);
        fetchCurrentDbState();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  const runAllRemainingSteps = async () => {
    setExecuting(true);
    try {
      await executeScenarioStep(1);
      await executeScenarioStep(2);
      await executeScenarioStep(4);
      await executeScenarioStep(7);
      await executeScenarioStep(12);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <RoleGuard
      allowedRoles={['FACILITIES_ADMIN', 'SYSTEM_ADMIN']}
      featureName="Classroom Disruption Simulation Engine"
    >
      <div>
        {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-critical">Evaluation Protocol</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classroom Relocation Workflow</span>
          </div>
          <h1 className="page-title">Classroom Disruption & Relocation</h1>
          <p className="page-description">
            Complete 12-step guided resolution for an electrical failure in Room A-204 prior to 60-student B.Sc AI & Data Science final examination.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleResetScenario}
            disabled={executing}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} />
            <span>Reset Demo</span>
          </button>
          {currentStep < 12 && (
            <button
              onClick={runAllRemainingSteps}
              disabled={executing}
              className="btn btn-danger btn-sm"
            >
              <AlertTriangle size={14} />
              <span>{executing ? 'Executing...' : 'Run Automated 12-Step Scenario'}</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '18px',
            background:
              feedback.type === 'success'
                ? 'var(--success-subtle)'
                : feedback.type === 'error'
                ? 'var(--critical-subtle)'
                : 'var(--info-subtle)',
            border: `1px solid ${
              feedback.type === 'success'
                ? 'var(--success-border)'
                : feedback.type === 'error'
                ? 'var(--critical-border)'
                : 'var(--info-border)'
            }`,
            color:
              feedback.type === 'success'
                ? 'var(--success-text)'
                : feedback.type === 'error'
                ? 'var(--critical-text)'
                : 'var(--info-text)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
          }}
        >
          {feedback.type === 'success' && <CheckCircle2 size={16} />}
          {feedback.type === 'error' && <AlertTriangle size={16} />}
          {feedback.type === 'info' && <RefreshCw size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Campus Initial Data Diagnostic Strip */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 22px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Target Room</div>
          <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.9375rem', marginTop: '2px' }}>
            {dbState?.roomA204?.roomNumber || 'A-204'} (Block A, Floor 2)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Capacity: 70 seats</div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>PostgreSQL Status</div>
          <div style={{ marginTop: '2px' }}>
            <span
              className={`badge ${
                dbState?.roomA204?.status === 'UNAVAILABLE' ? 'badge-critical' : 'badge-success'
              }`}
            >
              {dbState?.roomA204?.status || 'AVAILABLE'}
            </span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Scheduled Examination</div>
          <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem', marginTop: '2px' }}>
            {dbState?.examination?.courseTitle || 'B.Sc AI & Data Science'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
            {dbState?.examination?.studentCount || 60} Students | 10:00 AM – 12:00 PM
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Venue</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9375rem', marginTop: '2px' }}>
            {dbState?.examination?.room?.roomNumber || 'A-204'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Status: {dbState?.examination?.status || 'CONFIRMED'}
          </div>
        </div>
      </div>

      {/* 12-Step Stepper Visualizer */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '22px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '14px' }}>12-Step Disruption Protocol Stepper</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {[
            { step: 1, label: 'Create Incident' },
            { step: 2, label: 'Room Lockout' },
            { step: 3, label: 'Query Timetable' },
            { step: 4, label: 'Identify 60 Students' },
            { step: 5, label: 'Search Alternatives' },
            { step: 6, label: 'Validate Criteria' },
            { step: 7, label: 'Eligible & Rejected' },
            { step: 8, label: 'Admin Review' },
            { step: 9, label: 'Revalidate Concurrency' },
            { step: 10, label: 'Update DB Booking' },
            { step: 11, label: 'Send Notifications' },
            { step: 12, label: 'Audit Trail Commit' },
          ].map((s) => {
            const isDone = currentStep >= s.step;
            const isCurrent = currentStep === s.step - 1;

            return (
              <div
                key={s.step}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  background: isDone
                    ? 'var(--success-subtle)'
                    : isCurrent
                    ? 'var(--primary-subtle)'
                    : 'var(--bg-surface-subtle)',
                  border: `1px solid ${
                    isDone
                      ? 'var(--success-border)'
                      : isCurrent
                      ? 'var(--primary-border)'
                      : 'var(--border-subtle)'
                  }`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: isDone ? 'var(--success-text)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  STEP {s.step}
                </div>
                <div style={{ fontSize: '0.6875rem', color: isDone ? 'var(--text-heading)' : 'var(--text-secondary)', marginTop: '2px', fontWeight: isDone ? 500 : 400 }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step by Step Action Controller */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Left: Interactive Workflow Execution Box */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Interactive Workflow Execution</h3>

          {/* Step 1 & 2 Action */}
          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>Step 1 & 2: Incident Declaration & Room Lockout</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Creates electrical incident INC-2026-0088 and marks Room A-204 UNAVAILABLE in PostgreSQL.
                </div>
              </div>
              <button
                onClick={() => {
                  executeScenarioStep(1);
                  executeScenarioStep(2);
                }}
                disabled={executing || currentStep >= 2}
                className="btn btn-danger btn-sm"
              >
                {currentStep >= 2 ? 'Completed' : 'Execute Step 1 & 2'}
              </button>
            </div>
          </div>

          {/* Step 3 & 4 Action */}
          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>Step 3 & 4: Timetable Impact Assessment</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Queries PostgreSQL for affected examinations; identifies B.Sc AI & Data Science (60 students).
                </div>
              </div>
              <button
                onClick={() => executeScenarioStep(4)}
                disabled={executing || currentStep < 2 || currentStep >= 4}
                className="btn btn-primary btn-sm"
              >
                {currentStep >= 4 ? 'Completed' : 'Execute Step 3 & 4'}
              </button>
            </div>
          </div>

          {/* Step 5, 6, 7 Action: Alternative Room Finder */}
          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>Step 5, 6 & 7: Search & Multi-Factor Room Validation</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Validates capacity &ge; 60, projector facility, and checks 0 booking collisions in PostgreSQL.
                </div>
              </div>
              <button
                onClick={() => executeScenarioStep(7)}
                disabled={executing || currentStep < 4 || (currentStep >= 7 && eligibleRooms.length > 0)}
                className="btn btn-cyan btn-sm"
              >
                {eligibleRooms.length > 0 ? 'Re-evaluate' : 'Execute Step 5-7'}
              </button>
            </div>

            {/* Display Eligible and Rejected Rooms */}
            {eligibleRooms.length > 0 && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success-text)', marginBottom: '8px' }}>
                  Eligible Alternative Rooms Identified in PostgreSQL:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {eligibleRooms.map((er) => (
                    <label
                      key={er.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: selectedDestinationRoomId === er.id ? 'var(--primary-subtle)' : '#FFFFFF',
                        border: `1px solid ${selectedDestinationRoomId === er.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          name="destinationRoom"
                          checked={selectedDestinationRoomId === er.id}
                          onChange={() => setSelectedDestinationRoomId(er.id)}
                        />
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{er.roomNumber}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                            ({er.building}, Capacity: {er.capacity})
                          </span>
                        </div>
                      </div>
                      <span className="badge badge-success">Match Score: {er.score}%</span>
                    </label>
                  ))}
                </div>

                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--critical-text)', marginBottom: '6px' }}>
                  Rejected Alternative Rooms (with Verified Criteria Explanations):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {rejectedRooms.map((rr) => (
                    <div
                      key={rr.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--critical-subtle)',
                        border: '1px solid var(--critical-border)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--critical-text)' }}>{rr.roomNumber} ({rr.building}):</span>{' '}
                      <span style={{ color: 'var(--critical-text)' }}>{rr.reasons.join(' | ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 8-12 Action: Authorised Relocation Execution */}
          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.875rem' }}>Step 8 to 12: Admin Approval & Relocation Commit</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Revalidates concurrency (Step 9), updates booking transaction (Step 10), notifies 60 students (Step 11), logs audit (Step 12).
                </div>
              </div>
              <button
                onClick={() => executeScenarioStep(12)}
                disabled={executing || eligibleRooms.length === 0 || currentStep >= 12}
                className="btn btn-success btn-sm"
              >
                {currentStep >= 12 ? 'Relocation Completed' : 'Approve & Relocate'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Execution Log & Audit Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Step Logs */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Live Execution Log</h3>
              <span className="badge badge-low">PostgreSQL Commits</span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                background: '#0F172A',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                height: '220px',
                overflowY: 'auto',
                color: '#38BDF8',
                lineHeight: '1.5',
              }}
            >
              {stepLogs.length === 0 ? (
                <div style={{ color: '#64748B' }}>Ready to initialize scenario... Click Step 1 or Run Automated Scenario.</div>
              ) : (
                stepLogs.map((log, idx) => <div key={idx}>{log}</div>)
              )}
            </div>
          </div>

          {/* PostgreSQL AuditLog Proof */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <History size={15} color="var(--primary)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>PostgreSQL Audit History Proof</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {dbState?.recentAuditLogs?.map((al: any) => (
                <div
                  key={al.id}
                  style={{
                    padding: '8px 10px',
                    background: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-heading)' }}>
                    <span>{al.action}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                      {new Date(al.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>
                    Entity: {al.entity} ({al.entityId})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
