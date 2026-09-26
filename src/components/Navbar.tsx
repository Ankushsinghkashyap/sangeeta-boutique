import React, { useState } from 'react';
import {
  Scissors,
  Phone,
  MessageCircle,
  Search,
  Package,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { WebsiteContent } from '../types/index.ts';

interface NavbarProps {
  content: WebsiteContent;
  onNavigate: (view: string, filterCategory?: string) => void;
  currentView: string;
  onOpenOrderModal: () => void;
  onOpenTrackModal: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  content,
  onNavigate,
  currentView,
  onOpenOrderModal,
  onOpenTrackModal,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phone = content.phone_number || '+9779702742100';
  const whatsapp = content.whatsapp_number || '+9779702742100';
  const announcement =
    content.announcement_banner ||
    'Festive Season Bookings Open! Complimentary bridal styling consultation with every sewing booking.';

  const handleNavClick = (view: string, cat?: string) => {
    onNavigate(view, cat);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADBCE] shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#6E1423] text-[#FDFBF7] text-xs py-1.5 px-4 tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5C158] animate-pulse"></span>
            <span className="font-light">{announcement}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-[#F4EDE4]">
            <a
              href={`tel:${phone}`}
              className="hover:text-[#E5C158] transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>{phone}</span>
            </a>
            <span className="opacity-40">|</span>
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E5C158] transition-colors flex items-center gap-1 text-[#E5C158]"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Consultation</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-full bg-[#6E1423] text-[#E5C158] flex items-center justify-center shadow-xs border border-[#C59B27]/40 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="block font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#6E1423]">
                Sangeeta
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#C59B27] font-semibold -mt-1">
                Haute Couture & Tailoring
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#2B2320]">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors hover:text-[#6E1423] pb-1 cursor-pointer ${
                currentView === 'home'
                  ? 'text-[#6E1423] border-b-2 border-[#6E1423] font-semibold'
                  : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('designs')}
              className={`transition-colors hover:text-[#6E1423] pb-1 cursor-pointer ${
                currentView === 'designs'
                  ? 'text-[#6E1423] border-b-2 border-[#6E1423] font-semibold'
                  : ''
              }`}
            >
              All Designs
            </button>
            <button
              onClick={() => handleNavClick('designs', 'Blouse')}
              className="transition-colors hover:text-[#6E1423] pb-1 cursor-pointer"
            >
              Blouses
            </button>
            <button
              onClick={() => handleNavClick('designs', 'Suits')}
              className="transition-colors hover:text-[#6E1423] pb-1 cursor-pointer"
            >
              Suits
            </button>
            <button
              onClick={() => handleNavClick('designs', 'Lehenga')}
              className="transition-colors hover:text-[#6E1423] pb-1 cursor-pointer"
            >
              Lehengas
            </button>
            <button
              onClick={() => handleNavClick('designs', 'Kurti')}
              className="transition-colors hover:text-[#6E1423] pb-1 cursor-pointer"
            >
              Kurtis
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`transition-colors hover:text-[#6E1423] pb-1 cursor-pointer ${
                currentView === 'about'
                  ? 'text-[#6E1423] border-b-2 border-[#6E1423] font-semibold'
                  : ''
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`transition-colors hover:text-[#6E1423] pb-1 cursor-pointer ${
                currentView === 'contact'
                  ? 'text-[#6E1423] border-b-2 border-[#6E1423] font-semibold'
                  : ''
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenTrackModal}
              className="px-3.5 py-2 text-xs font-semibold text-[#6E1423] bg-[#FCF8EC] border border-[#EADBCE] rounded-sm hover:bg-[#F4EDE4] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Track your custom sewing order status"
            >
              <Package className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Track Order</span>
            </button>

            <button
              onClick={onOpenOrderModal}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FDFBF7] bg-[#6E1423] hover:bg-[#530E1A] rounded-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Book Sewing</span>
            </button>

            <button
              onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className="p-2 text-xs text-[#8A7968] hover:text-[#6E1423] hover:bg-[#F4EDE4] rounded-sm transition-colors cursor-pointer"
              title="Admin Boutique Portal"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenTrackModal}
              className="p-2 text-[#6E1423] bg-[#FCF8EC] rounded-sm border border-[#EADBCE]"
            >
              <Package className="w-4 h-4 text-[#C59B27]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#6E1423] hover:bg-[#F4EDE4] rounded-sm"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#EADBCE] bg-[#FDFBF7] px-4 pt-3 pb-6 shadow-lg animate-fade-in">
          <div className="flex flex-col gap-2 font-medium text-sm text-[#2B2320]">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left py-2 px-2 hover:bg-[#F9F6F0] rounded-sm text-[#6E1423] font-semibold"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('designs')}
              className="text-left py-2 px-2 hover:bg-[#F9F6F0] rounded-sm"
            >
              All Designs
            </button>
            <div className="pl-4 border-l-2 border-[#EADBCE] flex flex-col gap-1.5 text-xs text-[#6A5E57] my-1">
              <button
                onClick={() => handleNavClick('designs', 'Blouse')}
                className="text-left py-1 hover:text-[#6E1423]"
              >
                Designer Blouses
              </button>
              <button
                onClick={() => handleNavClick('designs', 'Suits')}
                className="text-left py-1 hover:text-[#6E1423]"
              >
                Salwar & Anarkali Suits
              </button>
              <button
                onClick={() => handleNavClick('designs', 'Lehenga')}
                className="text-left py-1 hover:text-[#6E1423]"
              >
                Bridal & Party Lehengas
              </button>
              <button
                onClick={() => handleNavClick('designs', 'Kurti')}
                className="text-left py-1 hover:text-[#6E1423]"
              >
                Festive Kurtis
              </button>
            </div>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-2 px-2 hover:bg-[#F9F6F0] rounded-sm"
            >
              About Boutique
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left py-2 px-2 hover:bg-[#F9F6F0] rounded-sm"
            >
              Contact Us
            </button>

            <div className="pt-4 border-t border-[#EADBCE] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOrderModal();
                }}
                className="w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#FDFBF7] bg-[#6E1423] rounded-sm"
              >
                Book Your Sewing Now
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrackModal();
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-[#6E1423] bg-[#FCF8EC] border border-[#EADBCE] rounded-sm flex items-center justify-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Track Existing Order</span>
              </button>
              <button
                onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
                className="w-full py-2 text-center text-xs text-[#8A7968] hover:text-[#6E1423]"
              >
                Admin CMS Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
