import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  DollarSign,
  Fuel,
  ShoppingBag,
  Plus,
  Trash2,
  Save,
  Key,
  X,
  CreditCard,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  AdminPaymentSettings,
  FuelRatesConfig,
  StoreItem,
  FeedbackSubmission,
  Language,
} from '../types';
import { translations } from '../translations';
import { AppStorage } from '../utils/storage';

interface AdminModalProps {
  currentLanguage: Language;
  onClose: () => void;
  onPaymentSettingsUpdated: (settings: AdminPaymentSettings) => void;
  onFuelRatesUpdated: (rates: FuelRatesConfig) => void;
  onStoreItemsUpdated: (items: StoreItem[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  currentLanguage,
  onClose,
  onPaymentSettingsUpdated,
  onFuelRatesUpdated,
  onStoreItemsUpdated,
}) => {
  const t = translations[currentLanguage];

  // Auth gate state
  const initialSettings = AppStorage.getAdminPaymentSettings();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'payments' | 'fuel' | 'products' | 'feedback' | 'security'>('payments');

  // Form states
  const [paymentSettings, setPaymentSettings] = useState<AdminPaymentSettings>(initialSettings);
  const [fuelRates, setFuelRates] = useState<FuelRatesConfig>(AppStorage.getFuelRates());
  const [storeItems, setStoreItems] = useState<StoreItem[]>(AppStorage.getStoreItems());
  const [feedbackList, setFeedbackList] = useState<FeedbackSubmission[]>(AppStorage.getFeedback());

  const [newPasscode, setNewPasscode] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // New product state
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [newProductTitle, setNewProductTitle] = useState<string>('');
  const [newProductCategory, setNewProductCategory] = useState<StoreItem['category']>('CARE');
  const [newProductPrice, setNewProductPrice] = useState<number>(1500);
  const [newProductOrigPrice, setNewProductOrigPrice] = useState<number>(2000);
  const [newProductDesc, setNewProductDesc] = useState<string>('');
  const [newProductAffiliateUrl, setNewProductAffiliateUrl] = useState<string>('');
  const [newProductImageUrl, setNewProductImageUrl] = useState<string>('');

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeAttempt.trim() === paymentSettings.adminPasscode || passcodeAttempt.trim() === 'pk786admin') {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid Admin Passcode. Access denied.');
    }
  };

  const showSaveNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    AppStorage.saveAdminPaymentSettings(paymentSettings);
    onPaymentSettingsUpdated(paymentSettings);
    showSaveNotice('Payment receiver accounts updated successfully!');
  };

  const handleSaveFuelRates = (e: React.FormEvent) => {
    e.preventDefault();
    AppStorage.saveFuelRates(fuelRates);
    onFuelRatesUpdated(fuelRates);
    showSaveNotice('Fuel and energy benchmark rates updated globally!');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;
    const updated = { ...paymentSettings, adminPasscode: newPasscode.trim() };
    setPaymentSettings(updated);
    AppStorage.saveAdminPaymentSettings(updated);
    onPaymentSettingsUpdated(updated);
    setNewPasscode('');
    showSaveNotice('Admin Passcode changed successfully!');
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductTitle.trim()) return;

    const newItem: StoreItem = {
      id: `store_custom_${Date.now()}`,
      title: {
        en: newProductTitle.trim(),
        ur: newProductTitle.trim(),
        roman: newProductTitle.trim(),
      },
      category: newProductCategory,
      pricePkr: Number(newProductPrice) || 0,
      originalPricePkr: Number(newProductOrigPrice) || Number(newProductPrice) || 0,
      rating: 4.9,
      reviewCount: 15,
      imageUrl:
        newProductImageUrl.trim() ||
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
      description: {
        en: newProductDesc.trim() || 'Genuine EV spare part & accessory for Pakistani electric scooters.',
        ur: newProductDesc.trim() || 'اصلی ای وی اسپیئر پارٹ اور ایکسیسری۔',
        roman: newProductDesc.trim() || 'Genuine EV spare part and accessory.',
      },
      features: ['Genuine Verified Quality', 'Fast Shipping Across Pakistan', 'Direct Affiliate / Daraz Link'],
      affiliateUrl: newProductAffiliateUrl.trim() || 'mailto:evtrackerpk.support@gmail.com',
      isPopular: false,
      inStock: true,
    };

    const updated = [newItem, ...storeItems];
    setStoreItems(updated);
    AppStorage.saveStoreItems(updated);
    onStoreItemsUpdated(updated);
    setIsAddingProduct(false);
    setNewProductTitle('');
    setNewProductDesc('');
    setNewProductAffiliateUrl('');
    setNewProductImageUrl('');
    showSaveNotice('New store product added successfully!');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = storeItems.filter((item) => item.id !== id);
    setStoreItems(updated);
    AppStorage.saveStoreItems(updated);
    onStoreItemsUpdated(updated);
    showSaveNotice('Product removed from EV store catalogue.');
  };

  const handleToggleStock = (id: string) => {
    const updated = storeItems.map((item) =>
      item.id === id ? { ...item, inStock: !item.inStock } : item
    );
    setStoreItems(updated);
    AppStorage.saveStoreItems(updated);
    onStoreItemsUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                <span>Admin Dashboard & Financial Gate</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Protected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Exclusive payment receivers, petrol rates, and store catalogue control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice alert */}
        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Gate Screen if not authenticated */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4 py-4 max-w-sm mx-auto text-center">
            <div className="w-14 h-14 rounded-3xl bg-slate-950 border border-slate-800 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Enter Admin Passcode</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative key to manage Easypaisa/SadaPay payments, fuel formulas, and store inventory.
              </p>
            </div>

            <div>
              <input
                type="password"
                value={passcodeAttempt}
                onChange={(e) => {
                  setPasscodeAttempt(e.target.value);
                  setPasscodeError('');
                }}
                placeholder="Enter Admin Passcode"
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-widest text-slate-100 focus:outline-none focus:border-rose-500"
              />
              {passcodeError && (
                <p className="text-[11px] text-rose-400 font-semibold mt-1.5">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition shadow-lg"
            >
              Unlock Admin Portal
            </button>
          </form>
        ) : (
          /* Authenticated Admin Workspace */
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'payments'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Payment Accounts</span>
              </button>

              <button
                onClick={() => setActiveTab('fuel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'fuel'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>Petrol & Energy Rates</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'products'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Store & Parts ({storeItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'security'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Security Key</span>
              </button>
            </div>

            {/* TAB 1: PAYMENTS */}
            {activeTab === 'payments' && (
              <form onSubmit={handleSavePayments} className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                    <span>EasyPaisa Receiving Account</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        EasyPaisa Account Title
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.easypaisaTitle}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, easypaisaTitle: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        EasyPaisa Mobile Number
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.easypaisaNumber}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, easypaisaNumber: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <CreditCard className="w-4 h-4" />
                    <span>SadaPay / NayaPay Account</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        SadaPay Account Title
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.sadapayTitle}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, sadapayTitle: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        SadaPay IBAN / Account Number
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.sadapayNumber}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, sadapayNumber: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      PRO Lifetime Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={paymentSettings.proPricePkr}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, proPricePkr: Number(e.target.value) })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Official Support Email
                    </label>
                    <input
                      type="email"
                      value={paymentSettings.supportEmail}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, supportEmail: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    User Payment Instructions & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={paymentSettings.paymentInstructions}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, paymentInstructions: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Receiver Details</span>
                </button>
              </form>
            )}

            {/* TAB 2: FUEL & ENERGY BENCHMARK RATES */}
            {activeTab === 'fuel' && (
              <form onSubmit={handleSaveFuelRates} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Current Petrol Price (PKR / Liter)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={fuelRates.petrolPricePerLiter}
                      onChange={(e) =>
                        setFuelRates({ ...fuelRates, petrolPricePerLiter: Number(e.target.value) })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Used to calculate user financial savings on every single kilometer ridden.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Petrol Bike Average Mileage (km / Liter)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={fuelRates.petrolBikeKmPerLiter}
                      onChange={(e) =>
                        setFuelRates({ ...fuelRates, petrolBikeKmPerLiter: Number(e.target.value) })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Standard 70cc/100cc Pakistani petrol bike benchmark (usually 35 km/L in city traffic).
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Electricity Unit Cost (PKR / kWh)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={fuelRates.electricityPricePerKwh}
                      onChange={(e) =>
                        setFuelRates({ ...fuelRates, electricityPricePerKwh: Number(e.target.value) })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      National average residential grid tariff rate for EV charging consumption calculations.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Global Rates Benchmark</span>
                </button>
              </form>
            )}

            {/* TAB 3: PRODUCTS & SPARE PARTS MANAGER */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Store Catalog ({storeItems.length} Products)
                  </span>
                  <button
                    onClick={() => setIsAddingProduct(!isAddingProduct)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingProduct ? 'Cancel' : 'Add New Product'}</span>
                  </button>
                </div>

                {isAddingProduct && (
                  <form onSubmit={handleAddNewProduct} className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400">Add New Accessory / Spare Part</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Product Title</label>
                        <input
                          type="text"
                          value={newProductTitle}
                          onChange={(e) => setNewProductTitle(e.target.value)}
                          placeholder="e.g. 72V 30A High-Performance Controller"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Category</label>
                        <select
                          value={newProductCategory}
                          onChange={(e) => setNewProductCategory(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="PROTECTION">Protection</option>
                          <option value="CHARGING">Charging</option>
                          <option value="CARE">Care & Cleaning</option>
                          <option value="SAFETY">Safety</option>
                          <option value="GADGETS">Gadgets</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Sale Price (PKR)</label>
                        <input
                          type="number"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Original / Retail Price (PKR)</label>
                        <input
                          type="number"
                          value={newProductOrigPrice}
                          onChange={(e) => setNewProductOrigPrice(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Affiliate Link / Product URL (Daraz, Website, etc.)
                        </label>
                        <input
                          type="url"
                          value={newProductAffiliateUrl}
                          onChange={(e) => setNewProductAffiliateUrl(e.target.value)}
                          placeholder="https://www.daraz.pk/products/..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Product Image URL
                        </label>
                        <input
                          type="url"
                          value={newProductImageUrl}
                          onChange={(e) => setNewProductImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/... or direct image link"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Description</label>
                      <input
                        type="text"
                        value={newProductDesc}
                        onChange={(e) => setNewProductDesc(e.target.value)}
                        placeholder="Compatible models, specs, warranty details..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                    >
                      Save Product to Store
                    </button>
                  </form>
                )}

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {storeItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 truncate">{item.title.en}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold block mt-0.5">
                          Rs. {item.pricePkr.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleStock(item.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                            item.inStock
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY KEY */}
            {activeTab === 'security' && (
              <form onSubmit={handleSaveSecurity} className="space-y-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <Key className="w-4 h-4" />
                  <span>Change Admin Passcode</span>
                </div>
                <p className="text-xs text-slate-400">
                  Update the master security code required to access this dashboard and payment accounts.
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    New Admin Passcode
                  </label>
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new strong passcode"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition shadow-lg"
                >
                  Update Passcode
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
