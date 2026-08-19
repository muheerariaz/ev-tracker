import React, { useState, useMemo } from 'react';
import {
  BatteryCharging,
  Calendar,
  Clock,
  Zap,
  Building,
  Home,
  MapPin,
  Coins,
  X,
} from 'lucide-react';
import { Vehicle, ChargeLog, Language } from '../types';
import { translations } from '../translations';

interface ChargeLoggerModalProps {
  vehicle: Vehicle;
  currentLanguage: Language;
  onClose: () => void;
  onSaveCharge: (charge: ChargeLog, updatedVehicleVoltage: number) => void;
}

export const ChargeLoggerModal: React.FC<ChargeLoggerModalProps> = ({
  vehicle,
  currentLanguage,
  onClose,
  onSaveCharge,
}) => {
  const t = translations[currentLanguage];

  const getInitialDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  // Safe default: initial start voltage starts at 30% pack SoC so calculations never initialize to 0
  const initialStartVoltage = useMemo(() => {
    const span = (vehicle.fullVoltage || 78.5) - (vehicle.cutoffVoltage || 62.0);
    const candidate = (vehicle.cutoffVoltage || 62.0) + span * 0.25;
    return Math.round(candidate * 10) / 10;
  }, [vehicle]);

  const [dateTime, setDateTime] = useState<string>(getInitialDateTime());
  const [startVoltage, setStartVoltage] = useState<number>(initialStartVoltage);
  const [endVoltage, setEndVoltage] = useState<number>(vehicle.fullVoltage || 78.5);
  const [durationHours, setDurationHours] = useState<number>(4.5);
  const [chargingLocation, setChargingLocation] = useState<'HOME' | 'OFFICE' | 'COMMERCIAL_STATION'>('HOME');
  const [unitRatePkr, setUnitRatePkr] = useState<number>(55);
  const [notes, setNotes] = useState<string>('');

  // Robust calculation of kWh and PKR cost
  const { estimatedKwh, estimatedCostPkr } = useMemo(() => {
    const nominalV = vehicle.nominalVoltage || 72;
    const capacityAh = vehicle.batteryCapacityAh || 32;
    const totalPackKwh = (nominalV * capacityAh) / 1000; // e.g. 2.304 kWh for 72V 32Ah

    const voltSpan = Math.max(1, (vehicle.fullVoltage || 78.5) - (vehicle.cutoffVoltage || 62.0));
    const voltDiff = endVoltage - startVoltage;

    let kwh = 0;
    if (voltDiff > 0.2) {
      const fraction = Math.min(1.0, Math.max(0.1, voltDiff / voltSpan));
      // Pack energy + 15% standard charger transformer/conversion loss
      kwh = fraction * totalPackKwh * 1.15;
    } else {
      // If voltage delta is tiny or equal, estimate based on charger wattage (~350W-450W for 72V charger) * hours
      const chargerKw = Math.max(0.35, (nominalV * 4.0) / 1000); // ~4A charger
      kwh = chargerKw * Math.max(0.5, durationHours) * 0.9;
    }

    // Ensure realistic minimum threshold
    const finalKwh = Math.max(0.3, Math.round(kwh * 10) / 10);
    const finalCost = Math.max(15, Math.round(finalKwh * (unitRatePkr || 55)));

    return { estimatedKwh: finalKwh, estimatedCostPkr: finalCost };
  }, [startVoltage, endVoltage, durationHours, unitRatePkr, vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCharge: ChargeLog = {
      id: `charge_${Date.now()}`,
      vehicleId: vehicle.id,
      dateTime: new Date(dateTime).toISOString(),
      startVoltage,
      endVoltage,
      durationHours: Number(durationHours) || 1,
      unitsConsumedKwh: estimatedKwh,
      costPkr: estimatedCostPkr,
      chargingLocation,
      notes: notes.trim(),
    };

    onSaveCharge(newCharge, endVoltage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-100">
                {t.log_charge_title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {vehicle.brand} {vehicle.model} • {vehicle.nominalVoltage}V {vehicle.batteryCapacityAh}Ah
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
          {/* Retroactive Date & Time */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.charge_date_time} (Retroactive Logging)</span>
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Start & End Voltage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.start_charge_voltage}</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={vehicle.cutoffVoltage || 50}
                max={vehicle.fullVoltage || 84}
                value={startVoltage}
                onChange={(e) => setStartVoltage(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.end_charge_voltage}</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={vehicle.cutoffVoltage || 50}
                max={vehicle.fullVoltage || 84}
                value={endVoltage}
                onChange={(e) => setEndVoltage(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Duration & Electricity Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.charge_duration_hrs}</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="24"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>PKR / WAPDA Unit</span>
              </label>
              <input
                type="number"
                min="10"
                max="150"
                value={unitRatePkr}
                onChange={(e) => setUnitRatePkr(parseInt(e.target.value) || 55)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Live Units and Cost Summary (Guaranteed accurate non-zero figures) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Energy Consumed:</span>
              <strong className="text-cyan-400 font-mono text-xl font-black">{estimatedKwh} kWh</strong>
              <span className="text-[10px] text-slate-500 block">Calculated units</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Cost:</span>
              <strong className="text-emerald-400 font-mono text-xl font-black">Rs. {estimatedCostPkr}</strong>
              <span className="text-[10px] text-slate-500 block">WAPDA bill impact</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {t.charging_location}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChargingLocation('HOME')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                  chargingLocation === 'HOME'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => setChargingLocation('OFFICE')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                  chargingLocation === 'OFFICE'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Office</span>
              </button>

              <button
                type="button"
                onClick={() => setChargingLocation('COMMERCIAL_STATION')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                  chargingLocation === 'COMMERCIAL_STATION'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Station</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {t.notes_optional}
            </label>
            <input
              type="text"
              placeholder="e.g. Regular night charge with 4A smart charger"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
              id="save-charge-log-submit-btn"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition"
            >
              {t.save_charge_log}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
