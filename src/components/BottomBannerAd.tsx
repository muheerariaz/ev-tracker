import React from 'react';
import { Sparkles, ExternalLink, X, ShieldAlert, Zap } from 'lucide-react';
import { Language } from '../types';

interface BottomBannerAdProps {
  currentLanguage?: Language;
  isPro: boolean;
  onUpgradePro: () => void;
  onNavigateStore?: () => void;
  onOpenStore?: () => void;
}

export const BottomBannerAd: React.FC<BottomBannerAdProps> = ({
  isPro,
  onUpgradePro,
  onNavigateStore,
  onOpenStore,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (isPro || dismissed) {
    return null;
  }

  const handleStoreClick = () => {
    if (onOpenStore) onOpenStore();
    if (onNavigateStore) onNavigateStore();
  };

  return (
    <div className="w-full bg-slate-900/95 border-t border-slate-800/80 px-3 py-2 text-xs flex items-center justify-between gap-3 shadow-lg z-30 transition-all">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Sponsored
        </span>
        <div className="flex items-center gap-1.5 truncate">
          <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-200 truncate">
            72V Smart Pulse Fast Charger with Auto-Cutoff (Prevents Graphene Swelling)
          </span>
          <span className="text-emerald-400 font-bold hidden sm:inline font-mono">
            Rs. 6,800
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleStoreClick}
          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 transition shadow-sm cursor-pointer"
        >
          <span>View Deal</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        <button
          onClick={onUpgradePro}
          className="text-[11px] text-slate-400 hover:text-amber-300 hidden md:inline transition font-medium"
        >
          Remove Ads (PRO)
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-500 hover:text-slate-300 transition rounded"
          title="Dismiss ad for this session"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
