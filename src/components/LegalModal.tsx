import React from 'react';
import { Shield, FileText, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface LegalModalProps {
  type: 'privacy' | 'terms';
  currentLanguage: Language;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  type,
  currentLanguage,
  onClose,
}) => {
  const t = translations[currentLanguage];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              {type === 'privacy' ? <Shield className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-100">
              {type === 'privacy' ? t.privacy_policy : t.terms_of_service}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3 pr-2 text-xs text-slate-300 leading-relaxed font-sans">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>1. Data Collection & Privacy:</strong> EV Tracker PK values your personal privacy. We do not transmit or sell your individual GPS coordinates, route histories, or battery log telemetries to third-party advertising networks.
              </p>
              <p>
                <strong>2. Local Device Storage:</strong> All ride logs, custom scooter configurations, voltage sag calibrations, and maintenance records are persistently saved inside your device’s sandboxed local browser storage and exported upon your explicit instruction.
              </p>
              <p>
                <strong>3. Analytics & Diagnostics:</strong> Anonymous diagnostic telemetry (such as battery model lookup counts and average kWh calculation efficiencies) is utilized strictly to improve the physics models for Pakistani electric two-wheelers.
              </p>
              <p>
                <strong>4. Contact & Inquiries:</strong> If you have inquiries regarding privacy or wish to request complete deletion of cached profiles, contact us directly at support@evtracker.pk or via our support WhatsApp channel.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>1. Telemetry Estimation Disclaimer:</strong> State of Charge (SoC), Hill Ascent Speed, and Estimated Remaining Range calculated by EV Tracker are algorithmic estimates derived from non-linear battery chemistry models (72V Graphene, LFP, NMC) and user-supplied voltage readings. Real-world range is influenced by wind resistance, tire pressures, ambient heat, and actual rider payload.
              </p>
              <p>
                <strong>2. Safe Operation & Electrical Safety:</strong> Always consult your original manufacturer handbook (e.g. Evee, Yadea, Metro, Crown, Vlektra) for exact terminal torque specifications, tire PSI limits, and charging protocol warnings. Do not tamper with battery BMS wiring while the system is energized.
              </p>
              <p>
                <strong>3. Subscriptions & Pro License:</strong> EV Tracker Pro lifetime licenses grant full access to certified PDF diagnostics reports, ad-free UI, and unlimited vehicle slots.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            {t.close_btn}
          </button>
        </div>
      </div>
    </div>
  );
};
