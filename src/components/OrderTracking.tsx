import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client.ts';
import { Order, OrderStatus } from '../types/index.ts';
import { PaymentQRCode } from './PaymentQRCode.tsx';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Scissors,
  Calendar,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  QrCode,
  Upload,
  CreditCard,
  Image as ImageIcon,
  Check,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface OrderTrackingProps {
  initialOrderNumber?: string;
  initialPhone?: string;
  onClose?: () => void;
}

const ORDER_STEPS = [
  { id: 'New Order', label: 'Order Received', desc: 'Order details and measurements submitted' },
  { id: 'Confirmed', label: 'Confirmed', desc: 'Fabric verified & advance confirmed' },
  { id: 'Measurement Verified', label: 'Measurement Verified', desc: 'Master tailor pattern mapped' },
  { id: 'Sewing in Progress', label: 'Sewing in Progress', desc: 'Cutting, embroidery & stitching' },
  { id: 'Ready', label: 'Ready for Trial / Pickup', desc: 'Garment pressed & inspected' },
  { id: 'Completed', label: 'Delivered / Completed', desc: 'Handed over to client' },
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  initialOrderNumber = '',
  initialPhone = '',
  onClose,
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-upload proof states
  const [showQrModal, setShowQrModal] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [txnInput, setTxnInput] = useState('');
  const [proofSuccessMsg, setProofSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTracking = async (orderNum: string, ph: string) => {
    if (!orderNum.trim() || !ph.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackOrder(orderNum.trim(), ph.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Could not find order. Please verify Order ID and phone number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      fetchTracking(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, phone);
  };

  const handleProofFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Payment screenshot size must be under 8MB');
      return;
    }

    setUploadingProof(true);
    setProofSuccessMsg(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64, `payment_${order.orderNumber}_${file.name}`);

        const updated = await api.submitPaymentProof({
          orderNumber: order.orderNumber,
          phone: order.customerPhone,
          paymentScreenshotUrl: uploadRes.url,
          paymentTransactionId: txnInput.trim() || undefined,
        });

        setOrder(updated);
        setProofSuccessMsg('Payment screenshot uploaded! Boutique admin Sangeeta will verify it shortly.');
        setTimeout(() => setProofSuccessMsg(null), 6000);
      } catch (err: any) {
        alert(err.message || 'Failed to upload payment proof');
      } finally {
        setUploadingProof(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Calculate current active step index
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'New Order':
      case 'Contact Customer':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Measurement Verified':
        return 2;
      case 'Sewing Started':
      case 'Sewing in Progress':
        return 3;
      case 'Ready':
        return 4;
      case 'Completed':
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = order ? getStepIndex(order.status) : 0;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">
            Tailoring Status & Verification
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#6E1423]">
            Track Your Sewing Order
          </h2>
          <p className="text-xs sm:text-sm text-[#8A7968] max-w-lg mx-auto">
            Enter your unique Order ID (e.g. SB-2026-XXXX) and registered phone number to view live status, measurements, and payment verification.
          </p>
        </div>

        {/* Tracking Input Form */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-6 rounded-2xl border border-[#EADBCE] shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#6E1423] uppercase tracking-wider">
                Order ID (SB-2026-...)
              </label>
              <input
                type="text"
                placeholder="e.g. SB-2026-ABCD"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs font-mono font-bold focus:border-[#6E1423] focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#6E1423] uppercase tracking-wider">
                Registered Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9801234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs focus:border-[#6E1423] focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Order Details & Timeline Display */}
        {order && (
          <div className="bg-[#FDFBF7] rounded-2xl border border-[#EADBCE] shadow-md overflow-hidden animate-fade-in space-y-6">
            {/* Top Order Summary Bar */}
            <div className="bg-[#6E1423] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={order.designImage || '/images/bridal-blouse-red.jpg'}
                  alt={order.designName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                  }}
                  className="w-16 h-20 object-cover rounded-lg border border-white/20 shadow-xs"
                />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C158] font-bold">
                    {order.orderNumber}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FDFBF7]">
                    {order.designName}
                  </h3>
                  <p className="text-xs text-[#F4EDE4] font-light">
                    Category: {order.designCategory} • Client: {order.customerName}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#F4EDE4] block">
                  Current Status
                </span>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#E5C158] text-[#2B2320]">
                  {order.status}
                </span>
                <div className="mt-2 text-xs text-[#F4EDE4]">
                  Total: <strong>Rs. {Number(order.totalAmount).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* PAYMENT VERIFICATION STATUS CARD */}
            <div className="mx-6 p-5 bg-white rounded-xl border border-[#EADBCE] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EADBCE] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FCF8EC] text-[#8C6D1F] flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#6E1423]">
                      Payment Verification & Receipt
                    </h4>
                    <p className="text-[11px] text-[#8A7968]">
                      Method: <strong>{order.paymentMethod || 'NIC ASIA QR Payment'}</strong> • Total: <strong className="text-[#6E1423]">Rs. {Number(order.totalAmount).toLocaleString('en-IN')}</strong>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      order.paymentStatus === 'Payment Verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : order.paymentStatus === 'Payment Rejected'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : order.paymentScreenshotUrl
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.paymentStatus === 'Payment Verified' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Payment Verified by Admin ✓</span>
                      </>
                    ) : order.paymentStatus === 'Payment Rejected' ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Payment Rejected — Please Re-upload</span>
                      </>
                    ) : order.paymentScreenshotUrl ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Screenshot Uploaded — Pending Admin Confirmation</span>
                      </>
                    ) : (
                      <span>Pending Payment / Verification</span>
                    )}
                  </span>
                </div>
              </div>

              {proofSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{proofSuccessMsg}</span>
                </div>
              )}

              {/* Payment Details & Re-upload box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                {order.paymentScreenshotUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-[#FDFBF7] rounded-lg border border-[#EADBCE]">
                    <img
                      src={order.paymentScreenshotUrl}
                      alt="Uploaded Receipt"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/nic_asia_qr.svg';
                      }}
                      className="w-14 h-14 object-cover rounded border border-[#EADBCE]"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#2B2320] block">Attached Receipt</span>
                      {order.paymentTransactionId && (
                        <span className="text-[11px] text-[#8A7968] font-mono block">
                          Ref: {order.paymentTransactionId}
                        </span>
                      )}
                      {order.paymentVerifiedBy && (
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Verified by {order.paymentVerifiedBy}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FDFBF7] rounded-lg border border-dashed border-[#EADBCE] text-center space-y-1">
                    <p className="font-semibold text-gray-700">No screenshot attached yet</p>
                    <p className="text-[11px] text-[#8A7968]">Scan our NIC ASIA MoBank QR code to pay anytime.</p>
                  </div>
                )}

                {/* Upload or Re-upload Button */}
                <div className="flex flex-col justify-center space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProofFileUpload}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="flex-1 py-2 px-3 bg-[#FCF8EC] border border-[#E5C158] hover:bg-[#F4EDE4] text-[#8C6D1F] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>View NIC ASIA QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingProof}
                      className="flex-1 py-2 px-3 bg-[#6E1423] hover:bg-[#530E1A] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingProof ? 'Uploading...' : order.paymentScreenshotUrl ? 'Update Screenshot' : 'Upload Receipt'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <div className="p-6 sm:p-8">
              <h4 className="font-serif text-lg font-bold text-[#6E1423] mb-6 border-b border-[#EADBCE] pb-2">
                Order Progress Milestones
              </h4>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-[#EADBCE] space-y-8 my-4 ml-4">
                {ORDER_STEPS.map((step, idx) => {
                  const isDone = idx <= currentIndex;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div key={step.id} className="relative">
                      {/* Node Bullet */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#6E1423] text-white ring-4 ring-[#FCF8EC]'
                            : 'bg-white border-2 border-[#EADBCE] text-[#8A7968]'
                        } ${isCurrent ? 'animate-pulse' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-[#E5C158]" /> : idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5
                            className={`text-sm font-bold ${
                              isDone ? 'text-[#6E1423]' : 'text-[#8A7968]'
                            }`}
                          >
                            {step.label}
                          </h5>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-[#FCF8EC] text-[#8C6D1F] border border-[#E5C158]">
                              Active Phase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6A5E57]">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status History Audit Log */}
              {order.history && order.history.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#EADBCE]">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#8A7968] mb-3">
                    Master Tailor Updates Log
                  </h5>
                  <div className="space-y-2">
                    {order.history.map((hist) => (
                      <div
                        key={hist.id}
                        className="p-3 bg-[#F9F6F0] rounded-lg border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                      >
                        <div>
                          <strong className="text-[#6E1423]">{hist.status}</strong>
                          {hist.note && <span className="text-[#6A5E57]"> — {hist.note}</span>}
                        </div>
                        <span className="text-[11px] text-[#8A7968]">
                          {new Date(hist.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Info & Tailor Contact Grid */}
              <div className="mt-8 pt-6 border-t border-[#EADBCE] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#F9F6F0] rounded-xl border border-[#EADBCE] space-y-1.5">
                  <span className="font-bold text-[#6E1423] block mb-1">
                    Fitting & Measurements Summary
                  </span>
                  <p><strong>Size Type:</strong> {order.sizeType}</p>
                  {order.standardSize && <p><strong>Standard Size:</strong> {order.standardSize}</p>}
                  {order.expectedCompletionDate && (
                    <p className="flex items-center gap-1 text-[#8C6D1F]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target Delivery: <strong>{order.expectedCompletionDate}</strong></span>
                    </p>
                  )}
                  {order.specialInstructions && (
                    <p className="text-[#6A5E57] italic mt-2">
                      "{order.specialInstructions}"
                    </p>
                  )}
                </div>

                <div className="p-4 bg-[#FCF8EC] rounded-xl border border-[#E5C158] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="font-bold text-[#8C6D1F] block mb-1">
                      Direct Boutique Consultation
                    </span>
                    <p className="text-[#6A5E57] text-[11px]">
                      Need to update measurements, request express completion, or ask styling questions? Chat directly with Sangeeta Kashyap.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/9779801234567?text=${encodeURIComponent(
                      `Namaste Sangeeta Boutique! Inquiring about Order #${order.orderNumber} (${order.designName}, Rs. ${order.totalAmount}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-[#25D366] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 hover:bg-[#20ba59] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Inquiry for this Order</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal in Tracker */}
      {showQrModal && order && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              ✕
            </button>
            <PaymentQRCode amount={order.totalAmount} orderNumber={order.orderNumber} />
          </div>
        </div>
      )}
    </div>
  );
};
