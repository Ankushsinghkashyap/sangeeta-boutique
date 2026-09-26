import React, { useState } from 'react';
import { Design } from '../types/index.ts';
import { DesignCard } from './DesignCard.tsx';
import { Sparkles, ArrowRight } from 'lucide-react';

interface FeaturedDesignsProps {
  designs: Design[];
  onViewDetails: (design: Design) => void;
  onOrderSewing: (design: Design) => void;
  onViewAll: () => void;
}

export const FeaturedDesigns: React.FC<FeaturedDesignsProps> = ({
  designs,
  onViewDetails,
  onOrderSewing,
  onViewAll,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'blouse' | 'suits' | 'lehenga'>('all');

  const filtered = designs.filter((d) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'blouse') return d.categoryName.toLowerCase().includes('blouse');
    if (activeTab === 'suits') return d.categoryName.toLowerCase().includes('suit');
    if (activeTab === 'lehenga') return d.categoryName.toLowerCase().includes('lehenga');
    return true;
  });

  return (
    <section className="py-16 sm:py-24 bg-[#F9F6F0] border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C59B27] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Haute Couture Highlights</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#6E1423]">
              Featured & Trending Creations
            </h2>
            <p className="text-sm sm:text-base text-[#6A5E57] mt-2 max-w-xl">
              Handpicked bridal, festive, and ceremonial garments tailored exclusively for our clientele.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#6E1423] text-[#FDFBF7] shadow-xs'
                  : 'bg-white text-[#2B2320] border border-[#EADBCE] hover:bg-[#F4EDE4]'
              }`}
            >
              All Highlights
            </button>
            <button
              onClick={() => setActiveTab('blouse')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'blouse'
                  ? 'bg-[#6E1423] text-[#FDFBF7] shadow-xs'
                  : 'bg-white text-[#2B2320] border border-[#EADBCE] hover:bg-[#F4EDE4]'
              }`}
            >
              Bridal Blouses
            </button>
            <button
              onClick={() => setActiveTab('suits')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'suits'
                  ? 'bg-[#6E1423] text-[#FDFBF7] shadow-xs'
                  : 'bg-white text-[#2B2320] border border-[#EADBCE] hover:bg-[#F4EDE4]'
              }`}
            >
              Royal Suits
            </button>
            <button
              onClick={() => setActiveTab('lehenga')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'lehenga'
                  ? 'bg-[#6E1423] text-[#FDFBF7] shadow-xs'
                  : 'bg-white text-[#2B2320] border border-[#EADBCE] hover:bg-[#F4EDE4]'
              }`}
            >
              Grand Lehengas
            </button>
          </div>
        </div>

        {/* Designs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.slice(0, 8).map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              onViewDetails={onViewDetails}
              onOrderSewing={onOrderSewing}
            />
          ))}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-[#F4EDE4] text-[#6E1423] font-semibold text-xs uppercase tracking-widest border border-[#EADBCE] hover:border-[#6E1423] rounded-sm transition-all shadow-xs cursor-pointer group"
          >
            <span>Browse Complete Design Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#C59B27]" />
          </button>
        </div>
      </div>
    </section>
  );
};
