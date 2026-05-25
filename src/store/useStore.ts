import { create } from 'zustand';
import type { FormInputs, CalculationResult } from '../types';
const defaultInputs: FormInputs = {
  unitType: 'supply-exhaust',
  selectionMode: 'manual',
  manualSeries: 'Unimax_P_CE',
  manualSize: 4,
  flowSupply: 500,
  flowExhaust: 500,
  pressureSupply: 150,
  outsideTemp: -30,
  outsideHumidity: 80,
  supplyTempRequired: 21,
  exhaustTemp: 18,
  exhaustHumidity: 40,
  heaterType: 'electric',
  recuperatorType: 'plate',
  bodyType: 'insulated',
  controlSystem: 'built-in',
  motorType: 'ec',
  bodyHeight: 'reduced',
  waterTempIn: 90,
  waterTempOut: 75,
  airDirection: 'side',
  mountType: 'suspended',
  optSpeedController: true,
  optValve: true,
  optActuator: true,
  optFlexConnectors: true,
  optSilencer: true,
  optMixingUnit: false,
  optPressureSensor: true,
};

interface Store {
  inputs: FormInputs;
  result: CalculationResult | null;
  isCalculating: boolean;
  setInputs: (inputs: Partial<FormInputs>) => void;
  setResult: (result: CalculationResult | null) => void;
  setCalculating: (v: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  inputs: defaultInputs,
  result: null,
  isCalculating: false,
  setInputs: (partial) => set((s) => ({ inputs: { ...s.inputs, ...partial } })),
  setResult: (result) => set({ result }),
  setCalculating: (isCalculating) => set({ isCalculating }),
}));
