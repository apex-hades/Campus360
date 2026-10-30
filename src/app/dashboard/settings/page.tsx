'use client';

import React, { useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import {
  Settings,
  ShieldCheck,
  Database,
  Cpu,
  Radio,
  Clock,
  Key,
  CheckCircle2,
  Server,
  Layers,
} from 'lucide-react';

export default function SettingsPage() {
  const [groqKey, setGroqKey] = useState('gsk_••••••••••••••••••••••••');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <RoleGuard allowedRoles={['SYSTEM_ADMIN']} featureName="System Administration & LLM Settings">
      <div>
        <div className="page-header">
        <div>
          <h1 className="page-title">Campus360 System Settings</h1>
          <p className="page-description">
            Configure LLM inference providers, SLA response windows, database connection pools, and webhook dispatch gateways.
          </p>
        </div>
      </div>

      {saved && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', color: 'var(--success-text)', fontSize: '0.8125rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
          <CheckCircle2 size={16} /> Configuration saved successfully.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left: AI & Database Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Provider Config */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Cpu size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>AI Incident Intelligence Engine</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Configured with Groq API as initial provider with automatic high-precision heuristic fallback.
            </p>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Primary LLM Provider</label>
                <select className="form-select" defaultValue="groq">
                  <option value="groq">Groq (Llama-3.3-70b-Versatile)</option>
                  <option value="local">Campus360 Heuristic NLP (Deterministic Fallback)</option>
                  <option value="gemini">Google Gemini 1.5 Pro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Groq API Key</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-input"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                  />
                  <Key size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  If key is empty or network fails, intelligent offline entity extractor engages automatically.
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                Save AI Configuration
              </button>
            </form>
          </div>

          {/* Database Info */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Database size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>PostgreSQL Relational Storage</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Database Driver</span>
                <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Prisma ORM with Native Query Engine</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Connection Target</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
                  localhost:5433 / campus360
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ACID Transactions</span>
                <span className="badge badge-success">Active & Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: SLA Rules Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Clock size={16} color="var(--warning)" />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>SLA Escalation Matrix</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Standard response deadlines calibrated by category and urgency severity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { cat: 'Electrical Emergency', prio: 'CRITICAL', hours: '2 Hours', badge: 'badge-critical' },
                { cat: 'Classroom Equipment', prio: 'HIGH', hours: '4 Hours', badge: 'badge-high' },
                { cat: 'Network / Wi-Fi', prio: 'HIGH', hours: '4 Hours', badge: 'badge-high' },
                { cat: 'Plumbing Leakage', prio: 'HIGH', hours: '6 Hours', badge: 'badge-high' },
                { cat: 'HVAC Cooling', prio: 'HIGH', hours: '8 Hours', badge: 'badge-high' },
                { cat: 'General Utility', prio: 'MEDIUM', hours: '12 Hours', badge: 'badge-medium' },
                { cat: 'Routine Maintenance', prio: 'LOW', hours: '24 Hours', badge: 'badge-low' },
              ].map((policy, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>{policy.cat}</div>
                    <span className={`badge ${policy.badge}`} style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                      {policy.prio}
                    </span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>
                    {policy.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </RoleGuard>
  );
}
