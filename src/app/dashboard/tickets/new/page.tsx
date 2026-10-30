'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { useRole } from '@/components/RoleContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building,
  DoorOpen,
  Wrench,
  ArrowRight,
  HelpCircle,
  CopyCheck,
  ShieldCheck,
} from 'lucide-react';
import { TicketCategory, Priority } from '@prisma/client';

export default function NewTicketPage() {
  const router = useRouter();
  const { role } = useRole();

  // Natural language AI prompt input
  const [nlPrompt, setNlPrompt] = useState(
    'The projector in Block A Room 204 is not working. We have an examination tomorrow.'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.CLASSROOM_EQUIPMENT);
  const [priority, setPriority] = useState<Priority>(Priority.CRITICAL);
  const [buildingId, setBuildingId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [equipmentName, setEquipmentName] = useState<string>('');
  const [duplicateOfId, setDuplicateOfId] = useState<string | null>(null);

  // Database options
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampusEntities();
  }, []);

  const fetchCampusEntities = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);

        const bMap = new Map();
        data.rooms.forEach((r: any) => {
          if (r.building && !bMap.has(r.building.id)) {
            bMap.set(r.building.id, r.building);
          }
        });
        setBuildings(Array.from(bMap.values()));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeComplaint = async () => {
    if (!nlPrompt.trim()) return;
    setAnalyzing(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/ai/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlPrompt }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'AI analysis failed');
      }

      const entityData = json.data;
      setAiAnalysis(entityData);

      // Auto-populate form fields from verified database extractions
      setTitle(entityData.analysis.summary || 'Incident Report');
      setDescription(nlPrompt);
      setCategory(entityData.analysis.category);
      setPriority(entityData.analysis.priority);

      if (entityData.verifiedBuilding) {
        setBuildingId(entityData.verifiedBuilding.id);
      }
      if (entityData.verifiedRoom) {
        setRoomId(entityData.verifiedRoom.id);
      }
      if (entityData.verifiedEquipment) {
        setEquipmentName(entityData.verifiedEquipment.name);
      } else if (entityData.analysis.equipmentName) {
        setEquipmentName(entityData.analysis.equipmentName);
      }

      if (entityData.duplicateCandidate) {
        setDuplicateOfId(entityData.duplicateCandidate.id);
      }
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setSubmitError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        title,
        description,
        category,
        priority,
        buildingId: buildingId || undefined,
        roomId: roomId || undefined,
        affectedEquipment: equipmentName || undefined,
        duplicateOfId: duplicateOfId || undefined,
      };

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      router.push(`/dashboard/tickets/${data.ticket.id}`);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard
      allowedRoles={['STUDENT', 'FACULTY', 'TECHNICIAN', 'DEPARTMENT_MANAGER', 'FACILITIES_ADMIN', 'SYSTEM_ADMIN', 'STUDENT_FACULTY']}
      featureName="Ticket Submission"
    >
      <div>
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${role === 'STUDENT' ? 'badge-info' : role === 'FACULTY' ? 'badge-purple' : 'badge-primary'}`}>
                {role === 'STUDENT' ? 'Student Portal' : role === 'FACULTY' ? 'Faculty Portal' : 'Campus Operations'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI-Assisted Natural Language Parsing</span>
            </div>
            <h1 className="page-title">
              {role === 'STUDENT'
                ? 'Report Campus Issue'
                : role === 'FACULTY'
                ? 'Academic Equipment Fault Escalation'
                : 'Smart Ticket Creation & NLP Triage'}
            </h1>
            <p className="page-description">
              {role === 'STUDENT'
                ? 'Describe any hostel, library, classroom, or Wi-Fi problem. AI will extract the location, category, and urgency.'
                : role === 'FACULTY'
                ? 'Report projector, audio, or computing faults. Tickets impacting upcoming lectures or exams are automatically given high priority.'
                : 'Describe the issue in plain English. The AI engine extracts verified database entities, checks duplicate reports, and assesses academic disruption risks.'}
            </p>
          </div>
        </div>

      {/* NLP AI Extraction Studio Card */}
      <div className="glass-panel" style={{ padding: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Natural-Language Complaint Input</h3>
          </div>
          <span className="badge badge-low">Interactive AI Parsing</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <textarea
            className="form-textarea"
            style={{ flex: 1, minHeight: '80px', fontSize: '0.875rem' }}
            placeholder="e.g. The projector in Block A Room 204 is not working. We have an examination tomorrow."
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
          />

          <button
            type="button"
            onClick={handleAnalyzeComplaint}
            disabled={analyzing}
            className="btn btn-primary"
            style={{ height: '80px', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <Sparkles size={16} />
            <span>{analyzing ? 'Extracting...' : 'AI Extract & Verify'}</span>
          </button>
        </div>

        {/* AI Analysis Result Display */}
        {aiAnalysis && (
          <div
            style={{
              marginTop: '18px',
              padding: '16px',
              background: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                  Verified Against PostgreSQL Database
                </span>
              </div>
              <span className="badge badge-purple">{aiAnalysis.analysis.engine}</span>
            </div>

            {/* Disruption Risk Alert Banner */}
            {aiAnalysis.analysis.isDisruptionRisk && (
              <div
                style={{
                  background: 'var(--critical-subtle)',
                  border: '1px solid var(--critical-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <AlertTriangle size={16} color="var(--critical)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--critical-text)', fontSize: '0.8125rem' }}>
                    ACADEMIC DISRUPTION RISK DETECTED
                  </div>
                  <div style={{ color: 'var(--critical-text)', fontSize: '0.75rem' }}>
                    {aiAnalysis.affectedSchedule
                      ? `Conflict identified with scheduled examination: "${aiAnalysis.affectedSchedule.title}" (${aiAnalysis.affectedSchedule.studentCount} students, ${aiAnalysis.affectedSchedule.startTime} – ${aiAnalysis.affectedSchedule.endTime}).`
                      : 'High urgency detected prior to examination schedule.'}
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Ticket Alert Banner */}
            {aiAnalysis.duplicateCandidate && (
              <div
                style={{
                  background: 'var(--warning-subtle)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CopyCheck size={16} color="var(--warning)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--warning-text)', fontSize: '0.8125rem' }}>
                      Potential Duplicate Report: {aiAnalysis.duplicateCandidate.id}
                    </div>
                    <div style={{ color: 'var(--warning-text)', fontSize: '0.75rem' }}>
                      Existing open ticket in this room: &quot;{aiAnalysis.duplicateCandidate.title}&quot; ({aiAnalysis.duplicateCandidate.status})
                    </div>
                  </div>
                </div>
                <span className="badge badge-high">Auto-linked</span>
              </div>
            )}

            {/* Extracted Entity Badges Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginTop: '2px' }}>{aiAnalysis.analysis.category.replace('_', ' ')}</div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                  {aiAnalysis.verifiedRoom ? aiAnalysis.verifiedRoom.roomNumber : aiAnalysis.analysis.roomNumber || 'Unspecified'}
                  {aiAnalysis.verifiedBuilding ? ` (${aiAnalysis.verifiedBuilding.code})` : ''}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Equipment</div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginTop: '2px' }}>
                  {aiAnalysis.verifiedEquipment ? aiAnalysis.verifiedEquipment.name : aiAnalysis.analysis.equipmentName || 'Facility General'}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Priority</div>
                <div style={{ marginTop: '2px' }}>
                  <span className={`badge ${aiAnalysis.analysis.priority === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                    {aiAnalysis.analysis.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Clarification Questions / Missing Info */}
            {aiAnalysis.analysis.clarificationQuestions && aiAnalysis.analysis.clarificationQuestions.length > 0 && (
              <div style={{ padding: '10px 12px', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} /> Clarification Prompts (System Inquiry)
                </div>
                <ul style={{ margin: '4px 0 0 18px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {aiAnalysis.analysis.clarificationQuestions.map((q: string, idx: number) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Ticket Form */}
      <form onSubmit={handleSubmitTicket} className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '18px' }}>Structured Ticket Data</h3>

        {submitError && (
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--critical-subtle)',
              border: '1px solid var(--critical-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--critical-text)',
              fontSize: '0.8125rem',
              marginBottom: '18px',
            }}
          >
            {submitError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Incident Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Projector malfunction before examination in Room A-204"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe symptoms, error codes, impact on students, and timeframe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
            >
              {Object.values(TicketCategory).map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Building / Block</label>
            <select
              className="form-select"
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
            >
              <option value="">Select Campus Building</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Room / Hall</label>
            <select
              className="form-select"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Select Room</option>
              {rooms
                .filter((r) => !buildingId || r.buildingId === buildingId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} - {r.roomType} (Cap: {r.capacity})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Affected Equipment / Asset</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Epson 4K Laser Projector (AST-PRJ-A204)"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/tickets')}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-sm"
          >
            {submitting ? 'Submitting to PostgreSQL...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  </RoleGuard>
  );
}
