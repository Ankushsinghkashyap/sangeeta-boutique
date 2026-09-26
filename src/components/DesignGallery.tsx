import React, { useState, useMemo } from 'react';
import { Design, Category } from '../types/index.ts';
import { DesignCard } from './DesignCard.tsx';
import { Search, SlidersHorizontal, Sparkles, X, RefreshCw } from 'lucide-react';

interface DesignGalleryProps {
  designs: Design[];
  categories: Category[];
  initialCategory?: string;
  onViewDetails: (design: Design) => void;
  onOrderSewing: (design: Design) => void;
}

export const DesignGallery: React.FC<DesignGalleryProps> = ({
  designs,
  categories,
  initialCategory,
  onViewDetails,
  onOrderSewing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const filteredDesigns = useMemo(() => {
    return designs
      .filter((d) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (d.categoryName.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = d.name.toLowerCase().includes(q);
          const matchCode = d.designCode.toLowerCase().includes(q);
          const matchDesc = d.description.toLowerCase().includes(q);
          const matchCat = d.categoryName.toLowerCase().includes(q);
          const matchFabric = d.fabricInfo ? d.fabricInfo.toLowerCase().includes(q) : false;
          if (!matchName && !matchCode && !matchDesc && !matchCat && !matchFabric) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return parseFloat(a.totalPrice) - parseFloat(b.totalPrice);
        }
        if (sortBy === 'price_desc') {
          return parseFloat(b.totalPrice) - parseFloat(a.totalPrice);
        }
        return b.id - a.id;
      });
  }, [designs, selectedCategory, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C59B27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Tailoring Archive</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#6E1423]">
            Boutique Design Gallery
          </h1>
          <p className="text-sm sm:text-base text-[#6A5E57]">
            Browse our handcrafted collection of bespoke blouses, regal suits, lehengas, and daily couture. Select any design to customize your fit.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#F9F6F0] p-4 sm:p-6 rounded-xl border border-[#EADBCE] mb-10 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#8A7968] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by design name, code, fabric..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#EADBCE] rounded-lg text-xs sm:text-sm text-[#2B2320] focus:outline-none focus:border-[#6E1423] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7968] hover:text-[#2B2320]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Results Count */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <span className="text-xs text-[#8A7968]">
                Showing <strong className="text-[#2B2320]">{filteredDesigns.length}</strong> creations
              </span>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8A7968]" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="text-xs py-2 px-3 bg-white border border-[#EADBCE] rounded-md text-[#2B2320] focus:outline-none focus:border-[#6E1423] cursor-pointer"
                >
                  <option value="newest">Sort by: Newest Additions</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#6E1423] text-white shadow-xs'
                  : 'bg-white text-[#2B2320] border border-[#EADBCE] hover:bg-[#F4EDE4]'
              }`}
            >
              All Designs
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-[#6E1423] text-white shadow-xs'
                    : 'bg-white text-[#2B2320] border border-[#EADBCE] hover:bg-[#F4EDE4]'
                }`}
              >
                {c.name}
              </button>
            ))}

            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-[#8C6D1F] hover:text-[#6E1423] font-medium flex items-center gap-1 cursor-pointer ml-auto"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onViewDetails={onViewDetails}
                onOrderSewing={onOrderSewing}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#F9F6F0] rounded-xl border border-dashed border-[#EADBCE] p-8">
            <div className="w-12 h-12 rounded-full bg-[#FCF8EC] text-[#C59B27] mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#6E1423]">
              No Designs Matched Your Search
            </h3>
            <p className="text-xs text-[#8A7968] mt-1 max-w-sm mx-auto">
              We couldn't find any creations matching your current query or category filter.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-5 py-2 bg-[#6E1423] text-[#FDFBF7] text-xs font-semibold rounded-sm hover:bg-[#530E1A]"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
