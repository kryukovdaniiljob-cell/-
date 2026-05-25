import type { AHUModel, FormInputs, CalculationResult, OptionItem } from '../types';
import { ALL_SERIES, getFilteredSeries, hasRecuperator, getHeaterTypeForSeries } from '../data/modelLoader';
import { computeAero } from './aero';
import { computeRecuperator } from './recuperator';
import { computeElectricHeater, computeWaterHeater } from './heater';
import { airDensity, calcNumber, round } from './utils';
import { validateAll } from './validation';

export function runCalculation(inputs: FormInputs): CalculationResult {
  const warnings: string[] = [];

  // Validate inputs
  const validationErrors = validateAll(inputs);
  warnings.push(...validationErrors);

  // --- Select model ---
  let selectedSeries: string;
  let selectedModel: AHUModel;

  if (inputs.selectionMode === 'manual') {
    selectedSeries = inputs.manualSeries;
    const seriesModels = ALL_SERIES[selectedSeries] || [];
    const idx = inputs.manualSize - 1;
    if (idx < 0 || idx >= seriesModels.length) {
      const maxId = seriesModels.length;
      warnings.push(`Типоразмер ${inputs.manualSize} не существует. Максимальный: ${maxId}. Выбран последний.`);
      selectedModel = seriesModels[seriesModels.length - 1] || createFallbackModel();
    } else {
      selectedModel = seriesModels[idx];
    }
  } else {
    // Auto selection
    const result = autoSelect(inputs, warnings);
    selectedSeries = result.series;
    selectedModel = result.model;
  }

  // --- Aerodynamic calculation ---
  const aero = computeAero(selectedModel, inputs.flowSupply, inputs.pressureSupply);

  if (aero.fanPressureAtDesign < inputs.pressureSupply - 1) {
    warnings.push(`Недостаточное давление: вентилятор при ${inputs.flowSupply} м³/ч даёт ${round(aero.fanPressureAtDesign, 0)} Па, требуется ${inputs.pressureSupply} Па.`);
  }

  if (inputs.flowSupply > selectedModel.maxFlow) {
    warnings.push(`Расход ${inputs.flowSupply} м³/ч превышает максимальный расход установки ${selectedModel.maxFlow} м³/ч.`);
  }

  // --- Recuperator calculation ---
  const isSupplyExhaust = inputs.unitType === 'supply-exhaust';
  const isRotary = inputs.recuperatorType === 'rotary';
  const hasRecup = hasRecuperator(selectedSeries) && isSupplyExhaust;

  let recup = {
    supplyTempAfter: inputs.outsideTemp,
    supplyHumidityAfter: inputs.outsideHumidity,
    exhaustTempAfter: inputs.exhaustTemp,
    efficiency: 0,
    efficiencyH: 0,
    heatRecovered: 0,
  };

  if (hasRecup && selectedModel.recupEffT > 0) {
    recup = computeRecuperator(
      selectedModel,
      isRotary,
      inputs.flowSupply,
      inputs.flowExhaust,
      inputs.outsideTemp,
      inputs.outsideHumidity,
      inputs.exhaustTemp,
      inputs.exhaustHumidity
    );

    // Frost warning for plate recuperator
    if (!isRotary && recup.exhaustTempAfter < 0) {
      warnings.push('Возможно обмерзание пластинчатого рекуператора. Рекомендуется предусмотреть преднагрев или байпас.');
    }
    if (inputs.outsideTemp < -25 && inputs.heaterType === 'water' && !isRotary) {
      warnings.push('При наружной температуре ниже -25°C с водяным нагревателем и пластинчатым рекуператором необходимо предусмотреть внешний преднагрев.');
    }
  }

  if (recup.supplyTempAfter > inputs.supplyTempRequired && hasRecup) {
    warnings.push('Температура приточного воздуха после рекуператора выше требуемой. Нагрев не требуется.');
  }

  // --- Heater calculation ---
  const tAfterRecup = recup.supplyTempAfter;
  const seriesHeaterType = getHeaterTypeForSeries(selectedSeries);
  const effectiveHeaterType = inputs.heaterType === 'none' ? 'none' : seriesHeaterType;

  let heater = {
    requiredPower: 0,
    nominalPower: selectedModel.heaterPower,
    achievableTemp: inputs.supplyTempRequired,
    insufficient: false,
  };

  if (effectiveHeaterType === 'electric' && inputs.heaterType !== 'none') {
    if (tAfterRecup < inputs.supplyTempRequired) {
      heater = computeElectricHeater(selectedModel, inputs.flowSupply, tAfterRecup, inputs.supplyTempRequired);
    }
    if (heater.insufficient) {
      warnings.push(`Недостаточная мощность электронагревателя: требуется ${round(heater.requiredPower, 2)} кВт, номинальная ${round(heater.nominalPower, 2)} кВт.`);
    }
  } else if (effectiveHeaterType === 'water' && inputs.heaterType !== 'none') {
    if (tAfterRecup < inputs.supplyTempRequired) {
      heater = computeWaterHeater(selectedModel, inputs.flowSupply, tAfterRecup, inputs.supplyTempRequired, inputs.waterTempIn, inputs.waterTempOut);
    }
    if (heater.insufficient) {
      warnings.push(`Недостаточная мощность водяного нагревателя: требуется ${round(heater.requiredPower, 2)} кВт, достижимая ${round(heater.nominalPower, 2)} кВт.`);
    }
  }

  // Low supply temperature warning
  if (inputs.supplyTempRequired < 12) {
    warnings.push('Низкая требуемая температура приточного воздуха. Проверьте условия комфорта.');
  }

  // --- Options ---
  const options = buildOptions(inputs, selectedModel);

  // --- Air density at working conditions ---
  const density = airDensity(inputs.outsideTemp);
  const massFlowVal = density * inputs.flowSupply / 3600;

  return {
    calcNumber: calcNumber(),
    selectedSeries,
    selectedModel,
    fanPressureAtDesign: round(aero.fanPressureAtDesign, 0),
    actualWorkingQ: aero.workingQ,
    actualWorkingP: aero.workingP,
    aeroPoints: aero.points,
    recup,
    heater,
    airDensity: round(density, 3),
    airMassFlow: round(massFlowVal, 3),
    options,
    warnings,
  };
}

function autoSelect(
  inputs: FormInputs,
  warnings: string[]
): { series: string; model: AHUModel } {
  const eligibleSeries = getFilteredSeries(
    inputs.unitType,
    inputs.heaterType,
    inputs.recuperatorType,
    inputs.motorType,
    inputs.bodyHeight
  );

  let bestModel: AHUModel | null = null;
  let bestSeries = '';
  let minExcess = Infinity;

  for (const series of eligibleSeries) {
    const models = ALL_SERIES[series] || [];
    for (const model of models) {
      const fanP = model.polyA * inputs.flowSupply ** 2
        + model.polyB * inputs.flowSupply
        + model.polyC
        + model.polyD * inputs.flowSupply ** 3;

      if (fanP >= inputs.pressureSupply && model.maxFlow >= inputs.flowSupply) {
        const excess = (model.maxFlow - inputs.flowSupply) + (fanP - inputs.pressureSupply) / 10;
        if (excess < minExcess) {
          minExcess = excess;
          bestModel = model;
          bestSeries = series;
        }
      }
    }
  }

  if (!bestModel) {
    warnings.push('Не удалось автоматически подобрать установку по заданным параметрам. Попробуйте изменить требования или выберите модель вручную.');
    // Return first eligible model as fallback
    for (const series of eligibleSeries) {
      const models = ALL_SERIES[series] || [];
      if (models.length > 0) {
        return { series, model: models[0] };
      }
    }
    return { series: 'CAU_F', model: createFallbackModel() };
  }

  return { series: bestSeries, model: bestModel };
}

function buildOptions(inputs: FormInputs, model: AHUModel): OptionItem[] {
  const opts: OptionItem[] = [];

  opts.push({
    name: 'Регулятор скорости',
    available: inputs.optSpeedController,
    type: inputs.optSpeedController ? model.controllerType : '-',
    model: inputs.optSpeedController ? model.controllerModel : '-',
    qty: inputs.optSpeedController ? '1' : '-',
  });

  opts.push({
    name: 'Клапан наружного воздуха',
    available: inputs.optValve,
    type: inputs.optValve ? 'Воздушный клапан' : '-',
    model: inputs.optValve ? `${model.valveModel} ${model.valveSize}` : '-',
    qty: inputs.optValve ? '1' : '-',
  });

  opts.push({
    name: 'Электропривод клапана',
    available: inputs.optActuator && inputs.optValve,
    type: inputs.optActuator && inputs.optValve ? model.actuatorBrand : '-',
    model: inputs.optActuator && inputs.optValve ? model.actuatorModel : '-',
    qty: inputs.optActuator && inputs.optValve ? '1' : '-',
  });

  opts.push({
    name: 'Гибкие вставки / хомуты',
    available: inputs.optFlexConnectors,
    type: inputs.optFlexConnectors ? 'Гибкая вставка' : '-',
    model: inputs.optFlexConnectors ? `${model.connectorModel} ${model.connectorSize}` : '-',
    qty: inputs.optFlexConnectors ? '2' : '-',
  });

  opts.push({
    name: 'Шумоглушитель',
    available: inputs.optSilencer,
    type: inputs.optSilencer ? 'Шумоглушитель' : '-',
    model: inputs.optSilencer ? `${model.silencerModel} ${model.silencerSize}` : '-',
    qty: inputs.optSilencer ? '1' : '-',
  });

  opts.push({
    name: 'Датчик давления',
    available: inputs.optPressureSensor,
    type: inputs.optPressureSensor ? 'Датчик давления' : '-',
    model: inputs.optPressureSensor ? model.pressureSensor : '-',
    qty: inputs.optPressureSensor ? '1' : '-',
  });

  return opts;
}

function createFallbackModel(): AHUModel {
  return {
    id: 1, name: 'N/A', filterSupply: '-', filterExhaust: '-',
    heaterVoltage: '-', heaterPower: 0, fanVoltage: '-', fanCurrent: 0,
    fanPower: 0, fanRpm: 0, totalPower: 0, totalCurrent: 0, supplyVoltage: '-',
    maxPressure: 0, maxFlow: 0,
    dimW: null, dimW1: null, dimW2: null, dimW3: null,
    dimH: null, dimH1: null, dimH2: null, dimH3: null, dimH4: null,
    dimL: null, dimL1: null, dimL2: null, dimL3: null, dimL4: null,
    dimD: null, dimd: null, weight: 0,
    polyA: 0, polyB: 0, polyC: 0, polyD: 0,
    recupEffT: 0, recupEffH: 0,
    recupK1T: 0, recupK2T: 0, recupK3T: 0, recupLT: null,
    recupK1H: 0, recupK2H: 0, recupK3H: 0,
    kfCoeff: null, kfNominalFlow: null,
    controllerType: '-', controllerModel: '-',
    valveModel: '-', valveSize: '-',
    connectorModel: '-', connectorSize: '-',
    actuatorBrand: '-', actuatorModel: '-',
    silencerModel: '-', silencerSize: '-',
    pressureSensor: '-',
  };
}
