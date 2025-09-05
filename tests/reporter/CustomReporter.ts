import { Reporter, TestCase, TestResult, FullResult, TestStep } from '@playwright/test/reporter';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EnhancedHTMLGenerator } from './EnhancedHTMLReporter';

export interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  passRate: number;
  failRate: number;
  avgDuration: number;
  startTime: Date;
  endTime: Date;
  slowestTest?: { name: string; duration: number };
  fastestTest?: { name: string; duration: number };
  browserMetrics: Record<string, { passed: number; failed: number; duration: number }>;
  errorCategories: Record<string, number>;
  
  // Allure-style metrics
  severityMetrics: Record<string, { total: number; passed: number; failed: number }>;
  featureMetrics: Record<string, { total: number; passed: number; failed: number }>;
  epicMetrics: Record<string, { total: number; passed: number; failed: number }>;
}

export interface TestResultDetail {
  test: string;
  status: string;
  duration: number;
  browser: string;
  retry: number;
  error?: string;
  allureProperties?: {
    severity?: string;
    feature?: string;
    epic?: string;
  };
}

export default class CustomReporter implements Reporter {
  private metrics: TestMetrics;
  private testResults: TestResultDetail[] = [];
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'test-results', 'reports');
    this.metrics = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      duration: 0,
      passRate: 0,
      failRate: 0,
      avgDuration: 0,
      startTime: new Date(),
      endTime: new Date(),
      browserMetrics: {},
      errorCategories: {},
      
      // Initialize Allure-style metrics
      severityMetrics: {},
      featureMetrics: {},
      epicMetrics: {}
    };
  }

  onBegin() {
    this.metrics.startTime = new Date();
    console.log('🚀 Starting Enhanced Test Reporter...');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.metrics.totalTests++;
    
    // Extract browser info
    const browserName = this.extractBrowserName(test);
    
    // Initialize browser metrics if not exists
    if (!this.metrics.browserMetrics[browserName]) {
      this.metrics.browserMetrics[browserName] = { passed: 0, failed: 0, duration: 0 };
    }
    
    // Extract Allure properties from test annotations
    const allureProperties = this.extractAllureProperties(test);
    
    // Update metrics based on result
    if (result.status === 'passed') {
      this.metrics.passed++;
      this.metrics.browserMetrics[browserName].passed++;
      
      // Update Allure metrics for passed tests
      this.updateAllureMetrics(allureProperties, 'passed');
    } else if (result.status === 'failed') {
      this.metrics.failed++;
      this.metrics.browserMetrics[browserName].failed++;
      
      // Update Allure metrics for failed tests
      this.updateAllureMetrics(allureProperties, 'failed');
      
      // Categorize error
      if (result.error) {
        const errorCategory = this.categorizeError(result.error.message || '');
        this.metrics.errorCategories[errorCategory] = (this.metrics.errorCategories[errorCategory] || 0) + 1;
      }
    } else if (result.status === 'skipped') {
      this.metrics.skipped++;
    } else if (result.status === 'timedOut' || result.status === 'interrupted') {
      this.metrics.failed++; // Count timeouts and interruptions as failures
      this.metrics.browserMetrics[browserName].failed++;
    }
    
    // Update duration metrics
    this.metrics.duration += result.duration;
    this.metrics.browserMetrics[browserName].duration += result.duration;
    
    // Track slowest and fastest tests
    if (!this.metrics.slowestTest || result.duration > this.metrics.slowestTest.duration) {
      this.metrics.slowestTest = { name: test.title, duration: result.duration };
    }
    if (!this.metrics.fastestTest || result.duration < this.metrics.fastestTest.duration) {
      this.metrics.fastestTest = { name: test.title, duration: result.duration };
    }
    
    // Store detailed result
    this.testResults.push({
      test: test.title,
      status: result.status,
      duration: result.duration,
      browser: browserName,
      retry: result.retry,
      error: result.error?.message,
      allureProperties
    });
  }

  private extractAllureProperties(test: TestCase): { severity?: string; feature?: string; epic?: string } {
    const properties: { severity?: string; feature?: string; epic?: string } = {};
    
    // Check for annotations
    test.annotations?.forEach(annotation => {
      switch (annotation.type) {
        case 'severity':
          properties.severity = annotation.description || 'normal';
          break;
        case 'feature':
          properties.feature = annotation.description || 'Unknown';
          break;
        case 'epic':
          properties.epic = annotation.description || 'General';
          break;
      }
    });
    
    // Set defaults
    properties.severity = properties.severity || 'normal';
    properties.feature = properties.feature || 'Unknown';
    properties.epic = properties.epic || 'General';
    
    return properties;
  }

  private updateAllureMetrics(properties: { severity?: string; feature?: string; epic?: string }, status: 'passed' | 'failed') {
    // Update severity metrics
    if (properties.severity) {
      if (!this.metrics.severityMetrics[properties.severity]) {
        this.metrics.severityMetrics[properties.severity] = { total: 0, passed: 0, failed: 0 };
      }
      this.metrics.severityMetrics[properties.severity].total++;
      if (status === 'passed') {
        this.metrics.severityMetrics[properties.severity].passed++;
      } else {
        this.metrics.severityMetrics[properties.severity].failed++;
      }
    }
    
    // Update feature metrics
    if (properties.feature) {
      if (!this.metrics.featureMetrics[properties.feature]) {
        this.metrics.featureMetrics[properties.feature] = { total: 0, passed: 0, failed: 0 };
      }
      this.metrics.featureMetrics[properties.feature].total++;
      if (status === 'passed') {
        this.metrics.featureMetrics[properties.feature].passed++;
      } else {
        this.metrics.featureMetrics[properties.feature].failed++;
      }
    }
    
    // Update epic metrics
    if (properties.epic) {
      if (!this.metrics.epicMetrics[properties.epic]) {
        this.metrics.epicMetrics[properties.epic] = { total: 0, passed: 0, failed: 0 };
      }
      this.metrics.epicMetrics[properties.epic].total++;
      if (status === 'passed') {
        this.metrics.epicMetrics[properties.epic].passed++;
      } else {
        this.metrics.epicMetrics[properties.epic].failed++;
      }
    }
  }

  private extractBrowserName(test: TestCase): string {
    // Extract browser name from project name or test title
    const projectName = test.parent?.parent?.title || 'unknown';
    if (projectName.includes('chromium')) return 'Chromium';
    if (projectName.includes('firefox')) return 'Firefox';
    if (projectName.includes('webkit')) return 'WebKit';
    return projectName || 'Unknown';
  }

  async onEnd(result: FullResult) {
    this.metrics.endTime = new Date();
    
    // Calculate rates
    this.metrics.passRate = this.metrics.totalTests > 0 ? (this.metrics.passed / this.metrics.totalTests) * 100 : 0;
    this.metrics.failRate = this.metrics.totalTests > 0 ? (this.metrics.failed / this.metrics.totalTests) * 100 : 0;
    this.metrics.avgDuration = this.metrics.totalTests > 0 ? this.metrics.duration / this.metrics.totalTests : 0;
    
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

  private async generateDetailedReport() {
    const reportData = {
      summary: this.metrics,
      testResults: this.testResults,
      generatedAt: new Date().toISOString()
    };

    await fs.ensureDir(this.outputDir);
    const reportPath = path.join(this.outputDir, 'detailed-report.json');
    await fs.writeJSON(reportPath, reportData, { spaces: 2 });
    console.log(`📄 Detailed JSON report saved to: ${reportPath}`);
  }

  private async generateEnhancedHTMLReport() {
    await fs.ensureDir(this.outputDir);
    const htmlContent = this.generateEnhancedHTML();
    const reportPath = path.join(this.outputDir, 'enhanced-report.html');
    await fs.writeFile(reportPath, htmlContent);
    console.log(`📄 Enhanced HTML report saved to: ${reportPath}`);
  }

  private generateEnhancedHTML(): string {
    return EnhancedHTMLGenerator.generateHTML(this.metrics, this.testResults);
  }

  private async generateTrendsReport() {
    const trendsPath = path.join(this.outputDir, 'trends.json');
    const currentTrend = {
      timestamp: this.metrics.endTime.toISOString(),
      totalTests: this.metrics.totalTests,
      passed: this.metrics.passed,
      failed: this.metrics.failed,
      passRate: this.metrics.passRate,
      duration: this.metrics.duration,
      avgDuration: this.metrics.avgDuration
    };

    const trends = await this.loadExistingTrends(trendsPath);
    trends.push(currentTrend);
    
    // Keep only last 30 runs
    if (trends.length > 30) {
      trends.splice(0, trends.length - 30);
    }

    await fs.ensureDir(this.outputDir);
    await fs.writeJSON(trendsPath, trends, { spaces: 2 });
    console.log(`📈 Trends report updated: ${trendsPath}`);
  }

  private async loadExistingTrends(trendsPath: string): Promise<any[]> {
    try {
      if (await fs.pathExists(trendsPath)) {
        return await fs.readJSON(trendsPath);
      }
    } catch (error) {
      console.log('No existing trends file found, creating new one');
    }
    return [];
  }
}
