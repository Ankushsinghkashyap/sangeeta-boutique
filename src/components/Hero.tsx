import React from 'react';
import { Sparkles, Scissors, ArrowRight, ShieldCheck, HeartHandshake, Award } from 'lucide-react';
import { WebsiteContent } from '../types/index.ts';

interface HeroProps {
  content: WebsiteContent;
  onExploreDesigns: () => void;
  onBookSewing: () => void;
}

export const Hero: React.FC<HeroProps> = ({ content, onExploreDesigns, onBookSewing }) => {
  const title = content.hero_title || 'Sangeeta Boutique';
  const tagline = content.hero_tagline || '“Elegant Designs. Perfect Fit. Made for You.”';
  const description =
    content.hero_description ||
    'Crafting bespoke bridal blouses, royal suits, festive lehengas, and designer silhouettes with master precision and timeless Indian artistry since 2012.';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F2EB] to-[#FDFBF7] border-b border-[#EADBCE]">
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 rounded-full bg-[#E5C158]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-1/3 w-96 h-96 rounded-full bg-[#6E1423]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCF8EC] border border-[#E5C158]/60 text-xs font-semibold text-[#8C6D1F]">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Bespoke Indian Couture & Custom Tailoring</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#6E1423] leading-none">
                {title}
              </h1>
              <p className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-[#8C6D1F] font-medium">
                {tagline}
              </p>
            </div>

            <p className="text-base sm:text-lg text-[#6A5E57] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {description}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreDesigns}
                className="w-full sm:w-auto px-8 py-4 bg-[#6E1423] hover:bg-[#530E1A] text-[#FDFBF7] font-semibold text-sm uppercase tracking-wider rounded-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Explore Designs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E5C158]" />
              </button>

              <button
                onClick={onBookSewing}
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-[#F4EDE4] text-[#6E1423] font-semibold text-sm uppercase tracking-wider rounded-sm border-2 border-[#6E1423] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scissors className="w-4 h-4 text-[#C59B27] -rotate-45" />
                <span>Book Your Sewing</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-[#EADBCE] grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-full bg-[#FCF8EC] text-[#C59B27]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2B2320]">15,000+ Perfect Fits</span>
                  <span className="block text-[11px] text-[#8A7968]">Hand-measured & crafted</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-full bg-[#FCF8EC] text-[#C59B27]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2B2320]">100% Fit Guarantee</span>
                  <span className="block text-[11px] text-[#8A7968]">Free trial fitting adjustments</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
                <div className="p-2 rounded-full bg-[#FCF8EC] text-[#C59B27]">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2B2320]">Master Artisans</span>
                  <span className="block text-[11px] text-[#8A7968]">Zardozi & Aari specialists</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Fashion Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative frame */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-[#E5C158]/30 via-transparent to-[#6E1423]/20 blur-sm"></div>

              <div className="relative rounded-xl overflow-hidden border-2 border-[#EADBCE] shadow-2xl bg-[#F9F6F0]">
                <img
                  src="/images/hero-banner.jpg"
                  alt="Sangeeta Boutique Haute Couture Studio"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                  }}
                  className="w-full h-[450px] sm:h-[500px] object-cover object-center transform hover:scale-102 transition-transform duration-700"
                />

                {/* Floating Glass Pill */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-lg border border-[#EADBCE]/80 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6E1423] text-[#E5C158] flex items-center justify-center font-serif font-bold text-lg">
                      S
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2B2320]">Bespoke Bridal & Couture</p>
                      <p className="text-[11px] text-[#8A7968]">Custom tailoring from Rs. 900</p>
                    </div>
                  </div>
                  <button
                    onClick={onBookSewing}
                    className="px-3.5 py-1.5 bg-[#6E1423] text-[#FDFBF7] text-xs font-semibold rounded-sm hover:bg-[#530E1A] transition-colors"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
