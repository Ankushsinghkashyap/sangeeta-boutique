import React, { useState, useRef } from 'react';
import { Design, Order } from '../types/index.ts';
import { api } from '../api/client.ts';
import { PaymentQRCode } from './PaymentQRCode.tsx';
import {
  X,
  Scissors,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  User,
  Ruler,
  Sliders,
  FileCheck,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Building2,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';

interface OrderModalProps {
  initialDesign: Design | null;
  designs: Design[];
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onNavigateToTracking: (orderNumber: string, phone: string) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  initialDesign,
  designs,
  onClose,
  onOrderSuccess,
  onNavigateToTracking,
}) => {
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(
    initialDesign || (designs.length > 0 ? designs[0] : null)
  );

  // Multi-step: 1 = Customer Info, 2 = Measurements, 3 = Customization & Reference, 4 = Review & Submit, 5 = Success Confirmation
  const [step, setStep] = useState<number>(1);

  // Step 1: Customer Information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [preferredContact, setPreferredContact] = useState('WhatsApp');

  // Step 2: Measurements
  const [sizeType, setSizeType] = useState<'Standard' | 'Custom'>('Custom');
  const [standardSize, setStandardSize] = useState('M');
  const [measurements, setMeasurements] = useState<Record<string, string>>({
    // Blouse fields
    Bust: '',
    Waist: '',
    Shoulder: '',
    Armhole: '',
    'Sleeve Length': '',
    'Blouse Length': '',
    'Neck Depth Front': '',
    'Neck Depth Back': '',
    // Suit & Lehenga extras
    Hip: '',
    'Kurta Length': '',
    'Pant Length': '',
    'Lehenga Length': '',
  });

  // Step 3: Customization & Reference Upload
  const [customizations, setCustomizations] = useState<Record<string, string>>({
    'Neck Design': '',
    'Sleeve Preference': '',
    'Back Design': '',
    'Fabric / Color Preference': '',
    Padding: 'Standard Cups',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referenceUploading, setReferenceUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Payment State (NIC ASIA QR Code & Receipt Screenshot)
  const [paymentMethod, setPaymentMethod] = useState<'NIC ASIA QR Payment' | 'Cash on In-Store Fitting'>('NIC ASIA QR Payment');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const paymentFileInputRef = useRef<HTMLInputElement>(null);

  // Post-order upload state (for Step 5)
  const [postOrderScreenshot, setPostOrderScreenshot] = useState<string | null>(null);
  const [postOrderTxnId, setPostOrderTxnId] = useState('');
  const [postOrderUploading, setPostOrderUploading] = useState(false);
  const [postOrderSuccess, setPostOrderSuccess] = useState(false);
  const postOrderFileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Pricing calculations
  const designPrice = parseFloat(selectedDesign?.designPrice || '0');
  const sewingPrice = parseFloat(selectedDesign?.sewingPrice || '0');
  const customCharge = referenceImageUrl || specialInstructions.length > 20 ? 300 : 0;
  const estimatedTotal = designPrice + sewingPrice + customCharge;

  // Determine which measurement fields to show based on category
  const categoryName = (selectedDesign?.categoryName || 'Blouse').toLowerCase();
  const isBlouse = categoryName.includes('blouse');
  const isSuit = categoryName.includes('suit');
  const isLehenga = categoryName.includes('lehenga');
  const isKurti = categoryName.includes('kurti');

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Reference image size must be under 8MB');
      return;
    }

    setReferenceUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64, file.name);
        setReferenceImageUrl(uploadRes.url);
      } catch (err: any) {
        alert(err.message || 'Image upload failed');
      } finally {
        setReferenceUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle payment screenshot upload during checkout
  const handlePaymentScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Payment receipt size must be under 8MB');
      return;
    }

    setScreenshotUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64, `payment_${file.name}`);
        setPaymentScreenshotUrl(uploadRes.url);
      } catch (err: any) {
        alert(err.message || 'Payment receipt upload failed');
      } finally {
        setScreenshotUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle post-order payment screenshot upload
  const handlePostOrderScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !submittedOrder) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Payment receipt size must be under 8MB');
      return;
    }

    setPostOrderUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadImage(base64, `payment_${submittedOrder.orderNumber}_${file.name}`);
        setPostOrderScreenshot(uploadRes.url);

        // Submit directly to API
        const updated = await api.submitPaymentProof({
          orderNumber: submittedOrder.orderNumber,
          phone: submittedOrder.customerPhone,
          paymentScreenshotUrl: uploadRes.url,
          paymentTransactionId: postOrderTxnId.trim() || undefined,
        });

        setSubmittedOrder(updated);
        setPostOrderSuccess(true);
      } catch (err: any) {
        alert(err.message || 'Failed to submit payment receipt');
      } finally {
        setPostOrderUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Measurement input helper
  const handleMeasurementChange = (field: string, val: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: val }));
  };

  // Customization input helper
  const handleCustomizationChange = (field: string, val: string) => {
    setCustomizations((prev) => ({ ...prev, [field]: val }));
  };

  // Validation
  const validateStep1 = () => {
    if (!customerName.trim()) {
      setSubmissionError('Please enter your full name');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 8) {
      setSubmissionError('Please enter a valid phone number');
      return false;
    }
    setSubmissionError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setSubmissionError(null);
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setSubmissionError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Submit Order
  const handleSubmitOrder = async () => {
    if (!selectedDesign) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || 'customer@sangeeta.boutique',
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim(),
        preferredContact,
        designId: selectedDesign.id,
        designCode: selectedDesign.designCode,
        designName: selectedDesign.name,
        designCategory: selectedDesign.categoryName,
        designImage: selectedDesign.mainImage,
        designPrice: selectedDesign.designPrice,
        sewingPrice: selectedDesign.sewingPrice,
        customizationPrice: customCharge.toFixed(2),
        totalAmount: estimatedTotal.toFixed(2),
        sizeType,
        standardSize: sizeType === 'Standard' ? standardSize : null,
        specialInstructions,
        referenceImageUrl,
        paymentMethod,
        paymentScreenshotUrl: paymentMethod === 'NIC ASIA QR Payment' ? paymentScreenshotUrl : null,
        paymentTransactionId: paymentMethod === 'NIC ASIA QR Payment' ? paymentTransactionId.trim() : null,
        measurementsData: sizeType === 'Custom' ? measurements : {},
        customizationsData: customizations,
      };

      const res = await api.createOrder(payload);
      setSubmittedOrder(res.order);
      onOrderSuccess(res.order);
      setStep(5); // Success step
    } catch (err: any) {
      console.error('Order submission error:', err);
      setSubmissionError(err.message || 'Failed to submit order. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderId = () => {
    if (submittedOrder) {
      navigator.clipboard.writeText(submittedOrder.orderNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EADBCE] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#6E1423] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E5C158] text-[#6E1423] flex items-center justify-center">
              <Scissors className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#FDFBF7]">
                Custom Sewing & Tailoring Order
              </h2>
              <p className="text-[11px] text-[#F4EDE4] font-light">
                {step < 5 ? `Step ${step} of 4 — ` : 'Order Confirmed — '}
                {step === 1 && 'Customer Information'}
                {step === 2 && 'Size & Precision Measurements'}
                {step === 3 && 'Customization & Reference Image'}
                {step === 4 && 'Review & Submit Sewing Order'}
                {step === 5 && 'Order Successfully Placed!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar (steps 1 to 4) */}
        {step < 5 && (
          <div className="bg-[#F4EDE4] px-6 py-2.5 border-b border-[#EADBCE] flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'font-bold text-[#6E1423]' : 'text-[#8A7968]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#6E1423] text-white' : 'bg-[#EADBCE]'}`}>1</span>
              <span className="hidden sm:inline">Details</span>
            </div>
            <div className="h-0.5 w-8 bg-[#EADBCE]"></div>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'font-bold text-[#6E1423]' : 'text-[#8A7968]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#6E1423] text-white' : 'bg-[#EADBCE]'}`}>2</span>
              <span className="hidden sm:inline">Measurements</span>
            </div>
            <div className="h-0.5 w-8 bg-[#EADBCE]"></div>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'font-bold text-[#6E1423]' : 'text-[#8A7968]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#6E1423] text-white' : 'bg-[#EADBCE]'}`}>3</span>
              <span className="hidden sm:inline">Customization</span>
            </div>
            <div className="h-0.5 w-8 bg-[#EADBCE]"></div>
            <div className={`flex items-center gap-1.5 ${step >= 4 ? 'font-bold text-[#6E1423]' : 'text-[#8A7968]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-[#6E1423] text-white' : 'bg-[#EADBCE]'}`}>4</span>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>
        )}

        {/* Selected Design Banner (Steps 1-4) */}
        {selectedDesign && step < 5 && (
          <div className="bg-[#F9F6F0] px-6 py-3 border-b border-[#EADBCE] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedDesign.mainImage}
                alt={selectedDesign.name}
                className="w-12 h-14 object-cover rounded-md border border-[#EADBCE]"
              />
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C59B27] uppercase">
                  {selectedDesign.designCode} • {selectedDesign.categoryName}
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2B2320] line-clamp-1">
                  {selectedDesign.name}
                </h4>
                <p className="text-xs text-[#6E1423] font-semibold">
                  Starting Price: ₹{Number(selectedDesign.totalPrice).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {designs.length > 1 && (
              <select
                value={selectedDesign.id}
                onChange={(e) => {
                  const found = designs.find((d) => d.id === parseInt(e.target.value));
                  if (found) setSelectedDesign(found);
                }}
                className="text-xs py-1.5 px-2 bg-white border border-[#EADBCE] rounded text-[#2B2320] focus:outline-none"
              >
                {designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.designCode} - {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto">
          {submissionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <span className="font-bold">Error:</span> {submissionError}
            </div>
          )}

          {/* STEP 1: Customer Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#6E1423] border-b border-[#EADBCE] pb-2">
                1. Customer & Delivery Contact Information
              </h3>
              <p className="text-xs text-[#8A7968]">
                We will use this to confirm your fitting schedule and send tailoring updates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ankita Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +9779702742100"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. ankita@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="e.g. Kapilvastu / Kathmandu"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                    Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Green Valley Apartments, MG Road"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2B2320] mb-1">
                    Preferred Contact Method
                  </label>
                  <div className="flex gap-4">
                    {['WhatsApp', 'Phone Call', 'Email'].map((method) => (
                      <label key={method} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="preferredContact"
                          value={method}
                          checked={preferredContact === method}
                          onChange={(e) => setPreferredContact(e.target.value)}
                          className="accent-[#6E1423]"
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Measurements */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#6E1423]">
                    2. Size & Fitting Specifications
                  </h3>
                  <p className="text-xs text-[#8A7968]">
                    Selected Category: <strong className="text-[#6E1423] capitalize">{selectedDesign?.categoryName}</strong>
                  </p>
                </div>

                {/* Sizing Switcher */}
                <div className="inline-flex p-1 bg-[#F4EDE4] rounded-lg border border-[#EADBCE]">
                  <button
                    type="button"
                    onClick={() => setSizeType('Custom')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      sizeType === 'Custom'
                        ? 'bg-[#6E1423] text-white shadow-xs'
                        : 'text-[#6A5E57] hover:text-[#2B2320]'
                    }`}
                  >
                    Custom Measurements (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeType('Standard')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      sizeType === 'Standard'
                        ? 'bg-[#6E1423] text-white shadow-xs'
                        : 'text-[#6A5E57] hover:text-[#2B2320]'
                    }`}
                  >
                    Standard Size
                  </button>
                </div>
              </div>

              {sizeType === 'Standard' ? (
                <div className="space-y-4 bg-[#F9F6F0] p-4 rounded-xl border border-[#EADBCE]">
                  <label className="block text-xs font-semibold text-[#2B2320]">
                    Select Standard Body Size:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setStandardSize(sz)}
                        className={`py-3 text-center rounded-lg border font-semibold text-xs cursor-pointer transition-all ${
                          standardSize === sz
                            ? 'bg-[#6E1423] text-white border-[#6E1423] shadow-xs'
                            : 'bg-white text-[#2B2320] border-[#EADBCE] hover:border-[#6E1423]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#8A7968] italic">
                    Note: Our master tailor will call you to verify your height and key measurements even when choosing standard size.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-[#FCF8EC] border border-[#E5C158] rounded-lg text-xs text-[#8C6D1F]">
                    Enter your measurements in <strong>inches</strong>. If unsure, you can leave fields blank; our master tailor will guide you during your consultation.
                  </div>

                  {/* Category-adaptive Measurement Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {/* Blouse Measurements */}
                    {(isBlouse || isLehenga) && (
                      <>
                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Bust (inches)</label>
                          <input
                            type="text"
                            placeholder="e.g. 36"
                            value={measurements['Bust'] || ''}
                            onChange={(e) => handleMeasurementChange('Bust', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Underbust / Waist</label>
                          <input
                            type="text"
                            placeholder="e.g. 30"
                            value={measurements['Waist'] || ''}
                            onChange={(e) => handleMeasurementChange('Waist', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Shoulder Width</label>
                          <input
                            type="text"
                            placeholder="e.g. 14"
                            value={measurements['Shoulder'] || ''}
                            onChange={(e) => handleMeasurementChange('Shoulder', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Armhole Round</label>
                          <input
                            type="text"
                            placeholder="e.g. 16"
                            value={measurements['Armhole'] || ''}
                            onChange={(e) => handleMeasurementChange('Armhole', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Sleeve Length</label>
                          <input
                            type="text"
                            placeholder="e.g. 11 (elbow)"
                            value={measurements['Sleeve Length'] || ''}
                            onChange={(e) => handleMeasurementChange('Sleeve Length', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Blouse Length</label>
                          <input
                            type="text"
                            placeholder="e.g. 14.5"
                            value={measurements['Blouse Length'] || ''}
                            onChange={(e) => handleMeasurementChange('Blouse Length', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Neck Depth (Front)</label>
                          <input
                            type="text"
                            placeholder="e.g. 7"
                            value={measurements['Neck Depth Front'] || ''}
                            onChange={(e) => handleMeasurementChange('Neck Depth Front', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Neck Depth (Back)</label>
                          <input
                            type="text"
                            placeholder="e.g. 10.5 (deep)"
                            value={measurements['Neck Depth Back'] || ''}
                            onChange={(e) => handleMeasurementChange('Neck Depth Back', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>
                      </>
                    )}

                    {/* Suit Specific */}
                    {(isSuit || isKurti) && (
                      <>
                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Bust (inches)</label>
                          <input
                            type="text"
                            placeholder="e.g. 38"
                            value={measurements['Bust'] || ''}
                            onChange={(e) => handleMeasurementChange('Bust', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Waist (inches)</label>
                          <input
                            type="text"
                            placeholder="e.g. 32"
                            value={measurements['Waist'] || ''}
                            onChange={(e) => handleMeasurementChange('Waist', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Hip Round</label>
                          <input
                            type="text"
                            placeholder="e.g. 40"
                            value={measurements['Hip'] || ''}
                            onChange={(e) => handleMeasurementChange('Hip', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Kurta / Top Length</label>
                          <input
                            type="text"
                            placeholder="e.g. 44"
                            value={measurements['Kurta Length'] || ''}
                            onChange={(e) => handleMeasurementChange('Kurta Length', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Salwar / Pant Length</label>
                          <input
                            type="text"
                            placeholder="e.g. 38"
                            value={measurements['Pant Length'] || ''}
                            onChange={(e) => handleMeasurementChange('Pant Length', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Sleeve Length</label>
                          <input
                            type="text"
                            placeholder="e.g. 18 (3/4th)"
                            value={measurements['Sleeve Length'] || ''}
                            onChange={(e) => handleMeasurementChange('Sleeve Length', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>
                      </>
                    )}

                    {/* Lehenga Specific */}
                    {isLehenga && (
                      <>
                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Lehenga Waist</label>
                          <input
                            type="text"
                            placeholder="e.g. 32"
                            value={measurements['Waist'] || ''}
                            onChange={(e) => handleMeasurementChange('Waist', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Lehenga Length</label>
                          <input
                            type="text"
                            placeholder="e.g. 42 (with heels)"
                            value={measurements['Lehenga Length'] || ''}
                            onChange={(e) => handleMeasurementChange('Lehenga Length', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#2B2320] mb-1">Hip Round</label>
                          <input
                            type="text"
                            placeholder="e.g. 38"
                            value={measurements['Hip'] || ''}
                            onChange={(e) => handleMeasurementChange('Hip', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Customization & Reference Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#6E1423] border-b border-[#EADBCE] pb-2">
                3. Custom Design Preferences & Reference Upload
              </h3>
              <p className="text-xs text-[#8A7968]">
                Personalize details like neck cuts, sleeves, back drop, and fabric choice.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Neck Design Cut</label>
                  <input
                    type="text"
                    placeholder="e.g. Sweetheart / Boat Neck / V-Cut"
                    value={customizations['Neck Design'] || ''}
                    onChange={(e) => handleCustomizationChange('Neck Design', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Sleeve Preference</label>
                  <input
                    type="text"
                    placeholder="e.g. Elbow length with lace / Sleeveless"
                    value={customizations['Sleeve Preference'] || ''}
                    onChange={(e) => handleCustomizationChange('Sleeve Preference', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Back Design Cut</label>
                  <input
                    type="text"
                    placeholder="e.g. Deep U cutout with latkan dori"
                    value={customizations['Back Design'] || ''}
                    onChange={(e) => handleCustomizationChange('Back Design', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">Padding & Lining</label>
                  <select
                    value={customizations['Padding'] || 'Standard Cups'}
                    onChange={(e) => handleCustomizationChange('Padding', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded text-xs"
                  >
                    <option value="Standard Cups">Built-in Bra Cups (Padded)</option>
                    <option value="Non-Padded">Non-Padded (Double Cotton Lining)</option>
                    <option value="Removable Cups">Removable Cups</option>
                  </select>
                </div>
              </div>

              {/* Reference Image Upload */}
              <div className="pt-2">
                <label className="block font-semibold text-xs text-[#2B2320] mb-1">
                  Upload Reference Image or Screenshot (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-[#EADBCE] rounded-xl bg-[#F9F6F0]">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {referenceImageUrl ? (
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#EADBCE] shadow-xs">
                      <img src={referenceImageUrl} alt="Customer Reference" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReferenceImageUrl(null)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-[#ECE4D8] flex items-center justify-center text-[#8A7968]">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}

                  <div className="text-center sm:text-left space-y-1">
                    <button
                      type="button"
                      disabled={referenceUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white border border-[#EADBCE] hover:border-[#6E1423] text-[#2B2320] text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      {referenceUploading ? 'Uploading Image...' : referenceImageUrl ? 'Change Reference Photo' : 'Select Photo / Screenshot'}
                    </button>
                    <p className="text-[11px] text-[#8A7968]">
                      Upload Pinterest or Instagram screenshots showing the back design or neck pattern you want.
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block font-semibold text-xs text-[#2B2320] mb-1">
                  Special Tailoring Instructions & Fabric Notes
                </label>
                <textarea
                  rows={3}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. I will courier my own silk fabric. Please ensure piping is antique gold. Wedding date is October 24th."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && selectedDesign && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#6E1423] border-b border-[#EADBCE] pb-2">
                4. Review Your Sewing Order Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details Box */}
                <div className="p-4 bg-[#F9F6F0] rounded-xl border border-[#EADBCE] space-y-2 text-xs">
                  <span className="font-bold text-[#6E1423] uppercase tracking-wider block border-b border-[#EADBCE] pb-1">
                    Customer Information
                  </span>
                  <p><strong>Name:</strong> {customerName}</p>
                  <p><strong>Phone:</strong> {customerPhone}</p>
                  {customerEmail && <p><strong>Email:</strong> {customerEmail}</p>}
                  {customerCity && <p><strong>City:</strong> {customerCity}</p>}
                  <p><strong>Preferred Contact:</strong> {preferredContact}</p>
                  <p><strong>Sizing Choice:</strong> {sizeType === 'Standard' ? `Standard (${standardSize})` : 'Custom Tailoring'}</p>
                </div>

                {/* Price Breakdown Box */}
                <div className="p-4 bg-[#FCF8EC] rounded-xl border border-[#E5C158] space-y-2 text-xs">
                  <span className="font-bold text-[#8C6D1F] uppercase tracking-wider block border-b border-[#E5C158] pb-1">
                    Price Breakdown
                  </span>
                  <div className="flex justify-between">
                    <span>Design & Fabric:</span>
                    <span>₹{Number(selectedDesign.designPrice).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Master Sewing & Stitching:</span>
                    <span>₹{Number(selectedDesign.sewingPrice).toLocaleString('en-IN')}</span>
                  </div>
                  {customCharge > 0 && (
                    <div className="flex justify-between text-[#8C6D1F]">
                      <span>Custom Pattern Add-on:</span>
                      <span>₹{customCharge}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#E5C158] flex justify-between font-bold text-sm text-[#6E1423]">
                    <span>Estimated Total:</span>
                    <span className="font-serif text-lg">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Measurements Snapshot */}
              {sizeType === 'Custom' && (
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] text-xs">
                  <span className="font-semibold text-[#6E1423] block mb-2">Recorded Measurements (Inches):</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(measurements)
                      .filter(([_, val]) => val && val.trim() !== '')
                      .map(([key, val]) => (
                        <span key={key} className="px-2 py-1 bg-[#F9F6F0] rounded border border-[#EADBCE] text-[11px]">
                          <strong>{key}:</strong> {val}"
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Special Instructions Preview */}
              {specialInstructions && (
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] text-xs">
                  <span className="font-semibold text-[#2B2320] block mb-1">Special Instructions:</span>
                  <p className="text-[#6A5E57] italic">{specialInstructions}</p>
                </div>
              )}

              {referenceImageUrl && (
                <div className="p-3 bg-white rounded-xl border border-[#EADBCE] text-xs flex items-center gap-3">
                  <img src={referenceImageUrl} alt="Reference" className="w-14 h-14 object-cover rounded border" />
                  <div>
                    <span className="font-semibold text-[#2B2320] block">Attached Reference Photo</span>
                    <span className="text-[11px] text-emerald-700">Uploaded and attached to order</span>
                  </div>
                </div>
              )}

              {/* PAYMENT SECTION WITH NIC ASIA QR CODE */}
              <div className="pt-2 border-t border-[#EADBCE] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-bold text-[#6E1423] flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#C59B27]" />
                    <span>Payment & Confirmation</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    Admin Verified
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NIC ASIA QR Payment')}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      paymentMethod === 'NIC ASIA QR Payment'
                        ? 'border-[#6E1423] bg-[#FCF8EC] ring-1 ring-[#6E1423]'
                        : 'border-[#EADBCE] bg-white hover:bg-[#F9F6F0]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#DA251C] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                      QR
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#2B2320] flex items-center gap-1.5">
                        <span>NIC ASIA MoBank QR</span>
                        <span className="text-[9px] bg-[#6E1423] text-white px-1.5 py-0.5 rounded font-semibold">Recommended</span>
                      </p>
                      <p className="text-[11px] text-[#8A7968] mt-0.5 leading-snug">
                        Instant mobile scan (MoBank, eSewa, Khalti, Fonepay). Fast admin verification.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on In-Store Fitting')}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      paymentMethod === 'Cash on In-Store Fitting'
                        ? 'border-[#6E1423] bg-[#FCF8EC] ring-1 ring-[#6E1423]'
                        : 'border-[#EADBCE] bg-white hover:bg-[#F9F6F0]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#6E1423] text-white flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#2B2320]">Cash on Fitting / Delivery</p>
                      <p className="text-[11px] text-[#8A7968] mt-0.5 leading-snug">
                        Pay cash when you visit our Dumara boutique for measurements or upon delivery.
                      </p>
                    </div>
                  </button>
                </div>

                {/* When QR Payment Selected */}
                {paymentMethod === 'NIC ASIA QR Payment' && (
                  <div className="space-y-4 bg-[#FDFBF7] p-4 rounded-xl border border-[#EADBCE] animate-fade-in">
                    {/* Standee QR Card */}
                    <PaymentQRCode amount={estimatedTotal} />

                    {/* Screenshot Upload Box */}
                    <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[#C59B27]/60 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <label className="block text-xs font-bold text-[#6E1423] flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-[#C59B27]" />
                            <span>Attach Payment Screenshot / Receipt</span>
                          </label>
                          <p className="text-[11px] text-[#8A7968] mt-0.5">
                            After transferring via NIC ASIA MoBank, eSewa, or Khalti, attach your transaction screenshot below for instant verification.
                          </p>
                        </div>
                        {paymentScreenshotUrl && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 shrink-0">
                            Screenshot Attached ✓
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={paymentFileInputRef}
                        onChange={handlePaymentScreenshotUpload}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                      />

                      {paymentScreenshotUrl ? (
                        <div className="flex items-center gap-3 p-2 bg-[#F9F6F0] rounded-lg border border-[#EADBCE]">
                          <img
                            src={paymentScreenshotUrl}
                            alt="Payment Receipt Preview"
                            className="w-16 h-16 object-cover rounded-md border border-[#EADBCE]"
                          />
                          <div className="flex-1 text-left">
                            <p className="text-xs font-semibold text-[#2B2320]">Payment Screenshot Attached</p>
                            <p className="text-[11px] text-emerald-700 font-medium">Ready for Admin Confirmation</p>
                            <button
                              type="button"
                              onClick={() => paymentFileInputRef.current?.click()}
                              className="text-[11px] text-[#6E1423] hover:underline font-semibold cursor-pointer mt-1"
                            >
                              Change Screenshot
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => paymentFileInputRef.current?.click()}
                          disabled={screenshotUploading}
                          className="w-full py-3 bg-white border border-[#EADBCE] hover:border-[#6E1423] hover:bg-[#FCF8EC] text-[#6E1423] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 text-[#C59B27]" />
                          <span>{screenshotUploading ? 'Uploading Screenshot...' : 'Select Payment Screenshot / MoBank Slip'}</span>
                        </button>
                      )}

                      {/* Optional Transaction Reference Input */}
                      <div className="pt-2 border-t border-gray-100">
                        <label className="block text-[11px] font-semibold text-[#8A7968] mb-1">
                          Transaction ID / Reference Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={paymentTransactionId}
                          onChange={(e) => setPaymentTransactionId(e.target.value)}
                          placeholder="e.g. 12-digit UTR, MoBank Txn ID, or Fonepay Ref"
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs text-[#2B2320] focus:border-[#6E1423] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>Safe & Verified:</strong> Sangeeta Boutique Admin verifies your payment screenshot within minutes and updates your tailoring workflow to <strong>Confirmed</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 5 && submittedOrder && (
            <div className="py-6 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">
                  Order Placed Successfully
                </span>
                <h3 className="font-serif text-3xl font-bold text-[#6E1423] mt-1">
                  Thank You, {submittedOrder.customerName}!
                </h3>
                <p className="text-xs sm:text-sm text-[#6A5E57] mt-2 max-w-md mx-auto">
                  Your custom sewing request has been dispatched to our boutique CMS. Our master tailor will review your measurements and reach out shortly.
                </p>
              </div>

              {/* Highlighted Order ID Card */}
              <div className="bg-[#FCF8EC] border-2 border-[#E5C158] rounded-xl p-5 max-w-md mx-auto shadow-sm">
                <span className="text-xs text-[#8C6D1F] uppercase tracking-wider block font-semibold">
                  Your Unique Order ID
                </span>
                <div className="flex items-center justify-center gap-3 my-2">
                  <span className="font-mono text-2xl font-bold text-[#6E1423]">
                    {submittedOrder.orderNumber}
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className="p-1.5 rounded-md bg-white border border-[#EADBCE] text-[#6E1423] hover:bg-[#FDFBF7]"
                    title="Copy Order ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#8A7968]">
                  Keep this Order ID safe. You can track your sewing progress anytime online.
                </p>
              </div>

              {/* Payment Verification Status Card */}
              <div className="max-w-md mx-auto bg-white border border-[#EADBCE] rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6E1423] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#C59B27]" />
                    <span>Payment Status</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      submittedOrder.paymentStatus === 'Payment Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : submittedOrder.paymentScreenshotUrl || postOrderScreenshot
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {submittedOrder.paymentStatus === 'Payment Verified'
                      ? 'Payment Verified ✓'
                      : submittedOrder.paymentScreenshotUrl || postOrderScreenshot
                      ? 'Pending Admin Verification'
                      : 'Pending Payment'}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-[#4A3E39]">
                  <p><strong>Payment Method:</strong> {submittedOrder.paymentMethod || 'NIC ASIA QR Payment'}</p>
                  <p><strong>Total Amount:</strong> Rs. {Number(submittedOrder.totalAmount).toLocaleString('en-IN')}</p>
                  {(submittedOrder.paymentTransactionId || postOrderTxnId) && (
                    <p><strong>Transaction Ref:</strong> {submittedOrder.paymentTransactionId || postOrderTxnId}</p>
                  )}
                </div>

                {/* If no screenshot was uploaded in Step 4, offer instant upload right now */}
                {!submittedOrder.paymentScreenshotUrl && !postOrderSuccess && submittedOrder.paymentMethod === 'NIC ASIA QR Payment' && (
                  <div className="pt-2 border-t border-dashed border-[#EADBCE] space-y-2">
                    <p className="text-[11px] text-[#8C6D1F] font-semibold">
                      Did you scan and pay just now? Upload your screenshot here:
                    </p>
                    <input
                      type="file"
                      ref={postOrderFileInputRef}
                      onChange={handlePostOrderScreenshotUpload}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Txn Ref (optional)"
                        value={postOrderTxnId}
                        onChange={(e) => setPostOrderTxnId(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-[#FDFBF7] border border-[#EADBCE] rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => postOrderFileInputRef.current?.click()}
                        disabled={postOrderUploading}
                        className="px-3 py-1.5 bg-[#6E1423] text-white rounded text-xs font-semibold cursor-pointer hover:bg-[#530E1A] disabled:opacity-50 flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{postOrderUploading ? 'Uploading...' : 'Upload Receipt'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {postOrderSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment screenshot uploaded! Admin Sangeeta will verify it shortly.</span>
                  </div>
                )}

                {/* WhatsApp Quick Link */}
                <a
                  href={`https://wa.me/9779702742100?text=${encodeURIComponent(
                    `Namaste Sangeeta Boutique! I have placed Order #${submittedOrder.orderNumber} for ${submittedOrder.designName} (Rs. ${submittedOrder.totalAmount}). Please verify my payment.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs block text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Payment Screenshot via WhatsApp</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left text-xs bg-[#F9F6F0] p-4 rounded-xl border border-[#EADBCE]">
                <div>
                  <span className="text-[#8A7968] block">Design Code:</span>
                  <span className="font-semibold text-[#2B2320]">{submittedOrder.designCode}</span>
                </div>
                <div>
                  <span className="text-[#8A7968] block">Estimated Total:</span>
                  <span className="font-semibold text-[#6E1423]">Rs. {Number(submittedOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[#8A7968] block">Estimated Ready By:</span>
                  <span className="font-semibold text-[#2B2320]">{submittedOrder.expectedCompletionDate || '7-10 Days'}</span>
                </div>
                <div>
                  <span className="text-[#8A7968] block">Contact Method:</span>
                  <span className="font-semibold text-[#2B2320]">{submittedOrder.preferredContact}</span>
                </div>
              </div>

              {/* Post-Order Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTracking(submittedOrder.orderNumber, submittedOrder.customerPhone);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#6E1423] hover:bg-[#530E1A] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Track This Order Now
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-[#EADBCE] hover:bg-[#F4EDE4] text-[#2B2320] text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bg-[#F9F6F0] px-6 py-4 border-t border-[#EADBCE] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 bg-white border border-[#EADBCE] hover:bg-[#F4EDE4] text-[#2B2320] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E5C158]" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitOrder}
                className="px-8 py-3 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-bold uppercase tracking-widest rounded-md flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Scissors className="w-4 h-4 text-[#E5C158] -rotate-45" />
                <span>{isSubmitting ? 'Submitting Order...' : 'Submit Sewing Order'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
