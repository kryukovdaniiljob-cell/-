import type { AHUModel } from '../types';

// Import all model JSON files
import CAU_F from './models/CAU_F.json';
import CAU_W from './models/CAU_W.json';
import ECO_A from './models/ECO_A.json';
import ECO_Slim from './models/ECO_Slim.json';
import ECO_Slim_W from './models/ECO_Slim_W.json';
import Airtube from './models/Airtube.json';
import Swift from './models/Swift.json';
import Nova from './models/Nova.json';
import Unimax_R_SW from './models/Unimax_R_SW.json';
import Unimax_R_SE from './models/Unimax_R_SE.json';
import Unimax_R_VW from './models/Unimax_R_VW.json';
import Unimax_R_VE from './models/Unimax_R_VE.json';
import Unimax_P_SW from './models/Unimax_P_SW.json';
import Unimax_P_SW_EC from './models/Unimax_P_SW_EC.json';
import Unimax_P_SE from './models/Unimax_P_SE.json';
import Unimax_P_SE_EC from './models/Unimax_P_SE_EC.json';
import Unimax_P_VW from './models/Unimax_P_VW.json';
import Unimax_P_VW_EC from './models/Unimax_P_VW_EC.json';
import Unimax_P_VE from './models/Unimax_P_VE.json';
import Unimax_P_VE_EC from './models/Unimax_P_VE_EC.json';
import Unimax_P_CW from './models/Unimax_P_CW.json';
import Unimax_P_CW_EC from './models/Unimax_P_CW_EC.json';
import Unimax_P_CE from './models/Unimax_P_CE.json';
import Unimax_P_CE_EC from './models/Unimax_P_CE_EC.json';

export const ALL_SERIES: Record<string, AHUModel[]> = {
  CAU_F: CAU_F as AHUModel[],
  CAU_W: CAU_W as AHUModel[],
  ECO_A: ECO_A as AHUModel[],
  ECO_Slim: ECO_Slim as AHUModel[],
  ECO_Slim_W: ECO_Slim_W as AHUModel[],
  Airtube: Airtube as AHUModel[],
  Swift: Swift as AHUModel[],
  Nova: Nova as AHUModel[],
  Unimax_R_SW: Unimax_R_SW as AHUModel[],
  Unimax_R_SE: Unimax_R_SE as AHUModel[],
  Unimax_R_VW: Unimax_R_VW as AHUModel[],
  Unimax_R_VE: Unimax_R_VE as AHUModel[],
  Unimax_P_SW: Unimax_P_SW as AHUModel[],
  Unimax_P_SW_EC: Unimax_P_SW_EC as AHUModel[],
  Unimax_P_SE: Unimax_P_SE as AHUModel[],
  Unimax_P_SE_EC: Unimax_P_SE_EC as AHUModel[],
  Unimax_P_VW: Unimax_P_VW as AHUModel[],
  Unimax_P_VW_EC: Unimax_P_VW_EC as AHUModel[],
  Unimax_P_VE: Unimax_P_VE as AHUModel[],
  Unimax_P_VE_EC: Unimax_P_VE_EC as AHUModel[],
  Unimax_P_CW: Unimax_P_CW as AHUModel[],
  Unimax_P_CW_EC: Unimax_P_CW_EC as AHUModel[],
  Unimax_P_CE: Unimax_P_CE as AHUModel[],
  Unimax_P_CE_EC: Unimax_P_CE_EC as AHUModel[],
};

// Series type classifications
// Supply-only series (no exhaust fan)
const SUPPLY_ONLY_SERIES = new Set(['CAU_F', 'CAU_W', 'ECO_A', 'ECO_Slim', 'ECO_Slim_W', 'Airtube', 'Swift', 'Nova']);

// Heater types by series
const WATER_HEATER_SERIES = new Set(['CAU_W', 'ECO_Slim_W', 'Unimax_R_VW', 'Unimax_R_VE',
  'Unimax_P_VW', 'Unimax_P_VW_EC', 'Unimax_P_VE', 'Unimax_P_VE_EC',
  'Unimax_P_CW', 'Unimax_P_CW_EC']);

const ELECTRIC_HEATER_SERIES = new Set(['CAU_F', 'ECO_A', 'ECO_Slim', 'Airtube', 'Swift', 'Nova',
  'Unimax_R_SW', 'Unimax_R_SE',
  'Unimax_P_SW', 'Unimax_P_SW_EC', 'Unimax_P_SE', 'Unimax_P_SE_EC',
  'Unimax_P_CE', 'Unimax_P_CE_EC']);

// EC motor series
const EC_MOTOR_SERIES = new Set(['Unimax_P_SW_EC', 'Unimax_P_SE_EC', 'Unimax_P_VW_EC',
  'Unimax_P_VE_EC', 'Unimax_P_CW_EC', 'Unimax_P_CE_EC']);

// Recuperator series (supply+exhaust)
const HAS_RECUPERATOR_SERIES = new Set(['Unimax_R_SW', 'Unimax_R_SE', 'Unimax_R_VW', 'Unimax_R_VE',
  'Unimax_P_SW', 'Unimax_P_SW_EC', 'Unimax_P_SE', 'Unimax_P_SE_EC',
  'Unimax_P_VW', 'Unimax_P_VW_EC', 'Unimax_P_VE', 'Unimax_P_VE_EC',
  'Unimax_P_CW', 'Unimax_P_CW_EC', 'Unimax_P_CE', 'Unimax_P_CE_EC']);

// Rotary recuperator series
const ROTARY_RECUP_SERIES = new Set(['Unimax_R_VW', 'Unimax_R_VE',
  'Unimax_P_VW', 'Unimax_P_VW_EC', 'Unimax_P_VE', 'Unimax_P_VE_EC']);

// Body height: reduced height series have ECO/Slim naming or specific P_*E* series
const REDUCED_HEIGHT_SERIES = new Set(['ECO_Slim', 'ECO_Slim_W',
  'Unimax_P_SE', 'Unimax_P_SE_EC', 'Unimax_P_VE', 'Unimax_P_VE_EC',
  'Unimax_P_CE', 'Unimax_P_CE_EC']);

export function isSupplyOnly(series: string): boolean {
  return SUPPLY_ONLY_SERIES.has(series);
}

export function getHeaterTypeForSeries(series: string): 'electric' | 'water' | 'none' {
  if (WATER_HEATER_SERIES.has(series)) return 'water';
  if (ELECTRIC_HEATER_SERIES.has(series)) return 'electric';
  return 'none';
}

export function isECMotor(series: string): boolean {
  return EC_MOTOR_SERIES.has(series);
}

export function hasRecuperator(series: string): boolean {
  return HAS_RECUPERATOR_SERIES.has(series);
}

export function isRotaryRecup(series: string): boolean {
  return ROTARY_RECUP_SERIES.has(series);
}

export function isReducedHeight(series: string): boolean {
  return REDUCED_HEIGHT_SERIES.has(series);
}

export function getFilteredSeries(
  unitType: 'supply' | 'supply-exhaust',
  heaterType: 'electric' | 'water' | 'none',
  recuperatorType: 'plate' | 'rotary',
  motorType: 'async' | 'ec',
  bodyHeight: 'standard' | 'reduced'
): string[] {
  return Object.keys(ALL_SERIES).filter(series => {
    // Unit type filter
    if (unitType === 'supply' && !isSupplyOnly(series)) return false;
    if (unitType === 'supply-exhaust' && isSupplyOnly(series)) return false;

    // Heater type filter
    const seriesHeater = getHeaterTypeForSeries(series);
    if (heaterType === 'electric' && seriesHeater !== 'electric') return false;
    if (heaterType === 'water' && seriesHeater !== 'water') return false;

    // Motor type filter
    if (motorType === 'ec' && !isECMotor(series)) return false;
    if (motorType === 'async' && isECMotor(series)) return false;

    // Recuperator type filter (only for supply+exhaust)
    if (unitType === 'supply-exhaust') {
      if (recuperatorType === 'rotary' && !isRotaryRecup(series)) return false;
      if (recuperatorType === 'plate' && isRotaryRecup(series)) return false;
    }

    // Body height filter
    if (bodyHeight === 'reduced' && !isReducedHeight(series)) return false;
    if (bodyHeight === 'standard' && isReducedHeight(series)) return false;

    return true;
  });
}
