'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import { useRole, ALL_DEMO_ROLES } from './RoleContext';
import { getRoleConfig } from '@/lib/permissions';

interface RoleGuardProps {
  allowedRoles: string[];
  featureName: string;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, featureName, children }: RoleGuardProps) {
  const { role, loading, switchRole } = useRole();

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <div className="badge badge-low" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
          Verifying role authorization...
        </div>
      </div>
    );
  }

  const isAllowed = role === 'SYSTEM_ADMIN' || allowedRoles.includes(role);

  if (isAllowed) {
    return <>{children}</>;
  }

  const currentConfig = getRoleConfig(role);
  const recommendedRole = ALL_DEMO_ROLES.find((r) => allowedRoles.includes(r.role)) || ALL_DEMO_ROLES[4];

  return (
    <div style={{ padding: '60px 24px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '40px 32px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'var(--critical-subtle)',
            border: '1px solid var(--critical-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--critical)',
          }}
        >
          <ShieldAlert size={28} />
        </div>

        <div className="badge badge-critical" style={{ marginBottom: '12px' }}>
          Role Access Restricted
        </div>

        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px' }}>
          {featureName} is not accessible for {currentConfig.label}s
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
          In accordance with campus governance policies and role-based access control, this feature is strictly reserved for:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
          {allowedRoles.map((r) => {
            const cfg = getRoleConfig(r);
            return (
              <span key={r} className={`badge ${cfg.badgeClass}`} style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>
                {cfg.label}
              </span>
            );
          })}
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '28px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
            Current Active Persona:
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>{currentConfig.label}</strong> — {currentConfig.description}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/dashboard" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <button
            onClick={() => switchRole(recommendedRole.role)}
            className="btn btn-primary"
          >
            <UserCheck size={16} />
            Switch to {recommendedRole.label}
          </button>
        </div>
      </div>
    </div>
  );
}
