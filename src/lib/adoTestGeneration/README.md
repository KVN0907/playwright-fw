# ADO Test Generation CLI

A command-line interface for generating Playwright tests from Azure DevOps work items.

## Quick Start

1. **Test Connection**
   ```bash
   npm run generate-from-ado -- --test-only
   ```

2. **Analyze Work Items** (recommended first step)
   ```bash
   npm run generate-from-ado -- --workItems 197716,198403,198402 --analyze
   ```

3. **Generate Tests**
   ```bash
   npm run generate-from-ado -- --workItems 197716,198403,198402
   ```

## Configuration

Edit `config/environments/ado.env` to configure ADO connection:

```bash
# Azure DevOps Configuration
ADO_ORGANIZATION=EYGS2
ADO_PROJECT=eycompliancemanager
ADO_BASE_URL=https://dev.azure.com
ADO_API_VERSION=7.0
ADO_PERSONAL_ACCESS_TOKEN=your-pat-token-here

# Test Generation Configuration
ADO_DEFAULT_TEST_TYPE=UI
ADO_INCLUDE_PAGE_OBJECTS=true
ADO_PREFER_TEST_CASES=true

# Output Paths (relative to project root)
ADO_API_TESTS_PATH=src/tests/api
ADO_UI_TESTS_PATH=src/tests/ui/e2e
ADO_PAGE_OBJECTS_PATH=src/pages/common
```

## CLI Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--workItems` | `-w` | Generate tests for specific work item IDs (comma-separated) | `--workItems 12345,12346` |
| `--env` | `-e` | Specify environment config file (default: ado) | `--env dev`, `--env qa` |
| `--analyze` | | Only analyze work item content (don't generate tests) | `--workItems 12345 --analyze` |
| `--test-only` | | Test ADO connection only | `--test-only` |
| `--help` | `-h` | Show help message | `--help` |

## Examples

### Test ADO Connection
```bash
npm run generate-from-ado -- --test-only
```

### Analyze Work Items First
```bash
npm run generate-from-ado -- --workItems 197716,198403,198402 --analyze
```

### Generate Tests from Work Items
```bash
npm run generate-from-ado -- --workItems 197716,198403,198402
```

### Use Different Environment
```bash
# Use custom environment file
npm run generate-from-ado -- --env qa --workItems 197716,198403 --analyze

# Default is ado.env, but you can specify others
npm run generate-from-ado -- --env dev --test-only
```

### Get Help
```bash
npm run generate-from-ado -- --help
```

## Output Structure

Generated test files are automatically routed based on test type detection:

- **API tests**: `src/tests/api/`
- **UI tests**: `src/tests/ui/e2e/`
- **Page objects**: `src/pages/common/` (UI tests only)

## Requirements

- Work items must have acceptance criteria for test generation
- Valid Azure DevOps Personal Access Token
- Network access to Azure DevOps organization

## Troubleshooting

### Connection Issues
```bash
# Test connection first
npm run generate-from-ado -- --test-only

# Check logs in console for specific error messages
```

### No Tests Generated
- Work items might not have acceptance criteria
- Use `--analyze` flag to check content first
- Verify work item IDs exist and are accessible

### Permission Errors
- Ensure Personal Access Token has correct permissions:
  - Work Items (Read)
  - Project and Team (Read)

## Integration with Existing Workflow

This CLI integrates with your existing Playwright framework:

1. **Fetches work items** from Azure DevOps
2. **Analyzes content** for acceptance criteria and test cases
3. **Detects test type** (API vs UI) automatically
4. **Routes generated files** to appropriate folders
5. **Uses existing** Playwright patterns and page objects

## Current ADO Project

- **Organization**: EYGS2
- **Project**: eycompliancemanager
- **Found work items**: 197716, 198403, 198402, etc.
- **Status**: Connection successful ✅