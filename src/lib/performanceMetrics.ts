export interface PerformanceMetrics {
  writeToUIRefresh: number[];
  p95: number;
  median: number;
  mean: number;
  min: number;
  max: number;
}

export class PerformanceTracker {
  private measurements: number[] = [];
  private startTime: number = 0;

  startMeasurement() {
    this.startTime = performance.now();
  }

  endMeasurement() {
    if (this.startTime === 0) return;
    const duration = performance.now() - this.startTime;
    this.measurements.push(duration);
    this.startTime = 0;
  }

  getMetrics(): PerformanceMetrics {
    if (this.measurements.length === 0) {
      return {
        writeToUIRefresh: [],
        p95: 0,
        median: 0,
        mean: 0,
        min: 0,
        max: 0
      };
    }

    const sorted = [...this.measurements].sort((a, b) => a - b);
    const p95Index = Math.floor(this.measurements.length * 0.95);
    
    return {
      writeToUIRefresh: this.measurements,
      p95: sorted[p95Index] || 0,
      median: sorted[Math.floor(this.measurements.length / 2)] || 0,
      mean: this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length,
      min: Math.min(...this.measurements),
      max: Math.max(...this.measurements)
    };
  }

  reset() {
    this.measurements = [];
    this.startTime = 0;
  }

  getCount() {
    return this.measurements.length;
  }
}

// Global performance tracker instance
export const globalPerformanceTracker = new PerformanceTracker();
