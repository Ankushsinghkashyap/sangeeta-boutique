import React from 'react';
import { Star, Sparkles, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Ankita Sharma',
      city: 'Kapilvastu, Nepal',
      role: 'Bridal Client',
      garment: 'Royal Heritage Velvet Bridal Blouse',
      quote:
        'Sangeeta ji understood exactly what I needed for my wedding day. The deep sweetheart cut and intricate zardozi back fit like a glove without pulling or gaping. Truly worth every rupee!',
      rating: 5,
    },
    {
      name: 'Priya Verma',
      city: 'Kathmandu, Nepal',
      role: 'Reception Bride',
      garment: 'Crimson Raw Silk Bridal Lehenga',
      quote:
        'I ordered remotely with custom measurements taken over a video consultation. When the package arrived, the flare, padding, and sleeve lengths were 100% spot-on. Master-level tailoring.',
      rating: 5,
    },
    {
      name: 'Meera Patel',
      city: 'Butwal, Nepal',
      role: 'Festive Wear',
      garment: 'Kalidar Chanderi Anarkali Suit',
      quote:
        'The neatness of their internal cotton lining and finishing stitches is unmatched. The online tracking timeline was so reassuring as my sister’s sangeet approached.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FDFBF7] border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C59B27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Affection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#6E1423]">
            Words From Our Brides & Patrons
          </h2>
          <p className="text-sm sm:text-base text-[#6A5E57]">
            Real stories from women who trusted Sangeeta Boutique with their most memorable occasions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 bg-[#F9F6F0] rounded-2xl border border-[#EADBCE] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#C59B27] transition-all hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Stars */}
                <div className="flex items-center gap-1 text-[#E5C158]">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-[#C59B27]/30" />

                <p className="text-xs sm:text-sm text-[#4A3E39] leading-relaxed italic">
                  "{r.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#EADBCE]/80 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2B2320]">
                    {r.name}
                  </h4>
                  <span className="text-[11px] text-[#8A7968]">
                    {r.city} • {r.role}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#8C6D1F] bg-[#FCF8EC] px-2 py-1 rounded border border-[#E5C158]/50">
                  Verified Fit
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
