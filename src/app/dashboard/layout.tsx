'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { RoleProvider } from '@/components/RoleContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <RoleProvider>
      <div className="app-layout">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={`main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
          <Topbar />
          <main className="page-container">{children}</main>
        </div>
      </div>
    </RoleProvider>
  );
}

