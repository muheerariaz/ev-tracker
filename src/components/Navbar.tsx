import React from 'react';
import {
  Zap,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  User,
  Plus,
} from 'lucide-react';
import { Vehicle, Language, ThemeMode, UserProfile } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeVehicle: Vehicle | null;
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle | string) => void;
  onOpenGarageModal?: () => void;
  onOpenGarage?: () => void;
  onOpenProModal: () => void;
  onOpenAuthModal: () => void;
  user: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  activeVehicle,
  vehicles,
  onSelectVehicle,
  onOpenGarageModal,
  onOpenGarage,
  onOpenProModal,
  onOpenAuthModal,
  user,
}) => {
  const [garageDropdownOpen, setGarageDropdownOpen] = React.useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);

  const t = translations[currentLanguage];

  const handleOpenGarage = () => {
    if (onOpenGarageModal) onOpenGarageModal();
    if (onOpenGarage) onOpenGarage();
  };

  const languageLabels: Record<Language, { label: string; flag: string }> = {
    en: { label: 'English', flag: '🇬🇧' },
    ur: { label: 'اردو', flag: '🇵🇰' },
    roman: { label: 'Roman Urdu', flag: '🇵🇰' },
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/90 dark:bg-slate-950/90 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40">
            <Zap className="w-5 h-5 fill-current animate-pulse text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                EV Tracker
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PK 72V
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium truncate max-w-[200px] md:max-w-none">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center: Active Scooter Selector (Quick Switcher) */}
        {activeVehicle && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setGarageDropdownOpen(!garageDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-sm font-medium text-slate-200 transition"
              id="navbar-scooter-dropdown"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left leading-tight">
                <span className="font-semibold text-slate-100">{activeVehicle.model}</span>
                <span className="text-[10px] block text-emerald-400/90 font-mono">
                  {activeVehicle.currentVoltage.toFixed(1)}V • {activeVehicle.batteryCapacityAh}Ah ({activeVehicle.nominalVoltage}V)
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {garageDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-semibold uppercase text-slate-400 px-2 py-1">
                  {t.garage_title}
                </div>
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectVehicle(v);
                      setGarageDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition ${
                      v.id === activeVehicle.id
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">{v.model}</div>
                      <div className="text-xs text-slate-400 font-mono">{v.brand} • {v.nickname || 'Default'}</div>
                    </div>
                    {v.id === activeVehicle.id && (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    setGarageDropdownOpen(false);
                    handleOpenGarage();
                  }}
                  className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.add_scooter}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Controls: Pro, Language, Theme, User */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PRO Button */}
          <button
            onClick={onOpenProModal}
            id="nav-upgrade-pro-btn"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              user.isPro
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 ring-1 ring-emerald-400/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {user.isPro ? t.pro_member : t.upgrade_pro}
            </span>
            <span className="sm:hidden">{user.isPro ? 'PRO' : 'PRO'}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              id="nav-lang-btn"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold">{languageLabels[currentLanguage].flag}</span>
              <span className="hidden md:inline">{languageLabels[currentLanguage].label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 animate-in fade-in">
                {(['en', 'ur', 'roman'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onLanguageChange(lang);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between font-medium ${
                      currentLanguage === lang
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{languageLabels[lang].flag} {languageLabels[lang].label}</span>
                    {currentLanguage === lang && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          <button
            onClick={onOpenAuthModal}
            id="nav-user-profile-btn"
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[11px]">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:inline max-w-[90px] truncate text-slate-200 font-semibold">
              {(user.name || 'Rider').split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
