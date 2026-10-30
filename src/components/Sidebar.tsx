'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  AlertTriangle,
  DoorOpen,
  Users,
  Boxes,
  CheckSquare,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useRole } from './RoleContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Complaints & Tickets', href: '/dashboard/tickets', icon: Ticket },
  { name: 'Incident Intelligence', href: '/dashboard/incidents', icon: AlertTriangle },
  { name: 'Room Management', href: '/dashboard/rooms', icon: DoorOpen },
  { name: 'Staff & Workforce', href: '/dashboard/staff', icon: Users },
  { name: 'Inventory & Parts', href: '/dashboard/inventory', icon: Boxes },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { role, roleConfig, canAccess } = useRole();

  const visibleNavItems = navigationItems.filter((item) => canAccess(item.href));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link href="/dashboard" className="brand">
          <div className="brand-icon">
            <Zap size={18} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div>
              <div className="brand-name">Campus360</div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
                Enterprise Operations
              </div>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px', borderRadius: 'var(--radius-sm)', width: '26px', height: '26px' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Disruption Demo link: only visible to Administrators with scenario permissions */}
        {roleConfig.capabilities.canRunDisruptionDemo && (
          <Link
            href="/dashboard/disruption"
            className={`nav-link nav-link-special ${pathname === '/dashboard/disruption' ? 'active' : ''}`}
            title="Classroom Disruption Scenario Demo (A-204)"
          >
            <AlertTriangle size={16} strokeWidth={2.2} />
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Disruption Demo</span>
                <span style={{ fontSize: '0.6875rem', opacity: 0.85 }}>Classroom Failure Scenario</span>
              </div>
            )}
          </Link>
        )}

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
              title={item.name}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role Indicator & System Status Pill at bottom */}
      {!collapsed && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Role
            </span>
            <span className={`badge ${roleConfig.badgeClass}`} style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
              {roleConfig.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot status-dot-green" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-heading)' }}>PostgreSQL Engine</span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>AI & Telemetry Live</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
