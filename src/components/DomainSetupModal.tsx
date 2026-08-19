import React, { useState } from 'react';
import {
  Server,
  Globe,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  X,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface DomainSetupModalProps {
  currentLanguage: Language;
  onClose: () => void;
}

export const DomainSetupModal: React.FC<DomainSetupModalProps> = ({
  currentLanguage,
  onClose,
}) => {
  const t = translations[currentLanguage];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-100">
                {t.domain_setup_guide_title}
              </h3>
              <p className="text-xs text-emerald-400 font-mono">
                {t.domain_address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Configure your PKNIC registrar DNS or Cloudflare dashboard with the following DNS records to route traffic to the container cluster.
        </p>

        {/* DNS Table */}
        <div className="space-y-2.5">
          {/* CNAME */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                  CNAME
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  Host: www
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono block mt-0.5">
                Target: scooter-health-monitor--muheerariaz.replit.app
              </span>
            </div>
            <button
              onClick={() => copy('scooter-health-monitor--muheerariaz.replit.app', 'cname')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 transition shrink-0"
            >
              {copiedKey === 'cname' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'cname' ? t.copied : 'Copy Target'}</span>
            </button>
          </div>

          {/* A Record */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                  A Record
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  Host: @ (Apex)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono block mt-0.5">
                IPv4: 34.102.136.180
              </span>
            </div>
            <button
              onClick={() => copy('34.102.136.180', 'a_record')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 transition shrink-0"
            >
              {copiedKey === 'a_record' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'a_record' ? t.copied : 'Copy IP'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-step instructions */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PKNIC Domain Verification Checklist</span>
          </div>
          <p>1. Log into your domain registrar (e.g. PKNIC, GoDaddy, Cloudflare).</p>
          <p>2. Add the CNAME record for <strong>www</strong> pointing to the app target.</p>
          <p>3. Add an A record for root <strong>@</strong> with TTL set to 300 seconds.</p>
          <p>4. SSL certificate will automatically provision via Let's Encrypt once DNS propagates.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
