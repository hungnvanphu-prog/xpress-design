"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { PageHero } from '@/components/PageHero';

const SERVICE_OPTION_KEYS = [
  'architecture',
  'interior',
  'full_package',
  'renovation',
] as const;

const BUDGET_OPTION_KEYS = [
  'under500',
  'b500_1b',
  'b1b_3b',
  'over3b',
] as const;

type ServiceOption = (typeof SERVICE_OPTION_KEYS)[number];
type BudgetOption = (typeof BUDGET_OPTION_KEYS)[number];

type ContactFormState = {
  name: string;
  phone: string;
  email: string;
  service: ServiceOption;
  budget: BudgetOption;
  message: string;
};

export default function Contact() {
  const tNav = useTranslations('Nav');
  const tPage = useTranslations('PageTitles');
  const tTag = useTranslations('HeroTaglines');
  const tContact = useTranslations('ContactPage');
  const locale = useLocale();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    phone: '',
    email: '',
    service: SERVICE_OPTION_KEYS[0],
    budget: BUDGET_OPTION_KEYS[0],
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.cmsContactRequest({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        service: tContact(`services.${formData.service}`),
        budget: tContact(`budgets.${formData.budget}`),
        message: formData.message.trim() || undefined,
        locale,
      });
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setFormData({
        name: '',
        phone: '',
        email: '',
        service: SERVICE_OPTION_KEYS[0],
        budget: BUDGET_OPTION_KEYS[0],
        message: '',
      });
    } catch {
      setSubmitError(tContact('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'service') {
      setFormData({ ...formData, service: value as ServiceOption });
      return;
    }
    if (name === 'budget') {
      setFormData({ ...formData, budget: value as BudgetOption });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  if (isSubmitted) {
    return (
      <div
        className="bg-white min-h-screen relative flex items-center justify-center px-6"
        data-e2e="contact-success"
      >
        <div className="absolute inset-0 h-[450px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-[#1A1A1A]"></div>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xl relative z-10 bg-white p-12 shadow-2xl border-t-4 border-[#D4AF37] mt-20"
        >
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-[#D4AF37]">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-4xl mb-4 text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>{tContact('successTitle')}</h1>
          <p className="text-gray-600 mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {tContact('successBody')}
          </p>
          <button 
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="bg-[#D4AF37] text-white px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-[#1A1A1A] transition-all duration-300"
          >
            {tContact('successNewRequest')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <PageHero
        image="https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGFyY2hpdGVjdHVyZSUyMGdhcmRlbiUyMHRlcnJhY2UlMjBsdXh1cnklMjBtaW5pbWFsJTIwZGVzaWdufGVufDF8fHx8MTc3NTc0NjY2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        title={tPage('contact')}
        breadcrumb={tNav('contact')}
        homeLabel={tNav('home')}
        tagline={tTag('contact')}
        alt={tContact('heroImageAlt')}
      />

      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            {/* Info Column */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-3xl mb-8 text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>{tContact('infoTitle')}</h2>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mr-6 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">{tContact('addressLabel')}</h4>
                      <p className="text-[#1A1A1A] font-medium">{tContact('addressValue')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mr-6 shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">{tContact('hotlineLabel')}</h4>
                      <p className="text-[#1A1A1A] font-medium">{tContact('hotlineValue')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mr-6 shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">{tContact('emailLabel')}</h4>
                      <p className="text-[#1A1A1A] font-medium">{tContact('emailValue')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#1A1A1A] text-white">
                <h3 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>{tContact('hoursTitle')}</h3>
                <div className="space-y-4 text-white/60 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span>{tContact('hoursWeekdays')}</span>
                    <span className="text-white">{tContact('hoursWeekdaysTime')}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span>{tContact('hoursSaturday')}</span>
                    <span className="text-white">{tContact('hoursSaturdayTime')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{tContact('hoursSunday')}</span>
                    <span className="text-[#D4AF37]">{tContact('hoursSundayClosed')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50">
                <h3 className="text-3xl mb-10 text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>{tContact('formTitle')}</h3>
                
                {submitError ? (
                  <p
                    className="text-red-600 text-sm mb-4 font-['Montserrat',sans-serif]"
                    data-e2e="contact-error"
                  >
                    {submitError}
                  </p>
                ) : null}
                <form onSubmit={handleSubmit} className="space-y-6" data-e2e="contact-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{tContact('labelName')}</label>
                      <input 
                        type="text" 
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder={tContact('placeholderName')}
                        data-e2e="contact-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{tContact('labelPhone')}</label>
                      <input 
                        type="tel" 
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] transition-colors"
                        placeholder={tContact('placeholderPhone')}
                        data-e2e="contact-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{tContact('labelEmailOptional')}</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder={tContact('placeholderEmail')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{tContact('labelService')}</label>
                      <select 
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] transition-colors bg-transparent cursor-pointer"
                      >
                        {SERVICE_OPTION_KEYS.map((key) => (
                          <option key={key} value={key}>{tContact(`services.${key}`)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{tContact('labelBudget')}</label>
                      <select 
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#D4AF37] transition-colors bg-transparent cursor-pointer"
                      >
                        {BUDGET_OPTION_KEYS.map((key) => (
                          <option key={key} value={key}>{tContact(`budgets.${key}`)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{tContact('labelMessage')}</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-100 p-4 outline-none focus:border-[#D4AF37] transition-colors resize-none"
                      placeholder={tContact('placeholderMessage')}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1A1A1A] text-white py-5 flex items-center justify-center gap-3 uppercase tracking-widest text-sm font-bold hover:bg-[#D4AF37] transition-all duration-500 group disabled:opacity-60"
                    data-e2e="contact-submit"
                  >
                    <span>{submitting ? tContact('submitting') : tContact('submitButton')}</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[450px] bg-gray-100 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden relative">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1758448756362-e323282ccbcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcmNoaXRlY3R1cmUlMjBhcmNoaXRlY3R1cmUlMjBpbnRlcmlvciUyMGV4dGVyaW9yJTIwbWluaW1hbCUyMGRlc2lnbiUyMHZpbGxhJTIwaG91c2UlMjBnYWxsZXJ5fGVufDF8fHx8MTc3NTc0NjY1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt={tContact('mapImageAlt')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="bg-white p-6 shadow-xl border-t-4 border-[#D4AF37] max-w-xs">
              <h5 className="font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{tContact('mapCardTitle')}</h5>
              <p className="text-xs text-gray-500 mb-4">{tContact('mapCardBody')}</p>
              <a href="#" className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:underline">{tContact('mapLink')}</a>
           </div>
        </div>
      </section>
    </div>
  );
}
