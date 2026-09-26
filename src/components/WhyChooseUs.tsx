import React from 'react';
import { Scissors, Ruler, Sparkles, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: Ruler,
      title: 'Precision Master Pattern Making',
      desc: 'Every blouse and suit starts with individual paper drafting mapped to your distinct posture and contour, avoiding standard factory shortcuts.',
    },
    {
      icon: Sparkles,
      title: 'Authentic Hand Zardozi & Aari',
      desc: 'In-house Karigars with generations of embroidery heritage crafting intricate kundan, dabka, cutwork, and fine silk threadwork.',
    },
    {
      icon: ShieldCheck,
      title: '100% Fit Guarantee & Trial Fitting',
      desc: 'Free alterations and trial fitting sessions. We will not hand over your ensemble until you feel radiant and utterly confident.',
    },
    {
      icon: Clock,
      title: 'Punctual Wedding & Festive Timelines',
      desc: 'We treat your celebration dates as sacred. Express 72-hour turnaround available for destination weddings and emergency requirements.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FDFBF7] border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C59B27]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Sangeeta Promise</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#6E1423]">
            Why Discerning Clients Choose Us
          </h2>
          <p className="text-sm sm:text-base text-[#6A5E57]">
            Four pillars of master craftsmanship that set our boutique tailoring apart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-[#F9F6F0] rounded-xl border border-[#EADBCE] hover:border-[#C59B27] transition-all hover:shadow-md space-y-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#FCF8EC] border border-[#E5C158]/50 text-[#C59B27] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#6E1423] group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#2B2320]">
                  {p.title}
                </h3>
                <p className="text-xs text-[#6A5E57] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
