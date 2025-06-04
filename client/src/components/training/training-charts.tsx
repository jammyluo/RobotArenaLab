import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card } from "@/components/ui/card";
import type { TrainingMetric } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrainingChartsProps {
  metrics: TrainingMetric[];
}

export function TrainingCharts({ metrics }: TrainingChartsProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
        grid: {
          color: '#374151',
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
      },
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
    },
  };

  const lossData = {
    labels: metrics.map(m => `Epoch ${m.epoch}`),
    datasets: [
      {
        label: 'Training Loss',
        data: metrics.map(m => m.loss),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const rewardData = {
    labels: metrics.map(m => `Epoch ${m.epoch}`),
    datasets: [
      {
        label: 'Reward',
        data: metrics.map(m => m.reward),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Loss Curve</h4>
        <div className="h-48">
          {metrics.length > 0 ? (
            <Line data={lossData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm">No training data available</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-slate-800 border-slate-700">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Reward Curve</h4>
        <div className="h-48">
          {metrics.length > 0 ? (
            <Line data={rewardData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm">No training data available</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
