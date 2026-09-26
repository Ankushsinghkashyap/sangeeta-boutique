import React, { useState } from 'react';
import { WebsiteContent } from '../types/index.ts';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

interface ContactSectionProps {
  content: WebsiteContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content }) => {
  const phone = content.phone_number || '+9779702742100';
  const whatsapp = content.whatsapp_number || '+9779702742100';
  const email = content.email_address || 'ankushsinghkashyap34@gmail.com';
  const address =
    content.physical_address ||
    'Dumara chowk kapilvastu nepal';
  const hours =
    content.opening_hours ||
    'Monday - Saturday: 10:30 AM - 8:30 PM | Sunday: By Appointment';

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;
    // Pre-fill WhatsApp message for quick customer convenience
    const text = encodeURIComponent(
      `Hello Sangeeta Boutique, my name is ${inquiryName} (${inquiryPhone}). ${inquiryMessage || 'I would like to inquire about custom sewing and consultation.'}`
    );
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMessage('');
    }, 4000);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F9F6F0] border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C59B27]">
            Visit Atelier & Consult
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#6E1423]">
            Get In Touch With Our Stylists
          </h2>
          <p className="text-sm sm:text-base text-[#6A5E57]">
            Have design queries or wish to schedule a physical fabric trial? We welcome you to our boutique atelier.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-white rounded-xl border border-[#EADBCE] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FCF8EC] text-[#6E1423] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div className="text-xs space-y-1">
                <strong className="block text-sm font-serif font-bold text-[#2B2320]">
                  Boutique Studio Address
                </strong>
                <p className="text-[#6A5E57] leading-relaxed">{address}</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#EADBCE] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FCF8EC] text-[#6E1423] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div className="text-xs space-y-1">
                <strong className="block text-sm font-serif font-bold text-[#2B2320]">
                  Direct Phone & Consultations
                </strong>
                <a href={`tel:${phone}`} className="text-[#6E1423] font-semibold hover:underline block">
                  {phone}
                </a>
                <p className="text-[#8A7968]">Call for fitting appointments or order queries</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#EADBCE] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FCF8EC] text-[#6E1423] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div className="text-xs space-y-1">
                <strong className="block text-sm font-serif font-bold text-[#2B2320]">
                  Atelier Hours
                </strong>
                <p className="text-[#6A5E57]">{hours}</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#EADBCE] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FCF8EC] text-[#6E1423] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#C59B27]" />
              </div>
              <div className="text-xs space-y-1">
                <strong className="block text-sm font-serif font-bold text-[#2B2320]">
                  Email Inquiries
                </strong>
                <a href={`mailto:${email}`} className="text-[#6E1423] hover:underline block">
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Right: Quick Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#EADBCE] shadow-md">
            <h3 className="font-serif text-2xl font-bold text-[#6E1423] mb-2">
              Send a Styling Inquiry
            </h3>
            <p className="text-xs text-[#6A5E57] mb-6">
              Share your clothing requirement, event dates, or ask about custom embroidery.
            </p>

            {inquirySent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 text-emerald-800">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
                <h4 className="font-serif font-bold text-lg">Inquiry Forwarded!</h4>
                <p className="text-xs">
                  Opening WhatsApp to connect you directly with Sangeeta Boutique's lead tailor.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#2B2320] mb-1">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Ritu Deshmukh"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs focus:border-[#6E1423] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2B2320] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="e.g. 98231 45678"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs focus:border-[#6E1423] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2B2320] mb-1">
                    Your Requirements / Message
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Tell us about the silhouette, wedding date, fabric type, or styling preference..."
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg text-xs focus:border-[#6E1423] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-[#8A7968]">
                    🔒 Your details are never shared with third parties.
                  </span>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-[#6E1423] hover:bg-[#530E1A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>Send Inquiry via WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
