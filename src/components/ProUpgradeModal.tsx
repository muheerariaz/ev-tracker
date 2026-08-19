import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  CreditCard,
  X,
  Mail,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { Language, UserProfile, Vehicle, AdminPaymentSettings } from '../types';
import { translations } from '../translations';
import { AppStorage } from '../utils/storage';
import confetti from 'canvas-confetti';

interface ProUpgradeModalProps {
  user: UserProfile;
  activeVehicle: Vehicle | null;
  currentLanguage: Language;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  adminPaymentSettings?: AdminPaymentSettings;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  user,
  activeVehicle,
  currentLanguage,
  onClose,
  onUpgradeSuccess,
  adminPaymentSettings,
}) => {
  const t = translations[currentLanguage];
  const settings = adminPaymentSettings || AppStorage.getAdminPaymentSettings();

  const [showPaymentDetails, setShowPaymentDetails] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [trxId, setTrxId] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleActivatePro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) return;

    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
      onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  const handleSimulatePdfExport = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      setPdfGenerating(false);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>EV Tracker - Certified Battery Health Inspection Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
            .footer { margin-top: 40px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin:0; color: #10b981;">EV Tracker PK</h1>
              <p style="margin:5px 0 0 0; color:#64748b;">Official Battery Health Inspection Certificate</p>
            </div>
            <div>
              <span class="badge">VERIFIED GRADE A</span>
            </div>
          </div>
          <div class="grid">
            <div class="card">
              <h3>Vehicle Information</h3>
              <p><strong>Owner:</strong> ${user.name || 'EV Owner'}</p>
              <p><strong>Vehicle Model:</strong> ${activeVehicle?.model || 'EV Bike'}</p>
              <p><strong>Brand:</strong> ${activeVehicle?.brand || 'EV'}</p>
              <p><strong>Registration:</strong> ${activeVehicle?.registrationNumber || 'Registered'}</p>
              <p><strong>Odometer:</strong> ${activeVehicle?.odometerKm || 0} KM</p>
            </div>
            <div class="card">
              <h3>Battery Telemetry Diagnostics</h3>
              <p><strong>Chemistry:</strong> ${activeVehicle?.batteryChemistry || '72V Graphene'}</p>
              <p><strong>Nominal Voltage:</strong> ${activeVehicle?.nominalVoltage || 72}V</p>
              <p><strong>State of Health (SOH):</strong> ${activeVehicle?.healthPercentage || 98}%</p>
              <p><strong>Full Charge Potential:</strong> ${activeVehicle?.fullVoltage || 78.5}V</p>
              <p><strong>Low Cutoff Threshold:</strong> ${activeVehicle?.cutoffVoltage || 62.0}V</p>
            </div>
          </div>
          <div class="card">
            <h3>Technical Inspection Conclusion</h3>
            <p>The battery pack demonstrates optimal cell internal resistance. Cell voltage balance falls within the 0.05V optimal variance margin.</p>
          </div>
          <div class="footer">
            <p>Generated via EV Tracker Pro Telemetry Engine on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EVTracker_Battery_Certificate_${activeVehicle?.model.replace(/\s+/g, '_') || 'Report'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const hasEasypaisa = !!(settings.easypaisaNumber && settings.easypaisaNumber.trim());
  const hasSadapay = !!(settings.sadapayNumber && settings.sadapayNumber.trim());

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100">
                {t.pro_upgrade_title}
              </h2>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Rs. {settings.proPricePkr.toLocaleString()} Lifetime Access
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.pro_feature_1}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.pro_feature_2}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.pro_feature_3}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.pro_feature_4}</span>
          </div>
        </div>

        {/* Instant PDF Export Action */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Battery Inspection Certificate Export</span>
            <span className="text-[11px] text-slate-400">Official formatted inspection HTML report</span>
          </div>
          <button
            type="button"
            onClick={handleSimulatePdfExport}
            disabled={pdfGenerating}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-500/30 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{pdfGenerating ? 'Generating...' : 'Export Certificate'}</span>
          </button>
        </div>

        {/* Unlock PRO Action / Accordion */}
        {!showPaymentDetails ? (
          <button
            type="button"
            onClick={() => setShowPaymentDetails(true)}
            id="unlock-pro-toggle-btn"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Unlock PRO Features Now (Rs. {settings.proPricePkr})</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t.payment_methods_title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentDetails(false)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <span>Collapse</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>

            {/* EasyPaisa Card */}
            {hasEasypaisa ? (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                    EasyPaisa
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200 block mt-1">
                    {settings.easypaisaNumber} {settings.easypaisaTitle ? `(${settings.easypaisaTitle})` : ''}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(settings.easypaisaNumber, 'easypaisa')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 transition shrink-0"
                >
                  {copiedKey === 'easypaisa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'easypaisa' ? t.copied : t.copy_number}</span>
                </button>
              </div>
            ) : null}

            {/* SadaPay / NayaPay Card */}
            {hasSadapay ? (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                    SadaPay
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200 block mt-1">
                    {settings.sadapayNumber} {settings.sadapayTitle ? `(${settings.sadapayTitle})` : ''}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(settings.sadapayNumber, 'sadapay')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 transition shrink-0"
                >
                  {copiedKey === 'sadapay' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sadapay' ? t.copied : t.copy_number}</span>
                </button>
              </div>
            ) : null}

            {!hasEasypaisa && !hasSadapay && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-slate-200">
                  Direct Payment Verification Support
                </p>
                <p className="text-[11px] text-slate-400">
                  Please contact official support at <a href={`mailto:${settings.supportEmail || 'evtrackerpk.support@gmail.com'}`} className="text-emerald-400 underline">{settings.supportEmail || 'evtrackerpk.support@gmail.com'}</a> to complete your Pro upgrade.
                </p>
              </div>
            )}

            {settings.paymentInstructions && (
              <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                ℹ️ {settings.paymentInstructions}
              </p>
            )}

            {/* Verification Form */}
            <form onSubmit={handleActivatePro} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t.upload_proof}
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRX-982314981 or EasyPaisa / SadaPay Transaction ID"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <a
                  href={`mailto:${settings.supportEmail || 'evtrackerpk.support@gmail.com'}?subject=EV Tracker Pro Payment Receipt&body=Hi EV Tracker Team,%0D%0A%0D%0AI have transferred the Pro payment. My Transaction ID is: ${trxId}`}
                  className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Need help? Email Support</span>
                </a>
              </div>

              <button
                type="submit"
                disabled={isActivating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isActivating ? 'Verifying Transaction...' : t.confirm_payment_btn}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
