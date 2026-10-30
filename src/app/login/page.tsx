'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '@prisma/client';

const DEMO_ACCOUNTS = [
  {
    role: UserRole.STUDENT,
    name: 'Aarav Sharma',
    title: 'Student',
    email: 'student@campus360.edu',
    dept: 'Computing & AI (Year 3)',
    desc: 'Files campus maintenance complaints, tracks personal repair timeline, receives campus alerts.',
  },
  {
    role: UserRole.FACULTY,
    name: 'Prof. Rajesh Kulkarni',
    title: 'Faculty / Professor',
    email: 'faculty@campus360.edu',
    dept: 'Dept of Computer Science & AI',
    desc: 'Reports classroom equipment faults before lectures, books seminar halls, views exam venues.',
  },
  {
    role: UserRole.TECHNICIAN,
    name: 'Ramesh Kumar',
    title: 'Lead Technician',
    email: 'tech@campus360.edu',
    dept: 'Electrical Engineering',
    desc: 'Receives work orders, updates repair status, tracks SLA deadlines, reserves spare parts.',
  },
  {
    role: UserRole.DEPARTMENT_MANAGER,
    name: 'Dr. Priya Nair',
    title: 'Department Manager',
    email: 'manager@campus360.edu',
    dept: 'Computer Science',
    desc: 'Monitors academic facilities, tracks examinations & department schedules.',
  },
  {
    role: UserRole.FACILITIES_ADMIN,
    name: 'Vikram Malhotra',
    title: 'Facilities Administrator',
    email: 'admin@campus360.edu',
    dept: 'Campus Infrastructure',
    desc: 'Full campus oversight, incident command, room relocation approvals.',
  },
  {
    role: UserRole.PROCUREMENT_APPROVER,
    name: 'Ananya Iyer',
    title: 'Procurement Approver',
    email: 'procurement@campus360.edu',
    dept: 'Finance & Supply Chain',
    desc: 'Reviews purchase requests, approves spare parts restock orders.',
  },
  {
    role: UserRole.SYSTEM_ADMIN,
    name: 'Devendra Patel',
    title: 'System Administrator',
    email: 'sysadmin@campus360.edu',
    dept: 'IT Infrastructure',
    desc: 'Superuser access, security audit log inspection, system overrides.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, role?: UserRole) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = role ? { role, password: 'demo' } : { email, password };
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Check credentials.');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 420px) 1fr',
          gap: '24px',
        }}
      >
        {/* Left Form Panel */}
        <div className="glass-panel" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div className="brand-icon" style={{ width: '38px', height: '38px' }}>
              <Zap size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', lineHeight: '1.2' }}>
                Campus360
              </h1>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ENTERPRISE OPERATIONS
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-heading)' }}>Sign in to your portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '22px' }}>
            Access role-gated workflows, incident intelligence, and operations control.
          </p>

          {error && (
            <div
              style={{
                background: 'var(--critical-subtle)',
                border: '1px solid var(--critical-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: 'var(--critical-text)',
                fontSize: '0.8125rem',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)}>
            <div className="form-group">
              <label className="form-label">Campus Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="admin@campus360.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '10px', top: '10px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '10px', top: '10px' }}
                />
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Default demo password: <code>password123</code>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '10px' }}
            >
              {loading ? 'Authenticating...' : 'Sign in'}
              <ArrowRight size={15} />
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} color="var(--success)" />
            <span>Bcrypt Hashing & Server-side RBAC Active</span>
          </div>
        </div>

        {/* Right Demo Accounts Grid */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>Demo Profiles for Evaluation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                Click any profile card for instant 1-click role simulation.
              </p>
            </div>
            <span className="badge badge-low">6 Seeded Roles</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '12px',
            }}
          >
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.role}
                onClick={() => handleLogin(undefined, acc.role)}
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-border)';
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--bg-surface-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span
                    className={`badge ${
                      acc.role === UserRole.FACILITIES_ADMIN
                        ? 'badge-critical'
                        : acc.role === UserRole.SYSTEM_ADMIN
                        ? 'badge-purple'
                        : acc.role === UserRole.PROCUREMENT_APPROVER
                        ? 'badge-high'
                        : 'badge-medium'
                    }`}
                  >
                    {acc.title}
                  </span>
                  <UserCheck size={14} color="var(--primary)" />
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>{acc.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '6px' }}>
                  {acc.email}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
                  {acc.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
