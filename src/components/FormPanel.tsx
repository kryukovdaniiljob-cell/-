import type { ReactNode } from 'react';
import { useStore } from '../store/useStore';
import { ALL_SERIES } from '../data/modelLoader';
import type { FormInputs } from '../types';

type FieldKey = keyof FormInputs;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, min, max, step }: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step || 1}
      onChange={e => onChange(Number(e.target.value))}
      className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
    />
  );
}

function Toggle({ value, onChange, labels }: {
  value: boolean;
  onChange: (v: boolean) => void;
  labels?: [string, string];
}) {
  const [on, off] = labels || ['Да', 'Нет'];
  return (
    <div className="flex gap-1">
      {[true, false].map(v => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${
            value === v
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {v ? on : off}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="col-span-2 border-b border-blue-200 pt-3 pb-1">
      <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

export function FormPanel({ onCalculate }: { onCalculate: () => void }) {
  const { inputs, setInputs } = useStore();
  const set = (key: FieldKey, value: unknown) => setInputs({ [key]: value } as Partial<FormInputs>);

  const seriesOptions = Object.keys(ALL_SERIES).map(s => ({ value: s, label: s }));
  const maxSize = ALL_SERIES[inputs.manualSeries]?.length || 1;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      <h2 className="text-base font-bold text-gray-800">Параметры установки</h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">

        <SectionHeader title="Режим подбора" />

        <Field label="Тип установки">
          <Select
            value={inputs.unitType}
            onChange={v => set('unitType', v)}
            options={[
              { value: 'supply-exhaust', label: 'Приточно-вытяжная' },
              { value: 'supply', label: 'Приточная' },
            ]}
          />
        </Field>

        <Field label="Способ подбора">
          <Select
            value={inputs.selectionMode}
            onChange={v => set('selectionMode', v)}
            options={[
              { value: 'manual', label: 'Вручную' },
              { value: 'auto', label: 'Автоматически' },
            ]}
          />
        </Field>

        {inputs.selectionMode === 'manual' && (
          <>
            <Field label="Серия установки">
              <Select
                value={inputs.manualSeries}
                onChange={v => set('manualSeries', v)}
                options={seriesOptions}
              />
            </Field>

            <Field label={`Типоразмер (1–${maxSize})`}>
              <NumberInput
                value={inputs.manualSize}
                onChange={v => set('manualSize', v)}
                min={1}
                max={maxSize}
              />
            </Field>
          </>
        )}

        <SectionHeader title="Аэродинамика" />

        <Field label="Расход притока, м³/ч">
          <NumberInput value={inputs.flowSupply} onChange={v => set('flowSupply', v)} min={50} max={10000} step={10} />
        </Field>

        {inputs.unitType === 'supply-exhaust' && (
          <Field label="Расход вытяжки, м³/ч">
            <NumberInput value={inputs.flowExhaust} onChange={v => set('flowExhaust', v)} min={50} max={10000} step={10} />
          </Field>
        )}

        <Field label="Напор, Па">
          <NumberInput value={inputs.pressureSupply} onChange={v => set('pressureSupply', v)} min={0} max={2000} step={10} />
        </Field>

        <SectionHeader title="Параметры воздуха" />

        <Field label="Температура нар. воздуха, °C">
          <NumberInput value={inputs.outsideTemp} onChange={v => set('outsideTemp', v)} min={-50} max={50} />
        </Field>

        <Field label="Влажность нар. воздуха, %">
          <NumberInput value={inputs.outsideHumidity} onChange={v => set('outsideHumidity', v)} min={0} max={100} />
        </Field>

        <Field label="Требуемая темп. притока, °C">
          <NumberInput value={inputs.supplyTempRequired} onChange={v => set('supplyTempRequired', v)} min={-10} max={50} />
        </Field>

        {inputs.unitType === 'supply-exhaust' && (
          <>
            <Field label="Температура вытяжки, °C">
              <NumberInput value={inputs.exhaustTemp} onChange={v => set('exhaustTemp', v)} min={0} max={40} />
            </Field>

            <Field label="Влажность вытяжки, %">
              <NumberInput value={inputs.exhaustHumidity} onChange={v => set('exhaustHumidity', v)} min={0} max={100} />
            </Field>
          </>
        )}

        <SectionHeader title="Комплектация" />

        <Field label="Тип нагревателя">
          <Select
            value={inputs.heaterType}
            onChange={v => set('heaterType', v)}
            options={[
              { value: 'electric', label: 'Электрический' },
              { value: 'water', label: 'Водяной' },
              { value: 'none', label: 'Без нагревателя' },
            ]}
          />
        </Field>

        {inputs.unitType === 'supply-exhaust' && (
          <Field label="Тип рекуператора">
            <Select
              value={inputs.recuperatorType}
              onChange={v => set('recuperatorType', v)}
              options={[
                { value: 'plate', label: 'Пластинчатый' },
                { value: 'rotary', label: 'Роторный' },
              ]}
            />
          </Field>
        )}

        <Field label="Тип корпуса">
          <Select
            value={inputs.bodyType}
            onChange={v => set('bodyType', v)}
            options={[
              { value: 'insulated', label: 'Изолированный' },
              { value: 'non-insulated', label: 'Не изолированный' },
            ]}
          />
        </Field>

        <Field label="Система управления">
          <Select
            value={inputs.controlSystem}
            onChange={v => set('controlSystem', v)}
            options={[
              { value: 'built-in', label: 'Встроенная' },
              { value: 'external', label: 'Внешняя' },
            ]}
          />
        </Field>

        <Field label="Тип двигателя">
          <Select
            value={inputs.motorType}
            onChange={v => set('motorType', v)}
            options={[
              { value: 'ec', label: 'ЕС (EC)' },
              { value: 'async', label: 'Асинхронный' },
            ]}
          />
        </Field>

        <Field label="Высота корпуса">
          <Select
            value={inputs.bodyHeight}
            onChange={v => set('bodyHeight', v)}
            options={[
              { value: 'reduced', label: 'Уменьшенная' },
              { value: 'standard', label: 'Стандартная' },
            ]}
          />
        </Field>

        {inputs.heaterType === 'water' && (
          <>
            <Field label="Температура воды вход, °C">
              <NumberInput value={inputs.waterTempIn} onChange={v => set('waterTempIn', v)} min={30} max={120} />
            </Field>
            <Field label="Температура воды выход, °C">
              <NumberInput value={inputs.waterTempOut} onChange={v => set('waterTempOut', v)} min={20} max={110} />
            </Field>
          </>
        )}

        <Field label="Направление выброса">
          <Select
            value={inputs.airDirection}
            onChange={v => set('airDirection', v)}
            options={[
              { value: 'side', label: 'Вбок' },
              { value: 'top', label: 'Вверх' },
            ]}
          />
        </Field>

        <Field label="Способ монтажа">
          <Select
            value={inputs.mountType}
            onChange={v => set('mountType', v)}
            options={[
              { value: 'suspended', label: 'Подвесная' },
              { value: 'floor', label: 'Напольная' },
            ]}
          />
        </Field>

        <SectionHeader title="Опции" />

        <Field label="Регулятор скорости">
          <Toggle value={inputs.optSpeedController} onChange={v => set('optSpeedController', v)} />
        </Field>

        <Field label="Клапан нар. воздуха">
          <Toggle value={inputs.optValve} onChange={v => set('optValve', v)} />
        </Field>

        <Field label="Электропривод клапана">
          <Toggle value={inputs.optActuator} onChange={v => set('optActuator', v)} />
        </Field>

        <Field label="Гибкие вставки">
          <Toggle value={inputs.optFlexConnectors} onChange={v => set('optFlexConnectors', v)} />
        </Field>

        <Field label="Шумоглушитель">
          <Toggle value={inputs.optSilencer} onChange={v => set('optSilencer', v)} />
        </Field>

        <Field label="Датчик давления">
          <Toggle value={inputs.optPressureSensor} onChange={v => set('optPressureSensor', v)} />
        </Field>
      </div>

      <button
        onClick={onCalculate}
        className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        Выполнить расчёт
      </button>
    </div>
  );
}
