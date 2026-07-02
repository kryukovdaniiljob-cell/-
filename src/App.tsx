import { useCallback, Component, type ReactNode } from 'react';
import { FormPanel } from './components/FormPanel';
import { ResultTable } from './components/ResultTable';
import { Graph } from './components/Graph';
import { Warnings } from './components/Warnings';
import { useStore } from './store/useStore';
import { runCalculation } from './calculations/selector';
import type { CalculationResult } from './types';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '14px 16px', fontSize: 13, color: '#B91C1C' }}>
          <strong>Ошибка при отображении результата:</strong> {this.state.error}
          <button style={{ marginLeft: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}
            onClick={() => this.setState({ error: null })}>Сбросить</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function exportCSV(result: CalculationResult) {
  const m = result.selectedModel;
  const lines: string[] = [
    'Параметр,Значение,Единица',
    `Расчёт №,${result.calcNumber},`,
    `Серия,${result.selectedSeries},`,
    `Модель,${m.name},`,
    `Расход факт.,${result.actualWorkingQ},м³/ч`,
    `Давление факт.,${result.actualWorkingP},Па`,
    `Давление вент. при расч. Q,${result.fanPressureAtDesign},Па`,
    `Макс. давление,${m.maxPressure},Па`,
    `Макс. расход,${m.maxFlow},м³/ч`,
    `КПД рекуп. (темп.),${(result.recup.efficiency * 100).toFixed(1)},%`,
    `Темп. после рекуп.,${result.recup.supplyTempAfter.toFixed(1)},°C`,
    `Теплота рекуп.,${Math.abs(result.recup.heatRecovered).toFixed(2)},кВт`,
    `Мощность нагрев. треб.,${result.heater.requiredPower.toFixed(2)},кВт`,
    `Мощность нагрев. ном.,${result.heater.nominalPower.toFixed(2)},кВт`,
    `Достиж. темп. нагрев.,${result.heater.achievableTemp.toFixed(1)},°C`,
    `Плотность воздуха,${result.airDensity},кг/м³`,
    `Масса установки,${m.weight},кг`,
    `Ширина W,${m.dimW ?? ''},мм`,
    `Высота H,${m.dimH ?? ''},мм`,
    `Длина L,${m.dimL ?? ''},мм`,
    `Диаметр патрубка D,${m.dimD ?? ''},мм`,
    '',
    'Предупреждения:',
    ...result.warnings.map(w => `,${w},`),
  ];
  const csv = lines.join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MiniAHU_${result.calcNumber}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const { inputs, result, isCalculating, setResult, setCalculating } = useStore();

  const handleCalculate = useCallback(() => {
    setCalculating(true);
    try {
      const res = runCalculation(inputs);
      setResult(res);
    } catch (e) {
      console.error('Calculation error:', e);
    } finally {
      setCalculating(false);
    }
  }, [inputs, setResult, setCalculating]);

  return (
    <div className="min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Dark header */}
      <header style={{ background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 22V12M3 7l9 5 9-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>MiniAHU Selector</h1>
              <p style={{ margin: 0, fontSize: 11, color: '#64748B', marginTop: 1 }}>Подбор приточно-вытяжных установок</p>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#334155', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 600, color: '#94A3B8' }}>v2.3</span>
            <span style={{ color: '#475569' }}>24 серии · 2025</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 20px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Sidebar form */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <FormPanel onCalculate={handleCalculate} />
          </div>

          {/* Results area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isCalculating && (
              <div className="bento-card" style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Выполняется расчёт…</div>
              </div>
            )}

            {!isCalculating && !result && (
              <div className="bento-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M12 22V12M3 7l9 5 9-5" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#334155' }}>Заполните параметры</p>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94A3B8' }}>Нажмите «Выполнить расчёт» для подбора установки</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#CBD5E1' }}>Загружено 24 серии установок</p>
              </div>
            )}

            {!isCalculating && result && (
              <ErrorBoundary>
                {result.warnings.length > 0 && <Warnings warnings={result.warnings} />}
                <ResultTable result={result} onExport={() => exportCSV(result)} />
                <Graph result={result} />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
