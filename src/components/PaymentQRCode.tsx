import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  Smartphone,
  Building2,
  Sparkles,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

interface PaymentQRCodeProps {
  amount?: number | string;
  orderNumber?: string;
  compact?: boolean;
  className?: string;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  amount,
  orderNumber,
  compact = false,
  className = '',
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Exact account details from user's NIC ASIA MoBank app
  const bankName = 'NIC ASIA Bank Ltd.';
  const accountHolder = 'ANKUSH SINGH KASHYAP';
  const accountType = 'Sarbashrestha Sahaj Bachat Khata';
  const accountNumber = '3535751560397001';
  const branchName = 'Bahadurgunj Branch, Kapilvastu, Nepal';
  const qrImageSrc = 'public/images/WhatsApp Image 2026-09-26 at 22.05.33.jpeg';

  const handleCopy = (text: string, type: 'acc' | 'name') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageSrc;
    link.download = `NIC_ASIA_QR_Ankush_Singh_Kashyap_${orderNumber || 'Payment'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedAmount = amount ? (typeof amount === 'number' ? amount : parseFloat(amount)) : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* MoBank Styled Card */}
      <div className="bg-white rounded-2xl border-2 border-[#D9D1C7] shadow-md overflow-hidden max-w-sm mx-auto text-center relative group">
        {/* Top Header */}
        <div className="bg-[#6E1423] text-[#FDFBF7] py-2 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#E5C158]" />
            <span className="font-bold tracking-wider uppercase text-[10px]">
              NIC ASIA MoBank QR Payment
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="p-1 hover:bg-white/10 rounded text-[#E5C158] cursor-pointer"
            title="Enlarge QR Code"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Account Info Bar */}
        <div className="p-3.5 bg-[#FAF7F2] border-b border-[#EADBCE] text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#2B2320] tracking-wide">
                {accountHolder}
              </h4>
              <span className="px-1.5 py-0.5 bg-[#DA251C] text-white text-[9px] font-bold rounded uppercase tracking-wider">
                PRIMARY
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(accountHolder, 'name')}
              title="Copy Account Holder Name"
              className="p-1 hover:bg-[#EADBCE]/50 rounded text-[#8A7968] cursor-pointer transition-colors"
            >
              {copiedName ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-[#8A7968] mt-0.5 flex items-center gap-1">
            <span>{accountType}</span>
            <span>•</span>
            <span className="font-mono font-bold text-[#2B2320]">{accountNumber}</span>
          </p>
        </div>

        {/* User QR Image Container */}
        <div className="p-4 bg-white flex flex-col items-center justify-center">
          {formattedAmount && (
            <div className="mb-3 px-3 py-1 bg-[#FCF8EC] border border-[#E5C158]/70 rounded-full inline-flex items-center gap-1.5 text-xs text-[#8C6D1F]">
              <Sparkles className="w-3 h-3 text-[#C59B27]" />
              <span>Amount to Pay:</span>
              <strong className="font-serif text-[#6E1423] text-sm">
                Rs. {formattedAmount.toLocaleString('en-IN')}
              </strong>
            </div>
          )}

          {/* Official MoBank QR Card Display */}
          <div
            className="relative p-2 bg-white rounded-2xl border-2 border-gray-100 shadow-sm cursor-pointer hover:border-[#6E1423]/40 transition-all flex flex-col items-center justify-center max-w-[260px] w-full"
            onClick={() => setShowModal(true)}
          >
            <img
              src={qrImageSrc}
              alt="NIC ASIA MoBank QR Code - Ankush Singh Kashyap"
              className="w-full h-auto object-contain rounded-xl transition-transform duration-200 hover:scale-[1.02]"
            />

            <div className="mt-2 text-center">
              <span className="text-[10px] text-[#8A7968] font-medium flex items-center justify-center gap-1">
                <Maximize2 className="w-2.5 h-2.5" /> Tap image to view fullscreen
              </span>
            </div>
          </div>
        </div>

        {/* Accepted Payment Apps Banner */}
        <div className="bg-[#F9F6F0] py-2.5 px-3 border-t border-[#EADBCE] text-[10px] text-[#8A7968] flex items-center justify-center gap-2 flex-wrap">
          <span className="font-semibold text-[#2B2320]">Scan with:</span>
          <span className="px-1.5 py-0.5 bg-white rounded border border-[#EADBCE] font-bold text-[#DA251C]">MoBank</span>
          <span className="px-1.5 py-0.5 bg-white rounded border border-[#EADBCE] font-bold text-[#60BB46]">eSewa</span>
          <span className="px-1.5 py-0.5 bg-white rounded border border-[#EADBCE] font-bold text-[#5D2E8E]">Khalti</span>
          <span className="px-1.5 py-0.5 bg-white rounded border border-[#EADBCE] font-bold text-[#006699]">ConnectIPS</span>
          <span className="px-1.5 py-0.5 bg-white rounded border border-[#EADBCE] font-bold text-[#EE2A24]">Fonepay</span>
        </div>
      </div>

      {/* Account Info Details & Copy Buttons */}
      {!compact && (
        <div className="bg-[#FDFBF7] border border-[#EADBCE] rounded-xl p-4 max-w-sm mx-auto space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2">
            <div className="flex items-center gap-1.5 text-[#6E1423] font-bold">
              <Building2 className="w-4 h-4" />
              <span>Direct Bank Account Details</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadQR}
              className="text-[11px] text-[#6E1423] hover:text-[#530E1A] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR</span>
            </button>
          </div>

          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#8A7968] block">Account Holder:</span>
                <span className="font-semibold text-[#2B2320]">{accountHolder}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(accountHolder, 'name')}
                className="px-2 py-0.5 bg-white border border-[#EADBCE] hover:bg-[#F4EDE4] text-[#2B2320] text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer"
              >
                {copiedName ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedName ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div>
              <span className="text-[10px] text-[#8A7968] block">Bank & Branch:</span>
              <span className="font-medium text-[#2B2320]">{bankName} — {branchName}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#EADBCE]/50">
              <div>
                <span className="text-[10px] text-[#8A7968] block">Account Number:</span>
                <span className="font-mono font-bold text-[#6E1423] text-sm">{accountNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(accountNumber, 'acc')}
                className="px-2.5 py-1 bg-[#6E1423] hover:bg-[#530E1A] text-white text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                {copiedAccount ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAccount ? 'Copied' : 'Copy Number'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen QR Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center relative border-2 border-[#EADBCE] shadow-2xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27] flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5" />
                <span>NIC ASIA MoBank QR Code</span>
              </span>
              <h3 className="font-serif text-xl font-bold text-[#6E1423] mt-1">
                {accountHolder}
              </h3>
              <p className="font-mono text-xs font-semibold text-[#8A7968] mt-0.5">
                A/C: {accountNumber}
              </p>
              {formattedAmount && (
                <div className="mt-2 inline-block px-3 py-1 bg-[#FCF8EC] border border-[#E5C158] rounded-full text-xs font-bold text-[#6E1423]">
                  Amount: Rs. {formattedAmount.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="p-3 bg-white rounded-2xl border border-gray-200 inline-block my-2 shadow-inner max-w-[320px] w-full">
              <img
                src={qrImageSrc}
                alt="NIC ASIA MoBank Full QR Code"
                className="w-full h-auto object-contain mx-auto rounded-xl"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-[#6E1423] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#530E1A]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Image</span>
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
