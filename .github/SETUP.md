# GitHub Actions Setup for Document360 Tests

## Required Repository Secrets

To run the Document360 API Documentation tests in GitHub Actions, you need to set up the following repository secrets:

### 🔐 Secrets Configuration

Go to your repository → Settings → Secrets and variables → Actions, then add:

| Secret Name   | Value                 | Description                |
| ------------- | --------------------- | -------------------------- |
| `QA_USERNAME` | `kvn0907@zohomail.in` | Document360 login email    |
| `QA_PASSWORD` | `[your-password]`     | Document360 login password |

### 🎯 Workflow Features

The updated workflow includes:

#### **Multi-Browser Testing**

- ✅ Chromium (Chrome,ms edge)
- ✅ Firefox
- ✅ WebKit (Safari)

#### **Test Strategy**

- **Authentication Tests**: Run first to verify login functionality
- **API Documentation Tests**: Run comprehensive workflow tests
- **Cross-browser compatibility**: Ensure tests work across all browsers

#### **Reporting & Artifacts**

- 📊 Enhanced HTML reports per browser
- 📈 Consolidated test reports
- 🏠 GitHub Pages deployment for main branch
- 📁 Test artifacts with 30-day retention

#### **Trigger Conditions**

- **Push**: `main`, `master`, `feature/*` branches
- **Pull Request**: to `main`/`master`
- **Schedule**: Daily at 6 AM UTC
- **Manual**: Can be triggered manually from Actions tab

#### **Environment Configuration**

- 🌐 **QA Environment**: Tests run against `https://portal.document360.io/`
- 📱 **Responsive**: Tests work across different viewport sizes
- 🔄 **Retry Logic**: Built-in retry for flaky tests

### 🚀 Usage

Once secrets are configured, the workflow will:

1. **Authenticate** with Document360 using your credentials
2. **Run Authentication Tests** to verify login works
3. **Execute API Documentation Tests** covering:
   - User authentication & project access
   - Content management workflows
   - Publishing workflows
4. **Generate Reports** with detailed test results
5. **Deploy Reports** to GitHub Pages (main branch only)

### 📋 Local Development

For local testing, ensure your `.env.qa` file contains:

```env
QA_APP_URL=https://portal.document360.io/
QA_USERNAME=kvn0907@zohomail.in
QA_PASSWORD=[your-password]
NODE_ENV=qa
```

### 🐛 Troubleshooting

**Common Issues:**

1. **Secret Not Found**: Ensure secrets are named exactly as shown above
2. **Login Failures**: Verify credentials are correct and account is active
3. **Test Timeouts**: Document360 may have rate limiting - workflow includes appropriate delays

**Debugging:**

- Check the "Actions" tab for detailed logs
- Download test artifacts for screenshots and traces
- Review the enhanced HTML reports for detailed failure analysis

### 🔍 Monitoring

The workflow provides:

- ✅ **Test Status**: Pass/fail status for each browser
- 📊 **Execution Time**: Performance metrics across browsers
- 🎯 **Success Rate**: Historical test reliability data
- 📈 **Trends**: Test performance over time

This setup ensures robust, reliable testing of the Document360 API Documentation module with comprehensive reporting and cross-browser validation.
