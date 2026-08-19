import React, { useState } from 'react';
import {
  History,
  PlayCircle,
  BatteryCharging,
  Download,
  Calendar,
  Clock,
  Zap,
  TrendingDown,
  Coins,
  MapPin,
  Search,
  Plus,
} from 'lucide-react';
import { RideLog, ChargeLog, Vehicle, Language } from '../types';
import { translations } from '../translations';
import { AppStorage } from '../utils/storage';

interface LogsViewProps {
  vehicle: Vehicle;
  rides: RideLog[];
  charges: ChargeLog[];
  currentLanguage: Language;
  onOpenRideLogger: () => void;
  onOpenChargeLogger: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({
  vehicle,
  rides,
  charges,
  currentLanguage,
  onOpenRideLogger,
  onOpenChargeLogger,
}) => {
  const t = translations[currentLanguage];
  const [activeTab, setActiveTab] = useState<'rides' | 'charges'>('rides');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredRides = rides
    .filter((r) => r.vehicleId === vehicle.id)
    .filter((r) =>
      r.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.terrain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rideMode.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredCharges = charges
    .filter((c) => c.vehicleId === vehicle.id)
    .filter((c) =>
      c.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.chargingLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Aggregate stats
  const totalRidesDist = filteredRides.reduce((acc, curr) => acc + curr.distanceKm, 0);
  const totalRidesTime = filteredRides.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalChargeUnits = filteredCharges.reduce((acc, curr) => acc + curr.unitsConsumedKwh, 0);
  const totalChargeCost = filteredCharges.reduce((acc, curr) => acc + curr.costPkr, 0);

  return (
    <div className="space-y-5 pb-6">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              {t.nav_logs}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical telemetry, trip distances, and charging expenses for {vehicle.model}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => AppStorage.exportCSV()}
            id="export-logs-csv-btn"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {activeTab === 'rides' ? (
            <button
              onClick={onOpenRideLogger}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.log_ride_btn}</span>
            </button>
          ) : (
            <button
              onClick={onOpenChargeLogger}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.log_charge_btn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Logged Trips</span>
          <span className="text-xl font-black text-slate-100 font-mono">{filteredRides.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">({Math.round(totalRidesTime / 60)} hrs on road)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Logged Distance</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{totalRidesDist.toFixed(1)} km</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Saved ~Rs. {Math.round(totalRidesDist * 6.4)}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Energy Consumed</span>
          <span className="text-xl font-black text-cyan-400 font-mono">{totalChargeUnits.toFixed(1)} kWh</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">({filteredCharges.length} charge cycles)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Electricity Cost</span>
          <span className="text-xl font-black text-amber-400 font-mono">Rs. {totalChargeCost}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">WAPDA / Commercial</span>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="grid grid-cols-2 gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('rides')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'rides'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Rides ({filteredRides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('charges')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'charges'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Charges ({filteredCharges.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes or terrain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Content List */}
      {activeTab === 'rides' ? (
        <div className="space-y-3">
          {filteredRides.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
              <PlayCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No ride logs recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">Log your first trip using the button above</p>
            </div>
          ) : (
            filteredRides.map((ride) => {
              const dt = new Date(ride.dateTime);
              const drop = Math.round((ride.startVoltage - ride.endVoltage) * 10) / 10;
              return (
                <div
                  key={ride.id}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-100 font-mono">
                            {ride.distanceKm} km
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {ride.rideMode}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {ride.passengerLoad}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {dt.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({ride.durationMinutes} min)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Voltage drop & telemetry */}
                    <div className="flex items-center gap-3 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
                      <div className="text-right font-mono">
                        <span className="text-[11px] text-slate-400 block">
                          {ride.startVoltage.toFixed(1)}V → {ride.endVoltage.toFixed(1)}V
                        </span>
                        <span className="text-xs font-bold text-amber-400">
                          -{drop}V drop
                        </span>
                      </div>
                    </div>
                  </div>

                  {ride.notes && (
                    <p className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80 italic">
                      "{ride.notes}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCharges.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
              <BatteryCharging className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No charge logs recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">Log your first charge cycle using the button above</p>
            </div>
          ) : (
            filteredCharges.map((charge) => {
              const dt = new Date(charge.dateTime);
              return (
                <div
                  key={charge.id}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                        <BatteryCharging className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-cyan-300 font-mono">
                            {charge.unitsConsumedKwh} kWh
                          </span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            Rs. {charge.costPkr}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {charge.chargingLocation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {dt.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {charge.durationHours} hrs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 text-right font-mono self-start sm:self-auto">
                      <span className="text-[11px] text-slate-400 block">Voltage Recovery:</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {charge.startVoltage.toFixed(1)}V → {charge.endVoltage.toFixed(1)}V
                      </span>
                    </div>
                  </div>

                  {charge.notes && (
                    <p className="text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80 italic">
                      "{charge.notes}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
