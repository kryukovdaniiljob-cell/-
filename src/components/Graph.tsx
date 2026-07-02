import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { CalculationResult } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ScatterController);

export function Graph({ result }: { result: CalculationResult }) {
  const { aeroPoints, actualWorkingQ, actualWorkingP, fanPressureAtDesign } = result;

  const points = aeroPoints.filter((_, i) => i % 2 === 0);
  const labels = points.map(p => p.q);

  const data = {
    labels,
    datasets: [
      {
        label: 'Характеристика вентилятора (Па)',
        data: points.map(p => Math.max(0, p.fanP)),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Характеристика сети (Па)',
        data: points.map(p => p.netP),
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Рабочая точка',
        data: [{ x: actualWorkingQ, y: actualWorkingP }],
        borderColor: 'rgb(22, 163, 74)',
        backgroundColor: 'rgb(22, 163, 74)',
        pointRadius: 8,
        pointHoverRadius: 10,
        showLine: false,
        type: 'scatter' as const,
      },
      {
        label: 'Расчётная точка',
        data: [{ x: result.selectedModel.maxFlow / 1, y: fanPressureAtDesign }],
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgb(234, 88, 12)',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
        type: 'scatter' as const,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 11, family: 'Inter, system-ui, sans-serif' }, boxWidth: 16, padding: 16 },
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `${ctx.dataset.label}: ${Math.round(ctx.parsed?.y ?? 0)} Па`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: { display: true, text: 'Расход, м³/ч', font: { size: 11 } },
        ticks: { font: { size: 10 } },
        grid: { color: '#F1F5F9' },
      },
      y: {
        title: { display: true, text: 'Давление, Па', font: { size: 11 } },
        min: 0,
        ticks: { font: { size: 10 } },
        grid: { color: '#F1F5F9' },
      },
    },
  };

  return (
    <div className="bento-card p-4">
      <p className="card-section-label">Аэродинамические характеристики</p>
      <div style={{ height: 300 }}>
        <Line data={data as Parameters<typeof Line>[0]['data']} options={options} />
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
          Рабочая точка: {actualWorkingQ} м³/ч / {actualWorkingP} Па
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EA580C', display: 'inline-block' }}></span>
          Расчётная точка: {fanPressureAtDesign} Па
        </span>
      </div>
    </div>
  );
}
