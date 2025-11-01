/**
 * HTML Report Generator
 * Generates visual HTML reports with charts and interactive elements
 */

import { TestMetrics, TestResult } from '../metrics/test-metrics';
import { FailurePattern } from '../analysis/failure-analyzer';
import * as fs from 'fs';
import * as path from 'path';

export class HTMLReportGenerator {
  /**
   * Generate complete HTML report
   */
  static generateReport(
    metrics: TestMetrics,
    testResults: TestResult[],
    failurePatterns: FailurePattern[],
    outputPath: string
  ): void {
    try {
      // Ensure the directory exists before writing the file
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const html = this.buildHTML(metrics, testResults, failurePatterns);
      fs.writeFileSync(outputPath, html, 'utf8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate HTML report at ${outputPath}: ${errorMessage}`);
    }
  }

  /**
   * Build complete HTML document
   */
  private static buildHTML(
    metrics: TestMetrics,
    testResults: TestResult[],
    failurePatterns: FailurePattern[]
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weem Test Report - ${new Date().toLocaleDateString()}</title>
    ${this.getStyles()}
</head>
<body>
    <div class="container">
        ${this.buildHeader(metrics)}
        ${this.buildSummaryCards(metrics)}
        ${this.buildChartsSection(metrics, testResults)}
        ${this.buildTestResultsTable(testResults)}
        ${this.buildFailureAnalysis(failurePatterns)}
        ${this.buildFooter()}
    </div>
    ${this.getScripts(metrics, testResults)}
</body>
</html>`;
  }

  /**
   * Build header section
   */
  private static buildHeader(metrics: TestMetrics): string {
    const passRate = ((metrics.passed / metrics.total) * 100).toFixed(1);
    const statusClass = parseFloat(passRate) >= 80 ? 'success' : parseFloat(passRate) >= 50 ? 'warning' : 'error';

    return `
    <header class="header">
        <div class="header-content">
            <h1>🧪 Weem Test Report</h1>
            <div class="header-meta">
                <span>Environment: <strong>${metrics.environment}</strong></span>
                <span>Browser: <strong>${metrics.browser}</strong></span>
                <span>Date: <strong>${metrics.startTime.toLocaleString()}</strong></span>
            </div>
        </div>
        <div class="pass-rate ${statusClass}">
            <div class="pass-rate-value">${passRate}%</div>
            <div class="pass-rate-label">Pass Rate</div>
        </div>
    </header>`;
  }

  /**
   * Build summary cards
   */
  private static buildSummaryCards(metrics: TestMetrics): string {
    const duration = (metrics.duration / 1000).toFixed(2);
    const avgDuration = (metrics.averageTestDuration / 1000).toFixed(2);

    return `
    <section class="summary-cards">
        <div class="card">
            <div class="card-icon">📊</div>
            <div class="card-content">
                <div class="card-value">${metrics.total}</div>
                <div class="card-label">Total Tests</div>
            </div>
        </div>
        <div class="card success">
            <div class="card-icon">✓</div>
            <div class="card-content">
                <div class="card-value">${metrics.passed}</div>
                <div class="card-label">Passed</div>
            </div>
        </div>
        <div class="card error">
            <div class="card-icon">✗</div>
            <div class="card-content">
                <div class="card-value">${metrics.failed}</div>
                <div class="card-label">Failed</div>
            </div>
        </div>
        <div class="card skipped">
            <div class="card-icon">○</div>
            <div class="card-content">
                <div class="card-value">${metrics.skipped}</div>
                <div class="card-label">Skipped</div>
            </div>
        </div>
        <div class="card warning">
            <div class="card-icon">⚠</div>
            <div class="card-content">
                <div class="card-value">${metrics.flaky}</div>
                <div class="card-label">Flaky</div>
            </div>
        </div>
        <div class="card">
            <div class="card-icon">⏱</div>
            <div class="card-content">
                <div class="card-value">${duration}s</div>
                <div class="card-label">Total Duration</div>
            </div>
        </div>
        <div class="card">
            <div class="card-icon">⌀</div>
            <div class="card-content">
                <div class="card-value">${avgDuration}s</div>
                <div class="card-label">Avg Duration</div>
            </div>
        </div>
    </section>`;
  }

  /**
   * Build charts section
   */
  private static buildChartsSection(metrics: TestMetrics, testResults: TestResult[]): string {
    return `
    <section class="charts-section">
        <h2>Test Results Overview</h2>
        <div class="charts-grid">
            <div class="chart-container">
                <h3>Status Distribution</h3>
                <canvas id="statusChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Test Duration Distribution</h3>
                <canvas id="durationChart"></canvas>
            </div>
        </div>
    </section>`;
  }

  /**
   * Build test results table
   */
  private static buildTestResultsTable(testResults: TestResult[]): string {
    const rows = testResults.map(result => this.buildTestRow(result)).join('');

    return `
    <section class="test-results">
        <h2>Test Results (${testResults.length} tests)</h2>
        <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="passed">Passed</button>
            <button class="filter-btn" data-filter="failed">Failed</button>
            <button class="filter-btn" data-filter="skipped">Skipped</button>
            <button class="filter-btn" data-filter="flaky">Flaky</button>
        </div>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Test Name</th>
                    <th>Duration</th>
                    <th>Retries</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </section>`;
  }

  /**
   * Build individual test row
   */
  private static buildTestRow(result: TestResult): string {
    const statusIcon = this.getStatusIcon(result.status);
    const duration = (result.duration / 1000).toFixed(2);
    const errorDetails = result.error
      ? `<div class="error-details">${this.escapeHTML(result.error.message)}</div>`
      : '';

    return `
    <tr class="test-row" data-status="${result.status}">
        <td><span class="status-badge ${result.status}">${statusIcon}</span></td>
        <td>
            <div class="test-name">${this.escapeHTML(result.fullName)}</div>
            ${errorDetails}
        </td>
        <td>${duration}s</td>
        <td>${result.retries || '-'}</td>
        <td>
            ${result.attachments.length > 0 ? `<button class="view-btn" onclick="viewAttachments(${result.attachments.length})">View (${result.attachments.length})</button>` : '-'}
        </td>
    </tr>`;
  }

  /**
   * Build failure analysis section
   */
  private static buildFailureAnalysis(patterns: FailurePattern[]): string {
    if (patterns.length === 0) {
      return '<section class="failure-analysis"><h2>Failure Analysis</h2><p class="no-failures">No failures detected 🎉</p></section>';
    }

    const rows = patterns.slice(0, 10).map(pattern => `
    <tr>
        <td><span class="severity-badge ${pattern.severity}">${pattern.severity}</span></td>
        <td>
            <strong>${pattern.category}</strong><br/>
            <small>${this.escapeHTML(pattern.pattern)}</small>
        </td>
        <td>${pattern.occurrences}</td>
        <td>${pattern.affectedTests.length}</td>
        <td class="suggested-fix">${this.escapeHTML(pattern.suggestedFix || 'N/A')}</td>
    </tr>
    `).join('');

    return `
    <section class="failure-analysis">
        <h2>Failure Analysis</h2>
        <table class="analysis-table">
            <thead>
                <tr>
                    <th>Severity</th>
                    <th>Pattern</th>
                    <th>Count</th>
                    <th>Tests</th>
                    <th>Suggested Fix</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </section>`;
  }

  /**
   * Build footer
   */
  private static buildFooter(): string {
    return `
    <footer class="footer">
        <p>Generated with Weem Test Framework | ${new Date().toLocaleString()}</p>
    </footer>`;
  }

  /**
   * Get status icon
   */
  private static getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      passed: '✓',
      failed: '✗',
      skipped: '○',
      flaky: '⚠',
    };
    return icons[status] || '?';
  }

  /**
   * Escape HTML
   */
  private static escapeHTML(text: string): string {
    const div = { innerHTML: '' } as any;
    const textNode = { nodeValue: text };
    div.appendChild = () => {};
    div.innerHTML = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return div.innerHTML || text;
  }

  /**
   * Get CSS styles
   */
  private static getStyles(): string {
    return `<style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f7fa; color: #2c3e50; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .header-meta span { margin-right: 20px; }
        .pass-rate { text-align: center; background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; min-width: 150px; }
        .pass-rate-value { font-size: 48px; font-weight: bold; }
        .pass-rate-label { font-size: 14px; opacity: 0.9; }
        .pass-rate.success { background: rgba(76, 175, 80, 0.3); }
        .pass-rate.warning { background: rgba(255, 152, 0, 0.3); }
        .pass-rate.error { background: rgba(244, 67, 54, 0.3); }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 15px; transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .card-icon { font-size: 36px; }
        .card-value { font-size: 32px; font-weight: bold; }
        .card-label { font-size: 14px; color: #7f8c8d; }
        .card.success { border-left: 4px solid #4caf50; }
        .card.error { border-left: 4px solid #f44336; }
        .card.warning { border-left: 4px solid #ff9800; }
        .card.skipped { border-left: 4px solid #9e9e9e; }
        .charts-section, .test-results, .failure-analysis { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .charts-section h2, .test-results h2, .failure-analysis h2 { margin-bottom: 20px; color: #2c3e50; }
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; }
        .chart-container { position: relative; }
        .chart-container h3 { margin-bottom: 15px; font-size: 18px; color: #34495e; }
        .filter-buttons { margin-bottom: 20px; display: flex; gap: 10px; }
        .filter-btn { padding: 8px 16px; border: none; background: #ecf0f1; color: #2c3e50; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { background: #bdc3c7; }
        .filter-btn.active { background: #667eea; color: white; }
        .results-table { width: 100%; border-collapse: collapse; }
        .results-table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #dee2e6; }
        .results-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        .test-row:hover { background: #f8f9fa; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        .status-badge.passed { background: #d4edda; color: #155724; }
        .status-badge.failed { background: #f8d7da; color: #721c24; }
        .status-badge.skipped { background: #d1ecf1; color: #0c5460; }
        .status-badge.flaky { background: #fff3cd; color: #856404; }
        .test-name { font-weight: 500; }
        .error-details { margin-top: 8px; padding: 8px; background: #fff3cd; border-left: 3px solid #ffc107; font-size: 12px; color: #856404; }
        .view-btn { padding: 4px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .view-btn:hover { background: #5568d3; }
        .analysis-table { width: 100%; border-collapse: collapse; }
        .analysis-table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #dee2e6; }
        .analysis-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        .severity-badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
        .severity-badge.high { background: #f8d7da; color: #721c24; }
        .severity-badge.medium { background: #fff3cd; color: #856404; }
        .severity-badge.low { background: #d1ecf1; color: #0c5460; }
        .suggested-fix { font-size: 13px; color: #6c757d; }
        .no-failures { text-align: center; padding: 40px; font-size: 18px; color: #4caf50; }
        .footer { text-align: center; padding: 20px; color: #7f8c8d; font-size: 14px; }
    </style>`;
  }

  /**
   * Get JavaScript code for interactive features
   */
  private static getScripts(metrics: TestMetrics, testResults: TestResult[]): string {
    const statusData = {
      labels: ['Passed', 'Failed', 'Skipped', 'Flaky'],
      data: [metrics.passed, metrics.failed, metrics.skipped, metrics.flaky],
    };

    const durationData = testResults
      .slice(0, 10)
      .sort((a, b) => b.duration - a.duration)
      .map(t => ({
        name: t.name,
        duration: (t.duration / 1000).toFixed(2),
      }));

    return `
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
        // Status chart
        new Chart(document.getElementById('statusChart'), {
            type: 'doughnut',
            data: {
                labels: ${JSON.stringify(statusData.labels)},
                datasets: [{
                    data: ${JSON.stringify(statusData.data)},
                    backgroundColor: ['#4caf50', '#f44336', '#9e9e9e', '#ff9800']
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });

        // Duration chart
        new Chart(document.getElementById('durationChart'), {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(durationData.map(d => d.name))},
                datasets: [{
                    label: 'Duration (s)',
                    data: ${JSON.stringify(durationData.map(d => d.duration))},
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } }
            }
        });

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                document.querySelectorAll('.test-row').forEach(row => {
                    if (filter === 'all' || row.dataset.status === filter) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        });

        function viewAttachments(count) {
            alert(count + ' attachment(s) available');
        }
    </script>`;
  }
}
