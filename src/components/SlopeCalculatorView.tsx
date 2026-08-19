import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Zap,
  Gauge,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Info,
  User,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Vehicle, Language } from '../types';
import { translations } from '../translations';
import { calculateHillClimb } from '../utils/calculations';

interface SlopeCalculatorViewProps {
  vehicle: Vehicle;
  currentLanguage: Language;
}

export const SlopeCalculatorView: React.FC<SlopeCalculatorViewProps> = ({
  vehicle,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  const [inclineGrade, setInclineGrade] = useState<number>(8); // 8%
  const [motorWattage, setMotorWattage] = useState<number>(vehicle.motorWattage || 1500);
  const [voltage, setVoltage] = useState<number>(vehicle.nominalVoltage || 72);
  const [riderWeightKg, setRiderWeightKg] = useState<number>(75);

  const result = useMemo(() => {
    return calculateHillClimb(inclineGrade, motorWattage, voltage, 'CUSTOM', riderWeightKg || 75);
  }, [inclineGrade, motorWattage, voltage, riderWeightKg]);

  const angleDeg = Math.round(Math.atan(inclineGrade / 100) * (180 / Math.PI) * 10) / 10;
  const totalWeight = 85 + (riderWeightKg || 75); // 85kg scooter + custom payload
  const gravityForce = Math.round(9.81 * totalWeight * Math.sin(Math.atan(inclineGrade / 100)));

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
            {t.hill_climb_title}
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {t.hill_climb_sub}
        </p>
      </div>

      {/* Main Grid: Controls & Animated Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Sliders & Parameter Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Elevation Presets */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              {t.incline_presets}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInclineGrade(5)}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition ${
                  inclineGrade === 5
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold block text-slate-100">City Flyover (5%)</span>
                <span className="text-[10px] text-slate-400">Kalma / Canal bridge</span>
              </button>

              <button
                type="button"
                onClick={() => setInclineGrade(9)}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition ${
                  inclineGrade === 9
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold block text-slate-100">Underpass Ramp (9%)</span>
                <span className="text-[10px] text-slate-400">Steep city underpasses</span>
              </button>

              <button
                type="button"
                onClick={() => setInclineGrade(14)}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition ${
                  inclineGrade === 14
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold block text-slate-100">Margalla Hills (14%)</span>
                <span className="text-[10px] text-slate-400">Islamabad / Murree road</span>
              </button>

              <button
                type="button"
                onClick={() => setInclineGrade(20)}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition ${
                  inclineGrade === 20
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold block text-slate-100">Basement Ramp (20%)</span>
                <span className="text-[10px] text-slate-400">Mall parking exit</span>
              </button>
            </div>
          </div>

          {/* Incline Angle Slider */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                {t.incline_angle}
              </label>
              <div className="flex items-center gap-1.5 font-mono text-sm font-black text-amber-400">
                <span>{inclineGrade}%</span>
                <span className="text-xs text-slate-400">({angleDeg}°)</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={inclineGrade}
              onChange={(e) => setInclineGrade(parseInt(e.target.value) || 0)}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              id="slope-incline-slider"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0% (Flat Road)</span>
              <span>8% (Flyover)</span>
              <span>15% (Mountain)</span>
              <span>25% (Extreme Ramp)</span>
            </div>
          </div>

          {/* Motor Power, Voltage, and Custom Weight (kg) Text Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Motor Wattage */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                Motor Peak Power
              </label>
              <select
                value={motorWattage}
                onChange={(e) => setMotorWattage(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value={800}>800W (Entry)</option>
                <option value={1000}>1000W (Standard)</option>
                <option value={1200}>1200W (T5 / Metro)</option>
                <option value={1500}>1500W (Gen Z Pro)</option>
                <option value={2000}>2000W (High Torque)</option>
                <option value={3000}>3000W (Dual Motor)</option>
              </select>
            </div>

            {/* Voltage */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                Battery Voltage
              </label>
              <select
                value={voltage}
                onChange={(e) => setVoltage(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value={48}>48V System</option>
                <option value={60}>60V System</option>
                <option value={72}>72V System (Standard)</option>
              </select>
            </div>

            {/* Custom Rider & Payload Weight (kg) Input */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custom Weight</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-amber-400">KG</span>
              </div>
              <input
                type="number"
                min="30"
                max="300"
                step="1"
                value={riderWeightKg}
                onChange={(e) => setRiderWeightKg(Math.max(1, Number(e.target.value)))}
                placeholder="75"
                id="custom-rider-weight-input"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Graphic & Output Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Animated Visual Slope Incline Stage */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col justify-between h-48 sm:h-56">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 z-10">
              <span>Visual Gradient Angle</span>
              <span className="text-amber-400 font-mono">{angleDeg}° Elevation</span>
            </div>

            {/* Dynamic CSS Incline SVG Graphic */}
            <div className="relative w-full h-28 flex items-end justify-center z-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                {/* Horizontal Baseline */}
                <line x1="10" y1="90" x2="290" y2="90" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                {/* Dynamic Slope Ramp */}
                <line
                  x1="20"
                  y1="90"
                  x2="280"
                  y2={Math.max(15, 90 - (inclineGrade / 25) * 75)}
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Scooter Marker on Ramp */}
                <circle
                  cx="150"
                  cy={90 - ((inclineGrade / 25) * 75) * 0.5}
                  r="7"
                  fill="#f59e0b"
                  className="animate-pulse"
                />
              </svg>
            </div>

            <div className="text-[11px] text-slate-400 text-center z-10 font-mono">
              Total Weight: {totalWeight} kg (Rider: {riderWeightKg}kg + Scooter: 85kg) • Gravity Force: {gravityForce} N
            </div>
          </div>

          {/* Results Telemetry Display */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Predicted Climb Performance
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 block">{t.ascent_speed}</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {result.estimatedSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 block">{t.current_draw}</span>
                <span className="text-xl font-black text-cyan-400 font-mono">
                  {result.currentDrawAmps} <span className="text-xs font-normal text-slate-400">Amps</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 block">{t.torque_required}</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {result.torqueNm} <span className="text-xs font-normal text-slate-400">Nm</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 block">{t.motor_temp}</span>
                <span
                  className={`text-sm font-black uppercase font-mono flex items-center gap-1 mt-1 ${
                    result.thermalStatus === 'COOL'
                      ? 'text-emerald-400'
                      : result.thermalStatus === 'WARM'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  <Thermometer className="w-4 h-4" />
                  {result.thermalStatus === 'COOL'
                    ? t.status_cool
                    : result.thermalStatus === 'WARM'
                    ? t.status_warm
                    : t.status_critical}
                </span>
              </div>
            </div>

            {/* Verdict Box */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                result.thermalStatus === 'CRITICAL'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : result.thermalStatus === 'WARM'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {result.thermalStatus === 'CRITICAL' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  {result.thermalStatus === 'CRITICAL'
                    ? 'Caution: Severe Incline Stress'
                    : result.thermalStatus === 'WARM'
                    ? 'Moderate Incline Load'
                    : 'Optimal Climbing Performance'}
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">{result.verdictDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
