import DateUtil from '../utils/DateUtil';
import EnvUtil from '../utils/EnvUtil';

export default class HTMLReporter {
    public static generateReport() {        
        const os = require('node:os');
        const report = require('multiple-cucumber-html-reporter');
        // require('dotenv').config();
        EnvUtil.setEnv();
        report.generate({
            jsonDir: './test-results/reports/',
            reportPath: './test-results/reports/html/',
            pageTitle: 'Saasifier Test Execution Report',
            reportName: 'Test Execution Results',
            displayDuration: false,
            displayReportTime: false,
            hideMetadata: false,
            customMetadata: false,
            metadata: {
                browser: {
                    name: process.env.BROWSER,
                    version: 'latest'
                },
                device: os.hostname(),
                platform: {
                    name: os.type(),
                    version: os.version(),
                }
            },
            customData: {
                title: 'Run Info',
                data: [
                    { label: 'Execution Date', value: DateUtil.dateGenerator("DD/MM/YYYY", 0, 0, 0) },
                    { label: 'Base URL', value: process.env.BASE_URL },
                    { label: 'Environment', value: process.env.ENVIRONMENT },
                    { label: 'REST Endpoint', value: process.env.REST_API_BASE_URL },
                ]
            }
        });
    }
}
HTMLReporter.generateReport();
