import React, { useState } from 'react';
import { Design } from '../types/index.ts';
import {
  X,
  Scissors,
  CheckCircle2,
  Clock,
  Shirt,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Share2,
  Check,
} from 'lucide-react';

interface DesignModalProps {
  design: Design | null;
  onClose: () => void;
  onOrderThisDesign: (design: Design) => void;
}

export const DesignModal: React.FC<DesignModalProps> = ({
  design,
  onClose,
  onOrderThisDesign,
}) => {
  if (!design) return null;

  const [activeImage, setActiveImage] = useState<string>(design.mainImage);
  const [copiedLink, setCopiedLink] = useState(false);

  const imagesList = design.images && design.images.length > 0
    ? design.images.map(img => img.imageUrl)
    : [design.mainImage];

  const isUnavailable = design.status === 'unavailable';

  const handleShare = async () => {
    const canonicalUrl = `${window.location.origin}/?design=${encodeURIComponent(design.designCode)}`;
    const shareData = {
      title: `${design.name} — Sangeeta Boutique (Sangita Boutique)`,
      text: `Check out ${design.name} (${design.designCode}) at Sangeeta Boutique (Sangita Boutique)!`,
      url: canonicalUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EADBCE] overflow-hidden my-6">
        {/* Action Controls: Share & Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="h-9 px-3 rounded-full bg-white/90 hover:bg-white text-[#2B2320] flex items-center gap-1.5 shadow-md transition-colors cursor-pointer text-xs font-semibold"
            aria-label="Share this design"
            title="Share or copy link to this design"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#6E1423]" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2B2320] flex items-center justify-center shadow-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Gallery & Image Previews */}
          <div className="p-6 bg-[#F9F6F0] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EADBCE]">
            <div className="space-y-4">
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden border border-[#EADBCE] bg-white shadow-inner">
                <img
                  src={activeImage || design.mainImage}
                  alt={design.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                  }}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#6E1423] text-white rounded-md shadow-xs">
                    {design.designCode}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative w-16 h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === imgUrl ? 'border-[#6E1423] scale-105' : 'border-[#EADBCE] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality assurance guarantee */}
            <div className="mt-4 pt-4 border-t border-[#EADBCE] flex items-center gap-3 text-xs text-[#8A7968]">
              <ShieldCheck className="w-4 h-4 text-[#C59B27] shrink-0" />
              <span>Master tailor verified. Includes complimentary trial fitting adjustment.</span>
            </div>
          </div>

          {/* Right: Design Details & Ordering */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-bold text-[#C59B27]">
                  {design.categoryName}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FCF8EC] border border-[#E5C158] text-[#8C6D1F]">
                  Handmade to Measure
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#6E1423]">
                {design.name}
              </h2>

              {/* Price Breakdown Card */}
              <div className="bg-[#F9F6F0] rounded-xl p-4 border border-[#EADBCE] space-y-2">
                <div className="flex justify-between text-xs text-[#6A5E57]">
                  <span>Design & Fabric Pattern Price</span>
                  <span className="font-medium text-[#2B2320]">₹{Number(design.designPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-[#6A5E57]">
                  <span>Handcrafted Sewing & Stitching Charge</span>
                  <span className="font-medium text-[#2B2320]">₹{Number(design.sewingPrice).toLocaleString('en-IN')}</span>
                </div>
                {parseFloat(design.customizationPrice) > 0 && (
                  <div className="flex justify-between text-xs text-[#6A5E57]">
                    <span>Customization Base Cost</span>
                    <span className="font-medium text-[#2B2320]">₹{Number(design.customizationPrice).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#EADBCE] flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6E1423]">
                    Total Starting Price
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#6E1423]">
                    ₹{Number(design.totalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Fabric & Timeline */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-[#EADBCE]">
                  <span className="text-[#8A7968] block mb-1 flex items-center gap-1 font-medium">
                    <Shirt className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>Fabric Details</span>
                  </span>
                  <p className="font-semibold text-[#2B2320]">
                    {design.fabricInfo || 'Pure Silk / Cotton Lining'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#EADBCE]">
                  <span className="text-[#8A7968] block mb-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>Estimated Tailoring</span>
                  </span>
                  <p className="font-semibold text-[#2B2320]">
                    {design.estimatedTime || '3-5 business days'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7968] mb-1.5">
                  About This Silhouette
                </h4>
                <p className="text-xs sm:text-sm text-[#4A3E39] leading-relaxed">
                  {design.description}
                </p>
              </div>

              {/* Customization Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7968] mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>Available Customizations</span>
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-[#4A3E39]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sleeve length & style</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Neckline depth & cut</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Back cutout & latkans</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Custom measurements</span>
                  </span>
                </div>
              </div>

              {/* Available Sizes */}
              <div className="text-xs text-[#8A7968]">
                <span>Standard Sizes: </span>
                <strong className="text-[#2B2320]">
                  {design.availableSizes || 'XS, S, M, L, XL, XXL, Custom'}
                </strong>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#EADBCE]">
              {isUnavailable ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center text-xs font-semibold text-red-700">
                  This design is currently unavailable for new sewing orders.
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOrderThisDesign(design);
                  }}
                  className="w-full py-4 bg-[#6E1423] hover:bg-[#530E1A] text-[#FDFBF7] font-semibold text-sm uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Scissors className="w-4 h-4 text-[#E5C158] -rotate-45" />
                  <span>Order This Design</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
