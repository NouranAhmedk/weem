/**
 * Test Metrics Collector
 * Collects and aggregates test execution metrics
 */

export interface TestMetrics {
  // Test counts
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;

  // Timing
  startTime: Date;
  endTime?: Date;
  duration: number; // in milliseconds

  // Performance
  averageTestDuration: number;
  slowestTest?: TestResult;
  fastestTest?: TestResult;

  // Failure analysis
  failureRate: number; // percentage
  topFailures: FailureAnalysis[];

  // Browser/environment
  browser: string;
  environment: string;
}

export interface TestResult {
  name: string;
  fullName: string;
  status: 'passed' | 'failed' | 'skipped' | 'flaky';
  duration: number;
  startTime: Date;
  endTime?: Date;
  error?: TestError;
  retries: number;
  attachments: Attachment[];
  tags: string[];
}

export interface TestError {
  message: string;
  stack?: string;
  type: string;
  location?: {
    file: string;
    line: number;
    column: number;
  };
}

export interface Attachment {
  name: string;
  path: string;
  type: 'screenshot' | 'video' | 'trace' | 'log';
  size?: number;
}

export interface FailureAnalysis {
  errorType: string;
  errorMessage: string;
  count: number;
  tests: string[];
  firstOccurrence: Date;
  lastOccurrence: Date;
}

export class TestMetricsCollector {
  private metrics: TestMetrics;
  private testResults: TestResult[] = [];
  private failures: Map<string, FailureAnalysis> = new Map();

  constructor(browser: string = 'chromium', environment: string = 'dev') {
    this.metrics = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      startTime: new Date(),
      duration: 0,
      averageTestDuration: 0,
      failureRate: 0,
      topFailures: [],
      browser,
      environment,
    };
  }

  /**
   * Start collecting metrics
   */
  start(): void {
    this.metrics.startTime = new Date();
  }

  /**
   * Record a test result
   */
  recordTest(result: TestResult): void {
    this.testResults.push(result);
    this.metrics.total++;

    switch (result.status) {
      case 'passed':
        this.metrics.passed++;
        break;
      case 'failed':
        this.metrics.failed++;
        this.recordFailure(result);
        break;
      case 'skipped':
        this.metrics.skipped++;
        break;
      case 'flaky':
        this.metrics.flaky++;
        break;
    }

    this.updatePerformanceMetrics(result);
  }

  /**
   * Record a failure for analysis
   */
  private recordFailure(result: TestResult): void {
    if (!result.error) return;

    const key = `${result.error.type}:${result.error.message}`;
    const existing = this.failures.get(key);

    if (existing) {
      existing.count++;
      existing.tests.push(result.fullName);
      existing.lastOccurrence = result.endTime || new Date();
    } else {
      this.failures.set(key, {
        errorType: result.error.type,
        errorMessage: result.error.message,
        count: 1,
        tests: [result.fullName],
        firstOccurrence: result.endTime || new Date(),
        lastOccurrence: result.endTime || new Date(),
      });
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(result: TestResult): void {
    // Update slowest test
    if (!this.metrics.slowestTest || result.duration > this.metrics.slowestTest.duration) {
      this.metrics.slowestTest = result;
    }

    // Update fastest test (only for passed tests)
    if (result.status === 'passed') {
      if (!this.metrics.fastestTest || result.duration < this.metrics.fastestTest.duration) {
        this.metrics.fastestTest = result;
      }
    }

    // Calculate average duration
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0);
    this.metrics.averageTestDuration = totalDuration / this.testResults.length;
  }

  /**
   * Finalize metrics collection
   */
  finish(): void {
    this.metrics.endTime = new Date();
    this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();

    // Calculate failure rate
    if (this.metrics.total > 0) {
      this.metrics.failureRate = (this.metrics.failed / this.metrics.total) * 100;
    }

    // Sort failures by count and get top 10
    this.metrics.topFailures = Array.from(this.failures.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get collected metrics
   */
  getMetrics(): TestMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all test results
   */
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  /**
   * Get failed tests
   */
  getFailedTests(): TestResult[] {
    return this.testResults.filter(t => t.status === 'failed');
  }

  /**
   * Get passed tests
   */
  getPassedTests(): TestResult[] {
    return this.testResults.filter(t => t.status === 'passed');
  }

  /**
   * Get skipped tests
   */
  getSkippedTests(): TestResult[] {
    return this.testResults.filter(t => t.status === 'skipped');
  }

  /**
   * Get flaky tests
   */
  getFlakyTests(): TestResult[] {
    return this.testResults.filter(t => t.status === 'flaky' || t.retries > 0);
  }

  /**
   * Get tests by duration (slowest first)
   */
  getTestsByDuration(limit?: number): TestResult[] {
    const sorted = [...this.testResults].sort((a, b) => b.duration - a.duration);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get tests by status
   */
  getTestsByStatus(status: TestResult['status']): TestResult[] {
    return this.testResults.filter(t => t.status === status);
  }

  /**
   * Get pass rate percentage
   */
  getPassRate(): number {
    if (this.metrics.total === 0) return 0;
    return (this.metrics.passed / this.metrics.total) * 100;
  }

  /**
   * Get metrics summary
   */
  getSummary(): string {
    const passRate = this.getPassRate().toFixed(1);
    const avgDuration = (this.metrics.averageTestDuration / 1000).toFixed(2);

    return `
Test Execution Summary
======================
Total Tests: ${this.metrics.total}
Passed: ${this.metrics.passed} (${passRate}%)
Failed: ${this.metrics.failed}
Skipped: ${this.metrics.skipped}
Flaky: ${this.metrics.flaky}

Duration: ${(this.metrics.duration / 1000).toFixed(2)}s
Average Test Duration: ${avgDuration}s

Failure Rate: ${this.metrics.failureRate.toFixed(1)}%
Top Failures: ${this.metrics.topFailures.length}
    `.trim();
  }

  /**
   * Export metrics to JSON
   */
  toJSON(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        results: this.testResults,
      },
      null,
      2
    );
  }

  /**
   * Reset collector
   */
  reset(): void {
    this.metrics = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      startTime: new Date(),
      duration: 0,
      averageTestDuration: 0,
      failureRate: 0,
      topFailures: [],
      browser: this.metrics.browser,
      environment: this.metrics.environment,
    };
    this.testResults = [];
    this.failures.clear();
  }
}
