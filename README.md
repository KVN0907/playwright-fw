<!--
This file is the README for the Playwright Core Framework project.
It provides an overview and documentation for the playwright-core-fw repository.
-->

# Playwright Test Framework

A comprehensive Playwright testing framework for end-to-end and API testing.

## 🏗️ Framework Architecture

### Directory Structure

```
playwright-fw/
├── tests/
│   ├── apiTests/           # API test specifications
│   ├── uiTests/           # UI test specifications
│   │   ├── e2e/           # End-to-end tests
│   │   └── pageObjects/   # Page Object Model classes
│   ├── fixtures/          # Test fixtures and base classes
│   ├── utils/             # Utility classes and helpers
│   ├── data/              # Test data files
│   └── reporter/          # Custom reporters
├── testConfig/            # Test configuration files
├── test-results/          # Test execution results
└── playwright-report/     # HTML reports
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
npx playwright install
```

### Environment Setup

1. Copy environment template:

```bash
cp .env.dev .env
```

2. Update environment variables in `.env` file with your credentials

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests in development environment
npm run test:dev

# Run tests headlessly
npm run test:dev:headless

# Run only UI tests
npm run test:ui

# Run only API tests
npm run test:api

# Run tests in debug mode
npm run test:debug
```
