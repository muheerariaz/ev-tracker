import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  X,
  Zap,
  Leaf,
  Coins,
  ShieldCheck,
  Flame,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { Badge, Language } from '../types';
import { translations } from '../translations';
import confetti from 'canvas-confetti';

interface BadgesModalProps {
  badges?: Badge[];
  currentLanguage: Language;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  badges = [],
  currentLanguage,
  onClose,
}) => {
  const t = translations[currentLanguage] || translations.en;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const safeBadges = Array.isArray(badges) ? badges : [];
  const unlockedCount = safeBadges.filter((b) => b?.unlocked).length;
  const totalCount = safeBadges.length;
  const percentComplete = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const totalRewardsPkr = safeBadges
    .filter((b) => b?.unlocked)
    .reduce((acc, b) => acc + (b?.rewardPkr || 0), 0);

  const triggerCelebrate = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Safe fallback if canvas is restricted
    }
  };

  const getBadgeIcon = (badge: Badge) => {
    switch (badge.category) {
      case 'ECO':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'SAVINGS':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'DISTANCE':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'HEALTH':
        return <ShieldCheck className="w-5 h-5 text-rose-400" />;
      case 'EXPLORER':
        return <Compass className="w-5 h-5 text-purple-400" />;
      default:
        return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  const filteredBadges = safeBadges.filter((b) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'UNLOCKED') return b?.unlocked;
    if (selectedCategory === 'LOCKED') return !b?.unlocked;
    return b?.category === selectedCategory;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95">
        {/* Header with Title & Stats */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-100">
                  {t.badges_title || 'Badges & Milestones'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {percentComplete}% Complete
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {unlockedCount} of {totalCount} Trophies Unlocked • Rs. {totalRewardsPkr.toLocaleString()} Saved Value
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="badges-modal-close-btn"
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Overall Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>EV Rider Milestone Progress</span>
            </span>
            <span className="text-amber-400 font-mono">
              {unlockedCount} / {totalCount} Achieved
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Badges' },
            { id: 'UNLOCKED', label: 'Unlocked' },
            { id: 'LOCKED', label: 'In Progress' },
            { id: 'DISTANCE', label: 'Distance' },
            { id: 'SAVINGS', label: 'Savings' },
            { id: 'ECO', label: 'Eco' },
            { id: 'HEALTH', label: 'Battery' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filteredBadges.map((badge) => {
            const title =
              badge.title?.[currentLanguage] ||
              badge.title?.en ||
              badge.titleKey ||
              'EV Milestone';
            const desc =
              badge.description?.[currentLanguage] ||
              badge.description?.en ||
              badge.descKey ||
              'Electric vehicle performance achievement';

            const progress = badge.progress || 0;
            const maxProgress = badge.maxProgress || 1;
            const badgePercent = Math.min(100, Math.round((progress / maxProgress) * 100));

            return (
              <div
                key={badge.id}
                onClick={badge.unlocked ? triggerCelebrate : undefined}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  badge.unlocked
                    ? 'bg-slate-950 border-amber-500/40 shadow-lg cursor-pointer hover:border-amber-400 hover:scale-[1.01]'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      badge.unlocked
                        ? 'bg-amber-500/20 border border-amber-500/40 ring-1 ring-amber-400/20'
                        : 'bg-slate-800 border border-slate-700 opacity-60'
                    }`}
                  >
                    {getBadgeIcon(badge)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{title}</h4>
                      {badge.unlocked ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>{badgePercent}%</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{desc}</p>
                  </div>
                </div>

                {/* Progress Bar & Reward Info */}
                <div className="pt-2 border-t border-slate-900 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">
                      {badge.unlocked
                        ? `Achieved on ${badge.unlockedDate || badge.unlockedAt || 'Recently'}`
                        : `Progress: ${progress.toLocaleString()} / ${maxProgress.toLocaleString()}`}
                    </span>
                    {badge.rewardPkr && (
                      <span className="text-amber-400 font-bold">
                        +{badge.rewardPkr} PKR
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.unlocked ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${badge.unlocked ? 100 : badgePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Keep logging rides and charges to unlock rewards!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition ml-auto"
          >
            {t.close_btn || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
