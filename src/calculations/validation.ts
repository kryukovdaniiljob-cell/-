import type { FormInputs } from '../types';
import { ALL_SERIES } from '../data/modelLoader';

export function validateAll(inputs: FormInputs): string[] {
  const errors: string[] = [];

  // Flow range
  if (inputs.flowSupply < 50 || inputs.flowSupply > 10000) {
    errors.push('Расход притока должен быть в диапазоне 50–10000 м³/ч.');
  }
  if (inputs.unitType === 'supply-exhaust' && (inputs.flowExhaust < 50 || inputs.flowExhaust > 10000)) {
    errors.push('Расход вытяжки должен быть в диапазоне 50–10000 м³/ч.');
  }

  // Pressure range
  if (inputs.pressureSupply < 0 || inputs.pressureSupply > 2000) {
    errors.push('Напор должен быть в диапазоне 0–2000 Па.');
  }

  // Temperature range
  if (inputs.outsideTemp < -50 || inputs.outsideTemp > 50) {
    errors.push('Температура наружного воздуха вне допустимого диапазона (-50…+50°C).');
  }
  if (inputs.supplyTempRequired < -10 || inputs.supplyTempRequired > 50) {
    errors.push('Требуемая температура притока вне допустимого диапазона (-10…+50°C).');
  }
  if (inputs.exhaustTemp < 0 || inputs.exhaustTemp > 40) {
    errors.push('Температура вытяжного воздуха вне допустимого диапазона (0…+40°C).');
  }

  // Manual selection check
  if (inputs.selectionMode === 'manual') {
    const series = inputs.manualSeries;
    const models = ALL_SERIES[series] || [];
    if (models.length === 0) {
      errors.push(`Серия "${series}" не найдена в базе данных.`);
    } else if (inputs.manualSize < 1 || inputs.manualSize > models.length) {
      errors.push(`Типоразмер ${inputs.manualSize} не существует. Доступно: 1–${models.length}.`);
    }
  }

  // Water heater temperature check
  if (inputs.heaterType === 'water') {
    if (inputs.waterTempIn <= inputs.waterTempOut) {
      errors.push('Температура воды на входе должна быть выше температуры воды на выходе.');
    }
    if (inputs.waterTempIn > 120 || inputs.waterTempIn < 30) {
      errors.push('Температура воды на входе должна быть в диапазоне 30–120°C.');
    }
  }

  // Option compatibility checks
  if (inputs.optActuator && !inputs.optValve) {
    errors.push('Электропривод клапана выбран без клапана наружного воздуха.');
  }

  // Supply temperature must be above outside temperature (or within reasonable range)
  if (inputs.supplyTempRequired < inputs.outsideTemp - 5) {
    errors.push('Требуемая температура притока значительно ниже наружной. Проверьте параметры.');
  }

  return errors;
}
