/**
 * Custom Playwright Reporter
 * Integrates with metrics collector and generates detailed reports
 */

import {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult as PlaywrightTestResult,
  FullResult,
} from '@playwright/test/reporter';
import { TestMetricsCollector, TestResult, TestError, Attachment } from '../metrics/test-metrics';
import * as fs from 'fs';
import * as path from 'path';

export class CustomReporter implements Reporter {
  private metricsCollector: TestMetricsCollector;
  private config?: FullConfig;
  private reportDir: string;
  private startTime: number = 0;

  constructor(options?: { outputFolder?: string }) {
    // Resolve to absolute path to avoid path resolution issues
    const relativeDir = options?.outputFolder || 'test-results/custom-reports';
    this.reportDir = path.isAbsolute(relativeDir) 
      ? relativeDir 
      : path.resolve(process.cwd(), relativeDir);
    this.metricsCollector = new TestMetricsCollector();
    this.ensureReportDirectory();
  }

  /**
   * Ensure report directory exists
   */
  private ensureReportDirectory(): void {
    try {
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to create report directory: ${this.reportDir}`, errorMessage);
      throw new Error(`Cannot create report directory at ${this.reportDir}: ${errorMessage}`);
    }
  }

  /**
   * Called when test run starts
   */
  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.startTime = Date.now();
    this.metricsCollector.start();

    console.log('\n' + '='.repeat(80));
    console.log('Starting Test Execution');
    console.log('='.repeat(80));
    console.log(`Projects: ${config.projects.map(p => p.name).join(', ')}`);
    console.log(`Workers: ${config.workers}`);
    // Timeout might not be directly available on FullConfig, get from first project if available
    const timeout = config.projects[0]?.timeout || 'N/A';
    console.log(`Timeout: ${timeout}${typeof timeout === 'number' ? 'ms' : ''}`);
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Called for each test
   */
  onTestEnd(test: TestCase, result: PlaywrightTestResult): void {
    const testResult = this.convertToTestResult(test, result);
    this.metricsCollector.recordTest(testResult);

    // Log test result
    this.logTestResult(test, result);
  }

  /**
   * Called when test run ends
   */
  async onEnd(result: FullResult): Promise<void> {
    this.metricsCollector.finish();

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log(this.metricsCollector.getSummary());
    console.log('='.repeat(80) + '\n');

    // Generate reports
    await this.generateReports();

    // Print report locations
    console.log('\nReports generated:');
    console.log(`  - JSON: ${path.join(this.reportDir, 'test-results.json')}`);
    console.log(`  - Metrics: ${path.join(this.reportDir, 'metrics.json')}`);
    console.log(`  - Summary: ${path.join(this.reportDir, 'summary.txt')}`);
  }

  /**
   * Convert Playwright test result to our format
   */
  private convertToTestResult(test: TestCase, result: PlaywrightTestResult): TestResult {
    const status = this.getTestStatus(result);
    const error = result.error ? this.extractError(result.error) : undefined;
    const attachments = this.extractAttachments(result);

    return {
      name: test.title,
      fullName: test.titlePath().join(' › '),
      status,
      duration: result.duration,
      startTime: new Date(result.startTime),
      endTime: new Date(result.startTime.getTime() + result.duration),
      error,
      retries: result.retry,
      attachments,
      tags: test.tags || [],
    };
  }

  /**
   * Get test status
   */
  private getTestStatus(result: PlaywrightTestResult): TestResult['status'] {
    if (result.status === 'skipped') return 'skipped';
    if (result.status === 'passed') {
      return result.retry > 0 ? 'flaky' : 'passed';
    }
    return 'failed';
  }

  /**
   * Extract error information
   */
  private extractError(error: any): TestError {
    return {
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: error.name || 'Error',
      location: error.location ? {
        file: error.location.file,
        line: error.location.line,
        column: error.location.column,
      } : undefined,
    };
  }

  /**
   * Extract attachments
   */
  private extractAttachments(result: PlaywrightTestResult): Attachment[] {
    return result.attachments.map(att => ({
      name: att.name,
      path: att.path || '',
      type: this.getAttachmentType(att.name),
      size: att.body?.length,
    }));
  }

  /**
   * Get attachment type from name
   */
  private getAttachmentType(name: string): Attachment['type'] {
    if (name.includes('screenshot')) return 'screenshot';
    if (name.includes('video')) return 'video';
    if (name.includes('trace')) return 'trace';
    return 'log';
  }

  /**
   * Log test result to console
   */
  private logTestResult(test: TestCase, result: PlaywrightTestResult): void {
    const duration = (result.duration / 1000).toFixed(2);
    const status = result.status.toUpperCase();
    const icon = this.getStatusIcon(result.status);
    const testName = test.titlePath().join(' › ');

    let logMessage = `${icon} ${status} ${testName} (${duration}s)`;

    if (result.retry > 0) {
      logMessage += ` [Retry: ${result.retry}]`;
    }

    console.log(logMessage);

    if (result.status === 'failed' && result.error) {
      console.log(`  Error: ${result.error.message}`);
    }
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed':
        return '✓';
      case 'failed':
        return '✗';
      case 'skipped':
        return '○';
      default:
        return '?';
    }
  }

  /**
   * Generate all reports
   */
  private async generateReports(): Promise<void> {
    // Generate JSON report
    await this.generateJSONReport();

    // Generate metrics report
    await this.generateMetricsReport();

    // Generate summary report
    await this.generateSummaryReport();

    // Generate failure analysis
    await this.generateFailureAnalysis();
  }

  /**
   * Generate JSON report with all test results
   */
  private async generateJSONReport(): Promise<void> {
    const reportPath = path.join(this.reportDir, 'test-results.json');
    fs.writeFileSync(reportPath, this.metricsCollector.toJSON(), 'utf8');
  }

  /**
   * Generate metrics report
   */
  private async generateMetricsReport(): Promise<void> {
    const metrics = this.metricsCollector.getMetrics();
    const reportPath = path.join(this.reportDir, 'metrics.json');
    fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2), 'utf8');
  }

  /**
   * Generate summary text report
   */
  private async generateSummaryReport(): Promise<void> {
    const summary = this.metricsCollector.getSummary();
    const reportPath = path.join(this.reportDir, 'summary.txt');
    fs.writeFileSync(reportPath, summary, 'utf8');
  }

  /**
   * Generate failure analysis report
   */
  private async generateFailureAnalysis(): Promise<void> {
    const metrics = this.metricsCollector.getMetrics();
    const failedTests = this.metricsCollector.getFailedTests();

    const analysis = {
      totalFailures: metrics.failed,
      failureRate: metrics.failureRate,
      topFailures: metrics.topFailures,
      failedTests: failedTests.map(t => ({
        name: t.fullName,
        duration: t.duration,
        error: t.error,
        retries: t.retries,
      })),
    };

    const reportPath = path.join(this.reportDir, 'failure-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2), 'utf8');
  }
}

export default CustomReporter;
