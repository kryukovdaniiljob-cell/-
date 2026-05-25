import type { AHUModel, AeroPoint } from '../types';
import { fanPressure } from './utils';

/**
 * Compute fan pressure at design airflow and return aero curve points.
 * Network resistance: R = P_design / Q_design^2
 * Working point: where fan curve intersects network curve (binary search).
 */
export interface AeroResult {
  fanPressureAtDesign: number;  // Fan pressure at requested Q
  workingQ: number;             // Actual Q at working point (fan intersects network)
  workingP: number;             // Actual P at working point
  points: AeroPoint[];          // Curve data for graph
}

export function computeAero(
  model: AHUModel,
  designQ: number,
  designP: number
): AeroResult {
  const { polyA: a, polyB: b, polyC: c, polyD: d, maxFlow } = model;

  // Network resistance coefficient
  const R = designQ > 0 ? designP / (designQ * designQ) : 0;

  // Fan pressure at design point
  const fanPAtDesign = fanPressure(designQ, a, b, c, d);

  // Generate curve points from Q=0 to 1.5*maxFlow
  const qMax = Math.max(maxFlow, designQ) * 1.5;
  const steps = 100;
  const points: AeroPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const q = (qMax / steps) * i;
    const fp = fanPressure(q, a, b, c, d);
    const np = R * q * q;
    points.push({ q: Math.round(q), fanP: Math.round(fp), netP: Math.round(np) });
  }

  // Find working point: where fanP = netP (fan intersects network)
  // Binary search for the crossover
  let lo = 0;
  let hi = qMax;
  let workingQ = designQ;
  let workingP = fanPAtDesign;

  const margin0 = fanPressure(lo, a, b, c, d) - R * lo * lo;
  const marginHi = fanPressure(hi, a, b, c, d) - R * hi * hi;

  if (margin0 > 0 && marginHi < 0) {
    // Binary search
    for (let iter = 0; iter < 60; iter++) {
      const mid = (lo + hi) / 2;
      const mMargin = fanPressure(mid, a, b, c, d) - R * mid * mid;
      if (mMargin > 0) lo = mid;
      else hi = mid;
      if (hi - lo < 0.1) break;
    }
    workingQ = (lo + hi) / 2;
    workingP = R * workingQ * workingQ;
  } else if (margin0 > 0 && marginHi > 0) {
    // Fan always above network in range - use max flow
    workingQ = hi;
    workingP = R * workingQ * workingQ;
  }

  return {
    fanPressureAtDesign: fanPAtDesign,
    workingQ: Math.round(workingQ),
    workingP: Math.round(workingP),
    points,
  };
}
