import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitoring';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PerformanceMetrics {
  score: number;
  webVitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
    TTFB?: number;
  };
  recommendations: string[];
  componentMetrics: Record<string, number[]>;
  apiMetrics: Record<string, number[]>;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('showPerformanceDashboard') === 'true';
    setIsVisible(shouldShow);
  }, []);

  const refreshMetrics = () => {
    const score = performanceMonitor.getPerformanceScore();
    const recommendations = performanceMonitor.getRecommendations();
    const fullMetrics = performanceMonitor.getMetrics();

    setMetrics({
      score,
      webVitals: fullMetrics.webVitals,
      recommendations,
      componentMetrics: fullMetrics.customMetrics.componentRenderTime || {},
      apiMetrics: fullMetrics.customMetrics.apiResponseTime || {},
    });
  };

  const exportData = () => {
    const data = performanceMonitor.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (time: number) => {
    if (time < 1000) return `${time.toFixed(0)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          📊 Performance
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="bg-white shadow-xl border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance Monitor</h3>
            <div className="flex gap-2">
              <Button onClick={refreshMetrics} size="sm" variant="outline">
                🔄
              </Button>
              <Button onClick={exportData} size="sm" variant="outline">
                📥
              </Button>
              <Button 
                onClick={() => setIsVisible(false)} 
                size="sm" 
                variant="outline"
              >
                ✕
              </Button>
            </div>
          </div>

          {metrics ? (
            <div className="space-y-4">
              {/* Performance Score */}
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(metrics.score)}`}>
                  {metrics.score}
                </div>
                <div className="text-sm text-gray-600">Performance Score</div>
              </div>

              {/* Web Vitals */}
              <div>
                <h4 className="font-medium mb-2">Web Vitals</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {metrics.webVitals.FCP && (
                    <div>
                      <span className="text-gray-600">FCP:</span> {formatTime(metrics.webVitals.FCP)}
                    </div>
                  )}
                  {metrics.webVitals.LCP && (
                    <div>
                      <span className="text-gray-600">LCP:</span> {formatTime(metrics.webVitals.LCP)}
                    </div>
                  )}
                  {metrics.webVitals.FID && (
                    <div>
                      <span className="text-gray-600">FID:</span> {formatTime(metrics.webVitals.FID)}
                    </div>
                  )}
                  {metrics.webVitals.CLS && (
                    <div>
                      <span className="text-gray-600">CLS:</span> {metrics.webVitals.CLS.toFixed(3)}
                    </div>
                  )}
                </div>
              </div>

              {/* Component Performance */}
              {Object.keys(metrics.componentMetrics).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Slow Components</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(metrics.componentMetrics)
                      .map(([component, times]) => ({
                        component,
                        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
                      }))
                      .filter(({ avgTime }) => avgTime > 16)
                      .sort((a, b) => b.avgTime - a.avgTime)
                      .slice(0, 3)
                      .map(({ component, avgTime }) => (
                        <div key={component} className="flex justify-between">
                          <span className="truncate">{component}</span>
                          <span className="text-red-600">{avgTime.toFixed(1)}ms</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* API Performance */}
              {Object.keys(metrics.apiMetrics).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Slow APIs</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(metrics.apiMetrics)
                      .map(([endpoint, times]) => ({
                        endpoint: endpoint.split('/').pop() || endpoint,
                        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
                      }))
                      .filter(({ avgTime }) => avgTime > 1000)
                      .sort((a, b) => b.avgTime - a.avgTime)
                      .slice(0, 3)
                      .map(({ endpoint, avgTime }) => (
                        <div key={endpoint} className="flex justify-between">
                          <span className="truncate">{endpoint}</span>
                          <span className="text-yellow-600">{formatTime(avgTime)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {metrics.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <div className="space-y-1 text-xs">
                    {metrics.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="text-gray-600">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Button onClick={refreshMetrics} variant="primary">
                Load Metrics
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};