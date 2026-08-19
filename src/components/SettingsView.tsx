import React, { useState } from 'react';
import {
  User,
  Bike,
  HelpCircle,
  Mail,
  ShieldCheck,
  LogOut,
  MapPin,
  LocateFixed,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Key,
  Flame,
  BatteryCharging,
  Zap,
} from 'lucide-react';
import {
  UserProfile,
  Language,
  Vehicle,
  FuelRatesConfig,
} from '../types';
import { translations } from '../translations';
import { FAQ_ITEMS } from '../data/mockData';
import { AppStorage } from '../utils/storage';

interface SettingsViewProps {
  user: UserProfile;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onUpdateUser: (user: UserProfile) => void;
  onOpenDomainModal?: () => void;
  onOpenLegalModal?: (type: 'privacy' | 'terms') => void;
  onOpenProModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
  fuelRates?: FuelRatesConfig;
  vehicles?: Vehicle[];
  activeVehicle?: Vehicle | null;
  onSaveVehicle?: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (id: string) => void;
  onSelectPrimaryVehicle?: (id: string) => void;
  onOpenGarageTab?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  currentLanguage,
  onLanguageChange,
  onUpdateUser,
  onOpenDomainModal,
  onOpenLegalModal,
  onOpenProModal,
  onOpenAdminModal,
  onLogout,
  fuelRates,
  vehicles = [],
  activeVehicle = null,
  onSaveVehicle,
  onDeleteVehicle,
  onSelectPrimaryVehicle,
  onOpenGarageTab,
}) => {
  const t = translations[currentLanguage];

  // Active section inside Settings: 'profile' | 'garage' | 'support'
  const [activeSection, setActiveSection] = useState<'profile' | 'garage' | 'support'>('profile');

  // Profile Edit State
  const [nameInput, setNameInput] = useState<string>(user.name || '');
  const [emailInput, setEmailInput] = useState<string>(user.email || '');
  const [phoneInput, setPhoneInput] = useState<string>(user.phone || '');
  const [cityInput, setCityInput] = useState<string>(user.city || '');
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Expandable FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      name: nameInput.trim() || 'EV Rider',
      email: emailInput.trim(),
      phone: phoneInput.trim(),
      city: cityInput.trim() || 'Pakistan',
    };
    onUpdateUser(updatedUser);
    AppStorage.saveUser(updatedUser);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Real browser GPS auto-detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingGPS(false);
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.state ||
            'Pakistan';
          setCityInput(detectedCity);
          const updatedUser: UserProfile = {
            ...user,
            city: detectedCity,
            locationCoords: { lat: latitude, lng: longitude },
          };
          onUpdateUser(updatedUser);
          AppStorage.saveUser(updatedUser);
          setSaveSuccessMsg(`GPS Location detected: ${detectedCity}`);
          setTimeout(() => setSaveSuccessMsg(''), 3000);
        } catch {
          setCityInput(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
        }
      },
      (err) => {
        setIsDetectingGPS(false);
        alert(`Could not detect location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
              System Settings & Controls
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t.settings_title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your rider identity, connected garage vehicles, and get instant customer support.
          </p>
        </div>

        {/* Pro / Rider Status Badge */}
        <div className="flex items-center gap-2">
          {user.isPro ? (
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRO Active</span>
            </div>
          ) : (
            <button
              onClick={onOpenProModal}
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock PRO</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Clean List-Based Vertical Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4-Cols: Vertical Navigation Menu */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl space-y-1.5">
            <button
              onClick={() => setActiveSection('profile')}
              id="settings-nav-profile"
              className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                activeSection === 'profile'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shadow-lg shadow-emerald-950/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    activeSection === 'profile'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">Profile</div>
                  <div className="text-[11px] text-slate-400">Identity, GPS & Account</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setActiveSection('garage')}
              id="settings-nav-garage"
              className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                activeSection === 'garage'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shadow-lg shadow-emerald-950/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    activeSection === 'garage'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">Garage Management</div>
                  <div className="text-[11px] text-slate-400">
                    {vehicles.length} {vehicles.length === 1 ? 'EV Bike' : 'EV Bikes'} Connected
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setActiveSection('support')}
              id="settings-nav-support"
              className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                activeSection === 'support'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shadow-lg shadow-emerald-950/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    activeSection === 'support'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">Help & Support</div>
                  <div className="text-[11px] text-slate-400">Email Support, FAQs & Portal</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Quick Logout Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <button
              onClick={onLogout}
              id="settings-logout-btn"
              className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Log Out of EV Tracker</span>
            </button>
          </div>
        </div>

        {/* Right 8-Cols: Content Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* ==================================================== */}
          {/* SECTION 1: PROFILE */}
          {/* ==================================================== */}
          {activeSection === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg font-black">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {user.name || 'EV Rider'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {user.email || user.phone || 'No identifier registered'}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                  Member since {user.joinedDate || '2026'}
                </span>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. rider@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. 03001234567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      City / Location
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="e.g. Lahore, Pakistan"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        disabled={isDetectingGPS}
                        title="Detect real coordinates with browser GPS"
                        className="px-3 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-bold transition shrink-0 flex items-center gap-1.5"
                      >
                        <LocateFixed className={`w-3.5 h-3.5 ${isDetectingGPS ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Detect GPS</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Profile changes are securely saved in your browser state.
                  </span>
                  <button
                    type="submit"
                    id="save-profile-btn"
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 2: GARAGE MANAGEMENT */}
          {/* ==================================================== */}
          {activeSection === 'garage' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Garage Management
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View, switch, or manage all electric bikes registered in your profile.
                  </p>
                </div>

                {onOpenGarageTab && (
                  <button
                    onClick={onOpenGarageTab}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New EV Bike</span>
                  </button>
                )}
              </div>

              {vehicles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No EV Bikes in Garage</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      You have not registered any electric motorbike yet. Add your Evee, Metro, Yadea, or custom build to start live tracking.
                    </p>
                  </div>
                  {onOpenGarageTab && (
                    <button
                      onClick={onOpenGarageTab}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First EV Bike</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((v) => {
                    const isPrimary = activeVehicle?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPrimary
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                isPrimary
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              <Bike className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {v.nickname || `${v.brand} ${v.model}`}
                                </span>
                                {isPrimary && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Primary Active
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                                {v.nominalVoltage}V ({v.batteryChemistry.replace('_', ' ')}) • {v.batteryCapacityAh}Ah • {v.odometerKm || 0} km
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {!isPrimary && onSelectPrimaryVehicle && (
                              <button
                                onClick={() => onSelectPrimaryVehicle(v.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                              >
                                Set as Primary
                              </button>
                            )}

                            {onDeleteVehicle && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove ${v.nickname || v.model} from garage?`)) {
                                    onDeleteVehicle(v.id);
                                  }
                                }}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition"
                                title="Delete Vehicle"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION 3: HELP & SUPPORT */}
          {/* ==================================================== */}
          {activeSection === 'support' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Help & Customer Support
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reach out to the EV Tracker Pakistan technical support team or explore troubleshooting guides.
                </p>
              </div>

              {/* Direct Email Support Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Official Email Support</h4>
                    <p className="text-xs text-slate-400">
                      Direct inquiries, telemetry calibration requests & bug reports:
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 truncate">
                    evtrackerpk.support@gmail.com
                  </span>
                  <a
                    href="mailto:evtrackerpk.support@gmail.com?subject=EV%20Tracker%20PK%20Support%20Request"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <span>Compose Email</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* EV Battery Care & FAQ Accordion */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  <span>EV Battery Knowledge Base & FAQs</span>
                </h4>

                <div className="space-y-2">
                  {FAQ_ITEMS.map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    const question =
                      currentLanguage === 'ur'
                        ? faq.q_ur
                        : currentLanguage === 'roman'
                        ? faq.q_roman
                        : faq.q_en;
                    const answer =
                      currentLanguage === 'ur'
                        ? faq.a_ur
                        : currentLanguage === 'roman'
                        ? faq.a_roman
                        : faq.a_en;

                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                          className="w-full text-left p-3.5 flex items-center justify-between gap-3 text-xs font-bold text-slate-200 hover:text-white transition"
                        >
                          <span>{question}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-2.5">
                            {answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin Portal Access Trigger */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-300">Admin Control Center</div>
                  <div className="text-[11px] text-slate-500">Manage store catalog & fuel tariff rates</div>
                </div>
                <button
                  type="button"
                  onClick={onOpenAdminModal}
                  id="settings-admin-portal-btn"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
