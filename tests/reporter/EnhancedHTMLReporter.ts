export class EnhancedHTMLGenerator {
  static generateHTML(metrics: any, testResults: any[]): string {
    const passRate = metrics.passRate.toFixed(1);
    const failRate = metrics.failRate.toFixed(1);
    const avgDuration = metrics.avgDuration.toFixed(0);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced Test Execution Report</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }
        
        /* Header Styles */
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        
        /* Navigation Styles */
        .nav-container { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); position: sticky; top: 120px; z-index: 999; border-bottom: 1px solid #e2e8f0; }
        .nav-menu { display: flex; justify-content: center; padding: 1rem; max-width: 1200px; margin: 0 auto; flex-wrap: wrap; gap: 1rem; }
        .nav-item { padding: 0.5rem 1rem; background: #667eea; color: white; text-decoration: none; border-radius: 20px; font-weight: 500; transition: all 0.3s ease; }
        .nav-item:hover { background: #5a67d8; transform: translateY(-2px); color: white; text-decoration: none; }
        
        /* Container Styles */
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        
        /* Section Styles */
        .section { margin-bottom: 3rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .section-header { background: #f8fafc; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center; transition: background 0.3s ease; }
        .section-header:hover { background: #f1f5f9; }
        .section-header h2 { margin: 0; color: #2d3748; font-size: 1.5rem; }
        .section-toggle { font-size: 1.2rem; color: #718096; transition: transform 0.3s ease; }
        .section-content { padding: 2rem; transition: all 0.3s ease; max-height: 2000px; overflow: hidden; }
        .section.collapsed .section-content { max-height: 0; padding: 0 2rem; }
        .section.collapsed .section-toggle { transform: rotate(-90deg); }
        
        /* Metrics Grid */
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .metric-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #667eea; transition: transform 0.2s ease; }
        .metric-card:hover { transform: translateY(-2px); }
        .metric-card h3 { color: #4a5568; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
        .metric-card .value { font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; }
        .metric-card .sub-value { color: #718096; font-size: 0.9rem; }
        .passed { border-color: #48bb78; } .passed .value { color: #48bb78; }
        .failed { border-color: #f56565; } .failed .value { color: #f56565; }
        .duration { border-color: #4299e1; } .duration .value { color: #4299e1; }
        .rate { border-color: #9f7aea; } .rate .value { color: #9f7aea; }
        
        /* Charts Grid */
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
        .chart-container { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .chart-container h3 { margin-bottom: 1rem; color: #4a5568; text-align: center; }
        
        /* Tables */
        .table-container { overflow-x: auto; max-height: 600px; overflow-y: auto; }
        .results-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .results-table th { background: #f7fafc; padding: 1rem; text-align: left; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0; position: sticky; top: 0; }
        .results-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; }
        .results-table tr:hover { background: #f8fafc; }
        
        /* Status Badges */
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-passed { background: #c6f6d5; color: #22543d; }
        .status-failed { background: #fed7d7; color: #742a2a; }
        .status-skipped { background: #fef5e7; color: #744210; }
        
        /* Insights */
        .insights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .insight-item { background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 4px solid #667eea; }
        
        /* Browser Metrics */
        .browser-metric { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; }
        .browser-metric:last-child { border-bottom: none; }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .nav-menu { padding: 0.5rem; }
            .nav-item { padding: 0.4rem 0.8rem; font-size: 0.9rem; }
            .charts-grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 2rem; }
            .metric-card .value { font-size: 1.5rem; }
            .nav-container { top: 100px; }
        }
        
        /* Smooth Scrolling */
        html { scroll-behavior: smooth; }
        
        /* Loading Animation */
        .loading { opacity: 0; animation: fadeIn 0.5s ease-in forwards; }
        @keyframes fadeIn { to { opacity: 1; } }
        
        /* Print Styles */
        @media print {
            .nav-container, .section-toggle { display: none; }
            .section-content { max-height: none !important; padding: 2rem !important; }
            .section { break-inside: avoid; }
            .table-container { max-height: none; overflow: visible; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Test Execution Report</h1>
        <p>Comprehensive analysis of test run from ${metrics.startTime.toLocaleString()} to ${metrics.endTime.toLocaleString()}</p>
    </div>
    
    <nav class="nav-container">
        <div class="nav-menu">
            <a href="#overview" class="nav-item">📊 Overview</a>
            <a href="#charts" class="nav-item">📈 Charts</a>
            <a href="#browser-metrics" class="nav-item">🌐 Browser Metrics</a>
            <a href="#allure-metrics" class="nav-item">🎯 Test Metrics</a>
            <a href="#insights" class="nav-item">🔍 Insights</a>
            <a href="#detailed-results" class="nav-item">📋 Detailed Results</a>
        </div>
    </nav>
    
    <div class="container">
        <!-- Overview Section -->
        <section id="overview" class="section loading">
            <div class="section-header" onclick="toggleSection('overview')">
                <h2>📊 Test Overview</h2>
                <span class="section-toggle">▼</span>
            </div>
            <div class="section-content">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>Total Tests</h3>
                        <div class="value">${metrics.totalTests}</div>
                        <div class="sub-value">Executed</div>
                    </div>
                    <div class="metric-card passed">
                        <h3>Passed Tests</h3>
                        <div class="value">${metrics.passed}</div>
                        <div class="sub-value">${passRate}% success rate</div>
                    </div>
                    <div class="metric-card failed">
                        <h3>Failed Tests</h3>
                        <div class="value">${metrics.failed}</div>
                        <div class="sub-value">${failRate}% failure rate</div>
                    </div>
                    <div class="metric-card duration">
                        <h3>Total Duration</h3>
                        <div class="value">${(metrics.duration / 1000).toFixed(1)}s</div>
                        <div class="sub-value">Avg: ${avgDuration}ms per test</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Charts Section -->
        <section id="charts" class="section loading">
            <div class="section-header" onclick="toggleSection('charts')">
                <h2>📈 Performance Charts</h2>
                <span class="section-toggle">▼</span>
            </div>
            <div class="section-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>📊 Browser Performance</h3>
                        <canvas id="browserChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>🐛 Error Categories</h3>
                        <canvas id="errorChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>🎯 Severity Distribution</h3>
                        <canvas id="severityChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>🎭 Feature Coverage</h3>
                        <canvas id="featureChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Browser Metrics Section -->
        <section id="browser-metrics" class="section loading">
            <div class="section-header" onclick="toggleSection('browser-metrics')">
                <h2>🌐 Browser Performance Metrics</h2>
                <span class="section-toggle">▼</span>
            </div>
            <div class="section-content">
                ${Object.entries(metrics.browserMetrics).map(([browser, browserMetrics]: [string, any]) => `
                    <div class="browser-metric">
                        <span><strong>${browser}</strong></span>
                        <span>✅ ${browserMetrics.passed} | ❌ ${browserMetrics.failed} | ⏱️ ${(browserMetrics.duration / 1000).toFixed(1)}s</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Allure Metrics Section -->
        <section id="allure-metrics" class="section loading">
            <div class="section-header" onclick="toggleSection('allure-metrics')">
                <h2>🎯 Test Classification Metrics</h2>
                <span class="section-toggle">▼</span>
            </div>
            <div class="section-content">
                <h4 style="margin-bottom: 1rem; color: #4a5568;">Severity Distribution</h4>
                ${Object.entries(metrics.severityMetrics).map(([severity, severityMetrics]: [string, any]) => `
                    <div class="browser-metric">
                        <span><strong>${severity.toUpperCase()}</strong></span>
                        <span>Total: ${severityMetrics.total} | ✅ ${severityMetrics.passed} | ❌ ${severityMetrics.failed} | Pass Rate: ${((severityMetrics.passed / severityMetrics.total) * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
                
                <h4 style="margin: 2rem 0 1rem 0; color: #4a5568;">Epic Coverage</h4>
                ${Object.entries(metrics.epicMetrics).map(([epic, epicMetrics]: [string, any]) => `
                    <div class="browser-metric">
                        <span><strong>${epic}</strong></span>
                        <span>Total: ${epicMetrics.total} | ✅ ${epicMetrics.passed} | ❌ ${epicMetrics.failed} | Pass Rate: ${((epicMetrics.passed / epicMetrics.total) * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Insights Section -->
        <section id="insights" class="section loading">
            <div class="section-header" onclick="toggleSection('insights')">
                <h2>🔍 Test Insights & Analytics</h2>
                <span class="section-toggle">▼</span>
            </div>
            <div class="section-content">
                <div class="insights-grid">
                    ${metrics.slowestTest ? `<div class="insight-item">🐌 <strong>Slowest Test:</strong> ${metrics.slowestTest.name} (${metrics.slowestTest.duration}ms)</div>` : ''}
                    ${metrics.fastestTest ? `<div class="insight-item">🚀 <strong>Fastest Test:</strong> ${metrics.fastestTest.name} (${metrics.fastestTest.duration}ms)</div>` : ''}
                    <div class="insight-item">📈 <strong>Average Test Duration:</strong> ${avgDuration}ms</div>
                    <div class="insight-item">⚡ <strong>Tests per Second:</strong> ${(metrics.totalTests / ((metrics.duration || 1) / 1000)).toFixed(2)}</div>
                    <div class="insight-item">🎯 <strong>Pass Rate:</strong> ${passRate}% (Target: ≥95%)</div>
                    <div class="insight-item">⏱️ <strong>Total Execution:</strong> ${(metrics.duration / 1000).toFixed(2)}s</div>
                </div>
            </div>
        </section>

        <!-- Detailed Results Section -->
        <section id="detailed-results" class="section loading">
            <div class="section-header" onclick="toggleSection('detailed-results')">
                <h2>📋 Detailed Test Results</h2>
                <span class="section-toggle">▼</span>
            </div>
            <div class="section-content">
                <div class="table-container">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Status</th>
                                <th>Browser</th>
                                <th>Duration</th>
                                <th>Retry</th>
                                <th>Severity</th>
                                <th>Feature</th>
                                <th>Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${testResults.map(result => `
                                <tr>
                                    <td><strong>${result.test}</strong></td>
                                    <td><span class="status-badge status-${result.status}">${result.status}</span></td>
                                    <td>${result.browser}</td>
                                    <td>${result.duration}ms</td>
                                    <td>${result.retry}</td>
                                    <td>${result.allureProperties?.severity || 'normal'}</td>
                                    <td>${result.allureProperties?.feature || 'Unknown'}</td>
                                    <td style="max-width: 300px; word-wrap: break-word;">${result.error || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>

    <script>
        // Section Toggle Functionality
        function toggleSection(sectionId) {
            const section = document.getElementById(sectionId);
            section.classList.toggle('collapsed');
        }

        // Smooth Scrolling for Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const headerHeight = 180; // Adjust for sticky headers
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Loading Animation
        setTimeout(() => {
            document.querySelectorAll('.loading').forEach((el, index) => {
                el.style.animationDelay = index * 0.1 + 's';
            });
        }, 100);

        // Charts initialization (wait for DOM to be ready)
        document.addEventListener('DOMContentLoaded', function() {
            try {
                // Browser Performance Chart
                const browserCtx = document.getElementById('browserChart');
                if (browserCtx) {
                    new Chart(browserCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: [${Object.keys(metrics.browserMetrics).map((b: string) => `'${b}'`).join(',')}],
                            datasets: [{
                                label: 'Passed',
                                data: [${Object.values(metrics.browserMetrics).map((m: any) => m.passed).join(',')}],
                                backgroundColor: '#48bb78'
                            }, {
                                label: 'Failed',
                                data: [${Object.values(metrics.browserMetrics).map((m: any) => m.failed).join(',')}],
                                backgroundColor: '#f56565'
                            }]
                        },
                        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }

                // Error Categories Chart
                const errorCtx = document.getElementById('errorChart');
                if (errorCtx) {
                    new Chart(errorCtx.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: [${Object.keys(metrics.errorCategories).map((c: string) => `'${c}'`).join(',')}],
                            datasets: [{
                                data: [${Object.values(metrics.errorCategories).join(',')}],
                                backgroundColor: ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1']
                            }]
                        },
                        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }

                // Severity Chart
                const severityCtx = document.getElementById('severityChart');
                if (severityCtx) {
                    new Chart(severityCtx.getContext('2d'), {
                        type: 'pie',
                        data: {
                            labels: [${Object.keys(metrics.severityMetrics).map((s: string) => `'${s.toUpperCase()}'`).join(',')}],
                            datasets: [{
                                data: [${Object.values(metrics.severityMetrics).map((m: any) => m.total).join(',')}],
                                backgroundColor: ['#f56565', '#ed8936', '#ecc94b', '#48bb78']
                            }]
                        },
                        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }

                // Feature Chart
                const featureCtx = document.getElementById('featureChart');
                if (featureCtx) {
                    new Chart(featureCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: [${Object.keys(metrics.featureMetrics).map((f: string) => `'${f}'`).join(',')}],
                            datasets: [{
                                label: 'Tests',
                                data: [${Object.values(metrics.featureMetrics).map((m: any) => m.total).join(',')}],
                                backgroundColor: '#667eea'
                            }]
                        },
                        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }
            } catch (error) {
                console.log('Chart.js not loaded, skipping charts');
            }
        });
    </script>
</body>
</html>`;
  }
}
