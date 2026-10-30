'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import {
  Users,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Plus,
  Activity,
  Layers,
} from 'lucide-react';
import { Shift, TicketCategory, Priority } from '@prisma/client';

export default function StaffManagementPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-dispatch recommendation tester
  const [recCategory, setRecCategory] = useState<TicketCategory>(TicketCategory.ELECTRICAL);
  const [recPriority, setRecPriority] = useState<Priority>(Priority.CRITICAL);
  const [computingRec, setComputingRec] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<any>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      setTechnicians(data.staff || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (staffId: string, currentVal: boolean) => {
    try {
      await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, isAvailable: !currentVal }),
      });
      fetchStaff();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComputeRecommendation = async () => {
    setComputingRec(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: recCategory,
          priority: recPriority,
        }),
      });
      const data = await res.json();
      setRecommendationResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setComputingRec(false);
    }
  };

  return (
    <RoleGuard
      allowedRoles={['FACILITIES_ADMIN', 'DEPARTMENT_MANAGER', 'SYSTEM_ADMIN']}
      featureName="Staff & Workforce Management"
    >
      <div>
        <div className="page-header">
        <div>
          <h1 className="page-title">Staff & Workforce Management</h1>
          <p className="page-description">
            Monitor technician shifts, active work orders, skill matrices, and intelligent assignment recommendations.
          </p>
        </div>
      </div>

      {/* Auto-Assignment Recommendation Simulator Strip */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Smart Assignment Recommendation Engine</h3>
          </div>
          <span className="badge badge-low">Load Balancer</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '190px' }}>
            <label className="form-label">Incident Category</label>
            <select
              className="form-select"
              value={recCategory}
              onChange={(e) => setRecCategory(e.target.value as TicketCategory)}
            >
              {Object.values(TicketCategory).map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, minWidth: '170px' }}>
            <label className="form-label">Urgency Priority</label>
            <select
              className="form-select"
              value={recPriority}
              onChange={(e) => setRecPriority(e.target.value as Priority)}
            >
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleComputeRecommendation}
            disabled={computingRec}
            className="btn btn-primary btn-sm"
          >
            {computingRec ? 'Evaluating...' : 'Compute Recommendation'}
          </button>
        </div>

        {recommendationResult && (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {recommendationResult.recommendation ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="var(--success)" />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                      Recommended: {recommendationResult.recommendation.user.name}
                    </span>
                    <span className="badge badge-success">Match Score: {recommendationResult.score}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {recommendationResult.recommendation.department} | Current Active Tasks: {recommendationResult.recommendation.activeAssignmentsCount}/{recommendationResult.recommendation.maxConcurrentTickets}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                  Skills: {recommendationResult.recommendation.skills.join(', ')}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--critical-text)', fontSize: '0.8125rem' }}>
                {recommendationResult.message || 'No available technician found matching criteria.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Technicians Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
        {technicians.map((tech) => {
          const loadPct = Math.round((tech.activeAssignmentsCount / tech.maxConcurrentTickets) * 100);

          return (
            <div key={tech.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-heading)', fontWeight: 600 }}>{tech.user.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {tech.employeeId} | {tech.department}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAvailability(tech.id, tech.isAvailable)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    title={tech.isAvailable ? 'Click to mark off-shift' : 'Click to mark available'}
                  >
                    <span className={`badge ${tech.isAvailable ? 'badge-success' : 'badge-low'}`}>
                      {tech.isAvailable ? 'AVAILABLE' : 'OFF-SHIFT'}
                    </span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <span className="badge badge-low">Shift: {tech.shift}</span>
                  <span className="badge badge-low">{tech.user.phone || '+91 98765 43210'}</span>
                </div>

                {/* Skills */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                    Certified Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {tech.skills.map((s: string) => (
                      <span key={s} style={{ fontSize: '0.6875rem', background: 'var(--bg-surface-subtle)', padding: '2px 7px', borderRadius: 'var(--radius-xs)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Workload Progress Bar */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Current Workload</span>
                    <span style={{ fontWeight: 600, color: loadPct >= 75 ? 'var(--critical)' : 'var(--text-heading)' }}>
                      {tech.activeAssignmentsCount} / {tech.maxConcurrentTickets} Active Tasks ({loadPct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${loadPct}%`,
                        height: '100%',
                        background: loadPct >= 75 ? 'var(--critical)' : 'var(--primary)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Work Orders */}
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>
                  Active Work Orders ({tech.assignments?.length || 0})
                </div>
                {tech.assignments?.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No pending assignments</div>
                ) : (
                  tech.assignments.map((a: any) => (
                    <div key={a.id} style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{a.ticket?.id}</span>
                      <span style={{ maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.ticket?.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </RoleGuard>
  );
}
