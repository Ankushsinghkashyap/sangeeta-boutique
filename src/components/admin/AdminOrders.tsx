import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client.ts';
import { Order, OrderStatus } from '../../types/index.ts';
import { AdminOrderDetailModal } from './AdminOrderDetailModal.tsx';
import {
  Search,
  Filter,
  Eye,
  Phone,
  MessageCircle,
  Calendar,
  AlertCircle,
  RefreshCw,
  Scissors,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ChevronDown,
  QrCode,
  CreditCard,
  Image as ImageIcon,
  ShieldCheck,
  Check,
} from 'lucide-react';

const STATUS_FILTERS = [
  'All',
  'New Order',
  'Contact Customer',
  'Confirmed',
  'Measurement Verified',
  'Sewing in Progress',
  'Ready',
  'Completed',
  'Cancelled',
];

const PAYMENT_FILTERS = [
  { id: 'All', label: 'All Payments' },
  { id: 'Pending Verification', label: '🟡 Needs Verification' },
  { id: 'Payment Verified', label: '🟢 Verified' },
  { id: 'Pending Payment', label: '⚪ Pending Payment' },
];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOrders({
        status: selectedStatus,
        search: searchQuery,
      });

      // Filter locally if paymentStatus is selected
      let filtered = data;
      if (selectedPaymentStatus !== 'All') {
        filtered = filtered.filter((o) => {
          if (selectedPaymentStatus === 'Pending Verification') {
            return o.paymentStatus === 'Pending Verification' || (o.paymentScreenshotUrl && o.paymentStatus !== 'Payment Verified');
          }
          return o.paymentStatus === selectedPaymentStatus;
        });
      }

      setOrders(filtered);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedPaymentStatus]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleExportCsv = async (scope: 'filtered' | 'all' = 'filtered') => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const params = scope === 'filtered'
        ? { status: selectedStatus, search: searchQuery }
        : { status: 'All' };

      const blob = await api.exportOrdersCsv(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      const scopeSuffix = scope === 'filtered' && selectedStatus !== 'All' ? `-${selectedStatus.toLowerCase().replace(/\s+/g, '-')}` : '';
      a.download = `sangeeta-boutique-orders${scopeSuffix}-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportMessage(
        scope === 'filtered'
          ? `Successfully exported ${orders.length} filtered orders for bookkeeping!`
          : 'Successfully exported complete boutique order history for bookkeeping!'
      );
      setTimeout(() => setExportMessage(null), 4500);
    } catch (err: any) {
      console.error('CSV Export failed:', err);
      alert(err.message || 'Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Export notification toast */}
      {exportMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportMessage}</span>
          </div>
          <button
            onClick={() => setExportMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#6E1423]">
            Customer Sewing Orders Management
          </h2>
          <p className="text-xs text-[#8A7968]">
            Manage bespoke tailoring jobs, measurements, fittings, and workflow milestones
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export to CSV Button & Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <div className="inline-flex rounded-lg shadow-xs">
              <button
                type="button"
                onClick={() => handleExportCsv('filtered')}
                disabled={exporting}
                title="Export order history as a spreadsheet for bookkeeping"
                className="px-3.5 py-2 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold rounded-l-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {exporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#E5C158]" />
                )}
                <span>{exporting ? 'Exporting...' : 'Export to CSV'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExportMenu((prev) => !prev)}
                disabled={exporting}
                aria-label="Export options"
                className="px-2 py-2 bg-[#530E1A] hover:bg-[#3D0A13] text-white rounded-r-lg border-l border-white/20 transition-colors cursor-pointer disabled:opacity-50 flex items-center"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Dropdown Options */}
            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#EADBCE] rounded-xl shadow-xl z-30 p-1.5 text-xs animate-fade-in">
                <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[#8A7968] border-b border-[#EADBCE]/50">
                  Bookkeeping CSV Options
                </div>

                <button
                  type="button"
                  onClick={() => handleExportCsv('filtered')}
                  className="w-full text-left px-2.5 py-2 hover:bg-[#FDFBF7] text-[#2B2320] rounded-lg font-medium flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[#6E1423]" />
                    <span>Export Current View</span>
                  </span>
                  <span className="text-[10px] bg-[#F4EDE4] text-[#6E1423] px-1.5 py-0.5 rounded font-bold">
                    {orders.length} orders
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportCsv('all')}
                  className="w-full text-left px-2.5 py-2 hover:bg-[#FDFBF7] text-[#2B2320] rounded-lg font-medium flex items-center gap-2 cursor-pointer border-t border-[#EADBCE]/50 mt-1 pt-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <span className="block font-semibold">Export All Orders</span>
                    <span className="text-[10px] text-[#8A7968]">Complete historical database</span>
                  </div>
                </button>

                <div className="px-2.5 py-1.5 text-[10px] text-[#A69788] bg-[#FDFBF7] rounded-lg mt-1 border border-[#EADBCE]/50">
                  🛡️ Includes CSV formula-injection defense & Excel UTF-8 BOM compatibility.
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 bg-white border border-[#EADBCE] hover:bg-[#F9F6F0] text-[#2B2320] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EADBCE] shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A7968] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (SB-2026-...), customer name, phone, or design code..."
              className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs focus:border-[#6E1423] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#6E1423] text-white text-xs font-semibold rounded-lg hover:bg-[#530E1A] transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="space-y-2 pt-1 pb-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-[#8A7968] shrink-0 mr-1">Status:</span>
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#6E1423] text-white font-semibold'
                    : 'bg-[#F9F6F0] text-[#6A5E57] hover:bg-[#ECE4D8]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Payment Status Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[#EADBCE]/60">
            <span className="text-[10px] uppercase font-bold text-[#8A7968] shrink-0 mr-1 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-[#C59B27]" />
              <span>Payment:</span>
            </span>
            {PAYMENT_FILTERS.map((pf) => (
              <button
                key={pf.id}
                onClick={() => setSelectedPaymentStatus(pf.id)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedPaymentStatus === pf.id
                    ? 'bg-[#E5C158] text-[#2B2320] border-[#C59B27] shadow-xs'
                    : 'bg-white text-[#6A5E57] border-[#EADBCE] hover:bg-[#FDFBF7]'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#EADBCE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F0] text-[#6A5E57] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Design Item</th>
                <th className="py-3 px-4">Sizing Fit</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment & QR Proof</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#8A7968]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#6E1423]">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#2B2320] block">{ord.customerName}</span>
                      <span className="text-[11px] text-[#8A7968] block">{ord.customerPhone}</span>
                      {ord.customerCity && (
                        <span className="text-[10px] text-[#A69788] block">{ord.customerCity}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#2B2320] block">{ord.designName}</span>
                      <span className="text-[11px] text-[#C59B27] font-mono">
                        {ord.designCode} • {ord.designCategory}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F9F6F0] border border-[#EADBCE]">
                        {ord.sizeType === 'Standard' ? `Standard (${ord.standardSize})` : 'Custom Fit'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-serif text-sm font-bold text-[#2B2320]">
                      Rs. {Number(ord.totalAmount).toLocaleString('en-IN')}
                    </td>

                    {/* Payment Column */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === 'Payment Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.paymentScreenshotUrl
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ord.paymentStatus === 'Payment Verified' ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </>
                          ) : ord.paymentScreenshotUrl ? (
                            <>
                              <ImageIcon className="w-3 h-3 text-amber-700" />
                              <span>Proof Attached</span>
                            </>
                          ) : (
                            <span>Pending</span>
                          )}
                        </span>
                        {ord.paymentTransactionId && (
                          <span className="font-mono text-[9px] text-[#8A7968] block truncate max-w-[110px]" title={ord.paymentTransactionId}>
                            Ref: {ord.paymentTransactionId}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#8A7968]">
                      {ord.expectedCompletionDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#C59B27]" />
                          <span>{ord.expectedCompletionDate}</span>
                        </span>
                      ) : (
                        'Not set'
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'New Order'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : ord.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'Cancelled'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-[#FCF8EC] text-[#8C6D1F] border border-[#E5C158]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs ${
                          ord.paymentScreenshotUrl && ord.paymentStatus !== 'Payment Verified'
                            ? 'bg-[#E5C158] hover:bg-[#d4ad42] text-[#2B2320] font-bold'
                            : 'bg-[#6E1423] hover:bg-[#530E1A] text-white'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{ord.paymentScreenshotUrl && ord.paymentStatus !== 'Payment Verified' ? 'Verify' : 'Manage'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#8A7968]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <AdminOrderDetailModal
          orderId={selectedOrder.id}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};
