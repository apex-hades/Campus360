'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  LogOut,
  ChevronDown,
  Check,
  CheckSquare,
} from 'lucide-react';
import { useRole, ALL_DEMO_ROLES } from './RoleContext';
import { getRoleConfig } from '@/lib/permissions';

export default function Topbar() {
  const router = useRouter();
  const { currentUser, role, roleConfig, switchRole } = useRole();
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [role]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications.slice(0, 5));
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleSelect = async (targetRole: string) => {
    setShowRoleMenu(false);
    await switchRole(targetRole);
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/tickets?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="topbar">
      {/* Search Input */}
      <div className="topbar-left">
        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
          <div className="topbar-search">
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={
                role === 'STUDENT'
                  ? 'Search complaints, facilities, or notices...'
                  : role === 'FACULTY'
                  ? 'Search classrooms, labs, or equipment...'
                  : role === 'TECHNICIAN'
                  ? 'Search assigned work orders or parts...'
                  : 'Search tickets, rooms, inventory, or incidents...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Clean Right Actions */}
      <div className="topbar-right">
        {/* Single Context-Aware Primary Action */}
        {role === 'PROCUREMENT_APPROVER' ? (
          <Link href="/dashboard/approvals" className="btn btn-primary btn-sm">
            <CheckSquare size={14} />
            <span>Review Approvals</span>
          </Link>
        ) : roleConfig.capabilities.canReportComplaints ? (
          <Link href="/dashboard/tickets/new" className="btn btn-primary btn-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span>{role === 'STUDENT' ? 'Report Issue' : role === 'FACULTY' ? 'Report Fault' : 'New Ticket'}</span>
          </Link>
        ) : null}

        {/* Notifications Icon Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="btn btn-secondary btn-sm"
            style={{ position: 'relative', width: '34px', height: '34px', padding: 0, justifyContent: 'center' }}
            title="Campus Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '6px',
                  height: '6px',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '50%',
                }}
              />
            )}
          </button>

          {showNotifMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '320px',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-heading)' }}>Campus Alerts & Notices</span>
                <Link href="/dashboard/notifications" onClick={() => setShowNotifMenu(false)} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>
                  View all
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No unread notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-hover)',
                      marginBottom: '6px',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Minimal User Persona Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
            }}
            title="Switch evaluation persona"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-heading)' }}>
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Demo User'}
            </span>
            <span className={`badge ${roleConfig.badgeClass}`} style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
              {roleConfig.label}
            </span>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {showRoleMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '300px',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
              }}
            >
              <div
                style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Switch Role Persona
                </div>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {ALL_DEMO_ROLES.map((r) => {
                  const isCurrent = role === r.role;
                  const cfg = getRoleConfig(r.role);

                  return (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r.role)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: isCurrent ? 'var(--primary-subtle)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '3px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isCurrent ? 'var(--primary)' : 'var(--text-heading)' }}>
                            {r.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {cfg.label} • {r.department.split('(')[0]}
                        </span>
                      </div>
                      {isCurrent && <Check size={14} color="var(--primary)" />}
                    </button>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    color: 'var(--critical-text)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--critical-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={13} />
                  <span>Log out of session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
