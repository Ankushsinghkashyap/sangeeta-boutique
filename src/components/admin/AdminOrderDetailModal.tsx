import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { Order, OrderStatus } from '../../types/index.ts';
import {
  X,
  Phone,
  MessageCircle,
  Scissors,
  Calendar,
  CheckCircle2,
  Printer,
  Edit2,
  Save,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  QrCode,
  CreditCard,
  Check,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminOrderDetailModalProps {
  orderId: number;
  onClose: () => void;
  onOrderUpdated: () => void;
}

const STATUS_OPTIONS: OrderStatus[] = [
  'New Order',
  'Contact Customer',
  'Confirmed',
  'Measurement Verified',
  'Sewing Started',
  'Sewing in Progress',
  'Ready',
  'Completed',
  'Cancelled',
];

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  orderId,
  onClose,
  onOrderUpdated,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status change state
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Price adjustment state
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedTotal, setEditedTotal] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Payment Verification state
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isRejectingPayment, setIsRejectingPayment] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Payment screenshot unclear or transaction reference not found');
  const [paymentVerificationSuccess, setPaymentVerificationSuccess] = useState<string | null>(null);
  const [zoomedScreenshot, setZoomedScreenshot] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOrderDetail(orderId);
      setOrder(data);
      setNewStatus(data.status);
      setTargetDate(data.expectedCompletionDate || '');
      setEditedTotal(data.totalAmount);
      setInternalNotes(data.notes || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      await api.updateOrderStatus(order.id, newStatus, statusNote, targetDate);
      setStatusNote('');
      await fetchDetail();
      onOrderUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!order) return;
    setIsSavingGeneral(true);
    try {
      await api.updateOrderDetails(order.id, {
        totalAmount: editedTotal,
        notes: internalNotes,
        expectedCompletionDate: targetDate,
      });
      setIsEditingPrice(false);
      await fetchDetail();
      onOrderUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!order) return;
    setIsVerifyingPayment(true);
    setPaymentVerificationSuccess(null);
    try {
      await api.verifyOrderPayment(order.id, {
        notes: `Payment screenshot verified for Rs. ${order.totalAmount}`,
      });
      setPaymentVerificationSuccess('Payment confirmed and order marked as Verified & Confirmed!');
      await fetchDetail();
      onOrderUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to verify payment');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!order) return;
    setIsRejectingPayment(true);
    try {
      await api.rejectOrderPayment(order.id, {
        reason: rejectReason.trim(),
      });
      setShowRejectModal(false);
      await fetchDetail();
      onOrderUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to reject payment');
    } finally {
      setIsRejectingPayment(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#6E1423] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#8A7968] mt-2">Loading tailoring job slip...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EADBCE] overflow-hidden my-6 print:border-none print:shadow-none print:m-0">
        {/* Header */}
        <div className="bg-[#6E1423] text-white p-6 flex items-center justify-between print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5C158] text-[#6E1423] flex items-center justify-center print:hidden">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-mono text-xs text-[#E5C158] font-bold tracking-widest print:text-black">
                ORDER #{order.orderNumber}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#FDFBF7] print:text-black">
                {order.designName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrintSlip}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title="Print Tailor Work Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6 print:max-h-none print:overflow-visible">
          {/* Quick Actions & Contact Bar */}
          <div className="bg-[#F9F6F0] p-4 rounded-xl border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#6E1423] text-white flex items-center justify-center font-bold text-sm">
                {order.customerName[0]}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2B2320]">{order.customerName}</h4>
                <p className="text-xs text-[#8A7968]">
                  Phone: {order.customerPhone} • {order.customerCity || 'City not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.customerPhone}`}
                className="px-3 py-1.5 bg-white border border-[#EADBCE] text-[#2B2320] text-xs font-semibold rounded-md flex items-center gap-1 hover:bg-[#FDFBF7]"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Client</span>
              </a>
              <a
                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Namaste ${order.customerName}! This is Sangeeta Boutique regarding your Order #${order.orderNumber} (Rs. ${order.totalAmount}). ${
                    order.paymentStatus === 'Payment Verified'
                      ? 'Your payment has been successfully confirmed and your tailoring is in progress!'
                      : 'We received your order and are reviewing your tailoring details.'
                  }`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-md flex items-center gap-1 hover:bg-[#20ba59]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* PAYMENT VERIFICATION & SCREENSHOT CONFIRMATION CARD (PRINT HIDDEN) */}
          <div className="bg-white rounded-xl border-2 border-[#E5C158] p-5 shadow-xs space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                    order.paymentStatus === 'Payment Verified'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.paymentScreenshotUrl
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#6E1423]">
                    Payment Verification & QR Confirmation
                  </h4>
                  <p className="text-xs text-[#8A7968]">
                    Method: <strong>{order.paymentMethod || 'NIC ASIA QR Payment'}</strong> • Total: <strong className="text-[#6E1423]">Rs. {Number(order.totalAmount).toLocaleString('en-IN')}</strong>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.paymentStatus === 'Payment Verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : order.paymentStatus === 'Payment Rejected'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : order.paymentScreenshotUrl
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  {order.paymentStatus === 'Payment Verified'
                    ? 'Payment Verified ✓'
                    : order.paymentStatus === 'Payment Rejected'
                    ? 'Payment Rejected'
                    : order.paymentScreenshotUrl
                    ? 'Action Needed: Verify Screenshot'
                    : 'Pending Payment'}
                </span>
              </div>
            </div>

            {paymentVerificationSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{paymentVerificationSuccess}</span>
              </div>
            )}

            {/* Payment Details & Screenshot Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Screenshot Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#2B2320] block">
                  Customer Payment Proof / MoBank Slip:
                </span>
                {order.paymentScreenshotUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-[#EADBCE] bg-[#FDFBF7] group">
                    <img
                      src={order.paymentScreenshotUrl}
                      alt="Customer payment screenshot"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/nic_asia_qr.svg';
                      }}
                      className="w-full h-44 object-contain bg-black/5 p-1"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoomedScreenshot(order.paymentScreenshotUrl!)}
                        className="px-3 py-1.5 bg-white text-[#2B2320] rounded text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#FDFBF7]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Enlarge Screenshot</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-[#FDFBF7] border border-dashed border-[#EADBCE] rounded-lg text-center text-xs text-[#8A7968] space-y-1">
                    <ImageIcon className="w-6 h-6 mx-auto text-gray-300" />
                    <p className="font-semibold text-gray-500">No screenshot uploaded yet</p>
                    <p className="text-[11px]">Customer selected {order.paymentMethod || 'Cash / QR'}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Transaction Info & Actions */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="bg-[#FDFBF7] p-3.5 rounded-lg border border-[#EADBCE] text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8A7968]">Transaction Ref / UTR:</span>
                    <span className="font-mono font-bold text-[#2B2320]">
                      {order.paymentTransactionId || 'None provided'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A7968]">Target Amount:</span>
                    <span className="font-bold text-[#6E1423]">
                      Rs. {Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {order.paymentVerifiedBy && (
                    <div className="flex justify-between text-emerald-800">
                      <span>Confirmed By:</span>
                      <span className="font-semibold">{order.paymentVerifiedBy}</span>
                    </div>
                  )}
                  {order.paymentVerifiedAt && (
                    <div className="flex justify-between text-[#8A7968] text-[11px]">
                      <span>Confirmed At:</span>
                      <span>{new Date(order.paymentVerifiedAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {order.paymentNotes && (
                    <div className="pt-1 border-t border-[#EADBCE] text-[11px] text-[#8C6D1F]">
                      <span>Admin Note: {order.paymentNotes}</span>
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {order.paymentStatus !== 'Payment Verified' ? (
                    <button
                      type="button"
                      onClick={handleVerifyPayment}
                      disabled={isVerifyingPayment}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isVerifyingPayment ? 'Verifying...' : 'Confirm & Verify Payment'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Payment Verified & Confirmed</span>
                    </div>
                  )}

                  {order.paymentStatus !== 'Payment Rejected' && (
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reject Payment Receipt"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Design & Reference Photo */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E1423] border-b border-[#EADBCE] pb-1">
                Design & Reference
              </h4>
              <div className="relative rounded-lg overflow-hidden border border-[#EADBCE] bg-[#F4EDE4]">
                <img
                  src={order.designImage || '/images/bridal-blouse-red.jpg'}
                  alt={order.designName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                  }}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2.5 bg-white text-xs space-y-0.5">
                  <span className="font-mono text-[#8C6D1F] font-bold block">{order.designCode}</span>
                  <span className="font-semibold text-[#2B2320] block">{order.designCategory}</span>
                </div>
              </div>

              {/* Customer reference image if uploaded */}
              {order.referenceImageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#8A7968] block">Customer Reference Photo:</span>
                  <a
                    href={order.referenceImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative rounded-lg overflow-hidden border border-[#EADBCE] group"
                  >
                    <img
                      src={order.referenceImageUrl}
                      alt="Customer uploaded reference"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/designer-blouse-back.jpg';
                      }}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      Open Full Image
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Custom Measurements Card */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-[#EADBCE] pb-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E1423]">
                  Tailoring Measurements ({order.sizeType})
                </h4>
                {order.standardSize && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FCF8EC] text-[#8C6D1F] border border-[#E5C158]">
                    Standard: {order.standardSize}
                  </span>
                )}
              </div>

              {order.measurements && order.measurements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {order.measurements.map((m) => (
                    <div
                      key={m.id || m.measurementType}
                      className="p-2.5 bg-[#F9F6F0] rounded-lg border border-[#EADBCE]"
                    >
                      <span className="text-[#8A7968] block text-[10px] uppercase font-semibold">
                        {m.measurementType}
                      </span>
                      <strong className="text-sm font-serif text-[#6E1423]">
                        {m.measurementValue}"
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#F9F6F0] rounded-lg text-xs text-[#8A7968] italic border border-[#EADBCE]">
                  Standard size selected ({order.standardSize || 'M'}). No custom measurement values inputted.
                </div>
              )}

              {/* Customizations List */}
              {order.customizations && order.customizations.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#8A7968]">
                    Requested Styling Customizations
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {order.customizations.map((c) => (
                      <div key={c.id || c.customizationType} className="p-2 bg-white rounded border border-[#EADBCE]">
                        <span className="font-semibold text-[#8C6D1F]">{c.customizationType}:</span>{' '}
                        <span className="text-[#2B2320]">{c.customizationValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special instructions */}
              {order.specialInstructions && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <strong className="text-amber-900 block mb-1">Customer Special Instructions:</strong>
                  <p className="text-amber-800 italic">"{order.specialInstructions}"</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-4 bg-white rounded-xl border border-[#EADBCE] space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-[#EADBCE] pb-2">
                  <span className="font-bold text-[#6E1423] uppercase">Financial Breakdown</span>
                  {!isEditingPrice ? (
                    <button
                      onClick={() => setIsEditingPrice(true)}
                      className="text-[11px] text-[#6E1423] hover:underline flex items-center gap-1 cursor-pointer print:hidden"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Price / Completion Date</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveGeneral}
                      disabled={isSavingGeneral}
                      className="px-2 py-0.5 bg-[#6E1423] text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>{isSavingGeneral ? 'Saving...' : 'Save Price'}</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-between text-[#6A5E57]">
                  <span>Design & Fabric Base:</span>
                  <span>₹{Number(order.designPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#6A5E57]">
                  <span>Sewing & Tailoring Charge:</span>
                  <span>₹{Number(order.sewingPrice).toLocaleString('en-IN')}</span>
                </div>
                {parseFloat(order.customizationPrice) > 0 && (
                  <div className="flex justify-between text-[#6A5E57]">
                    <span>Customization Charge:</span>
                    <span>₹{Number(order.customizationPrice).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#EADBCE] flex justify-between items-center text-sm font-bold text-[#6E1423]">
                  <span>Total Order Price:</span>
                  {isEditingPrice ? (
                    <div className="flex items-center gap-1">
                      <span>₹</span>
                      <input
                        type="number"
                        value={editedTotal}
                        onChange={(e) => setEditedTotal(e.target.value)}
                        className="w-24 px-2 py-1 border border-[#6E1423] rounded text-xs"
                      />
                    </div>
                  ) : (
                    <span className="font-serif text-lg">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Controller (Print hidden) */}
          <div className="p-5 bg-[#FCF8EC] rounded-xl border border-[#E5C158] space-y-4 print:hidden">
            <h4 className="font-serif text-base font-bold text-[#6E1423] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C59B27]" />
              <span>Update Tailoring Status & Milestone Note</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                  Change Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg text-xs font-semibold text-[#6E1423] focus:outline-none"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                  Milestone Note / Progress Comment
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Embroidery ready, lining attached"
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="px-6 py-2 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Saving Status...' : 'Apply Status Update & Notify Client'}
              </button>
            </div>
          </div>

          {/* Status History Timeline Audit Log */}
          {order.history && order.history.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7968]">
                Tailoring Status History Log
              </h4>
              <div className="space-y-2">
                {order.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-white rounded-lg border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                  >
                    <div>
                      <span className="font-bold text-[#6E1423]">{h.status}</span>
                      {h.note && <span className="text-[#6A5E57]"> — {h.note}</span>}
                    </div>
                    <div className="text-[11px] text-[#8A7968] flex items-center gap-2">
                      <span>By: {h.changedBy || 'Admin'}</span>
                      <span>•</span>
                      <span>
                        {new Date(h.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Atelier Notes */}
          <div className="space-y-2 print:hidden">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7968]">
              Internal Master Tailor Notes
            </h4>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private notes for master tailors and fitting records..."
              className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-lg text-xs"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={isSavingGeneral}
                className="px-4 py-1.5 bg-[#F9F6F0] hover:bg-[#6E1423] hover:text-white border border-[#EADBCE] text-[#2B2320] rounded text-xs font-semibold transition-colors"
              >
                Save Internal Notes
              </button>
            </div>
          </div>
        </div>

        {/* Screenshot Lightbox Modal */}
        {zoomedScreenshot && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-3 relative shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#6E1423]" />
                  <span className="font-bold text-xs text-[#2B2320]">
                    Payment Screenshot — Order #{order.orderNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomedScreenshot(null)}
                  className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-xl p-2">
                <img
                  src={zoomedScreenshot}
                  alt="Zoomed Payment Screenshot"
                  className="max-h-[65vh] object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8A7968]">
                  Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
                </span>
                <div className="flex gap-2">
                  <a
                    href={zoomedScreenshot}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#F9F6F0] border border-[#EADBCE] text-[#2B2320] rounded text-xs font-semibold flex items-center gap-1 hover:bg-[#EADBCE]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                  {order.paymentStatus !== 'Payment Verified' && (
                    <button
                      type="button"
                      onClick={() => {
                        setZoomedScreenshot(null);
                        handleVerifyPayment();
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Payment Reason Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EADBCE]">
              <div className="flex items-center gap-2.5 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-serif text-lg font-bold text-[#2B2320]">Reject Payment Proof</h4>
              </div>

              <p className="text-xs text-[#6A5E57]">
                Please specify why this payment proof could not be verified (e.g. amount mismatch, illegible slip, invalid transaction ID):
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                  Rejection Reason:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 border border-[#EADBCE] text-gray-700 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectPayment}
                  disabled={isRejectingPayment}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isRejectingPayment ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
