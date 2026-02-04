"use client";
import { useState, useEffect } from "react";
import {
  globalPerformanceTracker,
  PerformanceMetrics,
} from "@/lib/performanceMetrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerformanceTester() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        setMetrics(globalPerformanceTracker.getMetrics());
        setTestCount(globalPerformanceTracker.getCount());
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTest = () => {
    setIsRunning(true);
    globalPerformanceTracker.reset();
    setMetrics(null);
    setTestCount(0);
  };

  const stopTest = () => {
    setIsRunning(false);
    setMetrics(globalPerformanceTracker.getMetrics());
  };

  const resetTest = () => {
    globalPerformanceTracker.reset();
    setMetrics(null);
    setTestCount(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pt-8">
        <CardTitle className="text-center">
          Performance Metrics Tester
        </CardTitle>
        <p className="font-ui text-sm text-center text-muted-foreground mt-2">
          Test real-time write → UI refresh performance during habit check-ins
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 justify-center">
          <Button onClick={startTest} disabled={isRunning} variant="default">
            Start Test
          </Button>
          <Button
            onClick={stopTest}
            disabled={!isRunning}
            variant="destructive"
          >
            Stop Test
          </Button>
          <Button onClick={resetTest} variant="outline">
            Reset
          </Button>
        </div>

        {isRunning && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">
              🧪 Test Running... Perform habit check-ins to measure performance
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Measurements: {testCount}
            </p>
          </div>
        )}

        {metrics && metrics.writeToUIRefresh.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Results</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.median.toFixed(1)}ms
                </div>
                <div className="text-sm text-gray-600">Median</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.p95.toFixed(1)}ms
                </div>
                <div className="text-sm text-gray-600">P95</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">{metrics.mean.toFixed(1)}ms</div>
                <div className="text-gray-600">Mean</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{metrics.min.toFixed(1)}ms</div>
                <div className="text-gray-600">Min</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{metrics.max.toFixed(1)}ms</div>
                <div className="text-gray-600">Max</div>
              </div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm">
                <strong>Target:</strong> Median &lt; 220ms, P95 &lt; 1000ms
              </div>
              <div className="text-sm mt-1">
                {metrics.median < 220 ? "" : ""} Median:{" "}
                {metrics.median < 220 ? "PASS" : "FAIL"}
                {" | "}
                {metrics.p95 < 1000 ? "" : ""} P95:{" "}
                {metrics.p95 < 1000 ? "PASS" : "FAIL"}
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600">
                View All Measurements
              </summary>
              <div className="mt-2 p-2 bg-gray-50 rounded max-h-32 overflow-y-auto">
                {metrics.writeToUIRefresh.map((ms, i) => (
                  <span
                    key={i}
                    className="inline-block mr-2 mb-1 px-2 py-1 bg-white rounded text-xs"
                  >
                    {ms.toFixed(1)}ms
                  </span>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
