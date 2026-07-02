import type { ReactNode } from 'react';
import type { CalculationResult } from '../types';
import { round } from '../calculations/utils';

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bento-card p-4 flex flex-col justify-between">
      <p className="stat-label" style={{ color: '#94A3B8' }}>{label}</p>
      <div className="mt-2">
        <span className="stat-num">{value}</span>
        {unit && <span className="stat-unit ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function DataRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-slate-50 last:border-0">
      <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
        {value}{unit && <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 3 }}>{unit}</span>}
      </span>
    </div>
  );
}

function SectionCard({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bento-card p-4 ${className}`}>
      <p className="card-section-label">{title}</p>
      {children}
    </div>
  );
}

export function ResultTable({ result, onExport }: { result: CalculationResult; onExport: () => void }) {
  const { selectedModel: m, recup, heater } = result;
  const dim = (v: number | null) => v != null ? `${v}` : '—';

  return (
    <div className="flex flex-col gap-3">

      {/* Hero */}
      <div className="result-hero">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
              Подобранная установка · Расчёт №{result.calcNumber}
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'white', lineHeight: 1.15, margin: 0 }}>
              {result.selectedSeries}
            </h2>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {m.name}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>
              Фильтр: {m.filterSupply}{m.filterExhaust !== '-' ? ` / ${m.filterExhaust}` : ''}
              {m.supplyVoltage !== '-' && ` · ${m.supplyVoltage}`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onExport}
              style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              CSV
            </button>
            <button onClick={() => window.print()}
              style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Печать
            </button>
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Расход (факт)" value={result.actualWorkingQ} unit="м³/ч" />
        <StatCard label="Давление (факт)" value={result.actualWorkingP} unit="Па" />
        <StatCard label="Полная мощность" value={round(m.totalPower, 2)} unit="кВт" />
      </div>

      {/* Recuperator + Heater */}
      <div className="grid grid-cols-2 gap-3">
        <SectionCard title="Рекуператор">
          <DataRow label="КПД (температура)" value={round(recup.efficiency * 100, 1)} unit="%" />
          {recup.efficiencyH > 0 && <DataRow label="КПД (влажность)" value={round(recup.efficiencyH * 100, 1)} unit="%" />}
          <DataRow label="Темп. после рекуп." value={round(recup.supplyTempAfter, 1)} unit="°C" />
          <DataRow label="Влажн. после рекуп." value={round(recup.supplyHumidityAfter, 0)} unit="%" />
          <DataRow label="Теплота рекуп." value={round(Math.abs(recup.heatRecovered), 2)} unit="кВт" />
        </SectionCard>

        <SectionCard title="Нагреватель">
          <DataRow label="Тип" value={m.heaterVoltage !== '-' ? 'Электрический' : 'Нет'} />
          <DataRow label="Напряжение" value={m.heaterVoltage} />
          <DataRow label="Мощность номинальная" value={round(m.heaterPower, 2)} unit="кВт" />
          <DataRow label="Мощность требуемая" value={round(heater.requiredPower, 2)} unit="кВт" />
          <DataRow label="Достижимая темп." value={round(heater.achievableTemp, 1)} unit="°C" />
        </SectionCard>
      </div>

      {/* Fan + Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <SectionCard title="Вентилятор">
          <DataRow label="Давление при расч. Q" value={result.fanPressureAtDesign} unit="Па" />
          <DataRow label="Макс. давление" value={m.maxPressure} unit="Па" />
          <DataRow label="Макс. расход" value={m.maxFlow} unit="м³/ч" />
          <DataRow label="Напряжение" value={m.fanVoltage} />
          <DataRow label="Ток" value={round(m.fanCurrent, 2)} unit="А" />
          <DataRow label="Мощность" value={round(m.fanPower, 2)} unit="кВт" />
          {m.fanRpm > 0 && <DataRow label="Частота вращения" value={m.fanRpm} unit="об/мин" />}
        </SectionCard>

        <SectionCard title="Габариты и масса">
          <DataRow label="Ширина W" value={dim(m.dimW)} unit="мм" />
          <DataRow label="Высота H" value={dim(m.dimH)} unit="мм" />
          <DataRow label="Длина L" value={dim(m.dimL)} unit="мм" />
          {m.dimW1 != null && <DataRow label="W1" value={dim(m.dimW1)} unit="мм" />}
          {m.dimH1 != null && <DataRow label="H1" value={dim(m.dimH1)} unit="мм" />}
          {m.dimL1 != null && <DataRow label="L1" value={dim(m.dimL1)} unit="мм" />}
          {m.dimD != null && <DataRow label="Патрубок D" value={dim(m.dimD)} unit="мм" />}
          <DataRow label="Масса" value={m.weight} unit="кг" />
        </SectionCard>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Плотность воздуха" value={result.airDensity} unit="кг/м³" />
        <StatCard label="Массовый расход" value={result.airMassFlow} unit="кг/с" />
        <StatCard label="Ток полный" value={round(m.totalCurrent, 1)} unit="А" />
      </div>

      {/* Options table */}
      <div className="bento-card p-4">
        <p className="card-section-label">Опции комплектации</p>
        <table className="opts-table">
          <thead>
            <tr>
              <th>Опция</th>
              <th>Тип / Модель</th>
              <th style={{ textAlign: 'center' }}>Кол-во</th>
              <th style={{ textAlign: 'center' }}>Вкл.</th>
            </tr>
          </thead>
          <tbody>
            {result.options.map((opt, i) => (
              <tr key={i} className={opt.available ? '' : 'unavail'}>
                <td style={{ fontWeight: 500 }}>{opt.name}</td>
                <td style={{ color: '#64748B' }}>{opt.available ? `${opt.type} / ${opt.model}` : '—'}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{opt.available ? opt.qty : '—'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: opt.available ? '#DCFCE7' : '#F1F5F9' }}>
                    {opt.available
                      ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/></svg>
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
