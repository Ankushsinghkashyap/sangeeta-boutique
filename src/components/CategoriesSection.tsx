import React from 'react';
import { Category } from '../types/index.ts';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoriesSectionProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="py-16 sm:py-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C59B27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Silhouettes</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#6E1423]">
            Explore Clothing Categories
          </h2>
          <p className="text-sm sm:text-base text-[#6A5E57]">
            From heirloom bridal blouses to fluid everyday kurtis, explore designs tailored to your exact measurements.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group cursor-pointer flex flex-col items-center bg-[#F9F6F0] rounded-xl overflow-hidden border border-[#EADBCE] hover:border-[#C59B27] transition-all duration-300 hover:shadow-md"
            >
              <div className="w-full h-44 sm:h-52 overflow-hidden bg-[#ECE4D8] relative">
                <img
                  src={cat.image || '/images/hero-banner.jpg'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#FDFBF7]">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-[#E5C158] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Designs</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <div className="p-2.5 text-center w-full">
                <p className="text-[11px] text-[#8A7968] line-clamp-1">
                  {cat.description || 'Custom tailored designs'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
