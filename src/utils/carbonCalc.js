// Emission factors are approximate, India-calibrated averages.
// Sources used for calibration: India CEA grid emission factor (~0.82 kgCO2/kWh),
// general transport/diet LCA estimates. Good enough for a personal tracker —
// not lab-grade accounting, and that's fine for this use case.

export const EMISSION_FACTORS = {
  transport: {
    car_petrol: { label: "Car (petrol)", factor: 0.21, unit: "km" },
    car_diesel: { label: "Car (diesel)", factor: 0.24, unit: "km" },
    bike: { label: "Two-wheeler", factor: 0.07, unit: "km" },
    bus: { label: "Bus", factor: 0.05, unit: "km" },
    train_metro: { label: "Train / Metro", factor: 0.04, unit: "km" },
    auto_rickshaw: { label: "Auto-rickshaw", factor: 0.09, unit: "km" },
    cycle_walk: { label: "Cycling / Walking", factor: 0, unit: "km" },
  },
  energy: {
    grid_electricity: { label: "Electricity (grid)", factor: 0.82, unit: "kWh" },
  },
  food: {
    meat_heavy: { label: "Meat-heavy meal", factor: 3.3, unit: "meal" },
    meat_light: { label: "Light meat / egg meal", factor: 1.8, unit: "meal" },
    vegetarian: { label: "Vegetarian meal", factor: 1.0, unit: "meal" },
    vegan: { label: "Vegan meal", factor: 0.5, unit: "meal" },
  },
};

/**
 * Calculate CO2 in kg for a single log entry.
 * @param {"transport"|"energy"|"food"} type
 * @param {string} subtype - key within EMISSION_FACTORS[type]
 * @param {number} value - quantity (km, kWh, or meal count)
 * @returns {number} kg CO2, rounded to 2 decimals
 */
export function calculateCO2(type, subtype, value) {
  const factorEntry = EMISSION_FACTORS[type]?.[subtype];
  if (!factorEntry) {
    throw new Error(`Unknown emission factor: ${type}/${subtype}`);
  }
  const co2 = factorEntry.factor * Number(value);
  return Math.round(co2 * 100) / 100;
}

/**
 * Sum total CO2 from an array of log entries.
 */
export function sumCO2(logs) {
  return Math.round(logs.reduce((sum, log) => sum + (log.co2Kg || 0), 0) * 100) / 100;
}

/**
 * Group logs by type and sum CO2 per category — feeds dashboard charts.
 */
export function breakdownByType(logs) {
  const breakdown = { transport: 0, energy: 0, food: 0 };
  for (const log of logs) {
    if (breakdown[log.type] !== undefined) {
      breakdown[log.type] = Math.round((breakdown[log.type] + log.co2Kg) * 100) / 100;
    }
  }
  return breakdown;
}

/**
 * Group logs by ISO date (YYYY-MM-DD) for a daily trend chart.
 */
export function breakdownByDay(logs) {
  const byDay = {};
  for (const log of logs) {
    const day = log.date; // expect "YYYY-MM-DD"
    byDay[day] = Math.round(((byDay[day] || 0) + log.co2Kg) * 100) / 100;
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, co2Kg]) => ({ date, co2Kg }));
}

// India's average per-capita carbon footprint is roughly 1.9 tons/year
// (~5.2 kg/day). Used as a benchmark reference point in the UI.
export const INDIA_AVG_DAILY_KG = 5.2;
