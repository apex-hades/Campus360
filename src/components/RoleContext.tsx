'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { canAccessPath, getRoleConfig, RoleConfig } from '@/lib/permissions';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  avatarUrl: string | null;
}

export interface DemoRoleItem {
  role: string;
  name: string;
  label: string;
  email: string;
  department: string;
  description: string;
}

export const ALL_DEMO_ROLES: DemoRoleItem[] = [
  {
    role: 'STUDENT',
    name: 'Aarav Sharma',
    label: 'Student',
    email: 'student@campus360.edu',
    department: 'School of Computing & AI (Year 3)',
    description: 'Submit campus complaints, track ticket progress, view facility alerts.',
  },
  {
    role: 'FACULTY',
    name: 'Prof. Rajesh Kulkarni',
    label: 'Faculty / Professor',
    email: 'faculty@campus360.edu',
    department: 'Dept of Computer Science & AI',
    description: 'Report classroom equipment faults, reserve seminar halls, view exam venues.',
  },
  {
    role: 'TECHNICIAN',
    name: 'Ramesh Kumar',
    label: 'Lead Technician',
    email: 'tech@campus360.edu',
    department: 'Campus Electrical & Power Engineering',
    description: 'Accept work orders, progress repair status, reserve warehouse spare parts.',
  },
  {
    role: 'DEPARTMENT_MANAGER',
    name: 'Dr. Priya Nair',
    label: 'Department Manager',
    email: 'manager@campus360.edu',
    department: 'Department of Computer Science & AI',
    description: 'Monitor departmental SLA metrics, technician workloads, and escalations.',
  },
  {
    role: 'FACILITIES_ADMIN',
    name: 'Vikram Malhotra',
    label: 'Facilities Administrator',
    email: 'admin@campus360.edu',
    department: 'Campus Infrastructure & Operations',
    description: 'Full campus oversight, classroom relocation, staff dispatch, disruption demo.',
  },
  {
    role: 'PROCUREMENT_APPROVER',
    name: 'Ananya Iyer',
    label: 'Procurement Approver',
    email: 'procurement@campus360.edu',
    department: 'Finance & Material Procurement',
    description: 'Review purchase requests, approve stock replenishments, enforce governance.',
  },
  {
    role: 'SYSTEM_ADMIN',
    name: 'Devendra Patel',
    label: 'System Administrator',
    email: 'sysadmin@campus360.edu',
    department: 'Enterprise Information Systems',
    description: 'Platform superuser: audit logging, system settings, AI telemetry.',
  },
];

interface RoleContextType {
  currentUser: UserProfile | null;
  role: string;
  roleConfig: RoleConfig;
  loading: boolean;
  switchRole: (role: string) => Promise<void>;
  canAccess: (pathname: string) => boolean;
  refreshUser: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        // Fallback default: Facilities Administrator for full demo exploration
        const def = ALL_DEMO_ROLES[4];
        setCurrentUser({
          id: 'admin-demo-id',
          email: def.email,
          name: def.name,
          role: def.role,
          department: def.department,
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        });
      }
    } catch {
      const def = ALL_DEMO_ROLES[4];
      setCurrentUser({
        id: 'admin-demo-id',
        email: def.email,
        name: def.name,
        role: def.role,
        department: def.department,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const switchRole = async (targetRole: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole, password: 'demo' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else {
        // If not found in DB with exact role, find corresponding item from ALL_DEMO_ROLES
        const match = ALL_DEMO_ROLES.find((r) => r.role === targetRole) || ALL_DEMO_ROLES[0];
        setCurrentUser({
          id: `demo-${match.role.toLowerCase()}`,
          email: match.email,
          name: match.name,
          role: match.role,
          department: match.department,
          avatarUrl: null,
        });
      }
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  const currentRole = currentUser?.role || 'FACILITIES_ADMIN';
  const roleConfig = getRoleConfig(currentRole);

  const canAccess = (pathname: string) => {
    return canAccessPath(currentRole, pathname);
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        role: currentRole,
        roleConfig,
        loading,
        switchRole,
        canAccess,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

