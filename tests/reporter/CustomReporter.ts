import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  startTime: Date;
  endTime: Date;
}

export default class CustomReporter implements Reporter {
  private metrics: TestMetrics;
  private testResults: Array<{
    test: string;
    status: string;
    duration: number;
    error?: string;
    screenshot?: string;
  }>;

  constructor() {
    this.metrics = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      duration: 0,
      startTime: new Date(),
      endTime: new Date()
    };
    this.testResults = [];
  }

  onBegin() {
    this.metrics.startTime = new Date();
    console.log(`🚀 Starting test execution at ${this.metrics.startTime.toISOString()}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.metrics.totalTests++;
    
    const testResult = {
      test: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
      screenshot: result.attachments.find(a => a.name === 'screenshot')?.path
    };

    this.testResults.push(testResult);

    switch (result.status) {
      case 'passed':
        this.metrics.passed++;
        console.log(`✅ ${test.title} (${result.duration}ms)`);
        break;
      case 'failed':
        this.metrics.failed++;
        console.log(`❌ ${test.title} (${result.duration}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error.message}`);
        }
        break;
      case 'skipped':
        this.metrics.skipped++;
        console.log(`⏭️  ${test.title} (skipped)`);
        break;
      case 'timedOut':
        this.metrics.failed++;
        console.log(`⏰ ${test.title} (timed out after ${result.duration}ms)`);
        break;
    }

    this.metrics.duration += result.duration;
  }

  async onEnd(result: FullResult) {
    this.metrics.endTime = new Date();
    
    console.log('\n📊 Test Execution Summary:');
    console.log(`   Total Tests: ${this.metrics.totalTests}`);
    console.log(`   ✅ Passed: ${this.metrics.passed}`);
    console.log(`   ❌ Failed: ${this.metrics.failed}`);
    console.log(`   ⏭️  Skipped: ${this.metrics.skipped}`);
    console.log(`   ⏱️  Total Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`);
    console.log(`   🏁 Execution Time: ${this.metrics.endTime.toISOString()}`);

    // Generate detailed JSON report
    await this.generateDetailedReport();
    
    // Generate summary report
    await this.generateSummaryReport();
  }

  private async generateDetailedReport() {
    const reportData = {
      metrics: this.metrics,
      testResults: this.testResults,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL,
        browser: process.env.BROWSER || 'chromium'
      }
    };

    const reportPath = path.join('test-results', 'reports', 'detailed-report.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, reportData, { spaces: 2 });
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  private async generateSummaryReport() {
    const summaryPath = path.join('test-results', 'reports', 'summary.html');
    const htmlContent = this.generateHTMLSummary();
    
    await fs.ensureDir(path.dirname(summaryPath));
    await fs.writeFile(summaryPath, htmlContent);
    console.log(`📄 Summary report saved to: ${summaryPath}`);
  }

  private generateHTMLSummary(): string {
    const passRate = ((this.metrics.passed / this.metrics.totalTests) * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Execution Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px 20px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .results-table th, .results-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .results-table th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Test Execution Summary</h1>
    <div class="summary">
        <h2>Metrics</h2>
        <div class="metric">Total Tests: <strong>${this.metrics.totalTests}</strong></div>
        <div class="metric passed">Passed: <strong>${this.metrics.passed}</strong></div>
        <div class="metric failed">Failed: <strong>${this.metrics.failed}</strong></div>
        <div class="metric skipped">Skipped: <strong>${this.metrics.skipped}</strong></div>
        <div class="metric">Pass Rate: <strong>${passRate}%</strong></div>
        <div class="metric">Duration: <strong>${(this.metrics.duration / 1000).toFixed(2)}s</strong></div>
    </div>
    
    <h2>Test Results</h2>
    <table class="results-table">
        <thead>
            <tr>
                <th>Test Name</th>
                <th>Status</th>
                <th>Duration (ms)</th>
                <th>Error</th>
            </tr>
        </thead>
        <tbody>
            ${this.testResults.map(result => `
                <tr>
                    <td>${result.test}</td>
                    <td class="${result.status}">${result.status}</td>
                    <td>${result.duration}</td>
                    <td>${result.error || ''}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
  }
}

// Export as module.exports for Playwright compatibility
module.exports = CustomReporter;
