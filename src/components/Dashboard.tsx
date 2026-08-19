import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  BatteryCharging,
  Gauge,
  Leaf,
  Coins,
  TrendingUp,
  Activity,
  PlusCircle,
  PlayCircle,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sun,
  CloudSun,
  Snowflake,
  Users,
  User as UserIcon,
  Package,
  Lightbulb,
  Award,
  ChevronRight,
  ArrowUpRight,
  Scale,
  Bike,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Vehicle, Language, Badge, FuelRatesConfig, RiderLoad } from '../types';
import { translations } from '../translations';
import {
  calculateEstimatedRange,
  calculateStateOfCharge,
  calculateSavings,
  generateDischargeCurveData,
} from '../utils/calculations';
import { AppStorage } from '../utils/storage';

interface DashboardProps {
  vehicle: Vehicle | null;
  currentLanguage: Language;
  badges: Badge[];
  user?: any;
  rides?: any[];
  fuelRates?: FuelRatesConfig;
  onOpenRideLogger: () => void;
  onOpenChargeLogger: () => void;
  onOpenSlopeTool?: () => void;
  onOpenSlopeCalculator?: () => void;
  onOpenBadgeModal?: (badge?: Badge) => void;
  onOpenBadgesModal?: () => void;
  onOpenGarageView?: () => void;
  onOpenGarage?: () => void;
  onOpenTracking?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vehicle,
  currentLanguage,
  badges,
  fuelRates,
  onOpenRideLogger,
  onOpenChargeLogger,
  onOpenSlopeTool,
  onOpenSlopeCalculator,
  onOpenBadgeModal,
  onOpenBadgesModal,
  onOpenGarageView,
  onOpenGarage,
  onOpenTracking,
}) => {
  const t = translations[currentLanguage];

  // If no vehicle exists in garage
  if (!vehicle) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-5 my-8 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <Bike className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">No EV Bike Connected</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Your garage is empty. Add your electric scooter or motorbike (Evee, Metro, Yadea, Vlektra, Crown, etc.) to start tracking real-time range, battery sag, and fuel savings.
          </p>
        </div>
        <button
          onClick={onOpenGarage || onOpenGarageView}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/20 inline-flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your EV Bike to Garage</span>
        </button>
      </div>
    );
  }

  // Load persistent simulator state
  const savedSim = useMemo(() => AppStorage.getSimulatorState(), []);

  // Simulator controls
  const [simVoltage, setSimVoltage] = useState<number>(
    savedSim.voltage && savedSim.voltage >= vehicle.cutoffVoltage && savedSim.voltage <= vehicle.fullVoltage
      ? savedSim.voltage
      : vehicle.currentVoltage
  );
  const [simMode, setSimMode] = useState<'ECO' | 'NORMAL' | 'SPORT'>(savedSim.ridingMode || 'NORMAL');
  const [simLoad, setSimLoad] = useState<RiderLoad>(savedSim.riderLoad || 'SINGLE');
  const [customWeightKg, setCustomWeightKg] = useState<number>(savedSim.customRiderWeightKg || 85);
  const [simTemp, setSimTemp] = useState<'SUMMER' | 'SPRING' | 'WINTER'>(savedSim.temperature || 'SPRING');
  const [simHeadlight, setSimHeadlight] = useState<boolean>(savedSim.headlightOn || false);

  // Sync simulator slider if current vehicle voltage changes
  useEffect(() => {
    setSimVoltage(vehicle.currentVoltage);
  }, [vehicle.currentVoltage, vehicle.id]);

  // Persist simulator state on adjustments
  useEffect(() => {
    AppStorage.saveSimulatorState({
      voltage: simVoltage,
      ridingMode: simMode,
      riderLoad: simLoad,
      customRiderWeightKg: customWeightKg,
      temperature: simTemp,
      headlightOn: simHeadlight,
    });
  }, [simVoltage, simMode, simLoad, customWeightKg, simTemp, simHeadlight]);

  // Calculations for current vehicle state
  const currentRangeData = useMemo(() => {
    return calculateEstimatedRange(
      vehicle.currentVoltage,
      vehicle,
      'NORMAL',
      'SINGLE',
      'SPRING',
      false
    );
  }, [vehicle]);

  // Calculations for simulated state
  const simResult = useMemo(() => {
    return calculateEstimatedRange(
      simVoltage,
      vehicle,
      simMode,
      simLoad,
      simTemp,
      simHeadlight,
      customWeightKg
    );
  }, [simVoltage, vehicle, simMode, simLoad, simTemp, simHeadlight, customWeightKg]);

  // Savings
  const savings = useMemo(() => {
    return calculateSavings(vehicle.odometerKm, fuelRates);
  }, [vehicle.odometerKm, fuelRates]);


  // Chart data
  const chartData = useMemo(() => {
    return generateDischargeCurveData(
      vehicle.fullVoltage,
      vehicle.cutoffVoltage,
      simVoltage,
      Math.max(50, Math.round((vehicle.batteryCapacityAh / 32) * 75))
    );
  }, [vehicle, simVoltage]);

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-5 pb-6">
      {/* Top Banner Card: EV Health & Battery Metrics */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-4 sm:p-6 shadow-xl">
        {/* Subtle glow background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {vehicle.brand} • {vehicle.batteryChemistry.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {vehicle.registrationNumber || 'EV-PK'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              {vehicle.model}
              {vehicle.nickname && (
                <span className="text-sm font-medium text-slate-400">
                  ("{vehicle.nickname}")
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.total_km_tracked}: <span className="font-bold text-slate-200 font-mono">{vehicle.odometerKm.toLocaleString()} km</span> • Motor: <span className="font-semibold text-slate-300">{vehicle.motorWattage}W</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGarageView}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Garage Specs</span>
            </button>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {/* Voltage Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
              <span>{t.realtime_voltage}</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
                {vehicle.currentVoltage.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-amber-400">V</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Safe: {vehicle.cutoffVoltage}V - {vehicle.fullVoltage}V
            </div>
          </div>

          {/* State of Charge (SoC) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
              <span>{t.state_of_charge}</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {currentRangeData.socPercent}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  currentRangeData.socPercent > 40
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : currentRangeData.socPercent > 20
                    ? 'bg-amber-400'
                    : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${currentRangeData.socPercent}%` }}
              />
            </div>
          </div>

          {/* Est Range Left */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
              <span>{t.est_range_left}</span>
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                ~{currentRangeData.rangeKm}
              </span>
              <span className="text-xs font-bold text-slate-400">km</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Based on single rider flat terrain
            </div>
          </div>

          {/* Battery Health SOH */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
              <span>{t.battery_health} (SOH)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-teal-300 font-mono">
                {vehicle.healthPercentage}%
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Graphene</span>
            </div>
            <div className="text-[11px] text-emerald-400/90 mt-1 font-medium">
              Optimal Pack Balance
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={onOpenTracking}
          id="quick-live-gps-tracking-btn"
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-sky-500/25 active:scale-98 relative overflow-hidden"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="text-center">{t.nav_tracking || 'Live GPS Route'}</span>
        </button>

        <button
          onClick={onOpenRideLogger}
          id="quick-log-ride-btn"
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/20 active:scale-98"
        >
          <PlayCircle className="w-4 h-4 shrink-0" />
          <span className="text-center">{t.log_ride_btn}</span>
        </button>

        <button
          onClick={onOpenChargeLogger}
          id="quick-log-charge-btn"
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/20 active:scale-98"
        >
          <BatteryCharging className="w-4 h-4 shrink-0" />
          <span className="text-center">{t.log_charge_btn}</span>
        </button>

        <button
          onClick={onOpenSlopeTool || onOpenSlopeCalculator}
          id="quick-test-slope-btn"
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition shadow-md active:scale-98"
        >
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-center">{t.test_slope_btn}</span>
        </button>
      </div>

      {/* Interactive Voltage & Range Simulator Slider */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                {t.voltage_range_simulator}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.simulator_desc}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Simulation:</span>
            <span className="text-sm font-black text-amber-400 font-mono">{simVoltage.toFixed(1)} V</span>
            <span className="text-xs font-bold text-emerald-400">({simResult.socPercent}%)</span>
            <span className="text-xs font-extrabold text-cyan-300 font-mono">→ ~{simResult.rangeKm} km</span>
          </div>
        </div>

        {/* Voltage Range Slider Control */}
        <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span className="text-rose-400 flex items-center gap-1 font-mono">
              <AlertTriangle className="w-3 h-3" /> Cutoff: {vehicle.cutoffVoltage}V
            </span>
            <span className="text-amber-400 font-mono">Safe Alert: 66.0V</span>
            <span className="text-emerald-400 font-mono">100% Full: {vehicle.fullVoltage}V</span>
          </div>

          <input
            type="range"
            min={vehicle.cutoffVoltage}
            max={vehicle.fullVoltage}
            step="0.1"
            value={simVoltage}
            onChange={(e) => setSimVoltage(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            id="voltage-simulator-slider"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0% (Empty)</span>
            <span>25%</span>
            <span>50% (Nominal Plateau)</span>
            <span>75%</span>
            <span>100% (Charged)</span>
          </div>
        </div>

        {/* Multi-Condition Simulator Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Riding Mode Switch */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">
              {t.riding_mode}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['ECO', 'NORMAL', 'SPORT'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSimMode(m)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    simMode === m
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Load & Custom Weight Switch */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                {t.rider_load}
              </label>
              {simLoad === 'CUSTOM' && (
                <span className="text-[11px] font-mono text-cyan-400 font-bold">{customWeightKg} kg</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setSimLoad('SINGLE')}
                className={`py-1.5 px-0.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-0.5 ${
                  simLoad === 'SINGLE'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="Single Rider 75kg"
              >
                <UserIcon className="w-3 h-3" />
                <span>Single</span>
              </button>
              <button
                onClick={() => setSimLoad('DOUBLE')}
                className={`py-1.5 px-0.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-0.5 ${
                  simLoad === 'DOUBLE'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="Double Rider 145kg"
              >
                <Users className="w-3 h-3" />
                <span>Double</span>
              </button>
              <button
                onClick={() => setSimLoad('CARGO')}
                className={`py-1.5 px-0.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-0.5 ${
                  simLoad === 'CARGO'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="Heavy Cargo 180kg"
              >
                <Package className="w-3 h-3" />
                <span>Cargo</span>
              </button>
              <button
                onClick={() => setSimLoad('CUSTOM')}
                className={`py-1.5 px-0.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-0.5 ${
                  simLoad === 'CUSTOM'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="Custom Weight (kg)"
              >
                <Scale className="w-3 h-3" />
                <span>Custom</span>
              </button>
            </div>
            {simLoad === 'CUSTOM' && (
              <div className="mt-2 flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold">Rider Weight:</span>
                <input
                  type="number"
                  min="40"
                  max="250"
                  value={customWeightKg}
                  onChange={(e) => setCustomWeightKg(Math.max(30, Math.min(250, parseInt(e.target.value) || 80)))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-cyan-300 font-mono text-center font-bold"
                />
                <span className="text-[10px] text-slate-400">kg</span>
              </div>
            )}
          </div>


          {/* Temperature / Weather */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">
              {t.temp_ambient}
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setSimTemp('SPRING')}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                  simTemp === 'SPRING'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="25°C Mild"
              >
                <CloudSun className="w-3 h-3" />
                <span>25°C</span>
              </button>
              <button
                onClick={() => setSimTemp('SUMMER')}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                  simTemp === 'SUMMER'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="38°C+ Hot"
              >
                <Sun className="w-3 h-3" />
                <span>38°C</span>
              </button>
              <button
                onClick={() => setSimTemp('WINTER')}
                className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                  simTemp === 'WINTER'
                    ? 'bg-blue-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                title="12°C Cold"
              >
                <Snowflake className="w-3 h-3" />
                <span>12°C</span>
              </button>
            </div>
          </div>

          {/* Headlight / AC Load Switch */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between">
            <label className="text-[11px] font-bold text-slate-400 block uppercase tracking-wide">
              Electrical Load
            </label>
            <button
              onClick={() => setSimHeadlight(!simHeadlight)}
              className={`w-full py-1.5 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                simHeadlight
                  ? 'bg-yellow-400 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{simHeadlight ? 'Headlight ON (-4%)' : 'Headlight OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Voltage Degradation / Discharge Curve Graph */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                {t.discharge_curve_title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.discharge_curve_sub}
            </p>
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 78.5V Full
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> 66V Reserve
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> 62V Cutoff
            </span>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="km"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[60, 80]}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
                unit="V"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(value: any) => [`${value} Volts`, 'Battery Voltage']}
                labelFormatter={(label) => `Distance Travelled: ${label}`}
              />
              <ReferenceLine y={66.0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Reserve 66V', fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }} />
              <ReferenceLine y={62.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Cutoff 62V', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
              <Area
                type="monotone"
                dataKey="voltage"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#voltageGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environmental Carbon & Money Savings Counter */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
              {t.eco_savings_title}
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            PKR 280/L Petrol Rate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20">
            <div className="text-xs text-slate-400 font-medium mb-1">
              {t.pkr_saved}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                Rs. {savings.pkrSaved.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ~PKR 6.4 saved for every 1 km driven
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-500/20">
            <div className="text-xs text-slate-400 font-medium mb-1">
              {t.co2_offset}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-teal-300 font-mono">
                {savings.co2KgOffset}
              </span>
              <span className="text-sm font-bold text-teal-400">kg CO₂</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Equivalent to {savings.treesEquivalent} urban trees planted
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20">
            <div className="text-xs text-slate-400 font-medium mb-1">
              Total Zero-Emission Travel
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {vehicle.odometerKm.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-cyan-400">km</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {vehicle.nickname || vehicle.model} fleet lifetime
            </p>
          </div>
        </div>
      </div>

      {/* Gamification Badges Preview Strip */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                {t.gamification_badges}
              </h2>
              <p className="text-xs text-slate-400">
                Unlocked {unlockedBadgesCount} of {badges.length} rider milestones
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onOpenBadgesModal) onOpenBadgesModal();
              else if (onOpenBadgeModal) onOpenBadgeModal();
            }}
            id="view-all-badges-btn"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>{t.view_all_badges}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          {badges.slice(0, 4).map((badge) => (
            <div
              key={badge.id}
              onClick={() => {
                if (onOpenBadgesModal) onOpenBadgesModal();
                else if (onOpenBadgeModal) onOpenBadgeModal(badge);
              }}
              className={`p-3 rounded-xl border transition cursor-pointer flex flex-col items-center text-center ${
                badge.unlocked
                  ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
                  : 'bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow ${
                  badge.unlocked
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 ring-2 ring-amber-400/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-100 line-clamp-1">
                {badge.titleKey}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {badge.unlocked ? 'Unlocked ✓' : `${badge.progress}/${badge.maxProgress}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
