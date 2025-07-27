import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PerformanceChart } from '../PerformanceChart';
import type { PerformanceData } from '../../../types';

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Line Chart
    </div>
  ),
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Bar Chart
    </div>
  ),
  Doughnut: ({ data, options }: any) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Doughnut Chart
    </div>
  ),
}));

// Mock Chart.js registration
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  ArcElement: {},
}));

const mockPerformanceData: PerformanceData[] = [
  {
    date: '2024-01-01',
    accuracy: 85,
    subject: 'Mathematics',
    topic: 'Algebra',
  },
  {
    date: '2024-01-02',
    accuracy: 92,
    subject: 'Mathematics',
    topic: 'Geometry',
  },
  {
    date: '2024-01-03',
    accuracy: 78,
    subject: 'Physics',
    topic: 'Mechanics',
  },
];

describe('PerformanceChart', () => {
  it('renders line chart correctly', () => {
    render(
      <PerformanceChart
        data={mockPerformanceData}
        type="line"
        title="Performance Trends"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Line Chart')).toBeInTheDocument();
  });

  it('renders bar chart correctly', () => {
    render(
      <PerformanceChart
        data={mockPerformanceData}
        type="bar"
        title="Performance Comparison"
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();
  });

  it('renders doughnut chart correctly', () => {
    render(
      <PerformanceChart
        data={mockPerformanceData}
        type="doughnut"
        title="Subject Distribution"
      />
    );

    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByText('Doughnut Chart')).toBeInTheDocument();
  });

  it('shows empty state when no data provided', () => {
    render(
      <PerformanceChart
        data={[]}
        type="line"
        title="Empty Chart"
      />
    );

    expect(screen.getByText('No performance data available')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('applies custom className and height', () => {
    const { container } = render(
      <PerformanceChart
        data={mockPerformanceData}
        type="line"
        height={400}
        className="custom-chart"
      />
    );

    const chartContainer = container.querySelector('.custom-chart');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border', 'p-4');
  });

  it('shows/hides legend based on showLegend prop', () => {
    const { rerender } = render(
      <PerformanceChart
        data={mockPerformanceData}
        type="line"
        showLegend={true}
      />
    );

    let chartElement = screen.getByTestId('line-chart');
    let options = JSON.parse(chartElement.getAttribute('data-chart-options') || '{}');
    expect(options.plugins.legend.display).toBe(true);

    rerender(
      <PerformanceChart
        data={mockPerformanceData}
        type="line"
        showLegend={false}
      />
    );

    chartElement = screen.getByTestId('line-chart');
    options = JSON.parse(chartElement.getAttribute('data-chart-options') || '{}');
    expect(options.plugins.legend.display).toBe(false);
  });

  it('prepares chart data correctly for line/bar charts', () => {
    render(
      <PerformanceChart
        data={mockPerformanceData}
        type="line"
      />
    );

    const chartElement = screen.getByTestId('line-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');

    expect(chartData.labels).toBeDefined();
    expect(chartData.datasets).toBeDefined();
    expect(chartData.datasets.length).toBeGreaterThan(0);
  });

  it('prepares chart data correctly for doughnut chart', () => {
    render(
      <PerformanceChart
        data={mockPerformanceData}
        type="doughnut"
      />
    );

    const chartElement = screen.getByTestId('doughnut-chart');
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');

    expect(chartData.labels).toBeDefined();
    expect(chartData.datasets).toBeDefined();
    expect(chartData.datasets[0].label).toBe('Average Accuracy (%)');
    expect(chartData.datasets[0].backgroundColor).toBeDefined();
  });

  it('configures chart options correctly', () => {
    render(
      <PerformanceChart
        data={mockPerformanceData}
        type="line"
        title="Test Chart"
      />
    );

    const chartElement = screen.getByTestId('line-chart');
    const options = JSON.parse(chartElement.getAttribute('data-chart-options') || '{}');

    expect(options.responsive).toBe(true);
    expect(options.maintainAspectRatio).toBe(false);
    expect(options.plugins.title.display).toBe(true);
    expect(options.plugins.title.text).toBe('Test Chart');
    expect(options.scales).toBeDefined();
    expect(options.scales.y.max).toBe(100);
  });

  it('handles empty data gracefully', () => {
    render(
      <PerformanceChart
        data={[]}
        type="line"
      />
    );

    expect(screen.getByText('No performance data available')).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('handles null/undefined data gracefully', () => {
    render(
      <PerformanceChart
        data={null as any}
        type="line"
      />
    );

    expect(screen.getByText('No performance data available')).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });
});