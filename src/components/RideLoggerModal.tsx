import React, { useState } from 'react';
import {
  PlayCircle,
  Calendar,
  Clock,
  Zap,
  Gauge,
  User,
  Users,
  Package,
  Layers,
  Sparkles,
  X,
  Coins,
} from 'lucide-react';
import { Vehicle, RideLog, Language } from '../types';
import { translations } from '../translations';

interface RideLoggerModalProps {
  vehicle: Vehicle;
  currentLanguage: Language;
  onClose: () => void;
  onSaveRide: (ride: RideLog, updatedVehicleVoltage: number, updatedOdo: number) => void;
}

export const RideLoggerModal: React.FC<RideLoggerModalProps> = ({
  vehicle,
  currentLanguage,
  onClose,
  onSaveRide,
}) => {
  const t = translations[currentLanguage];

  // Format local ISO string for datetime-local input
  const getInitialDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const [dateTime, setDateTime] = useState<string>(getInitialDateTime());
  const [distanceKm, setDistanceKm] = useState<number>(18.5);
  const [startVoltage, setStartVoltage] = useState<number>(vehicle.currentVoltage);
  const [endVoltage, setEndVoltage] = useState<number>(Math.max(vehicle.cutoffVoltage + 1, Math.round((vehicle.currentVoltage - 2.8) * 10) / 10));
  const [durationMinutes, setDurationMinutes] = useState<number>(35);
  const [rideMode, setRideMode] = useState<'ECO' | 'NORMAL' | 'SPORT'>('NORMAL');
  const [passengerLoad, setPassengerLoad] = useState<'SINGLE' | 'DOUBLE' | 'CARGO'>('SINGLE');
  const [terrain, setTerrain] = useState<'FLAT' | 'SLOPED' | 'ROUGH_CITY'>('FLAT');
  const [notes, setNotes] = useState<string>('');

  const voltageDrop = Math.max(0, Math.round((startVoltage - endVoltage) * 10) / 10);
  const vPerKm = distanceKm > 0 ? (voltageDrop / distanceKm).toFixed(3) : '0.000';
  const pkrSavedThisRide = Math.round(distanceKm * 6.4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRide: RideLog = {
      id: `ride_${Date.now()}`,
      vehicleId: vehicle.id,
      dateTime: new Date(dateTime).toISOString(),
      distanceKm,
      durationMinutes,
      startVoltage,
      endVoltage,
      rideMode,
      passengerLoad,
      terrain,
      notes: notes.trim(),
      avgSpeedKmh: durationMinutes > 0 ? Math.round((distanceKm / (durationMinutes / 60)) * 10) / 10 : 35,
    };

    const newOdometer = vehicle.odometerKm + distanceKm;
    onSaveRide(newRide, endVoltage, newOdometer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100">
                {t.log_ride_title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {vehicle.brand} {vehicle.model}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Custom Date & Time Picker */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.ride_date_time} (Retroactive Logging)</span>
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Distance & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.distance_km}</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="300"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.ride_duration_min}</span>
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Starting & Ending Voltage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.start_voltage}</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={vehicle.cutoffVoltage}
                max={vehicle.fullVoltage}
                value={startVoltage}
                onChange={(e) => setStartVoltage(parseFloat(e.target.value) || vehicle.cutoffVoltage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.end_voltage}</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={vehicle.cutoffVoltage}
                max={vehicle.fullVoltage}
                value={endVoltage}
                onChange={(e) => setEndVoltage(parseFloat(e.target.value) || vehicle.cutoffVoltage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-400 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          {/* Quick Metrics Calculation Banner */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">{t.voltage_drop_calc}:</span>
              <strong className="text-amber-400 font-mono text-sm">-{voltageDrop} V</strong>
              <span className="text-[10px] text-slate-500 ml-1">({vPerKm} V/km)</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">PKR Saved on Petrol:</span>
              <strong className="text-emerald-400 font-mono text-sm flex items-center justify-end gap-1">
                <Coins className="w-3.5 h-3.5" />
                Rs. {pkrSavedThisRide}
              </strong>
            </div>
          </div>

          {/* Mode & Load Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {t.riding_mode}
              </label>
              <select
                value={rideMode}
                onChange={(e) => setRideMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ECO">Eco (35 km/h)</option>
                <option value="NORMAL">City Normal (48 km/h)</option>
                <option value="SPORT">Sport / Turbo (65 km/h)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {t.rider_load}
              </label>
              <select
                value={passengerLoad}
                onChange={(e) => setPassengerLoad(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="SINGLE">Single Rider (75kg)</option>
                <option value="DOUBLE">Pillion / Double (145kg)</option>
                <option value="CARGO">Cargo / Delivery (180kg)</option>
              </select>
            </div>
          </div>

          {/* Road Condition / Terrain */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {t.road_condition}
            </label>
            <select
              value={terrain}
              onChange={(e) => setTerrain(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="FLAT">{t.terrain_flat}</option>
              <option value="SLOPED">{t.terrain_sloped}</option>
              <option value="ROUGH_CITY">{t.terrain_rough}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {t.notes_optional}
            </label>
            <input
              type="text"
              placeholder="e.g. Lahore Canal Road commute, no headwinds"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-ride-log-submit-btn"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition"
            >
              {t.save_ride_log}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
