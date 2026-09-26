import React from 'react';
import { WebsiteContent } from '../types/index.ts';
import { Sparkles, Scissors, Award, Users, CheckCircle } from 'lucide-react';

interface AboutSectionProps {
  content: WebsiteContent;
  onBookSewing: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content, onBookSewing }) => {
  const story =
    content.about_story ||
    'Founded by master couturier Sangeeta Kashyap, Sangeeta Boutique has tailored over 15,000 bespoke ensembles. Every cut, pleat, and embroidery stitch is thoughtfully planned to celebrate your unique grace, ensuring an immaculate silhouette that feels effortlessly comfortable.';

  return (
    <section className="py-16 sm:py-24 bg-[#F9F6F0] border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Boutique Imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#EADBCE] shadow-xl">
              <img
                src="/images/hero-banner.jpg"
                alt="Sangeeta Boutique Atelier Studio"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/bridal-blouse-red.jpg';
                }}
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="font-serif italic text-lg text-[#E5C158] block">
                    “A perfect blouse is not just stitched; it is sculpted.”
                  </span>
                  <span className="text-xs text-[#F4EDE4] font-medium tracking-wide">
                    — Sangeeta Kashyap, Founder & Head Couturier
                  </span>
                </div>
              </div>
            </div>

            {/* Overlapping Badge */}
            <div className="hidden sm:flex absolute -bottom-6 -right-6 bg-white p-4 rounded-xl border border-[#EADBCE] shadow-lg items-center gap-3 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-[#6E1423] text-[#E5C158] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <strong className="block text-[#2B2320] font-bold">14+ Years of Heritage</strong>
                <span className="text-[#8A7968]">Crafting bespoke Nepali bridal & festive fashion</span>
              </div>
            </div>
          </div>

          {/* Right: Brand Heritage */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C59B27]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atelier Heritage</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#6E1423]">
              The Art of Sangeeta Boutique
            </h2>

            <p className="text-base text-[#4A3E39] leading-relaxed">
              {story}
            </p>

            <p className="text-sm text-[#6A5E57] leading-relaxed">
              What began as a passion atelier in 2012 has flourished into Nepal’s premier bespoke couture destination. Whether it’s designing an ornate velvet blouse with heavy pearl-and-zardozi handwork for your wedding day or sculpting a crisp everyday cotton kurti, we bridge time-honored Nepali handcraft with flattering modern cuts.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="flex items-center gap-2 text-xs font-bold text-[#2B2320]">
                  <CheckCircle className="w-4 h-4 text-[#6E1423]" />
                  <span>In-House Master Karigars</span>
                </span>
                <p className="text-[11px] text-[#8A7968] pl-6">Direct artisan embroidery without middleman compromises</p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-2 text-xs font-bold text-[#2B2320]">
                  <CheckCircle className="w-4 h-4 text-[#6E1423]" />
                  <span>Bespoke Styling Consultation</span>
                </span>
                <p className="text-[11px] text-[#8A7968] pl-6">Fabric recommendations and neck cut analysis for your frame</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onBookSewing}
                className="px-6 py-3.5 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold uppercase tracking-widest rounded-md transition-colors shadow-xs"
              >
                Schedule Your Sewing Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
