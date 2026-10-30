'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Database,
  GitBranch,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Zap,
  Server,
  Workflow,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  AlertTriangle,
  RefreshCw,
  Users,
  Compass,
  Boxes,
  Key
} from 'lucide-react';

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'flow' | 'schema' | 'pitch'>('architecture');
  const [dbStats, setDbStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/architecture/stats');
      const data = await res.json();
      if (data.success) {
        setDbStats(data);
      }
    } catch (e) {
      console.error('Failed to load schema stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={12} /> System Specification & Evaluation Blueprint
            </span>
            <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Database size={12} /> PostgreSQL 16 Live
            </span>
          </div>
          <h1 className="page-title">Campus360 Architecture & Data Engineering</h1>
          <p className="page-description">
            Complete technical blueprint: 4-tier modular architecture, AI triage pipeline, ACID relational schema, and live Prisma Studio.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="http://localhost:5555"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Database size={14} />
            <span>Open Live Prisma Studio (Port 5555)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          <Server size={14} />
          <span>1. System Architecture</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'flow' ? 'active' : ''}`}
          onClick={() => setActiveTab('flow')}
        >
          <Workflow size={14} />
          <span>2. Core Workflow Diagrams</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          <Database size={14} />
          <span>3. Database Schema & ER Model</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'pitch' ? 'active' : ''}`}
          onClick={() => setActiveTab('pitch')}
        >
          <Sparkles size={14} />
          <span>4. Evaluator Presentation Script</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM ARCHITECTURE                                                */}
      {/* ========================================================================= */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Architecture Overview Banner */}
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Enterprise 4-Tier High-Integrity Architecture
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '900px' }}>
              Campus360 is engineered as an integrated, event-driven operations platform. It completely separates client presentation,
              server-side role authorization, intelligent LLM extraction, and ACID-compliant relational data management.
            </p>

            {/* 4-Tier Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '20px' }}>
              {/* Tier 1 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Server size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>Tier 1: Client</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>Presentation Layer</div>
                  </div>
                </div>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>Next.js 14 App Router:</strong> Server & Client component rendering</li>
                  <li><strong>Vanilla CSS System:</strong> Zero Tailwind, strict design tokens</li>
                  <li><strong>Framer Motion:</strong> Micro-interactions and transition physics</li>
                  <li><strong>Recharts Analytics:</strong> Live SVG metric visualization</li>
                  <li><strong>Responsive Shell:</strong> Desktop, tablet & mobile viewports</li>
                </ul>
              </div>

              {/* Tier 2 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F0FDF4', color: '#16A36A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16A36A', textTransform: 'uppercase' }}>Tier 2: Business Core</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>API & RBAC Engine</div>
                  </div>
                </div>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>Route Handlers:</strong> Typed Next.js REST API endpoints</li>
                  <li><strong>7-Persona RBAC:</strong> Server-side authorization & route guards</li>
                  <li><strong>Separation of Duties:</strong> Anti-self-approval validation</li>
                  <li><strong>Zod Validation:</strong> Strict payload schema enforcement</li>
                  <li><strong>Audit Ledger:</strong> Immutable audit trail of every state change</li>
                </ul>
              </div>

              {/* Tier 3 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase' }}>Tier 3: Intelligence</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>AI & NLP Pipeline</div>
                  </div>
                </div>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>Groq LLaMA 3.3 70B:</strong> Ultra-fast structured NLP inference</li>
                  <li><strong>Vercel AI SDK:</strong> Safe structured output extraction</li>
                  <li><strong>Local Heuristic Engine:</strong> Guaranteed offline fallback</li>
                  <li><strong>Duplicate Detector:</strong> Location + category similarity matching</li>
                  <li><strong>Auto-Triage & Dispatch:</strong> Priority scoring & technician skills</li>
                </ul>
              </div>

              {/* Tier 4 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284C7', textTransform: 'uppercase' }}>Tier 4: Persistence</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>PostgreSQL & Prisma</div>
                  </div>
                </div>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li><strong>PostgreSQL 16:</strong> Port 5433 persistent database daemon</li>
                  <li><strong>Prisma ORM:</strong> Type-safe relational query engine</li>
                  <li><strong>ACID Transactions:</strong> Multi-table atomic operations</li>
                  <li><strong>Foreign Key Integrity:</strong> Cascades & relations enforced</li>
                  <li><strong>Prisma Studio:</strong> Port 5555 visual database browser</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Architecture Visual Block Diagram */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  System Dataflow Architecture Diagram
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  End-to-end request flow between User Actors, Application Layer, AI Engine, and Relational Database
                </p>
              </div>
              <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>Active Architecture</span>
            </div>

            {/* Visual Flow diagram container */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Actors Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '12px', flexWrap: 'wrap' }}>
                  {['Student / Faculty', 'Technician', 'Dept Manager', 'Facilities Admin', 'Procurement', 'System Admin'].map((actor, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 14px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Users size={12} style={{ color: 'var(--primary)' }} />
                      {actor}
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                  ▼ HTTP / REST & Server Actions (Secured via Session & RBAC Guard)
                </div>

                {/* Middleware & Gateway */}
                <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: '#16A36A' }} />
                      Application Gateway & Security Boundary
                    </div>
                    <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>Next.js 14 Middleware</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.75rem' }}>
                    <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '4px' }}>
                      <strong>Path Authorization:</strong> Dynamic route validation via <code>permissions.ts</code>
                    </div>
                    <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '4px' }}>
                      <strong>Role Isolation:</strong> Separate Student, Faculty, Tech, Manager & Admin scopes
                    </div>
                    <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '4px' }}>
                      <strong>Audit Trigger:</strong> Append-only mutation logging on all critical state transitions
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Left: AI Pipeline */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid #E9D5FF', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#7C3AED', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={14} /> AI Incident Extraction Subsystem
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>1. <strong>Natural Language Input:</strong> Unstructured complaint text</div>
                      <div>2. <strong>Groq Cloud API:</strong> LLaMA-3.3-70B-Versatile model</div>
                      <div>3. <strong>Fail-Safe Heuristic:</strong> Offline regex & keyword extractor</div>
                      <div>4. <strong>Zod Extraction:</strong> Category, Priority, Room, Equipment</div>
                      <div>5. <strong>Deduplication Engine:</strong> Text distance & room matching</div>
                    </div>
                  </div>

                  {/* Right: Operational Services */}
                  <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid #BAE6FD', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0284C7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} /> Operations Automation Engines
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>1. <strong>SLA Calculation:</strong> Severity-based resolution deadlines</div>
                      <div>2. <strong>Smart Dispatch:</strong> Technician skills & shift optimization</div>
                      <div>3. <strong>Disruption Engine:</strong> Alternative room finder for exams</div>
                      <div>4. <strong>Stock Reservation:</strong> Automatic warehouse part allocation</div>
                      <div>5. <strong>Separation of Duties:</strong> Anti-self-approval enforcement</div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                  ▼ Prisma ORM (Type-Safe Client & Dynamic Connection Pooling)
                </div>

                {/* Database Tier */}
                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Database size={16} style={{ color: '#2563EB' }} />
                    PostgreSQL 16 Relational Engine (Port 5433)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    14 Relational Models • Foreign Key Integrity • ACID Transactions • Immutable Audit Trails
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CORE WORKFLOW DIAGRAMS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'flow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Flow 1: AI Incident Understanding */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>Workflow 1</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                AI-Powered Natural Language Incident Triage & Auto-Dispatch
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              How raw complaints from students and faculty turn into structured, prioritized tickets with assigned technicians.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', background: '#F8FAFC' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>STEP 1: INGESTION</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>Natural Language Input</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Student types: <em>"The projector in Block A Room 204 is not working. Examination tomorrow."</em>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', background: '#FAF5FF' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7C3AED', marginBottom: '4px' }}>STEP 2: INFERENCE</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>Groq LLM / Fallback</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Calls LLaMA 3.3 70B via Groq API. If network is unavailable, offline Heuristic Rule Engine triggers.
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', background: '#EFF6FF' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0284C7', marginBottom: '4px' }}>STEP 3: EXTRACTION</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>Zod Entity Extraction</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Category: <strong>CLASSROOM_EQUIPMENT</strong><br />
                    Priority: <strong>CRITICAL (exam urgency)</strong><br />
                    Location: <strong>BLK-A-204</strong>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', background: '#F0FDF4' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16A36A', marginBottom: '4px' }}>STEP 4: DISPATCH</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>Skill & Shift Matching</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Matches available technician with AV/Electrical skills. Sets 2-hour SLA deadline in PostgreSQL.
                  </div>
                </div>
              </div>

              {/* Duplicate Detection Alert Callout */}
              <div style={{ borderLeft: '3px solid #D97706', background: '#FFFBEB', padding: '12px 16px', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#92400E' }}>
                <strong>Duplicate Incident Intelligence:</strong> If another student previously reported <em>"Projector black screen in Room 204"</em>, the algorithm links the new report as a duplicate (<code>duplicateOfId</code>), preventing multiple dispatches to the same room.
              </div>
            </div>
          </div>

          {/* Flow 2: Classroom Disruption & Exam Relocation */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-critical" style={{ fontSize: '0.75rem' }}>Workflow 2</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Critical Classroom Disruption & Automated Exam Relocation
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Autonomous timetable relocation algorithm resolving conflicts before exams or lectures are disrupted.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px', background: '#FEF2F2' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#DC2626' }}>PHASE 1: FAILURE TRIGGER</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px', color: '#991B1B' }}>A-204 AC & Projector Failure</div>
                <div style={{ fontSize: '0.75rem', color: '#7F1D1D', marginTop: '6px' }}>
                  Room A-204 flagged <strong>MAINTENANCE</strong>. 60-student final examination scheduled in 45 minutes is directly affected.
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px', background: '#F8FAFC' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)' }}>PHASE 2: ALTERNATIVE SEARCH</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px', color: 'var(--text-heading)' }}>Constraint Solver Engine</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Queries PostgreSQL for:
                  <ul style={{ paddingLeft: '14px', margin: '4px 0 0' }}>
                    <li>Capacity &ge; 60 seats</li>
                    <li>Status = AVAILABLE</li>
                    <li>Equipped with Projector & AC</li>
                  </ul>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px', background: '#F0FDF4' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16A36A' }}>PHASE 3: ATOMIC SWAP</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px', color: '#065F46' }}>ACID DB Transaction</div>
                <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '6px' }}>
                  <code>prisma.$transaction</code> relocates exam from A-204 to <strong>B-101</strong>, marks B-101 <strong>OCCUPIED</strong>, and writes immutable AuditLog.
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px', background: '#FAF5FF' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7C3AED' }}>PHASE 4: BROADCAST</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px', color: '#5B21B6' }}>Real-time Notifications</div>
                <div style={{ fontSize: '0.75rem', color: '#6D28D9', marginTop: '6px' }}>
                  SMS and in-app alerts dispatched to Professor Vikram, invigilators, and all 60 enrolled students with updated room badge.
                </div>
              </div>
            </div>
          </div>

          {/* Flow 3: Dual-Approval & Separation of Duties */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Workflow 3</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                Procurement & Separation-of-Duties Governance
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Financial and inventory threshold validation preventing fraud and unapproved expenditures.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-heading)' }}>1. Technician Identifies Shortage</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Circuit Breaker stock drops below minimum threshold (5 units).
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

              <div style={{ flex: 1, minWidth: '220px', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-heading)' }}>2. Purchase Request Initiated</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  PR-2026-0012 created for $340.00 (Exceeds $100 auto-approval threshold).
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

              <div style={{ flex: 1, minWidth: '220px', padding: '12px', border: '1px solid #FED7AA', borderRadius: 'var(--radius-sm)', background: '#FFF7ED' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#C2410C' }}>3. Anti-Self Approval Check</div>
                <div style={{ fontSize: '0.6875rem', color: '#9A3412', marginTop: '2px' }}>
                  System enforces <code>requesterId !== approverId</code>. Requester cannot self-approve.
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />

              <div style={{ flex: 1, minWidth: '220px', padding: '12px', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-sm)', background: '#F0FDF4' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803D' }}>4. Procurement Approver Decision</div>
                <div style={{ fontSize: '0.6875rem', color: '#166534', marginTop: '2px' }}>
                  Procurement officer approves; stock reservation is unlocked in warehouse inventory.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DATABASE SCHEMA & ER MODEL                                         */}
      {/* ========================================================================= */}
      {activeTab === 'schema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live DB Metrics Header */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Live PostgreSQL 16 Database Telemetry
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Live record counts queried directly via Prisma Client from <code>campus360</code> database
                </p>
              </div>
              <button onClick={fetchStats} className="btn btn-secondary btn-sm" disabled={loadingStats}>
                <RefreshCw size={12} className={loadingStats ? 'animate-spin' : ''} />
                <span>Refresh Counts</span>
              </button>
            </div>

            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Querying PostgreSQL statistics...
              </div>
            ) : dbStats?.models ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {dbStats.models.map((m: any, idx: number) => (
                  <div key={idx} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)' }}>{m.name}</span>
                      <span className="badge badge-low" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{m.records} rows</span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {m.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Visual Entity-Relationship Model */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Core Entity-Relationship (ER) Architecture
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Normalized relational mapping showcasing foreign keys, cascading constraints, and ACID boundaries
                </p>
              </div>
              <a
                href="http://localhost:5555"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>View Full Relations in Prisma Studio</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* ER Diagram Representation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Box 1: User & Auth */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={14} /> USER & AUTHENTICATION
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1.8, color: 'var(--text-heading)' }}>
                  <div><strong>User</strong> (id [PK], email [UQ], passwordHash, role, department)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>├─ 1:1 → <strong>StaffProfile</strong> (employeeId, skills, shift)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>├─ 1:N → <strong>Ticket</strong> (reporter, assignedTo)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>├─ 1:N → <strong>Approval</strong> (requester, approver)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>└─ 1:N → <strong>AuditLog</strong> (userId)</div>
                </div>
              </div>

              {/* Box 2: Facilities & Scheduling */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16A36A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={14} /> CAMPUS FACILITIES & TIMETABLES
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1.8, color: 'var(--text-heading)' }}>
                  <div><strong>Building</strong> (id [PK], code [UQ], name, zone)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>└─ 1:N → <strong>Room</strong> (id [PK], code [UQ], capacity, status)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '24px' }}>├─ 1:N → <strong>Equipment</strong> (assetTag, status)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '24px' }}>├─ 1:N → <strong>Examination</strong> (examCode, status)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '24px' }}>└─ 1:N → <strong>ClassSchedule</strong> (courseCode, day, time)</div>
                </div>
              </div>

              {/* Box 3: Tickets & Incident Intelligence */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#7C3AED', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} /> TICKETING & INCIDENTS
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1.8, color: 'var(--text-heading)' }}>
                  <div><strong>Ticket</strong> (id [PK, e.g. CMP-2026-0001], title, priority, status)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>├─ N:1 → <strong>Room</strong> (roomId [FK])</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>├─ 1:N → <strong>TicketComment</strong> (messages)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>├─ 1:N → <strong>TicketHistory</strong> (status audits)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>└─ N:M → <strong>IncidentTicket</strong> ↔ <strong>Incident</strong></div>
                </div>
              </div>

              {/* Box 4: Inventory & Approvals */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--surface)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#D97706', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Boxes size={14} /> INVENTORY & PROCUREMENT
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1.8, color: 'var(--text-heading)' }}>
                  <div><strong>InventoryItem</strong> (id [PK], sku [UQ], quantity, minStock)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>├─ 1:N → <strong>StockReservation</strong> (ticketId [FK])</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>└─ 1:N → <strong>PurchaseRequest</strong> (requesterId, approverId)</div>
                  <div style={{ color: 'var(--text-muted)', paddingLeft: '12px' }}>└─ 1:1 → <strong>Approval</strong> (entityType: PURCHASE_REQUEST)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EVALUATOR PRESENTATION SCRIPT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'pitch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Evaluator Presentation & Defense Cheat-Sheet
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Deliver this exact pitch when evaluators ask for your Architecture, Flow Diagrams, or Database Schema.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Question 1 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>Question 1</span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                    "Can you explain your system architecture?"
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Your 30-Second Answer:</strong><br />
                  <em>
                    "Campus360 is built on a 4-tier high-integrity architecture. On the frontend, we use Next.js 14 App Router with a pure Vanilla CSS light enterprise design system — zero Tailwind, zero bloated UI libraries.
                    Our business layer enforces strict Server-Side Role-Based Access Control across 7 distinct personas with complete Separation of Duties.
                    For incident triage, we integrate Groq's LLaMA 3.3 70B model with a local heuristic fallback so complaints are parsed in under 200 milliseconds even when offline.
                    Finally, our persistence tier uses PostgreSQL with Prisma ORM, utilizing ACID transactions and an immutable audit ledger for every critical operation."
                  </em>
                </div>
              </div>

              {/* Question 2 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-critical" style={{ fontSize: '0.75rem' }}>Question 2</span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                    "What are your core flow diagrams and differentiator features?"
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Your 30-Second Answer:</strong><br />
                  <em>
                    "We have two standout workflows: First, our <strong>AI Incident Triage Pipeline</strong>: when a user types plain English complaints like 'Projector not working before exam', our model extracts structured parameters, detects duplicate tickets from the same hall, sets an urgent 2-hour SLA deadline, and automatically matches an available technician by skill and shift.<br /><br />
                    Second, our <strong>Classroom Disruption Resolution Engine</strong>: when equipment fails in a room hosting an examination, our constraint solver queries the database, finds an alternative room matching capacity and equipment criteria (e.g. B-101), executes an atomic database transaction to re-route the exam, and dispatches real-time alerts to the faculty and all 60 enrolled students."
                  </em>
                </div>
              </div>

              {/* Question 3 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>Question 3</span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                    "Show us your database schema and proof that it's not mock data."
                  </div>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Your Action & Answer:</strong><br />
                  <em>
                    1. Click the button above: <strong>Open Live Prisma Studio (Port 5555)</strong>.<br />
                    2. Say: "Here is our live PostgreSQL database running on port 5433. As you can see, every metric on our dashboard is backed by normalized relational tables: Users, Tickets, Examinations, Equipment, Inventory, and Audit Logs. When we change a status or approve a request, you can see the database record update in real-time."
                  </em>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
