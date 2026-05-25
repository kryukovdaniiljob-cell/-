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
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-red-700">
          <strong>Ошибка при отображении результата:</strong> {this.state.error}
          <button className="ml-3 underline" onClick={() => this.setState({ error: null })}>Сбросить</button>
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">MiniAHU Selector</h1>
            <p className="text-xs text-blue-200">Подбор компактных приточно-вытяжных установок</p>
          </div>
          <div className="text-xs text-blue-200 text-right hidden sm:block">
            <div>Версия 2.3 · 2025</div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-72 xl:w-80 shrink-0">
            <FormPanel onCalculate={handleCalculate} />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {isCalculating && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Выполняется расчёт…
              </div>
            )}

            {!isCalculating && !result && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-sm">Заполните параметры и нажмите «Выполнить расчёт»</p>
                <p className="text-gray-400 text-xs mt-2">Загружено 24 серии установок</p>
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
