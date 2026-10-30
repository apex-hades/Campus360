'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import {
  DoorOpen,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { RoomStatus, RoomType, EventType } from '@prisma/client';

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingType, setBookingType] = useState<EventType>(EventType.CLASS);
  const [bookingStartTime, setBookingStartTime] = useState('02:00 PM');
  const [bookingEndTime, setBookingEndTime] = useState('04:00 PM');
  const [bookingCapacity, setBookingCapacity] = useState(40);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Alternative Room Finder Modal
  const [showAltModal, setShowAltModal] = useState(false);
  const [altRequiredCapacity, setAltRequiredCapacity] = useState(60);
  const [altStartTime, setAltStartTime] = useState('10:00 AM');
  const [altEndTime, setAltEndTime] = useState('12:00 PM');
  const [altEvaluating, setAltEvaluating] = useState(false);
  const [altResults, setAltResults] = useState<any>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setSubmittingBooking(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          title: bookingTitle,
          eventType: bookingType,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
          requiredCapacity: bookingCapacity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setBookingSuccess(`Booking confirmed for ${selectedRoom.roomNumber}!`);
      setBookingTitle('');
      fetchRooms();
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(null);
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleEvaluateAlternatives = async () => {
    setAltEvaluating(true);
    try {
      const res = await fetch('/api/rooms/check-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiredCapacity: altRequiredCapacity,
          startTime: altStartTime,
          endTime: altEndTime,
          requiredFacilities: ['Projector'],
        }),
      });
      const data = await res.json();
      setAltResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAltEvaluating(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.building.name.toLowerCase().includes(search.toLowerCase());
    const matchesBldg = filterBuilding === 'ALL' || r.building.code === filterBuilding;
    const matchesType = filterType === 'ALL' || r.roomType === filterType;
    return matchesSearch && matchesBldg && matchesType;
  });

  return (
    <RoleGuard
      allowedRoles={['FACULTY', 'FACILITIES_ADMIN', 'DEPARTMENT_MANAGER', 'SYSTEM_ADMIN', 'STUDENT_FACULTY']}
      featureName="Classroom Directory & Timetable Booking"
    >
      <div>
        <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-low">Facility Capacity Engine</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conflict-Free Scheduling</span>
          </div>
          <h1 className="page-title">Room & Timetable Management</h1>
          <p className="page-description">
            Monitor classroom capacities, validate timetable schedules, detect reservation conflicts, and search smart alternative venues.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowAltModal(true);
              handleEvaluateAlternatives();
            }}
            className="btn btn-primary btn-sm"
          >
            <Sparkles size={14} />
            <span>Alternative Recommender</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="topbar-search" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by room number, block name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
            >
              <option value="ALL">All Blocks</option>
              <option value="BLOCK-A">Block A (Computing)</option>
              <option value="BLOCK-B">Block B (Robotics)</option>
              <option value="BLOCK-C">Block C (Humanities)</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Room Types</option>
              {Object.values(RoomType).map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
        {filteredRooms.map((room) => (
          <div key={room.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-heading)' }}>{room.roomNumber}</span>
                    <span className="badge badge-low">{room.roomType}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {room.building.name} (Floor {room.floor})
                  </div>
                </div>

                <span
                  className={`badge ${
                    room.status === 'AVAILABLE'
                      ? 'badge-success'
                      : room.status === 'UNAVAILABLE'
                      ? 'badge-critical'
                      : 'badge-high'
                  }`}
                >
                  {room.status}
                </span>
              </div>

              {room.statusReason && (
                <div style={{ padding: '6px 10px', background: 'var(--critical-subtle)', border: '1px solid var(--critical-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', color: 'var(--critical-text)', marginBottom: '10px' }}>
                  {room.statusReason}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '0.8125rem', color: 'var(--primary)' }}>
                <Users size={14} />
                <span style={{ fontWeight: 600 }}>Capacity: {room.capacity} Students</span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  Installed Facilities
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {room.facilities.map((fac: string) => (
                    <span key={fac} style={{ fontSize: '0.6875rem', background: 'var(--bg-surface-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bookings Strip */}
              {room.bookings?.length > 0 && (
                <div style={{ padding: '8px 10px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                    Active Bookings
                  </div>
                  {room.bookings.map((b: any) => (
                    <div key={b.id} style={{ fontSize: '0.75rem', color: 'var(--text-heading)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>{b.title}</span>
                      <span style={{ color: 'var(--primary)' }}>{b.startTime} - {b.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setSelectedRoom(room);
                  setShowBookingModal(true);
                  setBookingError(null);
                  setBookingSuccess(null);
                }}
                disabled={room.status === 'UNAVAILABLE'}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={13} />
                <span>Reserve Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Book Room {selectedRoom.roomNumber}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Capacity: {selectedRoom.capacity} seats | {selectedRoom.building.name}
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="modal-body">
                {bookingError && (
                  <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--critical-subtle)', border: '1px solid var(--critical-border)', color: 'var(--critical-text)', fontSize: '0.8125rem', marginBottom: '12px' }}>
                    {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', color: 'var(--success-text)', fontSize: '0.8125rem', marginBottom: '12px' }}>
                    {bookingSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Event / Class Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Advanced Operating Systems Lecture"
                    value={bookingTitle}
                    onChange={(e) => setBookingTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={bookingStartTime}
                      onChange={(e) => setBookingStartTime(e.target.value)}
                      placeholder="10:00 AM"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={bookingEndTime}
                      onChange={(e) => setBookingEndTime(e.target.value)}
                      placeholder="12:00 PM"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Attendees / Students</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bookingCapacity}
                    onChange={(e) => setBookingCapacity(parseInt(e.target.value, 10))}
                    max={selectedRoom.capacity}
                  />
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Max room capacity is {selectedRoom.capacity}. Backend checks will reject exceeding attendees.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingBooking} className="btn btn-primary btn-sm">
                  {submittingBooking ? 'Checking Conflicts...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alternative Room Finder Modal */}
      {showAltModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  Intelligent Alternative Room Recommender
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Evaluates capacity, facilities, and live booking collisions against PostgreSQL
                </div>
              </div>
              <button onClick={() => setShowAltModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}>
                <X size={15} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Min Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={altRequiredCapacity}
                    onChange={(e) => setAltRequiredCapacity(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={altStartTime}
                    onChange={(e) => setAltStartTime(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={altEndTime}
                    onChange={(e) => setAltEndTime(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleEvaluateAlternatives}
                disabled={altEvaluating}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginBottom: '18px' }}
              >
                {altEvaluating ? 'Evaluating Real DB Records...' : 'Execute Multi-Factor Room Evaluation'}
              </button>

              {altResults && (
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success-text)', marginBottom: '8px' }}>
                    Eligible Alternatives ({altResults.eligibleRooms?.length || 0} Found)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    {altResults.eligibleRooms?.map((er: any) => (
                      <div
                        key={er.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--success-subtle)',
                          border: '1px solid var(--success-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                            {er.roomNumber} - {er.buildingName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Capacity: {er.capacity} | Facilities: {er.facilities.join(', ')}
                          </div>
                        </div>
                        <span className="badge badge-success">Match Score: {er.matchScore}%</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--critical-text)', marginBottom: '8px' }}>
                    Rejected Rooms with Criteria Explanations
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {altResults.rejectedRooms?.map((rr: any) => (
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
                        <span style={{ fontWeight: 600, color: 'var(--critical-text)' }}>{rr.roomNumber}:</span>{' '}
                        <span style={{ color: 'var(--critical-text)' }}>{rr.reasons.join(' | ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </RoleGuard>
  );
}
