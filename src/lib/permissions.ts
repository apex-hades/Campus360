import { UserRole } from '@prisma/client';

export type ExtendedRole = UserRole | 'STUDENT' | 'FACULTY';

export interface RoleConfig {
  label: string;
  badgeClass: string;
  description: string;
  allowedNavHrefs: string[];
  capabilities: {
    canReportComplaints: boolean;
    canEscalateAcademic: boolean;
    canBookRooms: boolean;
    canRelocateRooms: boolean;
    canManageStaff: boolean;
    canManageInventory: boolean;
    canApprovePurchases: boolean;
    canViewIncidents: boolean;
    canRunDisruptionDemo: boolean;
    canViewAnalytics: boolean;
    canManageSettings: boolean;
  };
}

export const ROLE_PERMISSIONS: Record<string, RoleConfig> = {
  STUDENT: {
    label: 'Student',
    badgeClass: 'badge-info',
    description: 'Campus student portal: submit maintenance complaints, track resolution, and receive campus alerts.',
    allowedNavHrefs: ['/dashboard', '/dashboard/tickets', '/dashboard/notifications'],
    capabilities: {
      canReportComplaints: true,
      canEscalateAcademic: false,
      canBookRooms: false,
      canRelocateRooms: false,
      canManageStaff: false,
      canManageInventory: false,
      canApprovePurchases: false,
      canViewIncidents: false,
      canRunDisruptionDemo: false,
      canViewAnalytics: false,
      canManageSettings: false,
    },
  },
  FACULTY: {
    label: 'Faculty / Professor',
    badgeClass: 'badge-purple',
    description: 'Academic operations: report classroom & lab equipment issues, reserve seminar rooms, and receive relocation notices.',
    allowedNavHrefs: ['/dashboard', '/dashboard/tickets', '/dashboard/rooms', '/dashboard/notifications'],
    capabilities: {
      canReportComplaints: true,
      canEscalateAcademic: true,
      canBookRooms: true,
      canRelocateRooms: false,
      canManageStaff: false,
      canManageInventory: false,
      canApprovePurchases: false,
      canViewIncidents: false,
      canRunDisruptionDemo: false,
      canViewAnalytics: false,
      canManageSettings: false,
    },
  },
  STUDENT_FACULTY: {
    label: 'Student / Faculty',
    badgeClass: 'badge-info',
    description: 'General campus user: report complaints, track ticket progress, and receive notifications.',
    allowedNavHrefs: ['/dashboard', '/dashboard/tickets', '/dashboard/rooms', '/dashboard/notifications'],
    capabilities: {
      canReportComplaints: true,
      canEscalateAcademic: true,
      canBookRooms: true,
      canRelocateRooms: false,
      canManageStaff: false,
      canManageInventory: false,
      canApprovePurchases: false,
      canViewIncidents: false,
      canRunDisruptionDemo: false,
      canViewAnalytics: false,
      canManageSettings: false,
    },
  },
  TECHNICIAN: {
    label: 'Technician',
    badgeClass: 'badge-warning',
    description: 'Work order dispatch: view assigned tickets, update resolution status, and reserve spare parts.',
    allowedNavHrefs: ['/dashboard', '/dashboard/tickets', '/dashboard/inventory', '/dashboard/notifications'],
    capabilities: {
      canReportComplaints: true,
      canEscalateAcademic: false,
      canBookRooms: false,
      canRelocateRooms: false,
      canManageStaff: false,
      canManageInventory: true, // Reserve parts, request low-stock
      canApprovePurchases: false, // Separation of duties!
      canViewIncidents: false,
      canRunDisruptionDemo: false,
      canViewAnalytics: false,
      canManageSettings: false,
    },
  },
  DEPARTMENT_MANAGER: {
    label: 'Department Manager',
    badgeClass: 'badge-purple',
    description: 'Department operations: monitor department ticket queue, staff workloads, and resolution metrics.',
    allowedNavHrefs: ['/dashboard', '/dashboard/tickets', '/dashboard/incidents', '/dashboard/staff', '/dashboard/notifications', '/dashboard/analytics'],
    capabilities: {
      canReportComplaints: true,
      canEscalateAcademic: true,
      canBookRooms: true,
      canRelocateRooms: false,
      canManageStaff: true,
      canManageInventory: false,
      canApprovePurchases: false,
      canViewIncidents: true,
      canRunDisruptionDemo: false,
      canViewAnalytics: true,
      canManageSettings: false,
    },
  },
  FACILITIES_ADMIN: {
    label: 'Facilities Administrator',
    badgeClass: 'badge-primary',
    description: 'Campus facilities command: manage rooms, emergency relocations, staff assignments, and disruption workflows.',
    allowedNavHrefs: [
      '/dashboard',
      '/dashboard/disruption',
      '/dashboard/tickets',
      '/dashboard/incidents',
      '/dashboard/rooms',
      '/dashboard/staff',
      '/dashboard/inventory',
      '/dashboard/approvals',
      '/dashboard/notifications',
      '/dashboard/analytics',
    ],
    capabilities: {
      canReportComplaints: true,
      canEscalateAcademic: true,
      canBookRooms: true,
      canRelocateRooms: true,
      canManageStaff: true,
      canManageInventory: true,
      canApprovePurchases: true,
      canViewIncidents: true,
      canRunDisruptionDemo: true,
      canViewAnalytics: true,
      canManageSettings: false,
    },
  },
  PROCUREMENT_APPROVER: {
    label: 'Procurement Approver',
    badgeClass: 'badge-success',
    description: 'Supply chain & financial governance: review and approve parts purchase requests and audit stock.',
    allowedNavHrefs: ['/dashboard', '/dashboard/approvals', '/dashboard/inventory', '/dashboard/notifications'],
    capabilities: {
      canReportComplaints: false,
      canEscalateAcademic: false,
      canBookRooms: false,
      canRelocateRooms: false,
      canManageStaff: false,
      canManageInventory: true,
      canApprovePurchases: true,
      canViewIncidents: false,
      canRunDisruptionDemo: false,
      canViewAnalytics: false,
      canManageSettings: false,
    },
  },
  SYSTEM_ADMIN: {
    label: 'System Administrator',
    badgeClass: 'badge-critical',
    description: 'Platform superuser: full access to all campus operations, audit logs, AI engine controls, and settings.',
    allowedNavHrefs: [
      '/dashboard',
      '/dashboard/disruption',
      '/dashboard/tickets',
      '/dashboard/incidents',
      '/dashboard/rooms',
      '/dashboard/staff',
      '/dashboard/inventory',
      '/dashboard/approvals',
      '/dashboard/notifications',
      '/dashboard/analytics',
      '/dashboard/settings',
    ],
    capabilities: {
      canReportComplaints: true,
      canEscalateAcademic: true,
      canBookRooms: true,
      canRelocateRooms: true,
      canManageStaff: true,
      canManageInventory: true,
      canApprovePurchases: true,
      canViewIncidents: true,
      canRunDisruptionDemo: true,
      canViewAnalytics: true,
      canManageSettings: true,
    },
  },
};

export function getRoleConfig(role?: string | null): RoleConfig {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return ROLE_PERMISSIONS.STUDENT_FACULTY;
  }
  return ROLE_PERMISSIONS[role];
}

export function canAccessPath(role: string | null | undefined, pathname: string): boolean {
  if (!role) return false;
  if (role === 'SYSTEM_ADMIN') return true;

  const config = getRoleConfig(role);

  // Allow sub-routes (e.g. /dashboard/tickets/new or /dashboard/tickets/CMP-2026-0001)
  return config.allowedNavHrefs.some((href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  });
}

