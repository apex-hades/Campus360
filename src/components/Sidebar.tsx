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
  Layers,
  ChevronLeft,
  ChevronRight,
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
  { name: 'Architecture & Specs', href: '/dashboard/architecture', icon: Layers },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { role, roleConfig, canAccess } = useRole();

  const visibleNavItems = navigationItems.filter((item) => canAccess(item.href));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link href="/dashboard" className="brand">
          <div className="brand-icon">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="brand-name">Campus360</span>
              <span style={{ fontSize: '0.625rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.04em' }}>
                v1.0
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="btn btn-secondary btn-sm"
          style={{ padding: '3px', borderRadius: 'var(--radius-sm)', width: '24px', height: '24px', minWidth: '24px' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {/* Disruption Demo Workflow: Cleanly placed for authorized admins */}
        {roleConfig.capabilities.canRunDisruptionDemo && (
          <Link
            href="/dashboard/disruption"
            className={`nav-link ${pathname === '/dashboard/disruption' ? 'active' : ''}`}
            title="Classroom Failover & Relocation Simulation"
            style={{
              color: pathname === '/dashboard/disruption' ? 'var(--primary)' : 'var(--critical)',
              backgroundColor: pathname === '/dashboard/disruption' ? 'var(--primary-subtle)' : 'transparent',
            }}
          >
            <AlertTriangle size={15} strokeWidth={2} />
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>Disruption Failover</span>
                <span className="badge badge-critical" style={{ fontSize: '0.5625rem', padding: '1px 5px' }}>
                  Demo
                </span>
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
              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.7} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Calm Status Pill at Bottom */}
      {!collapsed && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="status-dot status-dot-green" />
              <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Systems Nominal</span>
            </div>
            <span className={`badge ${roleConfig.badgeClass}`} style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
              {roleConfig.label}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
