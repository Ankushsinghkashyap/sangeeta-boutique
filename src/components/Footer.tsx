import React from 'react';
import { WebsiteContent, Category } from '../types/index.ts';
import { Scissors, Phone, Mail, MapPin, ShieldCheck, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  content: WebsiteContent;
  categories: Category[];
  onNavigate: (view: string, category?: string) => void;
  onOpenOrderModal: () => void;
  onOpenTrackModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  content,
  categories,
  onNavigate,
  onOpenOrderModal,
  onOpenTrackModal,
}) => {
  const phone = content.phone_number || '+9779702742100';
  const email = content.email_address || 'ankushsinghkashyap34@gmail.com';
  const address =
    content.physical_address ||
    'Dumara chowk kapilvastu nepal';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2B2320] text-[#FDFBF7] border-t border-[#4A3E39] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6E1423] text-[#E5C158] flex items-center justify-center border border-[#E5C158]/40 shadow-xs">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold tracking-wider text-[#FDFBF7]">
                  Sangeeta Boutique
                </span>
                <span className="block text-[10px] uppercase tracking-[0.25em] text-[#E5C158] font-semibold">
                  Haute Couture & Tailoring
                </span>
              </div>
            </div>

            <p className="text-xs text-[#C5B7AA] leading-relaxed max-w-sm">
              Dedicated to the timeless art of Nepali bespoke tailoring, bridal blouses, royal suits, and exquisite festive ensembles. Crafted with perfection, delivered with grace.
            </p>

            <div className="space-y-2 text-xs text-[#C5B7AA] pt-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E5C158] shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#E5C158]">
              Atelier Pages
            </h4>
            <ul className="space-y-2 text-xs text-[#C5B7AA]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#E5C158] transition-colors"
                >
                  Home Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('designs')}
                  className="hover:text-[#E5C158] transition-colors"
                >
                  All Design Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#E5C158] transition-colors"
                >
                  Our Heritage Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#E5C158] transition-colors"
                >
                  Contact & Atelier Map
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrackModal}
                  className="hover:text-[#E5C158] transition-colors flex items-center gap-1 font-semibold text-white"
                >
                  <span>Track Live Sewing Order</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#E5C158]">
              Bespoke Silhouettes
            </h4>
            <ul className="space-y-2 text-xs text-[#C5B7AA]">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('designs', cat.name)}
                    className="hover:text-[#E5C158] transition-colors"
                  >
                    {cat.name} Tailoring
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support & Booking */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#E5C158]">
              Client Services
            </h4>
            <div className="space-y-2 text-xs text-[#C5B7AA]">
              <p>Book custom measurement trial appointments online or visit our boutique.</p>
              <button
                onClick={onOpenOrderModal}
                className="w-full py-2.5 px-3 bg-[#6E1423] hover:bg-[#530E1A] text-white font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors text-center"
              >
                Book Sewing Now
              </button>
              <button
                onClick={onOpenTrackModal}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-[#E5C158] font-semibold text-xs rounded-sm transition-colors text-center"
              >
                Track Order Status
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A7968] gap-4">
          <p>© {new Date().getFullYear()} Sangeeta Boutique. All Rights Reserved.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-[#8A7968] hover:text-[#E5C158] transition-colors flex items-center gap-1 text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin CMS Portal</span>
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="text-[#8A7968] hover:text-[#E5C158] transition-colors flex items-center gap-1 text-[11px]"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
