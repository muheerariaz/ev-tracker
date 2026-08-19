export type Language = 'en' | 'ur' | 'roman';
export type ThemeMode = 'dark' | 'light';

export type NavigationTab =
  | 'dashboard'
  | 'tracking'
  | 'garage'
  | 'slope'
  | 'logs'
  | 'maintenance'
  | 'store'
  | 'settings';

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speedKmh?: number;
  altitude?: number;
  accuracy?: number;
  voltage?: number;
}

export interface SavedRoute {
  id: string;
  vehicleId: string;
  name: string;
  date: string;
  points: GPSPoint[];
  distanceKm: number;
  durationSeconds: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  elevationGainMeters: number;
  startVoltage?: number;
  endVoltage?: number;
  notes?: string;
}

export type BatteryChemistry = 
  | '72V_GRAPHENE'
  | '60V_GRAPHENE'
  | '72V_LITHIUM'
  | '60V_LITHIUM'
  | '48V_LEAD_ACID'
  | 'CUSTOM';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  nickname: string;
  year: number;
  batteryChemistry: BatteryChemistry;
  nominalVoltage: number; // e.g. 72V
  fullVoltage: number; // e.g. 78.5V
  cutoffVoltage: number; // e.g. 62.0V
  batteryCapacityAh: number; // e.g. 32Ah, 38Ah
  motorWattage: number; // e.g. 1200W, 1500W peak
  odometerKm: number;
  currentVoltage: number;
  healthPercentage: number;
  lastChargeDate?: string;
  purchaseDate?: string;
  registrationNumber?: string;
  color?: string;
  isPrimary?: boolean;
}

export interface RideLog {
  id: string;
  vehicleId: string;
  dateTime: string; // ISO string
  distanceKm: number;
  durationMinutes: number;
  startVoltage: number;
  endVoltage: number;
  rideMode: 'ECO' | 'NORMAL' | 'SPORT';
  passengerLoad: 'SINGLE' | 'DOUBLE' | 'CARGO';
  terrain: 'FLAT' | 'SLOPED' | 'ROUGH_CITY';
  energyUsedUnits?: number; // estimated kWh
  notes?: string;
  avgSpeedKmh?: number;
}

export interface ChargeLog {
  id: string;
  vehicleId: string;
  dateTime: string; // ISO string
  startVoltage: number;
  endVoltage: number;
  durationHours: number;
  unitsConsumedKwh: number;
  costPkr: number;
  chargingLocation: 'HOME' | 'OFFICE' | 'COMMERCIAL_STATION';
  notes?: string;
}

export interface MaintenanceItem {
  id: string;
  vehicleId: string;
  titleKey: string;
  titleCustom?: string;
  category: 'TIRES' | 'BRAKES' | 'BATTERY' | 'ELECTRICAL' | 'CHASSIS';
  intervalKm: number;
  intervalDays: number;
  lastDoneKm: number;
  lastDoneDate: string;
  status: 'GOOD' | 'DUE_SOON' | 'OVERDUE';
  notes?: string;
}

export interface Badge {
  id: string;
  titleKey?: string;
  title?: {
    en: string;
    ur: string;
    roman: string;
  };
  descKey?: string;
  description?: {
    en: string;
    ur: string;
    roman: string;
  };
  iconName?: string;
  icon?: string;
  category: 'DISTANCE' | 'SAVINGS' | 'ECO' | 'HEALTH' | 'EXPLORER';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
  unlockedDate?: string;
  rewardPkr?: number;
}

export interface StoreItem {
  id: string;
  title: {
    en: string;
    ur: string;
    roman: string;
  };
  category: 'PROTECTION' | 'CHARGING' | 'CARE' | 'SAFETY' | 'GADGETS';
  pricePkr: number;
  originalPricePkr: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: {
    en: string;
    ur: string;
    roman: string;
  };
  features: string[];
  affiliateUrl: string;
  isPopular?: boolean;
  inStock: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  isPro: boolean;
  proExpiryDate?: string;
  avatarUrl?: string;
  joinedDate: string;
  preferredLanguage: Language;
  theme: ThemeMode;
  notificationsEnabled: {
    chargeReminder: boolean;
    maintenanceAlerts: boolean;
    batterySagWarning: boolean;
    weeklyReport: boolean;
  };
}

export interface FeedbackSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT' | 'GENERAL';
  subject: string;
  message: string;
  submittedAt: string;
  status: 'PENDING' | 'RESOLVED';
}

export interface AdminPaymentSettings {
  easypaisaTitle: string;
  easypaisaNumber: string;
  sadapayTitle: string;
  sadapayNumber: string;
  proPricePkr: number;
  paymentInstructions: string;
  adminPasscode: string;
  supportEmail: string;
}

export interface FuelRatesConfig {
  petrolPricePerLiter: number;
  petrolBikeKmPerLiter: number;
  electricityPricePerKwh: number;
}

export type RiderLoad = 'SINGLE' | 'DOUBLE' | 'CARGO' | 'CUSTOM';

export interface SimulatorState {
  voltage: number;
  mode?: 'ECO' | 'NORMAL' | 'SPORT';
  ridingMode?: 'ECO' | 'NORMAL' | 'SPORT';
  load?: RiderLoad;
  riderLoad?: RiderLoad;
  customRiderWeightKg?: number;
  temp?: 'SUMMER' | 'SPRING' | 'WINTER';
  temperature?: 'SUMMER' | 'SPRING' | 'WINTER';
  headlight?: boolean;
  headlightOn?: boolean;
}


export interface BatteryDegradationStats {
  currentSoh: number;
  estimatedCycles: number;
  maxCycles: number;
  projectedYearsRemaining: number;
  temperatureStressScore: number;
  monthlyDegradationPercent: number;
}

export interface MaintenanceForecast {
  monthlyDistanceKm: number;
  projectedMonthlyCostPkr: number;
  projectedAnnualCostPkr: number;
  brakePadLifeKm: number;
  brakePadRemainingKm: number;
  tireLifeKm: number;
  tireRemainingKm: number;
  batteryLifeYears: number;
  batteryRemainingYears: number;
}
