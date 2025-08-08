import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { PerformanceData } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export interface PerformanceChartProps {
  data: PerformanceData[];
  type: 'line' | 'bar' | 'doughnut';
  title?: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  type,
  title,
  height = 300,
  showLegend = true,
  className = '',
}) => {
  // Prepare chart data based on type
  const prepareChartData = () => {
    if (!data || data.length === 0) {
      // Return meaningful empty data for charts
      if (type === 'doughnut') {
        return {
          labels: ['Veri Yok'],
          datasets: [
            {
              label: 'Henüz veri yok',
              data: [1],
              backgroundColor: ['#e5e7eb'],
              borderWidth: 0,
            },
          ],
        };
      } else {
        return {
          labels: ['Veri Yok'],
          datasets: [
            {
              label: 'Henüz veri yok',
              data: [0],
              borderColor: '#e5e7eb',
              backgroundColor: '#f3f4f6',
              tension: type === 'line' ? 0.4 : undefined,
              fill: false,
            },
          ],
        };
      }
    }

    if (type === 'doughnut') {
      // For doughnut chart, group by subject and show average accuracy
      const subjectData = data.reduce((acc, item) => {
        const subject = item?.subject || 'Bilinmiyor';
        if (!acc[subject]) {
          acc[subject] = { total: 0, count: 0 };
        }
        acc[subject].total += item?.accuracy || 0;
        acc[subject].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      const subjects = Object.keys(subjectData);
      const accuracies = subjects.map(
        (subject) => subjectData[subject].total / subjectData[subject].count
      );

      return {
        labels: subjects,
        datasets: [
          {
            label: 'Ortalama Doğruluk (%)',
            data: accuracies,
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
              '#06b6d4',
              '#84cc16',
              '#f97316',
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      };
    }

    // For line and bar charts, show accuracy over time or by category
    const labels = data.map((item) => {
      // Check if date is a valid date string or just a category label
      const dateTest = new Date(item?.date || '');
      const isValidDate = !isNaN(dateTest.getTime()) && item?.date;
      
      if (isValidDate) {
        // If it's a valid date, format it properly
        return dateTest.toLocaleDateString('tr-TR', {
          month: 'short',
          day: 'numeric',
        });
      } else {
        // If it's not a date (like subject names), use as is or fallback
        return item?.date || item?.subject || 'Bilinmiyor';
      }
    });

    // If no subject information provided, build a single dataset labelled generically
    const hasAnySubject = data.some((item) => typeof item?.subject === 'string' && item.subject.trim().length > 0);
    if (!hasAnySubject) {
      const color = '#3b82f6';
      return {
        labels: [...new Set(labels)],
        datasets: [
          {
            label: 'Doğruluk',
            data: data.map((item) => item?.accuracy || 0),
            borderColor: color,
            backgroundColor: type === 'bar' ? color + '20' : color,
            tension: type === 'line' ? 0.4 : undefined,
            fill: type === 'line' ? false : undefined,
          },
        ],
      };
    }

    // Group by subject for multiple datasets when subject info exists
    const subjectGroups = data.reduce((acc, item) => {
      const subject = (item?.subject && item.subject.trim().length > 0) ? item.subject : 'Genel';
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(item);
      return acc;
    }, {} as Record<string, PerformanceData[]>);

    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
    ];

    const datasets = Object.keys(subjectGroups).map((subject, index) => ({
      label: subject,
      data: subjectGroups[subject].map((item) => item?.accuracy || 0),
      borderColor: colors[index % colors.length],
      backgroundColor:
        type === 'bar'
          ? colors[index % colors.length] + '20'
          : colors[index % colors.length],
      tension: type === 'line' ? 0.4 : undefined,
      fill: type === 'line' ? false : undefined,
    }));

    return {
      labels: [...new Set(labels)], // Remove duplicates
      datasets,
    };
  };

  const chartData = prepareChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          filter: function(legendItem: any) {
            // Don't show legend for empty data
            return legendItem.text !== 'Henüz veri yok' && legendItem.text !== 'Veri Yok';
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        enabled: data && data.length > 0, // Disable tooltips for empty data
        callbacks: {
          label: (context: any) => {
            if (type === 'doughnut') {
              return `${context.label}: ${context.parsed.toFixed(1)}%`;
            }
            return `${context.dataset.label}: ${context.parsed.y?.toFixed(1)}%`;
          },
        },
      },
    },
    scales:
      type !== 'doughnut' && data && data.length > 0
        ? {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value: unknown) => `${value}%`,
              },
              title: {
                display: true,
                text: 'Doğruluk (%)',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Tarih',
              },
            },
          }
        : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  // Show empty state when data is truly empty (but still render charts with "no data" when there's structure but no content)
  const shouldShowEmptyState = !data || data.length === 0;

  if (shouldShowEmptyState) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-3">📊</div>
          <p className="text-gray-600 font-medium mb-1">Henüz veri yok</p>
          <p className="text-gray-500 text-sm">Quiz çözmeye başladığınızda grafikler burada görünecek</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div style={{ height }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default PerformanceChart;