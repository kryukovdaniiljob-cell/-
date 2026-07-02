import type { ReactNode } from 'react';
import { useStore } from '../store/useStore';
import { ALL_SERIES } from '../data/modelLoader';
import type { FormInputs } from '../types';

type FieldKey = keyof FormInputs;

function BentoCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bento-card p-4 ${className}`}>{children}</div>;
}

function CardLabel({ children }: { children: string }) {
  return <p className="card-section-label">{children}</p>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8' }}>{label}</span>
      {children}
    </div>
  );
}

function Seg({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`seg-btn ${value === o.value ? 'active' : ''}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function BSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="bento-input">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function BNum({ value, onChange, min, max, step }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <input type="number" value={value} min={min} max={max} step={step || 1}
      onChange={e => onChange(Number(e.target.value))}
      className="bento-input" />
  );
}

function Toggle({ value, onChange, labels }: {
  value: boolean; onChange: (v: boolean) => void; labels?: [string, string];
}) {
  const [on, off] = labels || ['Да', 'Нет'];
  return (
    <div className="pill-group">
      {([true, false] as const).map(v => (
        <button key={String(v)} onClick={() => onChange(v)}
          className={`pill-btn ${value === v ? 'active' : ''}`}>
          {v ? on : off}
        </button>
      ))}
    </div>
  );
}

export function FormPanel({ onCalculate }: { onCalculate: () => void }) {
  const { inputs, setInputs } = useStore();
  const set = (key: FieldKey, value: unknown) => setInputs({ [key]: value } as Partial<FormInputs>);

  const seriesOptions = Object.keys(ALL_SERIES).map(s => ({ value: s, label: s }));
  const maxSize = ALL_SERIES[inputs.manualSeries]?.length || 1;

  return (
    <div className="flex flex-col gap-3">

      {/* Card 1 — Mode */}
      <BentoCard>
        <CardLabel>Режим подбора</CardLabel>
        <div className="flex flex-col gap-3">
          <Field label="Тип установки">
            <Seg value={inputs.unitType} onChange={v => set('unitType', v)} options={[
              { value: 'supply-exhaust', label: 'Приточно-вытяжная' },
              { value: 'supply', label: 'Приточная' },
            ]} />
          </Field>
          <Field label="Способ подбора">
            <Seg value={inputs.selectionMode} onChange={v => set('selectionMode', v)} options={[
              { value: 'auto', label: 'Автоматически' },
              { value: 'manual', label: 'Вручную' },
            ]} />
          </Field>
          {inputs.selectionMode === 'manual' && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div className="col-span-2">
                <Field label="Серия">
                  <BSelect value={inputs.manualSeries} onChange={v => set('manualSeries', v)} options={seriesOptions} />
                </Field>
              </div>
              <Field label={`Типоразмер (1–${maxSize})`}>
                <BNum value={inputs.manualSize} onChange={v => set('manualSize', v)} min={1} max={maxSize} />
              </Field>
            </div>
          )}
        </div>
      </BentoCard>

      {/* Card 2 — Aerodynamics + Air */}
      <BentoCard>
        <CardLabel>Параметры воздуха</CardLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Расход приток, м³/ч">
            <BNum value={inputs.flowSupply} onChange={v => set('flowSupply', v)} min={50} max={10000} step={10} />
          </Field>
          {inputs.unitType === 'supply-exhaust' && (
            <Field label="Расход вытяжка, м³/ч">
              <BNum value={inputs.flowExhaust} onChange={v => set('flowExhaust', v)} min={50} max={10000} step={10} />
            </Field>
          )}
          <Field label="Напор, Па">
            <BNum value={inputs.pressureSupply} onChange={v => set('pressureSupply', v)} min={0} max={2000} step={10} />
          </Field>

          <div className="col-span-2 border-t border-slate-100 pt-3 grid grid-cols-2 gap-3">
            <Field label="Темп. наружная, °C">
              <BNum value={inputs.outsideTemp} onChange={v => set('outsideTemp', v)} min={-50} max={50} />
            </Field>
            <Field label="Влажность нар., %">
              <BNum value={inputs.outsideHumidity} onChange={v => set('outsideHumidity', v)} min={0} max={100} />
            </Field>
            <Field label="Темп. притока треб., °C">
              <BNum value={inputs.supplyTempRequired} onChange={v => set('supplyTempRequired', v)} min={-10} max={50} />
            </Field>
            {inputs.unitType === 'supply-exhaust' && (
              <>
                <Field label="Темп. вытяжки, °C">
                  <BNum value={inputs.exhaustTemp} onChange={v => set('exhaustTemp', v)} min={0} max={40} />
                </Field>
                <Field label="Влажность вытяжки, %">
                  <BNum value={inputs.exhaustHumidity} onChange={v => set('exhaustHumidity', v)} min={0} max={100} />
                </Field>
              </>
            )}
          </div>
        </div>
      </BentoCard>

      {/* Card 3 — Equipment */}
      <BentoCard>
        <CardLabel>Комплектация</CardLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Нагреватель">
            <BSelect value={inputs.heaterType} onChange={v => set('heaterType', v)} options={[
              { value: 'electric', label: 'Электрический' },
              { value: 'water', label: 'Водяной' },
              { value: 'none', label: 'Без нагревателя' },
            ]} />
          </Field>
          {inputs.unitType === 'supply-exhaust' && (
            <Field label="Рекуператор">
              <BSelect value={inputs.recuperatorType} onChange={v => set('recuperatorType', v)} options={[
                { value: 'plate', label: 'Пластинчатый' },
                { value: 'rotary', label: 'Роторный' },
              ]} />
            </Field>
          )}
          <Field label="Двигатель">
            <BSelect value={inputs.motorType} onChange={v => set('motorType', v)} options={[
              { value: 'ec', label: 'EC (EC)' },
              { value: 'async', label: 'Асинхронный' },
            ]} />
          </Field>
          <Field label="Высота корпуса">
            <BSelect value={inputs.bodyHeight} onChange={v => set('bodyHeight', v)} options={[
              { value: 'reduced', label: 'Уменьшенная' },
              { value: 'standard', label: 'Стандартная' },
            ]} />
          </Field>
          <Field label="Корпус">
            <BSelect value={inputs.bodyType} onChange={v => set('bodyType', v)} options={[
              { value: 'insulated', label: 'Изолированный' },
              { value: 'non-insulated', label: 'Не изолированный' },
            ]} />
          </Field>
          <Field label="Управление">
            <BSelect value={inputs.controlSystem} onChange={v => set('controlSystem', v)} options={[
              { value: 'built-in', label: 'Встроенная' },
              { value: 'external', label: 'Внешняя' },
            ]} />
          </Field>
          <Field label="Выброс">
            <BSelect value={inputs.airDirection} onChange={v => set('airDirection', v)} options={[
              { value: 'side', label: 'Вбок' },
              { value: 'top', label: 'Вверх' },
            ]} />
          </Field>
          <Field label="Монтаж">
            <BSelect value={inputs.mountType} onChange={v => set('mountType', v)} options={[
              { value: 'suspended', label: 'Подвесная' },
              { value: 'floor', label: 'Напольная' },
            ]} />
          </Field>
          {inputs.heaterType === 'water' && (
            <>
              <Field label="Вода вход, °C">
                <BNum value={inputs.waterTempIn} onChange={v => set('waterTempIn', v)} min={30} max={120} />
              </Field>
              <Field label="Вода выход, °C">
                <BNum value={inputs.waterTempOut} onChange={v => set('waterTempOut', v)} min={20} max={110} />
              </Field>
            </>
          )}
        </div>
      </BentoCard>

      {/* Card 4 — Options */}
      <BentoCard>
        <CardLabel>Опции</CardLabel>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {[
            { key: 'optSpeedController' as FieldKey, label: 'Регулятор скорости' },
            { key: 'optValve' as FieldKey, label: 'Клапан нар. воздуха' },
            { key: 'optActuator' as FieldKey, label: 'Привод клапана' },
            { key: 'optFlexConnectors' as FieldKey, label: 'Гибкие вставки' },
            { key: 'optSilencer' as FieldKey, label: 'Шумоглушитель' },
            { key: 'optPressureSensor' as FieldKey, label: 'Датчик давления' },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1">
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8' }}>{label}</span>
              <Toggle value={inputs[key] as boolean} onChange={v => set(key, v)} />
            </div>
          ))}
        </div>
      </BentoCard>

      <button className="calc-btn" onClick={onCalculate}>
        Выполнить расчёт
      </button>
    </div>
  );
}
