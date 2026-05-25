import type { AHUModel, RecuperatorResult } from '../types';
import { absoluteHumidity, relHumidity } from './utils';

/**
 * Compute recuperator performance.
 * Plate recuperator: temperature efficiency = recupEffT (from model data).
 * Rotary recuperator: also transfers moisture, using recupEffH.
 *
 * Efficiency formula (Расчеты sheet):
 *   t_supply_after = t_supply_in + η_T * (t_exhaust_in - t_supply_in)
 *
 * For flow ratio correction (supply vs exhaust differ):
 *   η_actual = η_T * min(G_supply, G_exhaust) / max(G_supply, G_exhaust)
 *
 * Heat recovered (kW):
 *   Q = G_supply * Cp * (t_supply_after - t_supply_in) / 1000
 */
export function computeRecuperator(
  model: AHUModel,
  isRotary: boolean,
  flowSupply: number,    // m3/h
  flowExhaust: number,   // m3/h
  tSupplyIn: number,     // °C outside air
  rhSupplyIn: number,    // % outside humidity
  tExhaustIn: number,    // °C exhaust air
  rhExhaustIn: number    // % exhaust humidity
): RecuperatorResult {
  const etaT = model.recupEffT || 0;
  const etaH = model.recupEffH || 0;

  // Flow ratio correction when flows are unequal
  const flowRatio = flowExhaust > 0 ? Math.min(flowSupply, flowExhaust) / Math.max(flowSupply, flowExhaust) : 1;
  const etaTActual = etaT * flowRatio;

  // Temperature after recuperator
  const tSupplyAfter = tSupplyIn + etaTActual * (tExhaustIn - tSupplyIn);

  // Exhaust temperature after recuperator (energy balance)
  const supplyExhaustRatio = flowExhaust > 0 ? flowSupply / flowExhaust : 1;
  const tExhaustAfter = tExhaustIn - etaTActual * supplyExhaustRatio * (tExhaustIn - tSupplyIn);

  // Moisture (humidity)
  const dSupplyIn = absoluteHumidity(tSupplyIn, rhSupplyIn);
  const dExhaustIn = absoluteHumidity(tExhaustIn, rhExhaustIn);

  let dSupplyAfter = dSupplyIn;
  let rhSupplyAfter = rhSupplyIn;

  if (isRotary) {
    // Rotary: transfers moisture proportional to humidity efficiency
    const etaHActual = etaH * flowRatio;
    dSupplyAfter = dSupplyIn + etaHActual * (dExhaustIn - dSupplyIn);
    rhSupplyAfter = relHumidity(tSupplyAfter, dSupplyAfter);
  } else {
    // Plate: no moisture transfer to supply
    rhSupplyAfter = relHumidity(tSupplyAfter, dSupplyIn);
    dSupplyAfter = dSupplyIn;
  }

  // Heat recovered (kW)
  const rhoSupply = 353.05 / (tSupplyIn + 273.15);
  const gSupply = rhoSupply * flowSupply / 3600; // kg/s
  const heatRecovered = gSupply * 1.005 * (tSupplyAfter - tSupplyIn); // kW

  return {
    supplyTempAfter: tSupplyAfter,
    supplyHumidityAfter: Math.min(100, Math.max(0, rhSupplyAfter)),
    exhaustTempAfter: tExhaustAfter,
    efficiency: etaTActual,
    efficiencyH: isRotary ? (etaH * flowRatio) : 0,
    heatRecovered,
  };
}
