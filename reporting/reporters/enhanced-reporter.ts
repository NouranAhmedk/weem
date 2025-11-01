/**
 * Enhanced Reporter
 * Comprehensive reporter with HTML generation, failure analysis, and metrics
 */

import {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult as PlaywrightTestResult,
  FullResult,
} from '@playwright/test/reporter';
import { TestMetricsCollector, TestResult } from '../metrics/test-metrics';
import { FailureAnalyzer } from '../analysis/failure-analyzer';
import { HTMLReportGenerator } from '../generators/html-generator';
import { logger } from '../../helpers/logger.helper';
import * as fs from 'fs';
import * as path from 'path';

export class EnhancedReporter implements Reporter {
  private metricsCollector: TestMetricsCollector;
  private config?: FullConfig;
  private reportDir: string;
  private startTime: number = 0;
  private outputHTML: boolean;
  private outputJSON: boolean;

  constructor(options?: {
    outputFolder?: string;
    outputHTML?: boolean;
    outputJSON?: boolean;
  }) {
    // Resolve to absolute path to avoid path resolution issues
    const relativeDir = options?.outputFolder || 'test-results/reports';
    this.reportDir = path.isAbsolute(relativeDir) 
      ? relativeDir 
      : path.resolve(process.cwd(), relativeDir);
    this.outputHTML = options?.outputHTML !== false;
    this.outputJSON = options?.outputJSON !== false;
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
        logger.info(`Created report directory: ${this.reportDir}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create report directory: ${this.reportDir}`, { error: errorMessage });
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

    logger.info('Starting Test Execution with Enhanced Reporter');
    console.log('\n' + '═'.repeat(80));
    console.log('🚀 Test Execution Started');
    console.log('═'.repeat(80));
    console.log(`📦 Projects: ${config.projects.map(p => p.name).join(', ')}`);
    console.log(`👷 Workers: ${config.workers}`);
    // Timeout might not be directly available on FullConfig, get from first project if available
    const timeout = config.projects[0]?.timeout || 'N/A';
    console.log(`⏱️  Timeout: ${timeout}${typeof timeout === 'number' ? 'ms' : ''}`);
    console.log(`📊 Reporter: Enhanced (HTML + JSON + Metrics)`);
    console.log('═'.repeat(80) + '\n');
  }

  /**
   * Called for each test
   */
  onTestEnd(test: TestCase, result: PlaywrightTestResult): void {
    const testResult = this.convertToTestResult(test, result);
    this.metricsCollector.recordTest(testResult);

    // Log test result with enhanced formatting
    this.logEnhancedTestResult(test, result);
  }

  /**
   * Called when test run ends
   */
  async onEnd(result: FullResult): Promise<void> {
    this.metricsCollector.finish();
    const metrics = this.metricsCollector.getMetrics();
    const testResults = this.metricsCollector.getTestResults();
    const failedTests = this.metricsCollector.getFailedTests();

    // Perform failure analysis
    const analyzer = new FailureAnalyzer(failedTests);
    const failurePatterns = analyzer.analyzeFailures();

    // Print enhanced summary
    this.printEnhancedSummary(metrics, analyzer);

    // Generate all reports
    await this.generateAllReports(metrics, testResults, failurePatterns, analyzer);

    // Log report locations
    this.printReportLocations();
  }

  /**
   * Convert Playwright test result to our format
   */
  private convertToTestResult(test: TestCase, result: PlaywrightTestResult): TestResult {
    const status = this.getTestStatus(result);
    const error = result.error
      ? {
          message: result.error.message || 'Unknown error',
          stack: result.error.stack,
          type: (result.error as any).name || (result.error as Error).name || 'Error',
        }
      : undefined;

    return {
      name: test.title,
      fullName: test.titlePath().join(' › '),
      status,
      duration: result.duration,
      startTime: new Date(result.startTime),
      endTime: new Date(result.startTime.getTime() + result.duration),
      error,
      retries: result.retry,
      attachments: result.attachments.map(att => ({
        name: att.name,
        path: att.path || '',
        type: this.getAttachmentType(att.name),
        size: att.body?.length,
      })),
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
   * Get attachment type
   */
  private getAttachmentType(name: string): 'screenshot' | 'video' | 'trace' | 'log' {
    if (name.includes('screenshot')) return 'screenshot';
    if (name.includes('video')) return 'video';
    if (name.includes('trace')) return 'trace';
    return 'log';
  }

  /**
   * Log enhanced test result
   */
  private logEnhancedTestResult(test: TestCase, result: PlaywrightTestResult): void {
    const duration = (result.duration / 1000).toFixed(2);
    const status = result.status.toUpperCase();
    const icon = this.getStatusIcon(result.status);
    const testName = test.titlePath().join(' › ');

    let logMessage = `${icon} ${status.padEnd(8)} ${testName} (${duration}s)`;

    if (result.retry > 0) {
      logMessage += ` 🔄 Retry: ${result.retry}`;
    }

    // Color code the output
    const coloredMessage = this.colorizeMessage(logMessage, result.status);
    console.log(coloredMessage);

    if (result.status === 'failed' && result.error) {
      console.log(`  💥 Error: ${result.error.message}`);
      logger.error(`Test failed: ${testName}`, { error: result.error.message });
    }
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'skipped':
        return '⊘';
      default:
        return '❓';
    }
  }

  /**
   * Colorize message based on status
   */
  private colorizeMessage(message: string, status: string): string {
    const colors: Record<string, string> = {
      passed: '\x1b[32m', // Green
      failed: '\x1b[31m', // Red
      skipped: '\x1b[90m', // Gray
    };
    const reset = '\x1b[0m';
    return `${colors[status] || ''}${message}${reset}`;
  }

  /**
   * Print enhanced summary
   */
  private printEnhancedSummary(metrics: any, analyzer: FailureAnalyzer): void {
    console.log('\n' + '═'.repeat(80));
    console.log('📈 Test Execution Summary');
    console.log('═'.repeat(80));

    // Overall stats
    const passRate = this.metricsCollector.getPassRate().toFixed(1);
    const avgDuration = (metrics.averageTestDuration / 1000).toFixed(2);
    const totalDuration = (metrics.duration / 1000).toFixed(2);

    console.log(`\n📊 Test Results:`);
    console.log(`   Total:   ${metrics.total}`);
    console.log(`   ✅ Passed:  ${metrics.passed} (${passRate}%)`);
    console.log(`   ❌ Failed:  ${metrics.failed}`);
    console.log(`   ⊘  Skipped: ${metrics.skipped}`);
    console.log(`   🔄 Flaky:   ${metrics.flaky}`);

    console.log(`\n⏱️  Performance:`);
    console.log(`   Total Duration: ${totalDuration}s`);
    console.log(`   Avg Duration:   ${avgDuration}s`);
    if (metrics.slowestTest) {
      console.log(`   Slowest Test:   ${metrics.slowestTest.name} (${(metrics.slowestTest.duration / 1000).toFixed(2)}s)`);
    }

    if (metrics.failed > 0) {
      console.log(`\n💥 Failure Analysis:`);
      console.log(`   Failure Rate: ${metrics.failureRate.toFixed(1)}%`);
      console.log(`   Patterns:     ${metrics.topFailures.length}`);

      const commonFailures = analyzer.getCommonFailures(3);
      if (commonFailures.length > 0) {
        console.log(`\n   Top 3 Failures:`);
        commonFailures.forEach((pattern, i) => {
          console.log(`   ${i + 1}. ${pattern.category}: ${pattern.occurrences} occurrences`);
        });
      }
    }

    console.log('\n' + '═'.repeat(80) + '\n');
  }

  /**
   * Generate all reports
   */
  private async generateAllReports(
    metrics: any,
    testResults: TestResult[],
    failurePatterns: any[],
    analyzer: FailureAnalyzer
  ): Promise<void> {
    logger.info('Generating test reports...');

    // Re-ensure directory exists before generating reports
    this.ensureReportDirectory();

    // Generate HTML report
    if (this.outputHTML) {
      try {
        const htmlPath = path.join(this.reportDir, 'test-report.html');
        HTMLReportGenerator.generateReport(metrics, testResults, failurePatterns, htmlPath);
        logger.info(`HTML report generated: ${htmlPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Failed to generate HTML report', { error: errorMessage });
        console.error(`❌ Failed to generate HTML report: ${errorMessage}`);
      }
    }

    // Generate JSON reports
    if (this.outputJSON) {
      try {
        // Main results JSON
        const jsonPath = path.join(this.reportDir, 'test-results.json');
        this.writeFileSafe(jsonPath, this.metricsCollector.toJSON(), 'test-results.json');

        // Metrics JSON
        const metricsPath = path.join(this.reportDir, 'metrics.json');
        this.writeFileSafe(metricsPath, JSON.stringify(metrics, null, 2), 'metrics.json');

        // Failure analysis JSON
        const analysisPath = path.join(this.reportDir, 'failure-analysis.json');
        this.writeFileSafe(analysisPath, analyzer.toJSON(), 'failure-analysis.json');

        logger.info(`JSON reports generated in: ${this.reportDir}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Failed to generate JSON reports', { error: errorMessage });
        console.error(`❌ Failed to generate JSON reports: ${errorMessage}`);
      }
    }

    // Generate summary text
    try {
      const summaryPath = path.join(this.reportDir, 'summary.txt');
      let summary = this.metricsCollector.getSummary();
      if (metrics.failed > 0) {
        summary += '\n\n' + analyzer.generateSummary();
      }
      this.writeFileSafe(summaryPath, summary, 'summary.txt');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to generate summary file', { error: errorMessage });
      console.error(`❌ Failed to generate summary: ${errorMessage}`);
    }
  }

  /**
   * Safely write file with error handling
   */
  private writeFileSafe(filePath: string, content: string, fileName: string): void {
    try {
      // Ensure directory exists before writing
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to write ${fileName}`, { path: filePath, error: errorMessage });
      throw new Error(`Failed to write ${fileName} to ${filePath}: ${errorMessage}`);
    }
  }

  /**
   * Print report locations
   */
  private printReportLocations(): void {
    console.log('📁 Reports Generated:');
    if (this.outputHTML) {
      console.log(`   🌐 HTML Report:       ${path.join(this.reportDir, 'test-report.html')}`);
    }
    if (this.outputJSON) {
      console.log(`   📄 JSON Results:      ${path.join(this.reportDir, 'test-results.json')}`);
      console.log(`   📊 Metrics:           ${path.join(this.reportDir, 'metrics.json')}`);
      console.log(`   💥 Failure Analysis:  ${path.join(this.reportDir, 'failure-analysis.json')}`);
    }
    console.log(`   📝 Summary:           ${path.join(this.reportDir, 'summary.txt')}`);
    console.log('');
  }
}

export default EnhancedReporter;
