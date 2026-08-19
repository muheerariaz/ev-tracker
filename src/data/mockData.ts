import {
  Vehicle,
  RideLog,
  ChargeLog,
  MaintenanceItem,
  Badge,
  StoreItem,
  UserProfile,
  AdminPaymentSettings,
  FuelRatesConfig,
  SimulatorState,
} from '../types';

export interface BrandModelOption {
  brand: string;
  models: string[];
}

export const PAKISTANI_EV_BRANDS: BrandModelOption[] = [
  {
    brand: 'Evee',
    models: [
      'Evee C1',
      'Evee C1 Air',
      'Evee C1 Pro',
      'Evee Gen Z',
      'Evee Gen Z Pro',
      'Evee Nisa',
      'Evee S1',
      'Evee M1',
    ],
  },
  {
    brand: 'Yadea',
    models: [
      'Yadea T5',
      'Yadea E8S Pro',
      'Yadea G5',
      'Yadea Ruibin',
      'Yadea Guanneng',
      'Yadea TTFAR',
      'Yadea Champion',
    ],
  },
  {
    brand: 'Metro',
    models: [
      'Metro E8S Pro',
      'Metro T9',
      'Metro M6',
      'Metro Milan',
      'Metro Falcon',
    ],
  },
  {
    brand: 'Vlektra',
    models: [
      'Vlektra Retro',
      'Vlektra 1969',
      'Vlektra Bolt',
      'Vlektra Blade',
    ],
  },
  {
    brand: 'Crown',
    models: [
      'Crown Benling',
      'Crown Electra 72V',
      'Crown Grace',
      'Crown Stallion',
      'Crown Electric 70',
    ],
  },
  {
    brand: 'Road Prince',
    models: [
      'Road Prince E-Go 72V',
      'Road Prince E-Glide',
      'Road Prince Bella',
    ],
  },
  {
    brand: 'Super Power',
    models: [
      'Super Power E-Scooter 72V',
      'Super Power E-100',
      'Super Power Leo EV',
      'Super Power SP-70 EV',
    ],
  },
  {
    brand: 'TailG',
    models: [
      'TailG Lion',
      'TailG Tiger',
      'TailG Dolphin',
      'TailG Leopard',
    ],
  },
  {
    brand: 'NIU',
    models: [
      'NIU NQi GTS',
      'NIU MQi GT',
      'NIU UQi Pro',
    ],
  },
  {
    brand: 'United',
    models: [
      'United US-100 EV',
      'United Revolt EV',
    ],
  },
  {
    brand: 'Super Star',
    models: [
      'Super Star Eco 70 EV',
      'Super Star Thunder EV',
    ],
  },
  {
    brand: 'JTA',
    models: [
      'JTA Electric City',
      'JTA Zoom 72V',
      'JTA Pro Cruiser',
    ],
  },
  {
    brand: 'Jagular',
    models: [
      'Jagular Stealth 72V',
      'Jagular Alpha Pro',
      'Jagular Thunder',
    ],
  },
  {
    brand: 'Other / Custom Model',
    models: ['Custom EV Model / DIY Build'],
  },
];

export const MAJOR_PAKISTAN_CITIES = [
  { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
  { name: 'Faisalabad', lat: 31.4504, lng: 73.1350 },
  { name: 'Multan', lat: 30.1575, lng: 71.5249 },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
  { name: 'Gujranwala', lat: 32.1877, lng: 74.1945 },
  { name: 'Sialkot', lat: 32.4945, lng: 74.5229 },
  { name: 'Sargodha', lat: 32.0836, lng: 72.6711 },
  { name: 'Bahawalpur', lat: 29.3544, lng: 71.6911 },
  { name: 'Hyderabad', lat: 25.3960, lng: 68.3578 },
  { name: 'Sukkur', lat: 27.7052, lng: 68.8574 },
  { name: 'Abbottabad', lat: 34.1688, lng: 73.2215 },
  { name: 'Mirpur', lat: 33.1478, lng: 73.7519 },
];

export const INITIAL_USER: UserProfile = {
  id: 'user_default',
  name: '',
  email: '',
  phone: '',
  city: '',
  isPro: false,
  joinedDate: new Date().toISOString().slice(0, 10),
  preferredLanguage: 'en',
  theme: 'dark',
  notificationsEnabled: {
    chargeReminder: true,
    maintenanceAlerts: true,
    batterySagWarning: true,
    weeklyReport: true,
  },
};

// Garage starts completely empty by default as requested
export const INITIAL_VEHICLES: Vehicle[] = [];

export const INITIAL_RIDES: RideLog[] = [];

export const INITIAL_CHARGES: ChargeLog[] = [];

export const INITIAL_MAINTENANCE: MaintenanceItem[] = [];

export const DEFAULT_ADMIN_PAYMENT_SETTINGS: AdminPaymentSettings = {
  easypaisaTitle: '',
  easypaisaNumber: '',
  sadapayTitle: '',
  sadapayNumber: '',
  proPricePkr: 999,
  paymentInstructions: 'Send payment via EasyPaisa or SadaPay, enter the Transaction ID (TRX ID) below, and submit for instant verification.',
  adminPasscode: 'pk786admin',
  supportEmail: 'evtrackerpk.support@gmail.com',
};

export const DEFAULT_FUEL_RATES: FuelRatesConfig = {
  petrolPricePerLiter: 285,
  petrolBikeKmPerLiter: 35,
  electricityPricePerKwh: 35,
};

export const DEFAULT_SIMULATOR_STATE: SimulatorState = {
  voltage: 74.0,
  mode: 'NORMAL',
  load: 'SINGLE',
  customRiderWeightKg: 75,
  temp: 'SPRING',
  headlight: false,
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_eco_rider',
    titleKey: 'Eco Pioneer',
    descKey: 'Track your first 50 km on zero emissions',
    iconName: 'Leaf',
    category: 'ECO',
    unlocked: true,
    progress: 50,
    maxProgress: 50,
    unlockedDate: '2026-08-10',
    rewardPkr: 500,
  },
  {
    id: 'badge_500km_club',
    titleKey: '500 km Club',
    descKey: 'Achieve 500 km total electric distance',
    iconName: 'Award',
    category: 'DISTANCE',
    unlocked: true,
    progress: 1420,
    maxProgress: 500,
    unlockedDate: '2026-08-14',
    rewardPkr: 1000,
  },
  {
    id: 'badge_1000km_legend',
    titleKey: '1000 km Legend',
    descKey: 'Surpass 1,000 km on your Pakistani EV scooter',
    iconName: 'Zap',
    category: 'DISTANCE',
    unlocked: true,
    progress: 1420,
    maxProgress: 1000,
    unlockedDate: '2026-08-16',
    rewardPkr: 2000,
  },
  {
    id: 'badge_paisa_saver',
    titleKey: 'Paisa Saver Master',
    descKey: 'Save over PKR 15,000 compared to petrol costs',
    iconName: 'Coins',
    category: 'SAVINGS',
    unlocked: true,
    progress: 18500,
    maxProgress: 15000,
    unlockedDate: '2026-08-15',
    rewardPkr: 1500,
  },
  {
    id: 'badge_battery_guardian',
    titleKey: 'Battery Guardian',
    descKey: 'Log 5 full charges without letting battery hit 62V cutoff',
    iconName: 'ShieldCheck',
    category: 'HEALTH',
    unlocked: false,
    progress: 3,
    maxProgress: 5,
    rewardPkr: 750,
  },
  {
    id: 'badge_hill_conqueror',
    titleKey: 'Hill Conqueror',
    descKey: 'Successfully calculate and conquer a 12%+ incline',
    iconName: 'Mountain',
    category: 'EXPLORER',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardPkr: 500,
  },
];

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  {
    id: 'store_01',
    title: {
      en: 'Heavy-Duty Waterproof Thermal EV Scooter Cover',
      ur: 'واٹر پروف اور ہیٹ ریزسٹنٹ اسکوٹر کور',
      roman: 'Waterproof Heavy Duty Scooter Cover',
    },
    category: 'PROTECTION',
    pricePkr: 2450,
    originalPricePkr: 3200,
    rating: 4.9,
    reviewCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    description: {
      en: 'Custom tailored for Evee Gen Z, Yadea T5, Metro & Crown scooters with battery heat shield ventilation and lock holes.',
      ur: 'ای وی اسکوٹرز کے لیے خصوصی تیار کردہ واٹر پروف کور جو بارش اور شدید دھوپ سے بیٹری کو محفوظ رکھتا ہے۔',
      roman: 'Evee aur Yadea scooters ke liye special waterproof cover jo battery ko dhoop aur barish se bachata hai.',
    },
    features: ['100% Waterproof Oxford Fabric', 'Reflective Night Safety Strips', 'Windproof Buckle & Lock Hole', 'Heat Reflective Silver Coating'],
    affiliateUrl: 'https://daraz.pk/products/ev-scooter-waterproof-cover',
    isPopular: true,
    inStock: true,
  },
  {
    id: 'store_02',
    title: {
      en: '72V Smart Fast Charger with Auto-Cutoff & Cooling Fan',
      ur: '72 وولٹ اسمارٹ فاسٹ چارجر خودکار کٹ آف کے ساتھ',
      roman: '72V Smart Fast Charger Auto Cutoff Ke Sath',
    },
    category: 'CHARGING',
    pricePkr: 6800,
    originalPricePkr: 8500,
    rating: 4.8,
    reviewCount: 98,
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80',
    description: {
      en: 'High-efficiency 72V 3.5A intelligent pulse charger designed for Graphene and Lead-acid battery packs. Prevents battery swelling.',
      ur: '72 وولٹ گرافین بیٹری کے لیے بہترین چارجر جو بیٹری پھولنے سے بچاتا ہے اور چارج ہونے پر خود بند ہو جاتا ہے۔',
      roman: '72V graphene battery ke liye safe fast charger jo auto-cutoff ke sath aata hai.',
    },
    features: ['Microprocessor Controlled Auto-Cutoff', 'High-Speed Silent Cooling Fan', 'Short Circuit & Reverse Polarity Protection', 'Pure Copper High-Grade Wiring'],
    affiliateUrl: 'https://daraz.pk/products/72v-smart-charger-ev',
    isPopular: true,
    inStock: true,
  },
  {
    id: 'store_03',
    title: {
      en: 'Anti-Vibration Heavy Aluminum Mobile Mount + QC3.0 USB Charger',
      ur: 'اینٹی وائبریشن ایلومینیم موبائل ہولڈر فاسٹ چارجر کے ساتھ',
      roman: 'Anti-Vibration Mobile Mount Fast USB Charger Ke Sath',
    },
    category: 'GADGETS',
    pricePkr: 2850,
    originalPricePkr: 3500,
    rating: 4.9,
    reviewCount: 215,
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
    description: {
      en: 'Dampens road vibrations on Pakistani roads. Connects directly to scooter 12V converter for ultra-fast smartphone charging while navigating.',
      ur: 'پاکستانی سڑکوں کے جھٹکوں سے موبائل کے کیمرے کو محفوظ رکھتا ہے اور راستے میں فاسٹ چارجنگ فراہم کرتا ہے۔',
      roman: 'Road vibrations se camera ko bachata hai aur sath mein fast USB charging deta hai.',
    },
    features: ['CNC Aviation Grade Aluminum Body', 'Silicone 4-Corner Shock Absorbers', '360° Ball Joint Rotation', 'Waterproof Rubber USB Cap'],
    affiliateUrl: 'https://daraz.pk/products/anti-vibration-phone-mount-ev',
    isPopular: false,
    inStock: true,
  },
  {
    id: 'store_04',
    title: {
      en: '110dB Alarm Siren Heavy Stainless Disc Brake Lock',
      ur: '110dB الارم والا مضبوط ڈسک بریک لاک',
      roman: 'Alarm Siren Heavy Disc Brake Lock',
    },
    category: 'SAFETY',
    pricePkr: 1950,
    originalPricePkr: 2600,
    rating: 4.7,
    reviewCount: 84,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
    description: {
      en: 'Motion-sensitive alarm lock that screams if your EV scooter is touched or wheeled away. Essential for public parking in Lahore & Karachi.',
      ur: 'موومنٹ سینسر الارم جو اسکوٹر کو چھونے پر زوردار آواز نکالتا ہے۔ چوری سے مکمل حفاظت۔',
      roman: 'Movement sensor alarm lock jo scooter hilane par loud siren bajata hai.',
    },
    features: ['110 Decibel Piercing Siren', '7mm Hardened Steel Locking Pin', 'Waterproof & Rustproof Zinc Alloy', 'Includes 2 Laser Cut Keys & Reminder Cable'],
    affiliateUrl: 'https://daraz.pk/products/alarm-disc-lock-ev',
    isPopular: false,
    inStock: true,
  },
  {
    id: 'store_05',
    title: {
      en: 'Matte Ceramic Coating & EV Detail Cleaning Kit',
      ur: 'میٹ سیرامک کوٹنگ اور ای وی بائیک صفائی کٹ',
      roman: 'Matte Ceramic Coating Aur Cleaning Kit',
    },
    category: 'CARE',
    pricePkr: 1800,
    originalPricePkr: 2400,
    rating: 4.8,
    reviewCount: 63,
    imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop&q=80',
    description: {
      en: 'Specially formulated for matte finish EV panels (Evee Gen Z, Yadea). Repels road grime, dust, and water spots without glossy residue.',
      ur: 'میٹ رنگ والے اسکوٹرز کے لیے خصوصی پالش جو دھول اور پانی کے داغوں سے بچاتی ہے۔',
      roman: 'Matte paint ke liye special spray jo dust aur scratches se protect karta hai.',
    },
    features: ['Hydrophobic Nano Layer Protection', 'Zero Gloss Streak-Free Matte Formula', 'Safe on Plastic & Acrylic Visors', 'Includes Premium Microfiber Towel'],
    affiliateUrl: 'https://daraz.pk/products/matte-ceramic-coating-scooter',
    isPopular: false,
    inStock: true,
  },
  {
    id: 'store_06',
    title: {
      en: 'Emergency Tubeless Tire Puncture Repair Kit + CO2 Inflator',
      ur: 'ایمرجنسی ٹیوب لیس ٹائر پنکچر کٹ اور انفلریٹر',
      roman: 'Emergency Tubeless Tire Puncture Kit',
    },
    category: 'CARE',
    pricePkr: 1650,
    originalPricePkr: 2200,
    rating: 4.6,
    reviewCount: 51,
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80',
    description: {
      en: 'Compact pocket kit to fix EV scooter tubeless tire punctures on the roadside within 2 minutes without removing the wheel.',
      ur: 'سڑک پر 2 منٹ میں بغیر ٹائر کھولے پنکچر لگانے والی ایمرجنسی کٹ۔',
      roman: 'Roadside par 2 minute mein puncture theek karne wali handy kit.',
    },
    features: ['5 Heavy Vulcanizing Repair Strips', 'Ergonomic T-Handle Rasp & Needle Tools', 'Rubber Cement & Valve Core Tool', 'Compact Oxford Carrying Pouch'],
    affiliateUrl: 'https://daraz.pk/products/tubeless-tire-repair-kit-ev',
    isPopular: false,
    inStock: true,
  },
];

export const PAKISTANI_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhelum',
  'Sahiwal',
  'Mardan',
  'Mirpur',
  'Muzaffarabad',
  'Gwadar',
];

export const FAQ_ITEMS = [


  {
    q_en: 'What is the real safe voltage range for a 72V Graphene battery?',
    q_ur: '72 وولٹ گرافین بیٹری کے لیے محفوظ وولٹیج رینج کیا ہے؟',
    q_roman: '72V Graphene battery ke liye safe voltage range kya hai?',
    a_en: 'A 72V Graphene battery (6 x 12V cells) charges up to ~78.0V - 78.5V when 100% full. The safe operating cutoff is 62.0V - 63.0V. We strongly advise charging when you hit 66.0V (approx 20% remaining) to maximize battery longevity and avoid severe voltage sag.',
    a_ur: '72 وولٹ گرافین بیٹری فل چارج پر 78.0 سے 78.5 وولٹ تک جاتی ہے۔ اس کی کم از کم کٹ آف حد 62.0 وولٹ ہے۔ بیٹری کی لمبی عمر کے لیے مشورہ ہے کہ 66.0 وولٹ (20 فیصد باقی) پر چارج کر لیں تاکہ بیٹری پھولنے اور خراب ہونے سے بچ سکے۔',
    a_roman: '72V Graphene battery full charge par 78.0V - 78.5V show karti hai. Iska cutoff 62V hai. Behtar hai ke jab voltage 66V (20%) par aaye to charge kar lein taake battery ki life lambi rahe.',
  },
  {
    q_en: 'How much money do I actually save compared to petrol in Pakistan?',
    q_ur: 'پاکستان میں پٹرول کے مقابلے میں کتنے روپے کی بچت ہوتی ہے؟',
    q_roman: 'Pakistan mein petrol ke muqablay kitne rupay bachat hoti hai?',
    a_en: 'At current petrol prices (~PKR 280/L), a 70cc/125cc bike costs ~PKR 8 to 9 per km. An electric scooter consuming ~2.5 kWh per 70km at PKR 45-55/unit costs only ~PKR 1.8 to 2.2 per km. You save roughly PKR 6.5 to 7.0 per kilometer traveled!',
    a_ur: 'موجودہ پٹرول کی قیمت (تقریباً 280 روپے فی لیٹر) پر عام موٹر سائیکل 8 سے 9 روپے فی کلومیٹر خرچ کرتی ہے، جبکہ ای وی اسکوٹر صرف 1.8 سے 2.2 روپے فی کلومیٹر لیتا ہے۔ آپ ہر کلومیٹر پر تقریباً 7 روپے بچاتے ہیں!',
    a_roman: 'Petrol bike takreeban 8-9 PKR per km leti hai, jabke EV scooter sirf 2 PKR per km mein chalti hai. Aap har kilometer par lagbhag 7 PKR bachat karte hain!',
  },
  {
    q_en: 'Can my 1200W / 1500W EV scooter climb steep Pakistani flyovers and hills?',
    q_ur: 'کیا 1200 یا 1500 واٹ کا اسکوٹر پل اور چڑھائی آسانی سے چڑھ سکتا ہے؟',
    q_roman: 'Kya 1200W / 1500W scooter flyover aur chadhai aasaani se chadh sakta hai?',
    a_en: 'Yes! Standard city flyovers (4-6% grade) are climbed at 32-42 km/h easily even with a double passenger. For steeper slopes (12-15% like Margalla Hills), a 1500W motor with 72V will climb at 20-25 km/h under single load. Use our interactive "Hill Climb" tool to test exact scenarios.',
    a_ur: 'جی ہاں! عام شہری فلائی اوورز (4 سے 6 فیصد چڑھائی) پر 1200 یا 1500 واٹ موٹر ڈبل سواری کے ساتھ بھی 35 کلومیٹر کی رفتار سے چڑھ جاتی ہے۔ شدید چڑھائی پر ہمارا "سلوپ کیلکولیٹر" استعمال کر کے درست اسپیڈ چیک کریں۔',
    a_roman: 'Ji haan! Normal flyover par double sawari ke sath bhi 35+ km/h par aram se chadh jata hai. Aap hamara Hill Climb tool use karke exact speed check kar sakte hain.',
  },
  {
    q_en: 'How do I export my ride history or transfer to a new phone?',
    q_ur: 'میں اپنا ڈیٹا دوسری ڈیوائس پر کیسے منتقل کر سکتا ہوں؟',
    q_roman: 'Data export ya new phone par transfer kaise karein?',
    a_en: 'Go to Settings > Export Data (CSV / JSON). You can download an instant spreadsheet of all your logged trips, battery voltages, and charging expenses, or export a JSON backup file to import on any device.',
    a_ur: 'سیٹنگز میں جائیں اور "ایکسپورٹ ڈیٹا" پر کلک کریں۔ آپ اپنے تمام سفر اور خرچ کی ایکسل (CSV) فائل یا JSON فائل باآسانی ڈاؤن لوڈ کر سکتے ہیں۔',
    a_roman: 'Settings mein ja kar "Export Data (CSV / JSON)" par click karein aur apna tamam record download kar lein.',
  },
];
