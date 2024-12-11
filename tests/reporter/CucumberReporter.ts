import reporter from 'cucumber-html-reporter';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';
import DateUtil from '../utils/DateUtil'; // Adjust the path as necessary
import EnvUtil from '../utils/EnvUtil'; // Adjust the path as necessary

// Load environment variables
dotenv.config({
  path: process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env',
  override: !!process.env.TEST_ENV,
});

// Ensure the reports directory exists
fs.ensureDirSync('./test-results/reports');


const options: reporter.Options = {
  brandTitle: "Acceptance Test Report",
  theme: 'bootstrap', 
  jsonFile: 'test-results/reports/cucumber.json',
  output: 'test-results/reports/cucumber.html',
  reportSuiteAsScenarios: false,
  scenarioTimestamp: true,
  launchReport: false,
  columnLayout: 1,
  metadata: {
    "Execution Date": DateUtil.dateGenerator("DD/MM/YYYY", 0, 0, 0),
    "Base URL": process.env.BASE_URL || 'Not specified', // Provide default values
    "Environment": process.env.ENVIRONMENT || 'Not specified',
    "Browser": process.env.BROWSER || 'Not specified',
  }
};

export default class CucumberReporter {
  public static generate(): void {
    EnvUtil.setEnv();
    reporter.generate(options);
  }
}

CucumberReporter.generate();
