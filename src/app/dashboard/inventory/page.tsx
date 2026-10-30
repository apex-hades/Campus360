'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  FileText,
  DollarSign,
  PackageCheck,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react';
import { StockStatus, TicketCategory } from '@prisma/client';

export default function InventoryManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Purchase Request Modal
  const [showPrModal, setShowPrModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [prQuantity, setPrQuantity] = useState(5);
  const [prReason, setPrReason] = useState('');
  const [submittingPr, setSubmittingPr] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (itemId: string, changeAmount: number) => {
    setFeedback(null);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          changeAmount,
          reason: changeAmount > 0 ? 'Manual Restock' : 'Technician Parts Usage',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Stock adjustment rejected');

      setFeedback({ type: 'success', text: `Stock updated for ${data.item.name}` });
      fetchInventory();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleCreatePurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmittingPr(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/inventory/purchase-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          quantity: prQuantity,
          reason: prReason || `Replenishment order for ${selectedItem.name}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit purchase request');

      setFeedback({ type: 'success', text: `Purchase Request ${data.purchaseRequest.id} submitted for approval!` });
      setShowPrModal(false);
      fetchInventory();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmittingPr(false);
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard
      allowedRoles={['TECHNICIAN', 'FACILITIES_ADMIN', 'PROCUREMENT_APPROVER', 'SYSTEM_ADMIN']}
      featureName="Inventory & Spare Parts Warehouse"
    >
      <div>
        <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Spare Parts Control</h1>
          <p className="page-description">
            Track components, prevent negative inventory, receive low-stock alerts, and route purchase requests to procurement.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '18px',
            background: feedback.type === 'success' ? 'var(--success-subtle)' : 'var(--critical-subtle)',
            border: `1px solid ${feedback.type === 'success' ? 'var(--success-border)' : 'var(--critical-border)'}`,
            color: feedback.type === 'success' ? 'var(--success-text)' : 'var(--critical-text)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search and Table */}
      <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div className="topbar-search" style={{ maxWidth: '380px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search SKU, spare part name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity in Hand</th>
              <th>Min Threshold</th>
              <th>Unit Cost</th>
              <th>Location Bin</th>
              <th>Status</th>
              <th>Adjust Stock</th>
              <th>Procurement</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>
                    {item.sku}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.name}</td>
                <td>
                  <span className="badge badge-low">{item.category.replace('_', ' ')}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: item.quantity <= item.minStockThreshold ? 'var(--critical)' : 'var(--text-heading)' }}>
                    {item.quantity}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{item.minStockThreshold} units</td>
                <td>${item.unitCost.toFixed(2)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{item.locationBin}</td>
                <td>
                  <span
                    className={`badge ${
                      item.status === 'OUT_OF_STOCK'
                        ? 'badge-critical'
                        : item.status === 'LOW_STOCK'
                        ? 'badge-high'
                        : 'badge-success'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleAdjustStock(item.id, -1)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px' }}
                      title="Consume 1 unit"
                    >
                      <Minus size={13} />
                    </button>
                    <button
                      onClick={() => handleAdjustStock(item.id, 1)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 6px' }}
                      title="Restock 1 unit"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setPrQuantity(item.minStockThreshold * 2);
                      setShowPrModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px' }}
                  >
                    <ShoppingCart size={13} />
                    <span>Purchase Req</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Purchase Request Modal */}
      {showPrModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Create Purchase Request</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {selectedItem.name} ({selectedItem.sku})
                </div>
              </div>
              <button onClick={() => setShowPrModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseRequest}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Order Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={prQuantity}
                    onChange={(e) => setPrQuantity(parseInt(e.target.value, 10))}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Estimated Total Cost: ${(prQuantity * selectedItem.unitCost).toFixed(2)} (${selectedItem.unitCost}/unit)
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Justification / Reason</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Critical replenishment before final examination week..."
                    value={prReason}
                    onChange={(e) => setPrReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowPrModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submittingPr} className="btn btn-primary btn-sm">
                  {submittingPr ? 'Submitting...' : 'Submit to Procurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </RoleGuard>
  );
}
