
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Mail, 
  Building2, 
  User, 
  Phone, 
  Palette, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PinteLogo } from './PinteLogo';
import { UILabels } from '../types';
import emailjs from '@emailjs/browser';

interface QuoteRequestProps {
  onBack: () => void;
  ui?: UILabels['quote']; // Optional prop for now to avoid breaking if not passed immediately, but app passes it
}

const PAIN_POINTS = [
  "附着力差 (Adhesion Issues)",
  "容易氧化变黑 (Oxidation)",
  "金粉脱落 (Foil Dusting)",
  "边缘不整齐 (Poor Edge Definition)",
  "拉丝/飞金 (Flaking)",
  "耐磨性不足 (Low Abrasion Resistance)",
  "光泽度不够 (Low Gloss)",
  "很难上烫 (Hard to Stamp)"
];

const APPLICATIONS = [
  "纸张包装 (Paper Packaging)",
  "皮革/PU (Leather/PU)",
  "塑胶外壳 (Plastic Housing)",
  "化妆品容器 (Cosmetic Container)",
  "纺织布料 (Textile)",
  "标签贴纸 (Labels)",
  "其他 (Others)"
];

// --- EMAILJS CONFIGURATION ---
const EMAILJS_SERVICE_ID: string = "service_o5cnsro"; 
const EMAILJS_TEMPLATE_ID: string = "template_yztox8m";
const EMAILJS_PUBLIC_KEY: string = "VBjpFY6nA0vANF7ok";

// Fallback UI labels in case prop is missing
const defaultUI = {
    title: "Start Your Custom Solution",
    subtitle: "Tell us your needs and issues.",
    back: "Back",
    projectDetails: "Project Details",
    appField: "Application Area",
    colorField: "Color/Effect Requirements",
    painPoints: "Current Pain Points",
    extraInfo: "Additional Info",
    contactInfo: "Contact Info",
    name: "Name",
    company: "Company Name",
    email: "Email",
    phone: "Phone Number",
    submit: "Send Request",
    submitting: "Sending...",
    successTitle: "Request Submitted!",
    successDesc: "Thank you for choosing PINTE.",
    backHome: "Back to Home",
    newRequest: "Submit New Request",
    placeholders: {
      select: "Please Select...",
      color: "e.g., Gloss Gold...",
      desc: "Describe substrate...",
      name: "Your Name",
      company: "Company Name",
      email: "email@example.com",
      phone: "+1 ..."
    }
};

const QuoteRequest: React.FC<QuoteRequestProps> = ({ onBack, ui = defaultUI }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    application: '',
    painPoints: [] as string[],
    colorRequirements: '',
    description: ''
  });

  const togglePainPoint = (point: string) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(point) 
        ? prev.painPoints.filter(p => p !== point)
        : [...prev.painPoints, point]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const templateParams = {
      subject:"PINTE Quote Request",
      to_name: formData.name,
      to_email: formData.email,
      from_name: "PINTE SALES TEAM",
      from_email: "sales@bestglitter.com",
      company: formData.company,
      phone: formData.phone,
      application: formData.application,
      color_requirements: formData.colorRequirements,
      pain_points: formData.painPoints.join(", "),
      message: formData.description,
      reply_to: formData.email
    };

    try {
      if (EMAILJS_SERVICE_ID === "") {
         await new Promise(resolve => setTimeout(resolve, 1500));
         setStep('success');
         window.scrollTo(0, 0);
         return;
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      setStep('success');
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error('Email sending failed:', error);
      const errorText = error?.text || "Unknown Error";
      setErrorMessage(`Failed (${errorText}). Please email sales9@bestglitter.com directly.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-12 text-center shadow-xl border border-neutral-100">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">{ui.successTitle}</h2>
          <p className="text-neutral-500 leading-relaxed mb-8">
            {ui.successDesc}
          </p>
          <div className="space-y-3">
             <button 
               onClick={onBack}
               className="w-full bg-pinte-blue text-white py-4 rounded-xl font-bold hover:bg-pinte-dark transition-colors shadow-lg shadow-pinte-blue/20"
             >
               {ui.backHome}
             </button>
             <button 
               onClick={() => {
                 setStep('form');
                 setFormData({
                    name: '',
                    company: '',
                    email: '',
                    phone: '',
                    application: '',
                    painPoints: [],
                    colorRequirements: '',
                    description: ''
                 });
               }}
               className="w-full bg-white text-neutral-600 py-4 rounded-xl font-bold hover:bg-neutral-50 transition-colors"
             >
               {ui.newRequest}
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-[1000px] mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-pinte-blue font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{ui.back}</span>
          </button>
          <div className="flex items-center gap-2">
            <PinteLogo originalColors className="h-6 w-auto" />
            <span className="font-display font-bold text-xl tracking-tight">PINTE QUOTE</span>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
            {ui.title}
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed">
            {ui.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Project Details */}
          <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 bg-blue-50 text-pinte-blue rounded-full flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{ui.projectDetails}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  {ui.appField} <span className="text-red-500">*</span>
                </label>
                <select 
                  required
                  value={formData.application}
                  onChange={(e) => setFormData({...formData, application: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 focus:border-pinte-blue transition-all appearance-none"
                >
                  <option value="" disabled>{ui.placeholders.select}</option>
                  {APPLICATIONS.map((app) => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <Palette size={16} className="text-neutral-400" /> {ui.colorField}
                </label>
                <input 
                  type="text" 
                  placeholder={ui.placeholders.color}
                  value={formData.colorRequirements}
                  onChange={(e) => setFormData({...formData, colorRequirements: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 focus:border-pinte-blue transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-neutral-400" /> {ui.painPoints}
              </label>
              <div className="flex flex-wrap gap-3">
                {PAIN_POINTS.map((point) => (
                  <button
                    key={point}
                    type="button"
                    onClick={() => togglePainPoint(point)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                      formData.painPoints.includes(point)
                        ? 'bg-pinte-blue text-white border-pinte-blue shadow-md'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-pinte-blue hover:text-pinte-blue'
                    }`}
                  >
                    {point}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
               <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  {ui.extraInfo}
               </label>
               <textarea 
                  rows={4}
                  placeholder={ui.placeholders.desc}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 focus:border-pinte-blue transition-all resize-none"
               />
            </div>
          </section>

          {/* Section 2: Contact Info */}
          <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{ui.contactInfo}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700">{ui.name} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 focus:border-pinte-blue transition-all"
                    placeholder={ui.placeholders.name}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700">{ui.company}</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full pl-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 focus:border-pinte-blue transition-all"
                    placeholder={ui.placeholders.company}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700">{ui.email} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 focus:border-pinte-blue transition-all"
                    placeholder={ui.placeholders.email}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700">{ui.phone}</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-pinte-blue/20 focus:border-pinte-blue transition-all"
                    placeholder={ui.placeholders.phone}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end pt-4">
             <button 
               type="submit"
               disabled={isSubmitting}
               className="bg-pinte-blue text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pinte-dark disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-pinte-blue/30 flex items-center gap-3"
             >
               {isSubmitting ? (
                 <>
                   <Loader2 size={20} className="animate-spin" />
                   {ui.submitting}
                 </>
               ) : (
                 <>
                   {ui.submit}
                   <Send size={20} />
                 </>
               )}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default QuoteRequest;
