'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Building,
  DoorOpen,
  Users,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';

export default function IncidentsOverviewPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard
      allowedRoles={['DEPARTMENT_MANAGER', 'FACILITIES_ADMIN', 'SYSTEM_ADMIN']}
      featureName="Incident Intelligence Command"
    >
      <div>
        <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-critical">Campus Operations Command</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-ticket Incident Intelligence</span>
          </div>
          <h1 className="page-title">Incident Intelligence Command</h1>
          <p className="page-description">
            Cluster and manage complex campus outages, aggregate correlated complaints, and coordinate technical response teams.
          </p>
        </div>

        <Link href="/dashboard/disruption" className="btn btn-secondary btn-sm" style={{ color: 'var(--critical-text)', borderColor: 'var(--critical-border)' }}>
          <AlertTriangle size={14} color="var(--critical)" />
          <span>Classroom Failure Disruption Demo</span>
        </Link>
      </div>

      {/* Incidents Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div className="badge badge-low">Loading campus incidents from PostgreSQL...</div>
        </div>
      ) : incidents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <ShieldAlert size={36} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>Zero Major Outages Active</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 16px' }}>
            All campus blocks, power grids, and laboratories are operating normally. You can simulate the examination failure scenario anytime.
          </p>
          <Link href="/dashboard/disruption" className="btn btn-primary btn-sm">
            Launch Disruption Scenario Demo
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {incidents.map((inc) => (
            <div key={inc.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>
                    {inc.id}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`badge ${inc.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                      {inc.severity}
                    </span>
                    <span className="badge badge-low">{inc.status}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-heading)' }}>{inc.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
                  {inc.summary || inc.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {inc.affectedRoom && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', background: 'var(--bg-surface-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <DoorOpen size={12} color="var(--primary)" />
                      <span>{inc.affectedRoom.roomNumber}</span>
                    </div>
                  )}

                  {inc.affectedBuilding && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', background: 'var(--bg-surface-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <Building size={12} color="var(--text-secondary)" />
                      <span>{inc.affectedBuilding.code}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', background: 'var(--bg-surface-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                    <Layers size={12} color="var(--purple)" />
                    <span>{inc.tickets?.length || 0} Linked Tickets</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(inc.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <Link href={`/dashboard/incidents/${inc.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                  <span>Command View</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </RoleGuard>
  );
}
