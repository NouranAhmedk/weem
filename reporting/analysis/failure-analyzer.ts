/**
 * Failure Analyzer
 * Analyzes test failures to identify patterns and root causes
 */

import { TestResult, TestError, FailureAnalysis } from '../metrics/test-metrics';

export interface FailurePattern {
  pattern: string;
  description: string;
  occurrences: number;
  affectedTests: string[];
  severity: 'high' | 'medium' | 'low';
  category: FailureCategory;
  suggestedFix?: string;
}

export type FailureCategory =
  | 'timeout'
  | 'assertion'
  | 'element-not-found'
  | 'network'
  | 'navigation'
  | 'authentication'
  | 'data'
  | 'unknown';

export interface FailureTrend {
  date: Date;
  failureCount: number;
  failureRate: number;
}

export class FailureAnalyzer {
  private failedTests: TestResult[] = [];

  constructor(failedTests: TestResult[]) {
    this.failedTests = failedTests;
  }

  /**
   * Analyze all failures and identify patterns
   */
  analyzeFailures(): FailurePattern[] {
    const patterns: Map<string, FailurePattern> = new Map();

    this.failedTests.forEach(test => {
      if (!test.error) return;

      const category = this.categorizeFailure(test.error);
      const pattern = this.extractPattern(test.error);
      const key = `${category}:${pattern}`;

      if (patterns.has(key)) {
        const existing = patterns.get(key)!;
        existing.occurrences++;
        existing.affectedTests.push(test.fullName);
      } else {
        patterns.set(key, {
          pattern,
          description: this.getPatternDescription(category, pattern),
          occurrences: 1,
          affectedTests: [test.fullName],
          severity: this.calculateSeverity(category),
          category,
          suggestedFix: this.getSuggestedFix(category, pattern),
        });
      }
    });

    return Array.from(patterns.values()).sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Categorize failure type
   */
  private categorizeFailure(error: TestError): FailureCategory {
    const message = error.message.toLowerCase();
    const type = error.type.toLowerCase();

    if (message.includes('timeout') || type.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('expect') || message.includes('assert') || type.includes('assertion')) {
      return 'assertion';
    }
    if (message.includes('locator') || message.includes('element') || message.includes('selector')) {
      return 'element-not-found';
    }
    if (message.includes('network') || message.includes('net::') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('navigation') || message.includes('goto')) {
      return 'navigation';
    }
    if (message.includes('authentication') || message.includes('login') || message.includes('unauthorized')) {
      return 'authentication';
    }
    if (message.includes('data') || message.includes('validation')) {
      return 'data';
    }

    return 'unknown';
  }

  /**
   * Extract failure pattern from error
   */
  private extractPattern(error: TestError): string {
    // Try to extract a meaningful pattern from the error message
    const message = error.message;

    // Extract timeout patterns
    if (message.includes('Timeout')) {
      const match = message.match(/Timeout (\d+)ms/);
      return match ? `Timeout ${match[1]}ms` : 'Timeout';
    }

    // Extract locator patterns
    if (message.includes('locator')) {
      const match = message.match(/locator\(['"]([^'"]+)['"]\)/);
      return match ? `Locator: ${match[1]}` : 'Locator not found';
    }

    // Extract assertion patterns
    if (message.includes('expect')) {
      const match = message.match(/expect\(([^)]+)\)/);
      return match ? `Assertion failed: ${match[1]}` : 'Assertion failed';
    }

    // Return first line of error message as pattern
    return message.split('\n')[0].substring(0, 100);
  }

  /**
   * Get pattern description
   */
  private getPatternDescription(category: FailureCategory, pattern: string): string {
    const descriptions: Record<FailureCategory, string> = {
      timeout: 'Test exceeded the maximum execution time',
      assertion: 'Expected condition was not met',
      'element-not-found': 'Could not find the specified element on the page',
      network: 'Network request failed or timed out',
      navigation: 'Failed to navigate to the specified URL',
      authentication: 'Authentication or authorization failed',
      data: 'Data validation or processing failed',
      unknown: 'Unclassified failure',
    };

    return descriptions[category];
  }

  /**
   * Calculate severity based on category
   */
  private calculateSeverity(category: FailureCategory): FailurePattern['severity'] {
    switch (category) {
      case 'authentication':
      case 'network':
      case 'navigation':
        return 'high';
      case 'element-not-found':
      case 'timeout':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Get suggested fix for common issues
   */
  private getSuggestedFix(category: FailureCategory, pattern: string): string | undefined {
    const fixes: Record<FailureCategory, string> = {
      timeout: 'Increase timeout value or optimize test performance. Check for slow network or page loads.',
      assertion: 'Review test assertions and ensure expected values are correct.',
      'element-not-found': 'Verify element selectors are correct and elements are visible. Consider adding explicit waits.',
      network: 'Check network connectivity and API endpoints. Implement retry logic for flaky requests.',
      navigation: 'Verify URLs are correct and accessible. Check for redirect issues.',
      authentication: 'Verify authentication credentials and flow. Check for expired tokens or sessions.',
      data: 'Validate test data format and values. Check data generators and fixtures.',
      unknown: 'Review error stack trace and test logs for more details.',
    };

    return fixes[category];
  }

  /**
   * Get common failure causes
   */
  getCommonFailures(limit: number = 5): FailurePattern[] {
    const patterns = this.analyzeFailures();
    return patterns.slice(0, limit);
  }

  /**
   * Get failures by category
   */
  getFailuresByCategory(): Map<FailureCategory, FailurePattern[]> {
    const patterns = this.analyzeFailures();
    const categorized = new Map<FailureCategory, FailurePattern[]>();

    patterns.forEach(pattern => {
      if (!categorized.has(pattern.category)) {
        categorized.set(pattern.category, []);
      }
      categorized.get(pattern.category)!.push(pattern);
    });

    return categorized;
  }

  /**
   * Get high severity failures
   */
  getHighSeverityFailures(): FailurePattern[] {
    return this.analyzeFailures().filter(p => p.severity === 'high');
  }

  /**
   * Get flaky test candidates (tests with multiple retries)
   */
  getFlakyTestCandidates(): TestResult[] {
    return this.failedTests.filter(t => t.retries > 0);
  }

  /**
   * Generate failure summary report
   */
  generateSummary(): string {
    const patterns = this.analyzeFailures();
    const byCategory = this.getFailuresByCategory();
    const highSeverity = this.getHighSeverityFailures();

    let summary = 'Failure Analysis Summary\n';
    summary += '========================\n\n';
    summary += `Total Failed Tests: ${this.failedTests.length}\n`;
    summary += `Unique Failure Patterns: ${patterns.length}\n\n`;

    summary += 'Top 5 Common Failures:\n';
    summary += '----------------------\n';
    this.getCommonFailures(5).forEach((pattern, index) => {
      summary += `${index + 1}. ${pattern.pattern} (${pattern.occurrences} occurrences)\n`;
      summary += `   Category: ${pattern.category}\n`;
      summary += `   Severity: ${pattern.severity}\n`;
      if (pattern.suggestedFix) {
        summary += `   Fix: ${pattern.suggestedFix}\n`;
      }
      summary += '\n';
    });

    summary += 'Failures by Category:\n';
    summary += '--------------------\n';
    byCategory.forEach((patterns, category) => {
      summary += `${category}: ${patterns.length} pattern(s)\n`;
    });

    if (highSeverity.length > 0) {
      summary += '\nHigh Severity Issues:\n';
      summary += '--------------------\n';
      highSeverity.forEach(pattern => {
        summary += `- ${pattern.pattern} (${pattern.occurrences} occurrences)\n`;
      });
    }

    return summary;
  }

  /**
   * Export analysis to JSON
   */
  toJSON(): string {
    return JSON.stringify(
      {
        totalFailures: this.failedTests.length,
        patterns: this.analyzeFailures(),
        byCategory: Object.fromEntries(this.getFailuresByCategory()),
        highSeverity: this.getHighSeverityFailures(),
        flakyTests: this.getFlakyTestCandidates(),
      },
      null,
      2
    );
  }
}
