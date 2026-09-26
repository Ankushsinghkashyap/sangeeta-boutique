import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.ts';
import { WebsiteContent } from '../../types/index.ts';
import { Globe, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminContentCMSProps {
  onContentUpdated: () => void;
}

export const AdminContentCMS: React.FC<AdminContentCMSProps> = ({ onContentUpdated }) => {
  const [content, setContent] = useState<WebsiteContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await api.getContent();
      setContent(data);
    } catch (err) {
      console.error('Failed to load website content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateContent(content);
      setSavedSuccess(true);
      onContentUpdated();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update website content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#8A7968]">
        Loading website CMS fields...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#6E1423]">
            Website Content Management (CMS)
          </h2>
          <p className="text-xs text-[#8A7968]">
            Update public homepage headlines, contact numbers, announcement banners, and boutique heritage story
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Changes published live!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EADBCE] shadow-xs space-y-6 text-xs">
        {/* Announcement Banner */}
        <div className="space-y-3 border-b border-[#EADBCE] pb-6">
          <h3 className="font-serif text-base font-bold text-[#6E1423]">
            Top Announcement Bar
          </h3>
          <div>
            <label className="block font-semibold text-[#2B2320] mb-1">
              Top Banner Message
            </label>
            <input
              type="text"
              value={content.announcement_banner || ''}
              onChange={(e) => handleChange('announcement_banner', e.target.value)}
              placeholder="e.g. Festive Season Bookings Open! Complimentary bridal styling consultation."
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 border-b border-[#EADBCE] pb-6">
          <h3 className="font-serif text-base font-bold text-[#6E1423]">
            Hero Landing Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#2B2320] mb-1">
                Boutique Main Title
              </label>
              <input
                type="text"
                value={content.hero_title || ''}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                placeholder="Sangeeta Boutique"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2B2320] mb-1">
                Hero Tagline / Motto
              </label>
              <input
                type="text"
                value={content.hero_tagline || ''}
                onChange={(e) => handleChange('hero_tagline', e.target.value)}
                placeholder="“Elegant Designs. Perfect Fit. Made for You.”"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#2B2320] mb-1">
                Hero Introductory Description
              </label>
              <textarea
                rows={3}
                value={content.hero_description || ''}
                onChange={(e) => handleChange('hero_description', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>
          </div>
        </div>

        {/* Contact & Hours */}
        <div className="space-y-4 border-b border-[#EADBCE] pb-6">
          <h3 className="font-serif text-base font-bold text-[#6E1423]">
            Contact, Phone & Physical Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#2B2320] mb-1">
                Primary Phone Number
              </label>
              <input
                type="text"
                value={content.phone_number || ''}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+9779702742100"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2B2320] mb-1">
                WhatsApp Consultation Number (Numbers only)
              </label>
              <input
                type="text"
                value={content.whatsapp_number || ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="+9779702742100"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2B2320] mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={content.email_address || ''}
                onChange={(e) => handleChange('email_address', e.target.value)}
                placeholder="ankushsinghkashyap34@gmail.com"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2B2320] mb-1">
                Atelier Opening Hours
              </label>
              <input
                type="text"
                value={content.opening_hours || ''}
                onChange={(e) => handleChange('opening_hours', e.target.value)}
                placeholder="Mon - Sat: 10:30 AM - 8:30 PM | Sun: By Appointment"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#2B2320] mb-1">
                Boutique Physical Address
              </label>
              <input
                type="text"
                value={content.physical_address || ''}
                onChange={(e) => handleChange('physical_address', e.target.value)}
                placeholder="Dumara chowk kapilvastu nepal"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
              />
            </div>
          </div>
        </div>

        {/* About Heritage Story */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-[#6E1423]">
            About Sangeeta Boutique Heritage
          </h3>
          <div>
            <label className="block font-semibold text-[#2B2320] mb-1">
              Brand Story & Couturier Note
            </label>
            <textarea
              rows={4}
              value={content.about_story || ''}
              onChange={(e) => handleChange('about_story', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-lg focus:outline-none focus:border-[#6E1423]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#EADBCE] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#6E1423] hover:bg-[#530E1A] text-white font-semibold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#E5C158]" />
            <span>{saving ? 'Publishing Updates...' : 'Publish Content Updates Live'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
