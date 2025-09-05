import { Reporter, TestCase, TestResult, FullResult, TestStep } from '@playwright/test/reporter';
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
  passRate: number;
  failRate: number;
  avgDuration: number;
  slowestTest: { name: string; duration: number } | null;
  fastestTest: { name: string; duration: number } | null;
  errorCategories: { [key: string]: number };
  browserMetrics: { [browser: string]: { passed: number; failed: number; duration: number } };
  severityMetrics: { [severity: string]: { passed: number; failed: number; total: number } };
  featureMetrics: { [feature: string]: { passed: number; failed: number; total: number } };
  epicMetrics: { [epic: string]: { passed: number; failed: number; total: number } };
}

export interface SimplifiedTestStep {
  title: string;
  category: string;
  duration: number;
  error?: string;
}

export interface EnhancedTestResult {
  test: string;
  status: string;
  duration: number;
  error?: string;
  screenshot?: string;
  browser?: string;
  retry: number;
  tags?: string[];
  steps?: SimplifiedTestStep[];
  allureProperties?: {
    severity?: string;
    epic?: string;
    feature?: string;
    story?: string;
    owner?: string;
    description?: string;
    links?: Array<{ name: string; url: string; type?: string }>;
    labels?: Array<{ name: string; value: string }>;
  };
}

export default class CustomReporter implements Reporter {
  private metrics: TestMetrics;
  private testResults: EnhancedTestResult[];

  constructor() {
    this.metrics = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      duration: 0,
      startTime: new Date(),
      endTime: new Date(),
      passRate: 0,
      failRate: 0,
      avgDuration: 0,
      slowestTest: null,
      fastestTest: null,
      errorCategories: {},
      browserMetrics: {},
      severityMetrics: {},
      featureMetrics: {},
      epicMetrics: {}
    };
    this.testResults = [];
  }

  onBegin() {
    this.metrics.startTime = new Date();
    console.log(`🚀 Starting test execution at ${this.metrics.startTime.toISOString()}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.metrics.totalTests++;
    
    // Extract browser from project name
    const browser = test.parent.project()?.name || 'unknown';
    
    // Extract tags from test title (assuming format like @tag)
    const tags = test.title.match(/@\w+/g) || [];
    
    // Extract Allure properties from test annotations
    const allureProperties = this.extractAllureProperties(test, result);
    
    const testResult: EnhancedTestResult = {
      test: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
      screenshot: result.attachments.find(a => a.name === 'screenshot')?.path,
      browser,
      retry: result.retry,
      tags,
      // Store a simplified version of steps to avoid circular references
      steps: result.steps?.map(step => ({
        title: step.title,
        category: step.category,
        duration: step.duration,
        error: step.error ? JSON.stringify(step.error).substring(0, 200) : undefined
      })) || [],
      allureProperties
    };

    this.testResults.push(testResult);

    // Update browser metrics
    if (!this.metrics.browserMetrics[browser]) {
      this.metrics.browserMetrics[browser] = { passed: 0, failed: 0, duration: 0 };
    }
    this.metrics.browserMetrics[browser].duration += result.duration;

    // Update Allure-based metrics
    this.updateAllureMetrics(allureProperties, result.status);

    // Track error categories
    if (result.error?.message) {
      const errorType = this.categorizeError(result.error.message);
      this.metrics.errorCategories[errorType] = (this.metrics.errorCategories[errorType] || 0) + 1;
    }

    // Update test metrics
    switch (result.status) {
      case 'passed':
        this.metrics.passed++;
        this.metrics.browserMetrics[browser].passed++;
        console.log(`✅ ${test.title} (${result.duration}ms) [${browser}]${allureProperties.severity ? ` [${allureProperties.severity}]` : ''}`);
        break;
      case 'failed':
        this.metrics.failed++;
        this.metrics.browserMetrics[browser].failed++;
        console.log(`❌ ${test.title} (${result.duration}ms) [${browser}]${allureProperties.severity ? ` [${allureProperties.severity}]` : ''}`);
        if (result.error) {
          console.log(`   Error: ${result.error.message}`);
        }
        break;
      case 'skipped':
        this.metrics.skipped++;
        console.log(`⏭️  ${test.title} (skipped) [${browser}]${allureProperties.severity ? ` [${allureProperties.severity}]` : ''}`);
        break;
      case 'timedOut':
        this.metrics.failed++;
        this.metrics.browserMetrics[browser].failed++;
        console.log(`⏰ ${test.title} (timed out after ${result.duration}ms) [${browser}]${allureProperties.severity ? ` [${allureProperties.severity}]` : ''}`);
        break;
    }

    this.metrics.duration += result.duration;
    
    // Track fastest and slowest tests
    if (!this.metrics.slowestTest || result.duration > this.metrics.slowestTest.duration) {
      this.metrics.slowestTest = { name: test.title, duration: result.duration };
    }
    if (!this.metrics.fastestTest || result.duration < this.metrics.fastestTest.duration) {
      this.metrics.fastestTest = { name: test.title, duration: result.duration };
    }
  }

  async onEnd(result: FullResult) {
    this.metrics.endTime = new Date();
    
    // Calculate final metrics
    this.metrics.passRate = (this.metrics.passed / this.metrics.totalTests) * 100;
    this.metrics.failRate = (this.metrics.failed / this.metrics.totalTests) * 100;
    this.metrics.avgDuration = this.metrics.duration / this.metrics.totalTests;
    
    console.log('\n📊 Enhanced Test Execution Summary:');
    console.log(`   Total Tests: ${this.metrics.totalTests}`);
    console.log(`   ✅ Passed: ${this.metrics.passed} (${this.metrics.passRate.toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${this.metrics.failed} (${this.metrics.failRate.toFixed(1)}%)`);
    console.log(`   ⏭️  Skipped: ${this.metrics.skipped}`);
    console.log(`   ⏱️  Total Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`);
    console.log(`   📈 Average Duration: ${this.metrics.avgDuration.toFixed(0)}ms`);

    // Display Allure-based metrics
    console.log('\n📋 Test Coverage by Severity:');
    Object.entries(this.metrics.severityMetrics).forEach(([severity, metrics]) => {
      const passRate = ((metrics.passed / metrics.total) * 100).toFixed(1);
      console.log(`   ${severity.toUpperCase()}: ${metrics.total} tests (${passRate}% pass rate)`);
    });

    console.log('\n🎯 Test Coverage by Feature:');
    Object.entries(this.metrics.featureMetrics).forEach(([feature, metrics]) => {
      const passRate = ((metrics.passed / metrics.total) * 100).toFixed(1);
      console.log(`   ${feature}: ${metrics.total} tests (${passRate}% pass rate)`);
    });
    
    if (this.metrics.slowestTest) {
      console.log(`   🐌 Slowest Test: ${this.metrics.slowestTest.name} (${this.metrics.slowestTest.duration}ms)`);
    }
    if (this.metrics.fastestTest) {
      console.log(`   🚀 Fastest Test: ${this.metrics.fastestTest.name} (${this.metrics.fastestTest.duration}ms)`);
    }
    
    console.log(`   🏁 Execution Time: ${this.metrics.endTime.toISOString()}`);

    // Generate enhanced reports
    await this.generateDetailedReport();
    await this.generateEnhancedHTMLReport();
    await this.generateTrendsReport();
    console.log('\n🎯 All enhanced reports generated successfully!');
  }

  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      return 'Timeout';
    } else if (errorMessage.includes('selector') || errorMessage.includes('locator')) {
      return 'Selector/Locator';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network';
    } else if (errorMessage.includes('assertion') || errorMessage.includes('expected')) {
      return 'Assertion';
    } else if (errorMessage.includes('navigation') || errorMessage.includes('page')) {
      return 'Navigation';
    } else {
      return 'Other';
    }
  }

  private extractAllureProperties(test: TestCase, result: TestResult): any {
    const properties: any = {
      severity: 'normal',
      epic: 'Unknown',
      feature: 'Unknown',
      story: test.title,
      owner: 'Unknown',
      description: '',
      links: [],
      labels: []
    };

    // Extract from test annotations if available
    const annotations = (test as any).annotations || [];
    
    annotations.forEach((annotation: any) => {
      switch (annotation.type) {
        case 'severity':
          properties.severity = annotation.description || 'normal';
          break;
        case 'epic':
          properties.epic = annotation.description || 'Unknown';
          break;
        case 'feature':
          properties.feature = annotation.description || 'Unknown';
          break;
        case 'story':
          properties.story = annotation.description || test.title;
          break;
        case 'owner':
          properties.owner = annotation.description || 'Unknown';
          break;
        case 'description':
          properties.description = annotation.description || '';
          break;
        case 'link':
          if (annotation.description) {
            properties.links.push({
              name: annotation.description.split('|')[0] || 'Link',
              url: annotation.description.split('|')[1] || annotation.description,
              type: annotation.description.split('|')[2] || 'link'
            });
          }
          break;
      }
    });

    // Extract from test title patterns
    const titleParts = test.title.split(' - ');
    if (titleParts.length >= 2) {
      properties.feature = titleParts[0];
      properties.story = titleParts[1];
    }

    // Extract severity from tags
    const severityTag = test.title.match(/@(critical|high|medium|low|trivial)/i);
    if (severityTag) {
      properties.severity = severityTag[1].toLowerCase();
    }

    // Extract epic/feature from file path
    const filePath = test.location.file;
    const pathParts = filePath.split(/[/\\]/);
    if (pathParts.includes('uiTests')) {
      properties.epic = 'UI Testing';
    } else if (pathParts.includes('apiTests')) {
      properties.epic = 'API Testing';
    }

    return properties;
  }

  private updateAllureMetrics(allureProperties: any, status: string): void {
    // Update severity metrics
    const severity = allureProperties.severity || 'normal';
    if (!this.metrics.severityMetrics[severity]) {
      this.metrics.severityMetrics[severity] = { passed: 0, failed: 0, total: 0 };
    }
    this.metrics.severityMetrics[severity].total++;
    if (status === 'passed') {
      this.metrics.severityMetrics[severity].passed++;
    } else if (status === 'failed' || status === 'timedOut') {
      this.metrics.severityMetrics[severity].failed++;
    }

    // Update feature metrics
    const feature = allureProperties.feature || 'Unknown';
    if (!this.metrics.featureMetrics[feature]) {
      this.metrics.featureMetrics[feature] = { passed: 0, failed: 0, total: 0 };
    }
    this.metrics.featureMetrics[feature].total++;
    if (status === 'passed') {
      this.metrics.featureMetrics[feature].passed++;
    } else if (status === 'failed' || status === 'timedOut') {
      this.metrics.featureMetrics[feature].failed++;
    }

    // Update epic metrics
    const epic = allureProperties.epic || 'Unknown';
    if (!this.metrics.epicMetrics[epic]) {
      this.metrics.epicMetrics[epic] = { passed: 0, failed: 0, total: 0 };
    }
    this.metrics.epicMetrics[epic].total++;
    if (status === 'passed') {
      this.metrics.epicMetrics[epic].passed++;
    } else if (status === 'failed' || status === 'timedOut') {
      this.metrics.epicMetrics[epic].failed++;
    }
  }

  private async generateDetailedReport() {
    // Create a clean copy of test results without circular references
    const cleanTestResults = this.testResults.map(result => ({
      test: result.test,
      status: result.status,
      duration: result.duration,
      error: result.error,
      screenshot: result.screenshot,
      browser: result.browser,
      retry: result.retry,
      tags: result.tags,
      // Serialize steps without circular references
      stepsCount: result.steps?.length || 0,
      stepsSummary: result.steps?.map(step => ({
        title: step.title,
        category: step.category,
        duration: step.duration,
        error: step.error ? JSON.stringify(step.error).substring(0, 200) : undefined
      })) || []
    }));

    const reportData = {
      metrics: this.metrics,
      testResults: cleanTestResults,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.BASE_URL,
        browser: process.env.BROWSER || 'chromium',
        timestamp: new Date().toISOString()
      },
      summary: {
        executionTime: this.metrics.endTime.getTime() - this.metrics.startTime.getTime(),
        testsPerSecond: this.metrics.totalTests / ((this.metrics.endTime.getTime() - this.metrics.startTime.getTime()) / 1000),
        averageTestDuration: this.metrics.avgDuration,
        totalDuration: this.metrics.duration
      }
    };

    const reportPath = path.join('test-results', 'reports', 'detailed-report.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, reportData, { spaces: 2 });
    console.log(`📄 Detailed JSON report saved to: ${reportPath}`);
  }

  private async generateEnhancedHTMLReport() {
    const reportPath = path.join('test-results', 'reports', 'enhanced-report.html');
    const htmlContent = this.generateEnhancedHTML();
    
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeFile(reportPath, htmlContent);
    console.log(`📄 Enhanced HTML report saved to: ${reportPath}`);
  }

  private generateEnhancedHTML(): string {
    const passRate = this.metrics.passRate.toFixed(1);
    const failRate = this.metrics.failRate.toFixed(1);
    const avgDuration = this.metrics.avgDuration.toFixed(0);
    
    // Generate browser metrics chart data
    const browserChartData = Object.entries(this.metrics.browserMetrics)
      .map(([browser, metrics]) => `['${browser}', ${metrics.passed}, ${metrics.failed}]`)
      .join(',');

    // Generate error categories chart data
    const errorChartData = Object.entries(this.metrics.errorCategories)
      .map(([category, count]) => `['${category}', ${count}]`)
      .join(',');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced Test Execution Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .metric-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #667eea; }
        .metric-card h3 { color: #4a5568; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
        .metric-card .value { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .metric-card .sub-value { color: #718096; font-size: 0.9rem; }
        .passed { border-color: #48bb78; } .passed .value { color: #48bb78; }
        .failed { border-color: #f56565; } .failed .value { color: #f56565; }
        .duration { border-color: #4299e1; } .duration .value { color: #4299e1; }
        .rate { border-color: #9f7aea; } .rate .value { color: #9f7aea; }
        .charts-section { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
        .chart-container { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .chart-container h3 { margin-bottom: 1rem; color: #4a5568; }
        .results-section { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .results-header { background: #edf2f7; padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .results-table { width: 100%; border-collapse: collapse; }
        .results-table th { background: #f7fafc; padding: 1rem; text-align: left; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0; }
        .results-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-passed { background: #c6f6d5; color: #22543d; }
        .status-failed { background: #fed7d7; color: #742a2a; }
        .status-skipped { background: #fef5e7; color: #744210; }
        .insights { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 2rem; }
        .insights h3 { color: #4a5568; margin-bottom: 1rem; }
        .insight-item { margin-bottom: 0.5rem; padding: 0.5rem 0; }
        .performance-section { margin-top: 2rem; }
        .browser-metrics { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .browser-metric { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; }
        .browser-metric:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Test Execution Report</h1>
        <p>Comprehensive analysis of test run from ${this.metrics.startTime.toLocaleString()} to ${this.metrics.endTime.toLocaleString()}</p>
    </div>
    
    <div class="container">
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Total Tests</h3>
                <div class="value">${this.metrics.totalTests}</div>
                <div class="sub-value">Executed</div>
            </div>
            <div class="metric-card passed">
                <h3>Passed Tests</h3>
                <div class="value">${this.metrics.passed}</div>
                <div class="sub-value">${passRate}% success rate</div>
            </div>
            <div class="metric-card failed">
                <h3>Failed Tests</h3>
                <div class="value">${this.metrics.failed}</div>
                <div class="sub-value">${failRate}% failure rate</div>
            </div>
            <div class="metric-card duration">
                <h3>Total Duration</h3>
                <div class="value">${(this.metrics.duration / 1000).toFixed(1)}s</div>
                <div class="sub-value">Avg: ${avgDuration}ms per test</div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h3>📊 Browser Performance</h3>
                <canvas id="browserChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
                <h3>🐛 Error Categories</h3>
                <canvas id="errorChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-container">
                <h3>🎯 Severity Distribution</h3>
                <canvas id="severityChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
                <h3>🎭 Feature Coverage</h3>
                <canvas id="featureChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="performance-section">
            <div class="browser-metrics">
                <h3>🌐 Browser Metrics</h3>
                ${Object.entries(this.metrics.browserMetrics).map(([browser, metrics]) => `
                    <div class="browser-metric">
                        <span><strong>${browser}</strong></span>
                        <span>✅ ${metrics.passed} | ❌ ${metrics.failed} | ⏱️ ${(metrics.duration / 1000).toFixed(1)}s</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="performance-section">
            <div class="browser-metrics">
                <h3>🎯 Allure Test Metrics</h3>
                <h4 style="margin-top: 1rem; color: #4a5568;">Severity Distribution</h4>
                ${Object.entries(this.metrics.severityMetrics).map(([severity, metrics]) => `
                    <div class="browser-metric">
                        <span><strong>${severity.toUpperCase()}</strong></span>
                        <span>Total: ${metrics.total} | ✅ ${metrics.passed} | ❌ ${metrics.failed} | Pass Rate: ${((metrics.passed / metrics.total) * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
                
                <h4 style="margin-top: 1rem; color: #4a5568;">Epic Coverage</h4>
                ${Object.entries(this.metrics.epicMetrics).map(([epic, metrics]) => `
                    <div class="browser-metric">
                        <span><strong>${epic}</strong></span>
                        <span>Total: ${metrics.total} | ✅ ${metrics.passed} | ❌ ${metrics.failed} | Pass Rate: ${((metrics.passed / metrics.total) * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="performance-section">
            <div class="browser-metrics">
                <h3>� Browser Metrics</h3>
                ${Object.entries(this.metrics.browserMetrics).map(([browser, metrics]) => `
                    <div class="browser-metric">
                        <span><strong>${browser}</strong></span>
                        <span>✅ ${metrics.passed} | ❌ ${metrics.failed} | ⏱️ ${(metrics.duration / 1000).toFixed(1)}s</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="insights">
            <h3>🔍 Test Insights</h3>
            ${this.metrics.slowestTest ? `<div class="insight-item">🐌 <strong>Slowest Test:</strong> ${this.metrics.slowestTest.name} (${this.metrics.slowestTest.duration}ms)</div>` : ''}
            ${this.metrics.fastestTest ? `<div class="insight-item">🚀 <strong>Fastest Test:</strong> ${this.metrics.fastestTest.name} (${this.metrics.fastestTest.duration}ms)</div>` : ''}
            <div class="insight-item">📈 <strong>Average Test Duration:</strong> ${avgDuration}ms</div>
            <div class="insight-item">⚡ <strong>Tests per Second:</strong> ${(this.metrics.totalTests / ((this.metrics.duration || 1) / 1000)).toFixed(2)}</div>
            <div class="insight-item">🎯 <strong>Pass Rate:</strong> ${passRate}% (Target: ≥95%)</div>
        </div>

        <div class="results-section">
            <div class="results-header">
                <h3>📋 Detailed Test Results</h3>
            </div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Status</th>
                        <th>Browser</th>
                        <th>Duration</th>
                        <th>Retry</th>
                        <th>Error</th>
                        <th>Severity</th>
                        <th>Feature</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.testResults.map(result => `
                        <tr>
                            <td>${result.test}</td>
                            <td><span class="status-badge status-${result.status}">${result.status}</span></td>
                            <td>${result.browser}</td>
                            <td>${result.duration}ms</td>
                            <td>${result.retry}</td>
                            <td style="max-width: 300px; word-wrap: break-word;">${result.error || '-'}</td>
                            <td>${result.allureProperties?.severity || 'normal'}</td>
                            <td>${result.allureProperties?.feature || 'Unknown'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Browser Performance Chart
        const browserCtx = document.getElementById('browserChart').getContext('2d');
        new Chart(browserCtx, {
            type: 'bar',
            data: {
                labels: [${Object.keys(this.metrics.browserMetrics).map(b => `'${b}'`).join(',')}],
                datasets: [{
                    label: 'Passed',
                    data: [${Object.values(this.metrics.browserMetrics).map(m => m.passed).join(',')}],
                    backgroundColor: '#48bb78'
                }, {
                    label: 'Failed',
                    data: [${Object.values(this.metrics.browserMetrics).map(m => m.failed).join(',')}],
                    backgroundColor: '#f56565'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Error Categories Chart
        const errorCtx = document.getElementById('errorChart').getContext('2d');
        new Chart(errorCtx, {
            type: 'doughnut',
            data: {
                labels: [${Object.keys(this.metrics.errorCategories).map(c => `'${c}'`).join(',')}],
                datasets: [{
                    data: [${Object.values(this.metrics.errorCategories).join(',')}],
                    backgroundColor: ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#9f7aea']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Severity Distribution Chart
        const severityCtx = document.getElementById('severityChart').getContext('2d');
        new Chart(severityCtx, {
            type: 'bar',
            data: {
                labels: [${Object.keys(this.metrics.severityMetrics).map(s => `'${s.toUpperCase()}'`).join(',')}],
                datasets: [{
                    label: 'Passed',
                    data: [${Object.values(this.metrics.severityMetrics).map(m => m.passed).join(',')}],
                    backgroundColor: '#48bb78'
                }, {
                    label: 'Failed',
                    data: [${Object.values(this.metrics.severityMetrics).map(m => m.failed).join(',')}],
                    backgroundColor: '#f56565'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Test Results by Severity Level'
                    }
                }
            }
        });

        // Feature Coverage Chart
        const featureCtx = document.getElementById('featureChart').getContext('2d');
        new Chart(featureCtx, {
            type: 'bar',
            data: {
                labels: [${Object.keys(this.metrics.featureMetrics).map(f => `'${f}'`).join(',')}],
                datasets: [{
                    label: 'Total Tests',
                    data: [${Object.values(this.metrics.featureMetrics).map(m => m.total).join(',')}],
                    backgroundColor: '#4299e1'
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: {
                    x: { beginAtZero: true }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Test Coverage by Feature'
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  private async generateTrendsReport() {
    const trendsPath = path.join('test-results', 'reports', 'trends.json');
    const existingTrends = await this.loadExistingTrends(trendsPath);
    
    const currentRun = {
      timestamp: this.metrics.endTime.toISOString(),
      metrics: {
        totalTests: this.metrics.totalTests,
        passed: this.metrics.passed,
        failed: this.metrics.failed,
        passRate: this.metrics.passRate,
        duration: this.metrics.duration,
        avgDuration: this.metrics.avgDuration
      }
    };

    existingTrends.push(currentRun);
    
    // Keep only last 30 runs
    if (existingTrends.length > 30) {
      existingTrends.splice(0, existingTrends.length - 30);
    }

    await fs.ensureDir(path.dirname(trendsPath));
    await fs.writeJson(trendsPath, existingTrends, { spaces: 2 });
    console.log(`📈 Trends report saved to: ${trendsPath}`);
  }

  private async loadExistingTrends(trendsPath: string): Promise<any[]> {
    try {
      if (await fs.pathExists(trendsPath)) {
        return await fs.readJson(trendsPath);
      }
    } catch (error) {
      console.warn(`Warning: Could not load existing trends: ${error}`);
    }
    return [];
  }


}

// Export as module.exports for Playwright compatibility
module.exports = CustomReporter;
