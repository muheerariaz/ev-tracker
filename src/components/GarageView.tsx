import React, { useState } from 'react';
import {
  Bike,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Battery,
  Zap,
  Gauge,
  Calendar,
  Save,
  Tag,
  Shield,
} from 'lucide-react';
import { Vehicle, Language, BatteryChemistry } from '../types';
import { translations } from '../translations';
import { PAKISTANI_EV_BRANDS } from '../data/mockData';

interface GarageViewProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  currentLanguage: Language;
  onSelectPrimary: (vehicleId: string) => void;
  onSaveVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  vehicles,
  activeVehicle,
  currentLanguage,
  onSelectPrimary,
  onSaveVehicle,
  onDeleteVehicle,
}) => {
  const t = translations[currentLanguage];

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [customModelInput, setCustomModelInput] = useState<string>('');

  const handleStartAddNew = () => {
    const newVeh: Vehicle = {
      id: `veh_${Date.now()}`,
      brand: 'Evee',
      model: 'Evee Gen Z',
      nickname: 'New E-Rider',
      year: 2024,
      batteryChemistry: '72V_GRAPHENE',
      nominalVoltage: 72,
      fullVoltage: 78.5,
      cutoffVoltage: 62.0,
      batteryCapacityAh: 32,
      motorWattage: 1200,
      odometerKm: 0,
      currentVoltage: 78.0,
      healthPercentage: 100,
      registrationNumber: '',
      color: 'Black',
      isPrimary: vehicles.length === 0,
    };
    setEditingVehicle(newVeh);
    setIsNew(true);
    setIsEditing(true);
    setCustomModelInput('');
  };

  const handleStartEdit = (veh: Vehicle) => {
    setEditingVehicle({ ...veh });
    setIsNew(false);
    setIsEditing(true);
    setCustomModelInput(veh.model.includes('Custom') ? veh.model : '');
  };

  const handleBrandChange = (newBrand: string) => {
    if (!editingVehicle) return;
    const brandObj = PAKISTANI_EV_BRANDS.find((b) => b.brand === newBrand);
    const firstModel = brandObj ? brandObj.models[0] : 'Custom Model';
    
    // Auto-adjust default battery voltages based on brand standards
    let nomV = 72;
    let fullV = 78.5;
    let cutoffV = 62.0;
    let chem: BatteryChemistry = '72V_GRAPHENE';
    let motorW = 1200;

    if (newBrand === 'Evee') {
      nomV = 72;
      fullV = 78.5;
      cutoffV = 62.0;
      chem = '72V_GRAPHENE';
      motorW = 1500;
    } else if (newBrand === 'Yadea') {
      nomV = 72;
      fullV = 78.0;
      cutoffV = 62.0;
      chem = '72V_GRAPHENE';
      motorW = 1200;
    }

    setEditingVehicle({
      ...editingVehicle,
      brand: newBrand,
      model: firstModel,
      nominalVoltage: nomV,
      fullVoltage: fullV,
      cutoffVoltage: cutoffV,
      batteryChemistry: chem,
      motorWattage: motorW,
    });
  };

  const handleChemistryChange = (chem: BatteryChemistry) => {
    if (!editingVehicle) return;
    let nomV = 72;
    let fullV = 78.5;
    let cutoffV = 62.0;

    if (chem === '72V_GRAPHENE') {
      nomV = 72; fullV = 78.5; cutoffV = 62.0;
    } else if (chem === '60V_GRAPHENE') {
      nomV = 60; fullV = 65.5; cutoffV = 52.0;
    } else if (chem === '72V_LITHIUM') {
      nomV = 72; fullV = 84.0; cutoffV = 60.0;
    } else if (chem === '60V_LITHIUM') {
      nomV = 60; fullV = 67.2; cutoffV = 50.0;
    } else if (chem === '48V_LEAD_ACID') {
      nomV = 48; fullV = 54.0; cutoffV = 42.0;
    }

    setEditingVehicle({
      ...editingVehicle,
      batteryChemistry: chem,
      nominalVoltage: nomV,
      fullVoltage: fullV,
      cutoffVoltage: cutoffV,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const finalVehicle = { ...editingVehicle };
    if (finalVehicle.brand === 'Other / Custom Model' || finalVehicle.model === 'Custom EV Model') {
      if (customModelInput.trim()) {
        finalVehicle.model = customModelInput.trim();
      }
    }

    onSaveVehicle(finalVehicle);
    setIsEditing(false);
    setEditingVehicle(null);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              {t.garage_title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.garage_subtitle}
          </p>
        </div>

        <button
          onClick={handleStartAddNew}
          id="garage-add-scooter-btn"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>{t.add_new_scooter}</span>
        </button>
      </div>

      {/* Vehicle Cards List or Empty State */}
      {vehicles.length === 0 ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100">Your Garage is Empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Add your electric scooter or motorbike to track battery voltage sag, real-time estimated range, fuel savings, and maintenance schedules.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartAddNew}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/20 inline-flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First EV Bike</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              Supported Pakistani EV Brands & Custom Builds:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl mx-auto">
              {PAKISTANI_EV_BRANDS.map((b) => (
                <span
                  key={b.brand}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300"
                >
                  {b.brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const isCurrentActive = activeVehicle?.id === v.id;
            return (
              <div
                key={v.id}
                className={`rounded-2xl p-5 border transition shadow-xl relative flex flex-col justify-between ${
                  isCurrentActive
                    ? 'bg-slate-900/90 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Badge Strip */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {v.brand}
                    </span>
                    {isCurrentActive ? (
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.active_primary}
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectPrimary(v.id)}
                        className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition"
                      >
                        {t.set_as_primary}
                      </button>
                    )}
                  </div>

                  {/* Model & Nickname */}
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">
                    {v.model}
                  </h3>
                  {v.nickname && (
                    <p className="text-xs text-slate-400 font-medium italic mt-0.5">
                      "{v.nickname}" • {v.registrationNumber || 'No Plate Registered'}
                    </p>
                  )}

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Battery</span>
                      <span className="text-xs font-black text-slate-200 font-mono">
                        {v.nominalVoltage}V {v.batteryCapacityAh}Ah
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Motor</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {v.motorWattage}W
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Health</span>
                      <span className="text-xs font-black text-teal-400 font-mono">
                        {v.healthPercentage}% SOH
                      </span>
                    </div>
                  </div>

                  {/* Voltage Range Display */}
                  <div className="mt-3 text-xs text-slate-400 flex items-center justify-between font-mono px-1">
                    <span>Cutoff: <strong className="text-rose-400">{v.cutoffVoltage}V</strong></span>
                    <span>Current: <strong className="text-amber-300">{v.currentVoltage.toFixed(1)}V</strong></span>
                    <span>Full: <strong className="text-emerald-400">{v.fullVoltage}V</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleStartEdit(v)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t.edit_specs}</span>
                  </button>

                  {vehicles.length > 1 && (
                    <button
                      onClick={() => onDeleteVehicle(v.id)}
                      className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title={t.delete_scooter}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Edit / Add Scooter Modal */}
      {isEditing && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-slate-100">
                  {isNew ? t.add_new_scooter : t.edit_specs}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingVehicle(null);
                }}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Brand & Model Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t.brand_label}
                  </label>
                  <select
                    value={editingVehicle.brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {PAKISTANI_EV_BRANDS.map((b) => (
                      <option key={b.brand} value={b.brand}>
                        {b.brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t.model_label}
                  </label>
                  {editingVehicle.brand === 'Other / Custom Model' ? (
                    <input
                      type="text"
                      placeholder="e.g. Super Power 72V Custom"
                      value={customModelInput || editingVehicle.model}
                      onChange={(e) => {
                        setCustomModelInput(e.target.value);
                        setEditingVehicle({ ...editingVehicle, model: e.target.value });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  ) : (
                    <select
                      value={editingVehicle.model}
                      onChange={(e) => {
                        if (e.target.value === 'Custom') {
                          setEditingVehicle({ ...editingVehicle, model: 'Custom Model' });
                        } else {
                          setEditingVehicle({ ...editingVehicle, model: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {PAKISTANI_EV_BRANDS.find((b) => b.brand === editingVehicle.brand)?.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Nickname & Reg Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t.nickname_label}
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.nickname}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, nickname: e.target.value })}
                    placeholder="e.g. Silver Comet"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t.registration_label}
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.registrationNumber || ''}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, registrationNumber: e.target.value })}
                    placeholder="e.g. LE-24-1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Battery Chemistry Type */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t.battery_chemistry_label}
                </label>
                <select
                  value={editingVehicle.batteryChemistry}
                  onChange={(e) => handleChemistryChange(e.target.value as BatteryChemistry)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="72V_GRAPHENE">72V Graphene (78.5V Full / 62.0V Cutoff - Pakistani Standard)</option>
                  <option value="60V_GRAPHENE">60V Graphene (65.5V Full / 52.0V Cutoff)</option>
                  <option value="72V_LITHIUM">72V Lithium-ion (84.0V Full / 60.0V Cutoff)</option>
                  <option value="60V_LITHIUM">60V Lithium-ion (67.2V Full / 50.0V Cutoff)</option>
                  <option value="48V_LEAD_ACID">48V Lead Acid (54.0V Full / 42.0V Cutoff)</option>
                  <option value="CUSTOM">Custom Manual Chemistry</option>
                </select>
              </div>

              {/* Voltage & Capacity Details */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    {t.nominal_voltage_label}
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.nominalVoltage}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, nominalVoltage: parseFloat(e.target.value) || 72 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-400 block mb-1">
                    {t.full_voltage_label}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingVehicle.fullVoltage}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, fullVoltage: parseFloat(e.target.value) || 78.5 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-rose-400 block mb-1">
                    {t.cutoff_voltage_label}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingVehicle.cutoffVoltage}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, cutoffVoltage: parseFloat(e.target.value) || 62.0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-rose-400 font-bold"
                  />
                </div>
              </div>

              {/* Motor Wattage, Ah, Odometer */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Capacity (Ah)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.batteryCapacityAh}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, batteryCapacityAh: parseFloat(e.target.value) || 32 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Motor (Watts)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.motorWattage}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, motorWattage: parseInt(e.target.value) || 1200 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.odometerKm}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, odometerKm: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingVehicle(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition"
                >
                  {t.save_vehicle}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
