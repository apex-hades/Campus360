'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Radio,
  Clock,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { NotificationType, DeliveryStatus } from '@prisma/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestWebhookDispatch = async () => {
    setTestingWebhook(true);
    setWebhookResult(null);

    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Manual Webhook Gateway Broadcast Test',
          message: 'Campus360 automated escalation webhook delivered to enterprise operations center with TLS 1.3 encryption.',
        }),
      });

      const data = await res.json();
      setWebhookResult(data);
      fetchNotifications();
    } catch (e: any) {
      console.error(e);
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-low">Multi-Channel Broadcast</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In-App & Simulated Webhook Gateway</span>
          </div>
          <h1 className="page-title">Notifications & External Integrations</h1>
          <p className="page-description">
            Audit in-app delivery statuses, emergency student broadcasts, and external webhook integrations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={14} />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={handleTestWebhookDispatch}
            disabled={testingWebhook}
            className="btn btn-primary btn-sm"
          >
            <Radio size={14} />
            <span>{testingWebhook ? 'Dispatching...' : 'Simulate External Webhook'}</span>
          </button>
        </div>
      </div>

      {/* Webhook Result Banner */}
      {webhookResult && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '18px',
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            color: 'var(--text-heading)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CheckCircle2 size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              Simulated Webhook Dispatched (Status 200 OK)
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Response Latency: {webhookResult.simulationResult?.responseTimeMs}ms | Event: {webhookResult.simulationResult?.eventType || 'BROADCAST'}
          </div>
        </div>
      )}

      {/* Notification Stream */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '14px' }}>Logged Notification History</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading notification records...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notification logs recorded yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: n.read ? '#FFFFFF' : 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${n.read ? 'var(--border-subtle)' : 'var(--primary-border)'}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      className={`badge ${
                        n.type === 'DISRUPTION_ALERT'
                          ? 'badge-critical'
                          : n.type === 'APPROVAL'
                          ? 'badge-high'
                          : 'badge-medium'
                      }`}
                    >
                      {n.type.replace('_', ' ')}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                      {n.title}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '4px 0 6px' }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    <span>Target: {n.user?.name || 'All Academic Staff'}</span>
                    <span>•</span>
                    <span>Delivery: {n.deliveryStatus}</span>
                    <span>•</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ marginLeft: '14px' }}>
                  <span className="badge badge-success">DELIVERED</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
