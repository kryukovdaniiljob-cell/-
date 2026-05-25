// Air and thermodynamic utility functions

/** Air density kg/m³ at given temperature (°C) and standard atmospheric pressure */
export function airDensity(tempC: number): number {
  return 353.05 / (tempC + 273.15);
}

/** Specific heat of moist air, kJ/(kg·K) */
export const CP_AIR = 1.005; // kJ/(kg·K)
export const CP_WATER = 4.187; // kJ/(kg·K)

/** Convert flow m³/h and temperature to mass flow kg/s */
export function massFlow(flowM3h: number, tempC: number): number {
  return airDensity(tempC) * flowM3h / 3600;
}

/**
 * Saturation pressure of water vapour, Pa
 * Uses Magnus formula
 */
export function saturationPressure(tempC: number): number {
  if (tempC >= 0) {
    return 610.78 * Math.exp(17.269 * tempC / (237.29 + tempC));
  } else {
    return 610.78 * Math.exp(21.875 * tempC / (265.5 + tempC));
  }
}

/** Absolute humidity (moisture content) g/kg of dry air */
export function absoluteHumidity(tempC: number, relHumPct: number): number {
  const phi = relHumPct / 100;
  const pSat = saturationPressure(tempC);
  const pAtm = 101325; // Pa
  return 621.9907 * phi * pSat / (pAtm - phi * pSat);
}

/** Specific enthalpy of moist air kJ/kg */
export function enthalpy(tempC: number, relHumPct: number): number {
  const d = absoluteHumidity(tempC, relHumPct) / 1000; // kg/kg
  return 1.006 * tempC + d * (2501 + 1.86 * tempC);
}

/** Relative humidity from absolute humidity and temperature */
export function relHumidity(tempC: number, absHumGkg: number): number {
  const pAtm = 101325;
  const pSat = saturationPressure(tempC);
  const d = absHumGkg / 1000; // kg/kg
  const phi = d * pAtm / ((621.9907 + d) * pSat);
  return Math.min(100, Math.max(0, phi * 100));
}

/**
 * Fan pressure at given flow from polynomial (Расчеты sheet formula)
 * dP = a*Q^2 + b*Q + c + d*Q^3  (Q in m3/h, dP in Pa)
 */
export function fanPressure(q: number, a: number, b: number, c: number, d: number): number {
  return a * q * q + b * q + c + d * q * q * q;
}

/**
 * Generate unique calculation number YYMMDDHHmm
 */
export function calcNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yy}${mm}${dd}-${hh}${min}`;
}

/** Round to n decimal places */
export function round(v: number, n: number): number {
  const f = Math.pow(10, n);
  return Math.round(v * f) / f;
}
