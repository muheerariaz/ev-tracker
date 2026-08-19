import React, { useState, useEffect, useMemo } from 'react';
import {
  Vehicle,
  UserProfile,
  RideLog,
  ChargeLog,
  MaintenanceItem,
  Badge,
  Language,
  NavigationTab,
  FuelRatesConfig,
  AdminPaymentSettings,
  StoreItem,
} from './types';
import { AppStorage } from './utils/storage';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { BottomBannerAd } from './components/BottomBannerAd';
import { Dashboard } from './components/Dashboard';
import { GarageView } from './components/GarageView';
import { SlopeCalculatorView } from './components/SlopeCalculatorView';
import { LogsView } from './components/LogsView';
import { MaintenanceView } from './components/MaintenanceView';
import { StoreView } from './components/StoreView';
import { SettingsView } from './components/SettingsView';
import { TrackingView } from './components/TrackingView';
import { RideLoggerModal } from './components/RideLoggerModal';
import { ChargeLoggerModal } from './components/ChargeLoggerModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { AuthModal } from './components/AuthModal';
import { DomainSetupModal } from './components/DomainSetupModal';
import { LegalModal } from './components/LegalModal';
import { BadgesModal } from './components/BadgesModal';
import { AdminModal } from './components/AdminModal';

export const App: React.FC = () => {
  // 1. Authentication State Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AppStorage.getAuthSession());

  // 2. Initial State from Storage
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => AppStorage.getVehicles());
  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    const v = AppStorage.getVehicles();
    return v.length > 0 ? v[0].id : '';
  });

  const [user, setUser] = useState<UserProfile>(() => AppStorage.getUser());
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => AppStorage.getLanguage());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const [rides, setRides] = useState<RideLog[]>(() => AppStorage.getRides());
  const [charges, setCharges] = useState<ChargeLog[]>(() => AppStorage.getCharges());
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(() =>
    AppStorage.getMaintenance()
  );
  const [badges, setBadges] = useState<Badge[]>(() => AppStorage.getBadges());
  const [fuelRates, setFuelRates] = useState<FuelRatesConfig>(() => AppStorage.getFuelRates());
  const [adminPayments, setAdminPayments] = useState<AdminPaymentSettings>(() =>
    AppStorage.getAdminPaymentSettings()
  );
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => AppStorage.getStoreItems());

  // 3. Modals state
  const [isRideModalOpen, setIsRideModalOpen] = useState<boolean>(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<'privacy' | 'terms' | null>(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Synchronize active vehicle
  const activeVehicle = useMemo(() => {
    if (vehicles.length === 0) return null;
    return vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || null;
  }, [vehicles, activeVehicleId]);

  // Enforce Permanent Dark Mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    AppStorage.saveLanguage(lang);
  };

  // Vehicle Garage Handlers
  const handleSaveVehicle = (updatedVehicle: Vehicle) => {
    const existingIndex = vehicles.findIndex((v) => v.id === updatedVehicle.id);
    let newVehicles: Vehicle[];
    if (existingIndex >= 0) {
      newVehicles = [...vehicles];
      newVehicles[existingIndex] = updatedVehicle;
    } else {
      newVehicles = [...vehicles, updatedVehicle];
    }
    setVehicles(newVehicles);
    AppStorage.saveVehicles(newVehicles);
    setActiveVehicleId(updatedVehicle.id);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const filtered = vehicles.filter((v) => v.id !== vehicleId);
    setVehicles(filtered);
    AppStorage.saveVehicles(filtered);
    if (filtered.length > 0) {
      setActiveVehicleId(filtered[0].id);
    } else {
      setActiveVehicleId('');
    }
  };

  // Ride & Charge Log Handlers
  const handleSaveRide = (ride: RideLog, endVoltage: number, updatedOdo: number) => {
    const updatedRides = [ride, ...rides];
    setRides(updatedRides);
    AppStorage.saveRides(updatedRides);

    if (activeVehicle) {
      const updatedVehicle: Vehicle = {
        ...activeVehicle,
        currentVoltage: endVoltage,
        odometerKm: updatedOdo,
      };
      handleSaveVehicle(updatedVehicle);
    }

    // Check Badges Unlock
    checkAndUnlockBadges(updatedRides, charges);
  };

  const handleSaveCharge = (charge: ChargeLog, endVoltage: number) => {
    const updatedCharges = [charge, ...charges];
    setCharges(updatedCharges);
    AppStorage.saveCharges(updatedCharges);

    if (activeVehicle) {
      const updatedVehicle: Vehicle = {
        ...activeVehicle,
        currentVoltage: endVoltage,
      };
      handleSaveVehicle(updatedVehicle);
    }
  };

  const handleGPSRideLogged = (newRide: RideLog) => {
    const updatedRides = [newRide, ...rides];
    setRides(updatedRides);
    AppStorage.saveRides(updatedRides);
    checkAndUnlockBadges(updatedRides, charges);
  };

  const handleUpdateVehicleOdometer = (kmToAdd: number) => {
    if (activeVehicle) {
      const updatedVehicle: Vehicle = {
        ...activeVehicle,
        odometerKm: Number((activeVehicle.odometerKm + kmToAdd).toFixed(1)),
      };
      handleSaveVehicle(updatedVehicle);
    }
  };

  // Maintenance Handlers
  const handleUpdateMaintenanceItem = (item: MaintenanceItem) => {
    const updated = maintenanceItems.map((m) => (m.id === item.id ? item : m));
    setMaintenanceItems(updated);
    AppStorage.saveMaintenance(updated);
  };

  const handleAddMaintenanceItem = (item: MaintenanceItem) => {
    const updated = [item, ...maintenanceItems];
    setMaintenanceItems(updated);
    AppStorage.saveMaintenance(updated);
  };

  // Badges unlocker
  const checkAndUnlockBadges = (currentRides: RideLog[], currentCharges: ChargeLog[]) => {
    const totalDist = currentRides.reduce((acc, r) => acc + (r.distanceKm || 0), 0);
    const totalSavingsPkr = totalDist * 7.5;

    let modified = false;
    const updatedBadges = badges.map((badge) => {
      if (badge.unlocked) return badge;

      let shouldUnlock = false;
      if (badge.id === 'badge_1' && currentRides.length >= 1) shouldUnlock = true;
      if (badge.id === 'badge_2' && currentCharges.length >= 1) shouldUnlock = true;
      if (badge.id === 'badge_3' && totalDist >= 100) shouldUnlock = true;
      if (badge.id === 'badge_4' && totalDist >= 500) shouldUnlock = true;
      if (badge.id === 'badge_5' && totalSavingsPkr >= 10000) shouldUnlock = true;
      if (badge.id === 'badge_8' && user.isPro) shouldUnlock = true;

      if (shouldUnlock) {
        modified = true;
        return {
          ...badge,
          unlocked: true,
          unlockedAt: new Date().toISOString().slice(0, 10),
        };
      }
      return badge;
    });

    if (modified) {
      setBadges(updatedBadges);
      AppStorage.saveBadges(updatedBadges);
    }
  };

  // User and Auth Handlers
  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    AppStorage.saveUser(newUser);
    AppStorage.setAuthSession(true);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    AppStorage.saveUser(updatedUser);
  };

  const handleProUpgradeSuccess = () => {
    const updatedUser: UserProfile = {
      ...user,
      isPro: true,
    };
    setUser(updatedUser);
    AppStorage.saveUser(updatedUser);
    checkAndUnlockBadges(rides, charges);
  };

  const handleLogout = () => {
    AppStorage.setAuthSession(false);
    setIsAuthenticated(false);
  };

  // Admin config save handlers
  const handleSaveFuelRates = (rates: FuelRatesConfig) => {
    setFuelRates(rates);
    AppStorage.saveFuelRates(rates);
  };

  const handleSavePaymentSettings = (settings: AdminPaymentSettings) => {
    setAdminPayments(settings);
    AppStorage.saveAdminPaymentSettings(settings);
  };

  const handleSaveStoreItems = (items: StoreItem[]) => {
    setStoreItems(items);
    AppStorage.saveStoreItems(items);
  };

  // FORCE AUTHENTICATION: If user is not authenticated, render ONLY the Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <AuthModal
          currentLanguage={currentLanguage}
          onLoginSuccess={handleLoginSuccess}
          isGatekeeper={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Universal Navbar */}
      <Navbar
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        user={user}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onSelectVehicle={(v) => setActiveVehicleId(typeof v === 'string' ? v : v.id)}
        onOpenGarageModal={() => setActiveTab('garage')}
        onOpenGarage={() => setActiveTab('garage')}
        onOpenProModal={() => setIsProModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Responsive Viewport Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 pb-36 sm:pb-28">
        {activeTab === 'dashboard' && (
          <Dashboard
            vehicle={activeVehicle}
            user={user}
            rides={rides}
            badges={badges}
            fuelRates={fuelRates}
            currentLanguage={currentLanguage}
            onOpenRideLogger={() => setIsRideModalOpen(true)}
            onOpenChargeLogger={() => setIsChargeModalOpen(true)}
            onOpenSlopeCalculator={() => setActiveTab('slope')}
            onOpenGarage={() => setActiveTab('garage')}
            onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
            onOpenBadgeModal={() => setIsBadgesModalOpen(true)}
            onOpenTracking={() => setActiveTab('tracking')}
          />
        )}

        {activeTab === 'tracking' && activeVehicle && (
          <TrackingView
            vehicle={activeVehicle}
            currentLanguage={currentLanguage}
            onRideLogged={handleGPSRideLogged}
            onUpdateVehicleOdometer={handleUpdateVehicleOdometer}
          />
        )}

        {activeTab === 'garage' && (
          <GarageView
            vehicles={vehicles}
            activeVehicle={activeVehicle}
            currentLanguage={currentLanguage}
            onSelectPrimary={(id) => setActiveVehicleId(id)}
            onSaveVehicle={handleSaveVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        )}

        {activeTab === 'slope' && activeVehicle && (
          <SlopeCalculatorView
            vehicle={activeVehicle}
            currentLanguage={currentLanguage}
          />
        )}

        {activeTab === 'logs' && activeVehicle && (
          <LogsView
            vehicle={activeVehicle}
            rides={rides}
            charges={charges}
            currentLanguage={currentLanguage}
            onOpenRideLogger={() => setIsRideModalOpen(true)}
            onOpenChargeLogger={() => setIsChargeModalOpen(true)}
          />
        )}

        {activeTab === 'maintenance' && activeVehicle && (
          <MaintenanceView
            vehicle={activeVehicle}
            maintenanceItems={maintenanceItems}
            currentLanguage={currentLanguage}
            onUpdateItem={handleUpdateMaintenanceItem}
            onAddItem={handleAddMaintenanceItem}
          />
        )}

        {activeTab === 'store' && (
          <StoreView currentLanguage={currentLanguage} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={user}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            onUpdateUser={handleUpdateUser}
            onOpenDomainModal={() => setIsDomainModalOpen(true)}
            onOpenLegalModal={(type) => setIsLegalModalOpen(type)}
            onOpenProModal={() => setIsProModalOpen(true)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onLogout={handleLogout}
            fuelRates={fuelRates}
            vehicles={vehicles}
            activeVehicle={activeVehicle}
            onSaveVehicle={handleSaveVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onSelectPrimaryVehicle={(id) => setActiveVehicleId(id)}
            onOpenGarageTab={() => setActiveTab('garage')}
          />
        )}
      </main>

      {/* Fixed Bottom Ad Banner & Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col pointer-events-auto shadow-2xl">
        <BottomBannerAd
          isPro={user.isPro}
          onOpenStore={() => setActiveTab('store')}
          onNavigateStore={() => setActiveTab('store')}
          onUpgradePro={() => setIsProModalOpen(true)}
          currentLanguage={currentLanguage}
        />

        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onTabChange={setActiveTab}
          currentLanguage={currentLanguage}
          dueMaintenanceCount={maintenanceItems.filter((m) => m.isDue).length}
        />
      </div>

      {/* Interactive Modals */}
      {isRideModalOpen && activeVehicle && (
        <RideLoggerModal
          vehicle={activeVehicle}
          currentLanguage={currentLanguage}
          onClose={() => setIsRideModalOpen(false)}
          onSaveRide={handleSaveRide}
        />
      )}

      {isChargeModalOpen && activeVehicle && (
        <ChargeLoggerModal
          vehicle={activeVehicle}
          currentLanguage={currentLanguage}
          onClose={() => setIsChargeModalOpen(false)}
          onSaveCharge={handleSaveCharge}
        />
      )}

      {isProModalOpen && (
        <ProUpgradeModal
          user={user}
          activeVehicle={activeVehicle}
          currentLanguage={currentLanguage}
          onClose={() => setIsProModalOpen(false)}
          onUpgradeSuccess={handleProUpgradeSuccess}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          currentLanguage={currentLanguage}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {isDomainModalOpen && (
        <DomainSetupModal
          currentLanguage={currentLanguage}
          onClose={() => setIsDomainModalOpen(false)}
        />
      )}

      {isLegalModalOpen && (
        <LegalModal
          type={isLegalModalOpen}
          currentLanguage={currentLanguage}
          onClose={() => setIsLegalModalOpen(null)}
        />
      )}

      {isBadgesModalOpen && (
        <BadgesModal
          badges={badges}
          currentLanguage={currentLanguage}
          onClose={() => setIsBadgesModalOpen(false)}
        />
      )}

      {isAdminModalOpen && (
        <AdminModal
          currentLanguage={currentLanguage}
          onClose={() => setIsAdminModalOpen(false)}
          paymentSettings={adminPayments}
          onPaymentSettingsUpdated={handleSavePaymentSettings}
          fuelRates={fuelRates}
          onFuelRatesUpdated={handleSaveFuelRates}
          storeItems={storeItems}
          onStoreItemsUpdated={handleSaveStoreItems}
        />
      )}
    </div>
  );
};

export default App;
