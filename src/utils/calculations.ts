import {
  Vehicle,
  RideLog,
  FuelRatesConfig,
  BatteryDegradationStats,
  MaintenanceForecast,
} from '../types';

/**
 * Calculates accurate State of Charge (SoC %) from resting battery voltage
 * for 72V/60V/48V Graphene/Lithium profiles.
 */
export function calculateStateOfCharge(
  voltage: number,
  nominalVoltage = 72,
  fullVoltage = 78.5,
  cutoffVoltage = 62.0
): number {
  if (voltage >= fullVoltage) return 100;
  if (voltage <= cutoffVoltage) return 0;

  const range = fullVoltage - cutoffVoltage;
  if (range <= 0) return 50;
  const normalized = (voltage - cutoffVoltage) / range;

  let soc = 0;
  if (normalized > 0.8) {
    soc = 80 + ((normalized - 0.8) / 0.2) * 20;
  } else if (normalized > 0.3) {
    soc = 30 + ((normalized - 0.3) / 0.5) * 50;
  } else {
    soc = (normalized / 0.3) * 30;
  }

  return Math.min(100, Math.max(0, Math.round(soc)));
}

/**
 * Estimate real-world remaining range in km based on:
 * - Current voltage & capacity
 * - Riding mode (Eco, Normal, Sport)
 * - Load (Single, Double, Cargo, or Custom Weight)
 * - Ambient temperature (Summer, Spring, Winter)
 * - Headlight on/off
 * - Vehicle battery health %
 */
export function calculateEstimatedRange(
  voltage: number,
  vehicle: Vehicle,
  mode: 'ECO' | 'NORMAL' | 'SPORT' = 'NORMAL',
  load: 'SINGLE' | 'DOUBLE' | 'CARGO' | 'CUSTOM' = 'SINGLE',
  temp: 'SUMMER' | 'SPRING' | 'WINTER' = 'SPRING',
  headlight = false,
  customRiderWeightKg = 75
): {
  rangeKm: number;
  socPercent: number;
  status: 'OPTIMAL' | 'CAUTION' | 'CRITICAL';
} {
  const soc = calculateStateOfCharge(
    voltage,
    vehicle.nominalVoltage,
    vehicle.fullVoltage,
    vehicle.cutoffVoltage
  );

  // Base max range for 100% battery (32Ah 72V ~ 75km baseline in normal mode)
  const base100Range =
    (vehicle.batteryCapacityAh / 32) *
    (vehicle.nominalVoltage / 72) *
    75 *
    (vehicle.healthPercentage / 100);

  let modeFactor = 1.0;
  if (mode === 'ECO') modeFactor = 1.25;
  if (mode === 'SPORT') modeFactor = 0.78;

  let loadFactor = 1.0;
  if (load === 'SINGLE') {
    loadFactor = 1.0;
  } else if (load === 'DOUBLE') {
    loadFactor = 0.82;
  } else if (load === 'CARGO') {
    loadFactor = 0.72;
  } else if (load === 'CUSTOM') {
    // Exact weight scaling relative to 75kg base
    const weightDiff = customRiderWeightKg - 75;
    loadFactor = Math.max(0.6, 1.0 - (weightDiff * 0.0025));
  }

  let tempFactor = 1.0;
  if (temp === 'SUMMER') tempFactor = 0.95; // heat internal resistance
  if (temp === 'WINTER') tempFactor = 0.85; // cold chemical slowdown

  const lightFactor = headlight ? 0.96 : 1.0;

  const totalFactor = modeFactor * loadFactor * tempFactor * lightFactor;
  const maxPracticalRange = base100Range * totalFactor;

  const remainingKm = Math.max(
    0,
    Math.round((soc / 100) * maxPracticalRange * 10) / 10
  );

  let status: 'OPTIMAL' | 'CAUTION' | 'CRITICAL' = 'OPTIMAL';
  if (voltage <= vehicle.cutoffVoltage + 2.0 || soc <= 15) {
    status = 'CRITICAL';
  } else if (voltage <= vehicle.cutoffVoltage + 5.0 || soc <= 30) {
    status = 'CAUTION';
  }

  return {
    rangeKm: remainingKm,
    socPercent: soc,
    status,
  };
}

/**
 * Hill Climb Physics Engine
 * Calculates ascent speed, current draw, torque and motor thermal status under slope gradient.
 */
export interface HillClimbResult {
  estimatedSpeedKmh: number;
  currentDrawAmps: number;
  powerRequiredWatts: number;
  torqueNm: number;
  drainMultiplier: number;
  thermalStatus: 'COOL' | 'WARM' | 'CRITICAL';
  verdictKey: string;
  verdictDesc: string;
}

export function calculateHillClimb(
  inclineGradePercent: number, // e.g. 5%, 12%, 18%
  motorWattage: number, // e.g. 1500W
  voltage: number, // e.g. 72V
  load: 'SINGLE' | 'DOUBLE' | 'CARGO' | 'CUSTOM',
  customRiderWeightKg = 75
): HillClimbResult {
  const g = 9.81; // m/s^2
  const scooterMass = 85; // kg average for 72V electric scooter
  let riderMass = 75; // kg
  if (load === 'DOUBLE') riderMass = 145;
  if (load === 'CARGO') riderMass = 180;
  if (load === 'CUSTOM') riderMass = customRiderWeightKg;
  const totalMass = scooterMass + riderMass; // kg

  const thetaRad = Math.atan(inclineGradePercent / 100);
  const sinTheta = Math.sin(thetaRad);
  const cosTheta = Math.cos(thetaRad);

  // Forces
  const fGravity = totalMass * g * sinTheta;
  const crr = 0.015; // rolling resistance
  const fRolling = totalMass * g * crr * cosTheta;

  // Max peak motor power (1.35x nominal for brushless hub motor)
  const peakMotorPower = motorWattage * 1.35;
  const systemEfficiency = 0.82;
  const usablePowerWatts = peakMotorPower * systemEfficiency;

  const fLinear = fGravity + fRolling;

  let speedMs = usablePowerWatts / Math.max(fLinear, 1);
  const maxFlatSpeedMs = 65 / 3.6;
  speedMs = Math.min(speedMs, maxFlatSpeedMs);

  let speedKmh = Math.max(0, speedMs * 3.6);

  if (fGravity > usablePowerWatts / 2.0 && inclineGradePercent > 18) {
    speedKmh = Math.max(4, speedKmh * 0.6);
  }

  speedKmh = Math.round(speedKmh * 10) / 10;

  const powerDrawnWatts = Math.min(
    peakMotorPower,
    (fLinear * (speedKmh / 3.6)) / systemEfficiency + 120
  );
  const currentDrawAmps = Math.round((powerDrawnWatts / voltage) * 10) / 10;

  const wheelRadiusM = 0.22;
  const wheelRpm = (speedKmh / 3.6 / wheelRadiusM) * (60 / (2 * Math.PI));
  const torqueNm =
    wheelRpm > 0
      ? Math.min(120, Math.round((powerDrawnWatts * 9.5488) / Math.max(wheelRpm, 15)))
      : 85;

  const drainMultiplier = Math.round((powerDrawnWatts / 600) * 10) / 10;

  let thermalStatus: 'COOL' | 'WARM' | 'CRITICAL' = 'COOL';
  let verdictKey = 'status_cool';
  let verdictDesc =
    'Motor & controller operate well within safety thermal limits. Sustained cruising feasible.';

  if (powerDrawnWatts > motorWattage * 1.15 || currentDrawAmps > 28) {
    thermalStatus = 'CRITICAL';
    verdictKey = 'status_critical';
    verdictDesc =
      'Heavy thermal strain. Do not exceed continuous climb over 5 minutes to prevent controller shutdown.';
  } else if (powerDrawnWatts > motorWattage * 0.9 || currentDrawAmps > 20) {
    thermalStatus = 'WARM';
    verdictKey = 'status_warm';
    verdictDesc =
      'Moderate hill load. Normal performance on typical flyovers; keep steady throttle.';
  }

  return {
    estimatedSpeedKmh: speedKmh,
    currentDrawAmps,
    powerRequiredWatts: Math.round(powerDrawnWatts),
    torqueNm,
    drainMultiplier,
    thermalStatus,
    verdictKey,
    verdictDesc,
  };
}

/**
 * Calculate financial money saved (PKR) and environmental CO2 offset.
 * Fully configurable petrol rates and electricity unit costs.
 */
export function calculateSavings(
  totalKm: number,
  fuelRates?: FuelRatesConfig,
  batteryCapacityAh = 32,
  nominalVoltage = 72
): {
  pkrSaved: number;
  co2KgOffset: number;
  treesEquivalent: number;
  pkrPerKmSaved: number;
  petrolCostPerKm: number;
  evCostPerKm: number;
} {
  const petrolPrice = fuelRates?.petrolPricePerLiter ?? 285;
  const petrolKmPerL = fuelRates?.petrolBikeKmPerLiter ?? 35;
  const electUnitCost = fuelRates?.electricityPricePerKwh ?? 35;

  const petrolCostPerKm = petrolPrice / Math.max(petrolKmPerL, 10);
  const batteryKwh = (batteryCapacityAh * nominalVoltage) / 1000;
  const fullRangeKm = (batteryCapacityAh / 32) * (nominalVoltage / 72) * 75;
  const evCostPerKm = (batteryKwh * electUnitCost) / Math.max(fullRangeKm, 20);

  const pkrPerKmSaved = Math.max(1.5, Math.round((petrolCostPerKm - evCostPerKm) * 100) / 100);
  const pkrSaved = Math.round(totalKm * pkrPerKmSaved);

  const co2KgPerKm = 0.118;
  const co2KgOffset = Math.round(totalKm * co2KgPerKm * 10) / 10;
  const treesEquivalent = Math.round((co2KgOffset / 21) * 10) / 10;

  return {
    pkrSaved,
    co2KgOffset,
    treesEquivalent,
    pkrPerKmSaved,
    petrolCostPerKm: Math.round(petrolCostPerKm * 10) / 10,
    evCostPerKm: Math.round(evCostPerKm * 10) / 10,
  };
}

/**
 * Calculate Efficiency Score in Wh/km
 */
export function calculateEfficiencyScore(
  distanceKm: number,
  startVoltage: number,
  endVoltage: number,
  batteryAh = 32,
  nominalV = 72,
  fullV = 78.5,
  cutoffV = 62.0
): {
  whPerKm: number;
  totalWhConsumed: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  ratingColor: string;
  costPkr: number;
} {
  if (distanceKm <= 0) {
    return {
      whPerKm: 28,
      totalWhConsumed: 0,
      grade: 'A',
      ratingColor: 'text-emerald-400',
      costPkr: 0,
    };
  }

  const vSpan = fullV - cutoffV;
  const vDrop = Math.max(0.1, startVoltage - endVoltage);
  const capacityUsedFrac = Math.min(1.0, vDrop / Math.max(vSpan, 5));
  const totalWhCapacity = (batteryAh * nominalV);
  const totalWhConsumed = Math.round(capacityUsedFrac * totalWhCapacity);
  const whPerKm = Math.round((totalWhConsumed / distanceKm) * 10) / 10;

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A';
  let ratingColor = 'text-emerald-400';

  if (whPerKm <= 24) {
    grade = 'A+';
    ratingColor = 'text-emerald-300';
  } else if (whPerKm <= 31) {
    grade = 'A';
    ratingColor = 'text-emerald-400';
  } else if (whPerKm <= 38) {
    grade = 'B';
    ratingColor = 'text-teal-400';
  } else if (whPerKm <= 48) {
    grade = 'C';
    ratingColor = 'text-amber-400';
  } else {
    grade = 'D';
    ratingColor = 'text-rose-400';
  }

  const costPkr = Math.round((totalWhConsumed / 1000) * 35 * 10) / 10;

  return {
    whPerKm,
    totalWhConsumed,
    grade,
    ratingColor,
    costPkr,
  };
}

/**
 * Battery Degradation Analytics Engine
 */
export function calculateBatteryDegradation(
  vehicle: Vehicle,
  totalKmTracked = 0
): BatteryDegradationStats {
  const currentSoh = vehicle.healthPercentage || 94;
  const isLithium = vehicle.batteryChemistry.includes('LITHIUM');
  const maxCycles = isLithium ? 1200 : 450;

  const fullRangeKm = (vehicle.batteryCapacityAh / 32) * (vehicle.nominalVoltage / 72) * 75;
  const estimatedCycles = Math.round(
    Math.max(12, (vehicle.odometerKm + totalKmTracked) / Math.max(fullRangeKm, 25))
  );

  const cycleRatio = estimatedCycles / maxCycles;
  const projectedYearsRemaining = Math.max(
    0.5,
    Math.round(((1 - cycleRatio) * (isLithium ? 5.0 : 2.5)) * 10) / 10
  );

  const tempStressScore = 22; // Typical moderate ambient stress
  const monthlyDegradationPercent = isLithium ? 0.35 : 0.9;

  return {
    currentSoh,
    estimatedCycles,
    maxCycles,
    projectedYearsRemaining,
    temperatureStressScore: tempStressScore,
    monthlyDegradationPercent,
  };
}

/**
 * Generate 5-year degradation curve data points for Recharts.
 */
export function generateDegradationCurveData(vehicle: Vehicle) {
  const isLithium = vehicle.batteryChemistry.includes('LITHIUM');
  const currentSoh = vehicle.healthPercentage || 95;
  const dropPerYear = isLithium ? 3.5 : 8.5;

  const points = [];
  for (let year = 0; year <= 5; year++) {
    const idealSoh = Math.max(50, Math.round(100 - year * dropPerYear * 0.8));
    const realSoh = Math.max(45, Math.round(currentSoh - year * dropPerYear));
    const cutoffSoh = 70; // Standard industry end-of-life battery replacement threshold

    points.push({
      year: year === 0 ? 'Now' : `Yr ${year}`,
      idealSoh,
      realSoh,
      replacementThreshold: cutoffSoh,
    });
  }
  return points;
}

/**
 * Maintenance Cost & Wear Forecaster
 */
export function calculateMaintenanceForecast(
  monthlyDistanceKm = 450,
  vehicle?: Vehicle
): MaintenanceForecast {
  const currentOdo = vehicle?.odometerKm || 1200;

  const brakePadLifeKm = 3500;
  const tireLifeKm = 9000;
  const isLithium = vehicle?.batteryChemistry.includes('LITHIUM') ?? false;
  const batteryLifeYears = isLithium ? 4.5 : 2.2;

  const brakePadRemainingKm = Math.max(
    100,
    brakePadLifeKm - (currentOdo % brakePadLifeKm)
  );
  const tireRemainingKm = Math.max(
    300,
    tireLifeKm - (currentOdo % tireLifeKm)
  );
  const batteryRemainingYears = Math.max(0.6, batteryLifeYears - (currentOdo / 12000));

  // Electric scooters have ~70% lower routine maintenance costs than petrol bikes (no engine oil, no spark plugs, no air filters, no chain lubing)
  // Projected routine maintenance cost (tire inflation, brake shoe tuning, electrical inspection) ~ 350 PKR / month
  const projectedMonthlyCostPkr = Math.round(250 + (monthlyDistanceKm * 0.45));
  const projectedAnnualCostPkr = projectedMonthlyCostPkr * 12;

  return {
    monthlyDistanceKm,
    projectedMonthlyCostPkr,
    projectedAnnualCostPkr,
    brakePadLifeKm,
    brakePadRemainingKm,
    tireLifeKm,
    tireRemainingKm,
    batteryLifeYears,
    batteryRemainingYears: Math.round(batteryRemainingYears * 10) / 10,
  };
}

/**
 * Generate interactive voltage vs distance discharge data points for Recharts graph.
 */
export function generateDischargeCurveData(
  fullVoltage = 78.5,
  cutoffVoltage = 62.0,
  currentVoltage = 74.2,
  totalCapacityKm = 70
) {
  const points = [];
  const steps = 14;

  for (let i = 0; i <= steps; i++) {
    const km = Math.round((i / steps) * totalCapacityKm);
    const fraction = i / steps;

    let volt: number;
    if (fraction < 0.15) {
      volt = fullVoltage - fraction * 2.0;
    } else if (fraction < 0.8) {
      volt = fullVoltage - 2.0 - (fraction - 0.15) * 8.5;
    } else {
      volt = fullVoltage - 7.5 - Math.pow(fraction - 0.8, 1.3) * 35;
    }

    volt = Math.max(cutoffVoltage - 1.0, Math.round(volt * 10) / 10);

    points.push({
      km: `${km} km`,
      distanceNum: km,
      voltage: volt,
      safeThreshold: cutoffVoltage + 4.0,
      cutoffThreshold: cutoffVoltage,
      isCurrentPosition: Math.abs(volt - currentVoltage) < 0.8,
    });
  }

  return points;
}
