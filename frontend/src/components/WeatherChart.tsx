import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';

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

interface HourlyData {
  time: string;
  time_epoch: number;
  temp_c: number;
  temp_f: number;
  condition_text: string;
  condition_icon: string;
  is_day: number;
}

interface WeatherChartProps {
  hourly: HourlyData[];
  unit: 'C' | 'F';
  isDarkMode: boolean;
}

export default function WeatherChart({ hourly, unit, isDarkMode }: WeatherChartProps) {
  // Take the first 12 hours for the trend chart
  const nextHours = hourly.slice(0, 12);
  
  const labels = nextHours.map(h => {
    try {
      const date = new Date(h.time_epoch * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return h.time.split(' ')[1] || h.time;
    }
  });
  
  const temps = nextHours.map(h => unit === 'C' ? h.temp_c : h.temp_f);

  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const lineColor = '#facc15'; // neo-yellow
  const fillColor = isDarkMode ? 'rgba(192, 132, 252, 0.2)' : 'rgba(250, 204, 21, 0.3)'; // purple dark / yellow light

  const data = {
    labels,
    datasets: [
      {
        label: `Temperature (°${unit})`,
        data: temps,
        borderColor: isDarkMode ? '#c084fc' : '#000000', // purple on dark / black on light
        backgroundColor: fillColor,
        borderWidth: 4,
        fill: true,
        tension: 0.1, // clean straight-ish segments but soft
        pointBackgroundColor: lineColor,
        pointBorderColor: '#000000',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#000000',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Custom header instead of legend
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#ffffff' : '#000000',
        bodyColor: isDarkMode ? '#ffffff' : '#000000',
        titleFont: {
          family: 'var(--font-space-grotesk)',
          weight: 'bold',
        },
        bodyFont: {
          family: 'var(--font-space-grotesk)',
        },
        borderColor: isDarkMode ? '#ffffff' : '#000000',
        borderWidth: 2,
        cornerRadius: 0, // Neubrutalist sharp edges
        displayColors: false,
        padding: 10,
        callbacks: {
          label: function(context) {
            return ` ${context.parsed.y} °${unit}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          lineWidth: 2,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'var(--font-space-grotesk)',
            weight: 'bold',
          },
        },
        border: {
          color: isDarkMode ? '#ffffff' : '#000000',
          width: 3,
        }
      },
      y: {
        grid: {
          color: gridColor,
          lineWidth: 2,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'var(--font-space-grotesk)',
            weight: 'bold',
          },
        },
        border: {
          color: isDarkMode ? '#ffffff' : '#000000',
          width: 3,
        }
      },
    },
  };

  return (
    <div className="w-full h-64 md:h-72">
      <Line data={data} options={options} />
    </div>
  );
}
