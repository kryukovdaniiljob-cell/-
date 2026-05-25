export type UnitType = 'supply' | 'supply-exhaust';
export type SelectionMode = 'auto' | 'manual';
export type HeaterType = 'electric' | 'water' | 'none';
export type RecuperatorType = 'plate' | 'rotary';
export type BodyType = 'insulated' | 'non-insulated';
export type ControlSystem = 'built-in' | 'external';
export type MotorType = 'async' | 'ec';
export type BodyHeight = 'standard' | 'reduced';
export type AirDirection = 'side' | 'top';
export type MountType = 'suspended' | 'floor';

export interface FormInputs {
  unitType: UnitType;
  selectionMode: SelectionMode;
  manualSeries: string;
  manualSize: number;
  flowSupply: number;
  flowExhaust: number;
  pressureSupply: number;
  outsideTemp: number;
  outsideHumidity: number;
  supplyTempRequired: number;
  exhaustTemp: number;
  exhaustHumidity: number;
  heaterType: HeaterType;
  recuperatorType: RecuperatorType;
  bodyType: BodyType;
  controlSystem: ControlSystem;
  motorType: MotorType;
  bodyHeight: BodyHeight;
  waterTempIn: number;
  waterTempOut: number;
  airDirection: AirDirection;
  mountType: MountType;
  optSpeedController: boolean;
  optValve: boolean;
  optActuator: boolean;
  optFlexConnectors: boolean;
  optSilencer: boolean;
  optMixingUnit: boolean;
  optPressureSensor: boolean;
}

export interface AHUModel {
  id: number;
  name: string;
  filterSupply: string;
  filterExhaust: string;
  heaterVoltage: string;
  heaterPower: number;
  fanVoltage: string;
  fanCurrent: number;
  fanPower: number;
  fanRpm: number;
  totalPower: number;
  totalCurrent: number;
  supplyVoltage: string;
  maxPressure: number;
  maxFlow: number;
  dimW: number | null;
  dimW1: number | null;
  dimW2: number | null;
  dimW3: number | null;
  dimH: number | null;
  dimH1: number | null;
  dimH2: number | null;
  dimH3: number | null;
  dimH4: number | null;
  dimL: number | null;
  dimL1: number | null;
  dimL2: number | null;
  dimL3: number | null;
  dimL4: number | null;
  dimD: number | null;
  dimd: number | null;
  weight: number;
  polyA: number;
  polyB: number;
  polyC: number;
  polyD: number;
  recupEffT: number;
  recupEffH: number;
  recupK1T: number;
  recupK2T: number;
  recupK3T: number;
  recupLT: number | null;
  recupK1H: number;
  recupK2H: number;
  recupK3H: number;
  kfCoeff: number | null;
  kfNominalFlow: number | null;
  controllerType: string;
  controllerModel: string;
  valveModel: string;
  valveSize: string;
  connectorModel: string;
  connectorSize: string;
  actuatorBrand: string;
  actuatorModel: string;
  silencerModel: string;
  silencerSize: string;
  pressureSensor: string;
}

export interface AeroPoint {
  q: number;
  fanP: number;
  netP: number;
}

export interface RecuperatorResult {
  supplyTempAfter: number;
  supplyHumidityAfter: number;
  exhaustTempAfter: number;
  efficiency: number;
  efficiencyH: number;
  heatRecovered: number;
}

export interface HeaterResult {
  requiredPower: number;
  nominalPower: number;
  achievableTemp: number;
  waterFlow?: number;
  insufficient: boolean;
}

export interface CalculationResult {
  calcNumber: string;
  selectedSeries: string;
  selectedModel: AHUModel;
  // Aero
  actualWorkingQ: number;
  actualWorkingP: number;
  fanPressureAtDesign: number;
  aeroPoints: AeroPoint[];
  // Recuperator
  recup: RecuperatorResult;
  // Heater
  heater: HeaterResult;
  // Air properties at working conditions
  airDensity: number;
  airMassFlow: number;
  // Options
  options: OptionItem[];
  // Warnings
  warnings: string[];
}

export interface OptionItem {
  name: string;
  available: boolean;
  type: string;
  model: string;
  qty: string;
}

export interface MSTRow {
  [key: string]: string;
}
