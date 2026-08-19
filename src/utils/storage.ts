import {
  Vehicle,
  RideLog,
  ChargeLog,
  MaintenanceItem,
  Badge,
  UserProfile,
  FeedbackSubmission,
  Language,
  ThemeMode,
  SavedRoute,
  StoreItem,
  AdminPaymentSettings,
  FuelRatesConfig,
  SimulatorState,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_VEHICLES,
  INITIAL_RIDES,
  INITIAL_CHARGES,
  INITIAL_MAINTENANCE,
  INITIAL_BADGES,
  INITIAL_STORE_ITEMS,
  DEFAULT_ADMIN_PAYMENT_SETTINGS,
  DEFAULT_FUEL_RATES,
  DEFAULT_SIMULATOR_STATE,
} from '../data/mockData';

const STORAGE_KEYS = {
  USER: 'evtracker_user_v2',
  AUTH_SESSION: 'evtracker_auth_session_v2',
  VEHICLES: 'evtracker_vehicles_v2',
  RIDES: 'evtracker_rides_v2',
  CHARGES: 'evtracker_charges_v2',
  MAINTENANCE: 'evtracker_maintenance_v2',
  BADGES: 'evtracker_badges_v2',
  FEEDBACK: 'evtracker_feedback_v2',
  ROUTES: 'evtracker_routes_v2',
  LANGUAGE: 'evtracker_lang_v2',
  THEME: 'evtracker_theme_v2',
  FUEL_RATES: 'evtracker_fuel_rates_v2',
  ADMIN_PAYMENTS: 'evtracker_admin_payments_v2',
  SIM_STATE: 'evtracker_sim_state_v2',
  STORE_ITEMS: 'evtracker_store_items_v2',
};

export const AppStorage = {
  getAuthSession(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
    } catch {
      return false;
    }
  },

  setAuthSession(authenticated: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, authenticated ? 'true' : 'false');
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getLanguage(): Language {
    try {
      const l = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
      return l === 'ur' || l === 'roman' || l === 'en' ? l : 'en';
    } catch {
      return 'en';
    }
  },

  saveLanguage(lang: Language): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getTheme(): ThemeMode {
    return 'dark';
  },

  saveTheme(_theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  },

  saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getVehicles(): Vehicle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return data ? JSON.parse(data) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  },

  saveVehicles(vehicles: Vehicle[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getFuelRates(): FuelRatesConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FUEL_RATES);
      return data ? JSON.parse(data) : DEFAULT_FUEL_RATES;
    } catch {
      return DEFAULT_FUEL_RATES;
    }
  },

  saveFuelRates(rates: FuelRatesConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FUEL_RATES, JSON.stringify(rates));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getAdminPaymentSettings(): AdminPaymentSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_PAYMENTS);
      return data ? JSON.parse(data) : DEFAULT_ADMIN_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_ADMIN_PAYMENT_SETTINGS;
    }
  },

  saveAdminPaymentSettings(settings: AdminPaymentSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PAYMENTS, JSON.stringify(settings));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getSimulatorState(): SimulatorState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SIM_STATE);
      return data ? JSON.parse(data) : DEFAULT_SIMULATOR_STATE;
    } catch {
      return DEFAULT_SIMULATOR_STATE;
    }
  },

  saveSimulatorState(state: SimulatorState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SIM_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getStoreItems(): StoreItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORE_ITEMS);
      return data ? JSON.parse(data) : INITIAL_STORE_ITEMS;
    } catch {
      return INITIAL_STORE_ITEMS;
    }
  },

  saveStoreItems(items: StoreItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STORE_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getRides(): RideLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RIDES);
      return data ? JSON.parse(data) : INITIAL_RIDES;
    } catch {
      return INITIAL_RIDES;
    }
  },

  saveRides(rides: RideLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getCharges(): ChargeLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHARGES);
      return data ? JSON.parse(data) : INITIAL_CHARGES;
    } catch {
      return INITIAL_CHARGES;
    }
  },

  saveCharges(charges: ChargeLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARGES, JSON.stringify(charges));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getMaintenance(): MaintenanceItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
      return data ? JSON.parse(data) : INITIAL_MAINTENANCE;
    } catch {
      return INITIAL_MAINTENANCE;
    }
  },

  saveMaintenance(items: MaintenanceItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(items));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getBadges(): Badge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BADGES);
      return data ? JSON.parse(data) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  },

  saveBadges(badges: Badge[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getRoutes(): SavedRoute[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRoutes(routes: SavedRoute[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  addRoute(route: SavedRoute): void {
    try {
      const routes = this.getRoutes();
      routes.unshift(route);
      this.saveRoutes(routes);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  deleteRoute(id: string): void {
    try {
      const routes = this.getRoutes().filter((r) => r.id !== id);
      this.saveRoutes(routes);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getFeedback(): FeedbackSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFeedback(item: FeedbackSubmission): void {
    try {
      const all = this.getFeedback();
      all.unshift(item);
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(all));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  exportCSV(): void {
    const rides = this.getRides();
    const charges = this.getCharges();
    const fuelRates = this.getFuelRates();

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '--- EV TRACKER PK - RIDES & TRIP LOG ---\n';
    csvContent += 'Date,Time,Distance (km),Duration (min),Start Voltage (V),End Voltage (V),Ride Mode,Load,Avg Speed (km/h),PKR Saved vs Petrol,Terrain,Notes\n';

    rides.forEach((r) => {
      const dt = new Date(r.dateTime);
      const dateStr = dt.toLocaleDateString();
      const timeStr = dt.toLocaleTimeString();
      const pkrPerKm = Math.max(5, (fuelRates.petrolPricePerLiter / fuelRates.petrolBikeKmPerLiter) - 1.2);
      const tripSaved = Math.round(r.distanceKm * pkrPerKm);
      csvContent += `"${dateStr}","${timeStr}",${r.distanceKm},${r.durationMinutes || 0},${r.startVoltage},${r.endVoltage},"${r.rideMode}","${r.passengerLoad}",${r.avgSpeedKmh || 0},${tripSaved},"${r.terrain}","${(r.notes || '').replace(/"/g, '""')}"\n`;
    });

    csvContent += '\n--- CHARGING SESSIONS LOG ---\n';
    csvContent += 'Date,Time,Start Voltage (V),End Voltage (V),Duration (Hours),Units (kWh),Cost (PKR),Location,Notes\n';

    charges.forEach((c) => {
      const dt = new Date(c.dateTime);
      const dateStr = dt.toLocaleDateString();
      const timeStr = dt.toLocaleTimeString();
      csvContent += `"${dateStr}","${timeStr}",${c.startVoltage},${c.endVoltage},${c.durationHours},${c.unitsConsumedKwh},${c.costPkr},"${c.chargingLocation}","${(c.notes || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EVTracker_Trips_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportJSON(): void {
    const backupData = {
      user: this.getUser(),
      vehicles: this.getVehicles(),
      rides: this.getRides(),
      charges: this.getCharges(),
      maintenance: this.getMaintenance(),
      badges: this.getBadges(),
      fuelRates: this.getFuelRates(),
      adminPayments: this.getAdminPaymentSettings(),
      simulatorState: this.getSimulatorState(),
      storeItems: this.getStoreItems(),
      exportedAt: new Date().toISOString(),
      appVersion: '3.0.0',
    };

    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `EVTracker_FullBackup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  restoreJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.vehicles) this.saveVehicles(parsed.vehicles);
      if (parsed.rides) this.saveRides(parsed.rides);
      if (parsed.charges) this.saveCharges(parsed.charges);
      if (parsed.maintenance) this.saveMaintenance(parsed.maintenance);
      if (parsed.badges) this.saveBadges(parsed.badges);
      if (parsed.user) this.saveUser(parsed.user);
      if (parsed.fuelRates) this.saveFuelRates(parsed.fuelRates);
      if (parsed.adminPayments) this.saveAdminPaymentSettings(parsed.adminPayments);
      if (parsed.simulatorState) this.saveSimulatorState(parsed.simulatorState);
      if (parsed.storeItems) this.saveStoreItems(parsed.storeItems);
      return true;
    } catch {
      return false;
    }
  },
};
