import type { AHUModel, HeaterResult } from '../types';
import { airDensity, CP_AIR, CP_WATER } from './utils';

/**
 * Electric heater calculation.
 * Required power = G_air * Cp * (t_required - t_inlet)
 */
export function computeElectricHeater(
  model: AHUModel,
  flowM3h: number,
  tInlet: number,   // °C air after recuperator
  tRequired: number // °C required supply temperature
): HeaterResult {
  const rho = airDensity((tInlet + tRequired) / 2);
  const gAir = rho * flowM3h / 3600; // kg/s
  const requiredPower = gAir * CP_AIR * (tRequired - tInlet); // kW

  const nominalPower = model.heaterPower || 0;
  const achievableTemp = nominalPower > 0
    ? tInlet + nominalPower / (gAir * CP_AIR)
    : tInlet;

  return {
    requiredPower,
    nominalPower,
    achievableTemp,
    insufficient: requiredPower > nominalPower + 0.01,
  };
}

/**
 * Water heater calculation using ε-NTU method.
 * kF(Q) = kfCoeff * Q^0.6  (W/K) — from model data
 *
 * Counter-flow heat exchanger:
 *   NTU = kF / C_min
 *   C* = C_min / C_max
 *   ε = (1 - exp(-NTU(1-C*))) / (1 - C* * exp(-NTU(1-C*)))  for C* ≠ 1
 *   ε = NTU / (1 + NTU)  for C* = 1
 *
 * Iterative: G_water depends on Q_heat which depends on outlet temp
 * which depends on ε which depends on G_water.
 */
export function computeWaterHeater(
  model: AHUModel,
  flowM3h: number,
  tAirIn: number,    // °C air inlet (after recuperator)
  tRequired: number, // °C required air outlet
  tWaterIn: number,  // °C water inlet
  tWaterOut: number  // °C water outlet
): HeaterResult {
  const kfCoeff = model.kfCoeff;

  if (!kfCoeff || kfCoeff <= 0) {
    // No water heater data — fall back to electric-style estimate
    return {
      requiredPower: 0,
      nominalPower: 0,
      achievableTemp: tAirIn,
      insufficient: true,
    };
  }

  const rho = airDensity((tAirIn + tRequired) / 2);
  const gAir = rho * flowM3h / 3600; // kg/s
  const cAir = gAir * CP_AIR * 1000; // W/K

  // kF at actual flow (air-side convection ∝ Q^0.6)
  const kF = kfCoeff * Math.pow(flowM3h, 0.6) * 1000; // W/K (kfCoeff is in kW/K / m³/h^0.6)

  // Required heat
  const qRequired = gAir * CP_AIR * 1000 * (tRequired - tAirIn); // W

  // Water flow for required heat
  const dtWater = tWaterIn - tWaterOut;
  const gWaterRequired = dtWater > 0 ? qRequired / (CP_WATER * 1000 * dtWater) : 0;
  const cWater = gWaterRequired > 0 ? gWaterRequired * CP_WATER * 1000 : 9999999;

  // ε-NTU calculation for achievable temperature
  const cMin = Math.min(cAir, cWater);
  const cMax = Math.max(cAir, cWater);
  const cStar = cMax > 0 ? cMin / cMax : 0;
  const ntu = kF / cMin;

  let epsilon: number;
  if (Math.abs(1 - cStar) < 0.001) {
    epsilon = ntu / (1 + ntu);
  } else {
    const expTerm = Math.exp(-ntu * (1 - cStar));
    epsilon = (1 - expTerm) / (1 - cStar * expTerm);
  }

  // Maximum achievable heat
  const qMax = epsilon * cMin * (tWaterIn - tAirIn);
  const achievableTemp = tAirIn + qMax / cAir;

  // Nominal power: max possible with given water params
  const nominalPower = qMax / 1000; // kW

  return {
    requiredPower: qRequired / 1000,
    nominalPower,
    achievableTemp,
    waterFlow: gWaterRequired * 3600, // convert to L/h (kg/s → L/h, ρ_water ≈ 1 kg/L)
    insufficient: achievableTemp < tRequired - 0.5,
  };
}
