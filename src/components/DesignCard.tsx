import React from 'react';
import { Design } from '../types/index.ts';
import { Scissors, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface DesignCardProps {
  design: Design;
  onViewDetails: (design: Design) => void;
  onOrderSewing: (design: Design) => void;
}

export const DesignCard: React.FC<DesignCardProps> = ({
  design,
  onViewDetails,
  onOrderSewing,
}) => {
  const isUnavailable = design.status === 'unavailable';

  return (
    <div className="group bg-[#FDFBF7] rounded-xl overflow-hidden border border-[#EADBCE] hover:border-[#C59B27]/80 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image container */}
      <div
        onClick={() => onViewDetails(design)}
        className="relative w-full h-72 sm:h-80 overflow-hidden bg-[#F4EDE4] cursor-pointer"
      >
        <img
          src={design.mainImage || '/images/bridal-blouse-red.jpg'}
          alt={design.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {design.featured && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#6E1423] text-[#FDFBF7] rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#E5C158]" />
              <span>Featured</span>
            </span>
          )}
          {design.popular && !design.featured && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#C59B27] text-[#2B2320] rounded-full shadow-xs">
              Trending
            </span>
          )}
        </div>

        {/* Design Code Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-white/90 backdrop-blur-xs text-[#2B2320] rounded-sm border border-[#EADBCE]">
            {design.designCode}
          </span>
        </div>

        {/* Unavailable overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-20">
            <div className="bg-white/95 px-4 py-2 rounded-md text-center shadow-lg border border-red-200">
              <span className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" />
                <span>Currently Unavailable</span>
              </span>
            </div>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(design);
            }}
            className="px-3.5 py-2 bg-white text-[#2B2320] text-xs font-semibold rounded-sm shadow-md hover:bg-[#FDFBF7] flex items-center gap-1.5 transition-transform transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5 text-[#6E1423]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#8A7968] mb-1">
            <span className="uppercase tracking-wider font-semibold text-[#8C6D1F]">
              {design.categoryName}
            </span>
            {design.estimatedTime && (
              <span className="text-[11px] text-[#A69788]">
                ⏱ {design.estimatedTime}
              </span>
            )}
          </div>

          <h3
            onClick={() => onViewDetails(design)}
            className="font-serif text-lg sm:text-xl font-bold text-[#2B2320] group-hover:text-[#6E1423] transition-colors cursor-pointer line-clamp-1"
          >
            {design.name}
          </h3>

          <p className="text-xs text-[#6A5E57] line-clamp-2 mt-1.5 font-normal leading-relaxed">
            {design.description}
          </p>
        </div>

        {/* Pricing & Buttons */}
        <div className="mt-4 pt-3 border-t border-[#EADBCE]/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8A7968] block">
                Total Starting Price
              </span>
              <span className="text-lg font-bold text-[#6E1423] font-serif">
                ₹{Number(design.totalPrice).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right text-[11px] text-[#8A7968]">
              <span>Sewing: ₹{Number(design.sewingPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(design)}
              className="px-3 py-2 text-xs font-semibold text-[#2B2320] bg-[#F9F6F0] hover:bg-[#ECE4D8] border border-[#EADBCE] rounded-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-[#8A7968]" />
              <span>Details</span>
            </button>

            {isUnavailable ? (
              <button
                disabled
                className="px-3 py-2 text-xs font-semibold text-[#8A7968] bg-[#ECE4D8] rounded-sm cursor-not-allowed text-center"
              >
                Unavailable
              </button>
            ) : (
              <button
                onClick={() => onOrderSewing(design)}
                className="px-3 py-2 text-xs font-semibold text-[#FDFBF7] bg-[#6E1423] hover:bg-[#530E1A] rounded-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <Scissors className="w-3.5 h-3.5 text-[#E5C158] -rotate-45" />
                <span>Order Sewing</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
