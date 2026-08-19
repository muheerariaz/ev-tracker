import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Calendar,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { MaintenanceItem, Vehicle, Language } from '../types';
import { translations } from '../translations';

interface MaintenanceViewProps {
  vehicle: Vehicle;
  maintenanceItems: MaintenanceItem[];
  currentLanguage: Language;
  onUpdateItem: (item: MaintenanceItem) => void;
  onAddItem: (item: MaintenanceItem) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  vehicle,
  maintenanceItems,
  currentLanguage,
  onUpdateItem,
  onAddItem,
}) => {
  const t = translations[currentLanguage];
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<MaintenanceItem['category']>('TIRES');
  const [customIntervalKm, setCustomIntervalKm] = useState<number>(1000);
  const [customIntervalDays, setCustomIntervalDays] = useState<number>(60);

  const vehicleItems = maintenanceItems.filter((m) => m.vehicleId === vehicle.id);

  const handleMarkDone = (item: MaintenanceItem) => {
    const updated: MaintenanceItem = {
      ...item,
      lastDoneKm: vehicle.odometerKm,
      lastDoneDate: new Date().toISOString().slice(0, 10),
      status: 'GOOD',
    };
    onUpdateItem(updated);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newItem: MaintenanceItem = {
      id: `maint_${Date.now()}`,
      vehicleId: vehicle.id,
      titleKey: customTitle.trim(),
      titleCustom: customTitle.trim(),
      category: customCategory,
      intervalKm: customIntervalKm,
      intervalDays: customIntervalDays,
      lastDoneKm: vehicle.odometerKm,
      lastDoneDate: new Date().toISOString().slice(0, 10),
      status: 'GOOD',
      notes: 'Custom user reminder',
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setCustomTitle('');
  };

  const getTranslatedTitle = (item: MaintenanceItem) => {
    if (item.titleCustom) return item.titleCustom;
    return t[item.titleKey] || item.titleKey;
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              {t.maintenance_title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.maintenance_sub}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Reminder</span>
        </button>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicleItems.map((item) => {
          const kmSince = Math.max(0, vehicle.odometerKm - item.lastDoneKm);
          const isOverdue = item.status === 'OVERDUE' || kmSince >= item.intervalKm;
          const isDueSoon = item.status === 'DUE_SOON' || (kmSince >= item.intervalKm * 0.8 && !isOverdue);

          let statusBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
          let statusText = t.status_good;

          if (isOverdue) {
            statusBadgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse';
            statusText = t.status_overdue;
          } else if (isDueSoon) {
            statusBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            statusText = t.status_due;
          }

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 border transition shadow-lg flex flex-col justify-between ${
                isOverdue
                  ? 'bg-slate-900 border-rose-500/40 ring-1 ring-rose-500/20'
                  : isDueSoon
                  ? 'bg-slate-900 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
                    {statusText}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-1">
                  {getTranslatedTitle(item)}
                </h3>

                {item.notes && (
                  <p className="text-xs text-slate-400 italic mb-3">
                    {item.notes}
                  </p>
                )}

                {/* Progress bar to next interval */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>{kmSince} km elapsed</span>
                    <span>Interval: {item.intervalKm} km</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverdue ? 'bg-rose-500' : isDueSoon ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (kmSince / item.intervalKm) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-400 font-mono">
                  <div>
                    <span className="text-slate-500 block">{t.last_serviced}:</span>
                    <strong className="text-slate-300">{item.lastDoneDate} ({item.lastDoneKm} km)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.next_due}:</span>
                    <strong className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {item.lastDoneKm + item.intervalKm} km
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleMarkDone(item)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.mark_done} ({vehicle.odometerKm} km)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-100">
                Add Maintenance Reminder
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Belt tension check / Battery water check"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TIRES">Tires & Wheels</option>
                  <option value="BRAKES">Brakes & Fluid</option>
                  <option value="BATTERY">Battery & Connections</option>
                  <option value="ELECTRICAL">Electrical & Lighting</option>
                  <option value="CHASSIS">Chassis & Suspension</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Interval (KM)
                  </label>
                  <input
                    type="number"
                    value={customIntervalKm}
                    onChange={(e) => setCustomIntervalKm(parseInt(e.target.value) || 1000)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Interval (Days)
                  </label>
                  <input
                    type="number"
                    value={customIntervalDays}
                    onChange={(e) => setCustomIntervalDays(parseInt(e.target.value) || 60)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
