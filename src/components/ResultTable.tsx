import type { CalculationResult } from '../types';
import { round } from '../calculations/utils';

function Row({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-1.5 pr-4 text-xs text-gray-600 font-medium whitespace-nowrap">{label}</td>
      <td className="py-1.5 text-sm font-semibold text-gray-900">
        {typeof value === 'number' ? String(value) : value}
        {unit && <span className="ml-1 text-xs text-gray-500 font-normal">{unit}</span>}
      </td>
    </tr>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <tr>
      <td colSpan={2} className="pt-3 pb-1">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{title}</span>
      </td>
    </tr>
  );
}

export function ResultTable({ result, onExport }: { result: CalculationResult; onExport: () => void }) {
  const { selectedModel: m, recup, heater } = result;

  const dim = (v: number | null) => v != null ? `${v}` : '—';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Техническая спецификация</h2>
          <p className="text-xs text-gray-500 mt-0.5">Расчёт №{result.calcNumber}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            Экспорт CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Печать
          </button>
        </div>
      </div>

      {/* Model name */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
        <p className="text-xs text-blue-600 font-medium mb-0.5">Подобранная установка</p>
        <p className="text-base font-bold text-blue-900">{result.selectedSeries} — {m.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <table className="text-sm w-full">
          <tbody>
            <SectionTitle title="Основные характеристики" />
            <Row label="Серия" value={result.selectedSeries} />
            <Row label="Модель" value={m.name} />
            <Row label="Фильтр приток" value={m.filterSupply} />
            <Row label="Фильтр вытяжка" value={m.filterExhaust} />
            <Row label="Расход (факт)" value={`${result.actualWorkingQ}`} unit="м³/ч" />
            <Row label="Давление (факт)" value={`${result.actualWorkingP}`} unit="Па" />
            <Row label="Давление вент. при расч. Q" value={`${result.fanPressureAtDesign}`} unit="Па" />
            <Row label="Макс. давление" value={m.maxPressure} unit="Па" />
            <Row label="Макс. расход" value={m.maxFlow} unit="м³/ч" />
            <Row label="Напряжение" value={m.supplyVoltage} />
            <Row label="Потр. мощность (без нагр.)" value={round(m.fanPower, 2)} unit="кВт" />
            <Row label="Полная мощность" value={round(m.totalPower, 2)} unit="кВт" />
            <Row label="Рабочий ток" value={round(m.totalCurrent, 1)} unit="А" />

            <SectionTitle title="Вентилятор" />
            <Row label="Напряжение вент." value={m.fanVoltage} />
            <Row label="Ток вент." value={round(m.fanCurrent, 2)} unit="А" />
            <Row label="Мощность вент." value={round(m.fanPower, 2)} unit="кВт" />
            <Row label="Частота вращения" value={m.fanRpm > 0 ? m.fanRpm : '—'} unit={m.fanRpm > 0 ? "об/мин" : ""} />

            <SectionTitle title="Нагреватель" />
            <Row label="Тип" value={m.heaterVoltage !== '-' ? 'Электрический' : 'Нет'} />
            <Row label="Напряжение нагрев." value={m.heaterVoltage} />
            <Row label="Мощность ном." value={round(m.heaterPower, 2)} unit="кВт" />
            <Row label="Мощность треб." value={round(heater.requiredPower, 2)} unit="кВт" />
            <Row label="Достиж. температура" value={round(heater.achievableTemp, 1)} unit="°C" />
          </tbody>
        </table>

        {/* Right column */}
        <table className="text-sm w-full">
          <tbody>
            <SectionTitle title="Рекуператор" />
            <Row label="КПД (темп.)" value={round(recup.efficiency * 100, 1)} unit="%" />
            {recup.efficiencyH > 0 && <Row label="КПД (влажн.)" value={round(recup.efficiencyH * 100, 1)} unit="%" />}
            <Row label="Темп. после рекуп." value={round(recup.supplyTempAfter, 1)} unit="°C" />
            <Row label="Влажность после рекуп." value={round(recup.supplyHumidityAfter, 0)} unit="%" />
            <Row label="Теплота рекуп." value={round(Math.abs(recup.heatRecovered), 2)} unit="кВт" />

            <SectionTitle title="Воздушные параметры" />
            <Row label="Плотность воздуха" value={result.airDensity} unit="кг/м³" />
            <Row label="Массовый расход" value={result.airMassFlow} unit="кг/с" />

            <SectionTitle title="Габаритные размеры (мм)" />
            <Row label="W (ширина)" value={dim(m.dimW)} />
            <Row label="H (высота)" value={dim(m.dimH)} />
            <Row label="L (длина)" value={dim(m.dimL)} />
            <Row label="W1" value={dim(m.dimW1)} />
            <Row label="H1" value={dim(m.dimH1)} />
            <Row label="L1" value={dim(m.dimL1)} />
            <Row label="D (патрубок)" value={dim(m.dimD)} unit={m.dimD ? "мм" : ""} />
            <Row label="Масса" value={m.weight} unit="кг" />
          </tbody>
        </table>
      </div>

      {/* Options table */}
      <div className="mt-4">
        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Опции</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-600">Опция</th>
              <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-600">Тип / Модель</th>
              <th className="text-center py-1.5 px-2 text-xs font-semibold text-gray-600">Кол-во</th>
            </tr>
          </thead>
          <tbody>
            {result.options.map((opt, i) => (
              <tr key={i} className={`border-b border-gray-100 ${opt.available ? '' : 'opacity-40'}`}>
                <td className="py-1 px-2 text-xs">{opt.name}</td>
                <td className="py-1 px-2 text-xs text-gray-700">
                  {opt.available ? `${opt.type} / ${opt.model}` : '—'}
                </td>
                <td className="py-1 px-2 text-center text-xs">{opt.available ? opt.qty : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
