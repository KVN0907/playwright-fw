# Test Profiles

Profiles allow you to overlay additional configuration on top of your base environment settings.

## Available Profiles

### 🔥 Smoke (`smoke.env`)

Fast smoke tests with minimal coverage

- Quick execution
- No retries
- Minimal reporting

```bash
PROFILE=smoke npm run test:qa
```

### 🔄 Regression (`regression.env`)

Comprehensive testing with full coverage

- Extended timeouts
- Full retries
- Complete reporting

```bash
PROFILE=regression npm run test:qa
```

### 📱 Mobile (`mobile.env`)

Mobile device testing configuration

- Visible browser
- Slower execution for visibility
- Full capture

```bash
PROFILE=mobile npm run test:qa
```

### ⚡ Performance (`performance.env`)

Optimized for speed

- Maximum parallelization
- Minimal reporting
- No retries

```bash
PROFILE=performance npm run test:qa
```

### 🐛 Debug (`debug.env`)

Full visibility for debugging

- Visible browser
- Slow motion
- Single worker
- Full capture

```bash
PROFILE=debug npm run test:qa
```

## How Profiles Work

1. **Base Environment**: Loaded first from `config/environments/{env}.env`
2. **Profile Overlay**: Applied on top, overriding base settings
3. **Result**: Merged configuration

### Example

```bash
# QA environment with smoke profile
NODE_ENV=qa PROFILE=smoke npm test

# Dev environment with debug profile
NODE_ENV=dev PROFILE=debug npm test

# Staging with regression profile
NODE_ENV=staging PROFILE=regression npm test
```

## Creating Custom Profiles

Create a new file in `config/profiles/`:

```env
# config/profiles/my-profile.env
TIMEOUT=30000
RETRIES=1
HEADLESS=true
# ... your settings
```

Use it:

```bash
PROFILE=my-profile npm run test:qa
```

## Profile Priority

Settings are applied in this order (later overrides earlier):

1. Default values in ConfigManager
2. Environment file (`config/environments/{env}.env`)
3. Profile file (`config/profiles/{profile}.env`)
4. Process environment variables

## Common Use Cases

### Run Smoke Tests Before Deployment

```bash
PROFILE=smoke npm run test:prod
```

### Debug Failing Test

```bash
PROFILE=debug npm test -- path/to/failing-test.spec.ts
```

### Mobile Testing

```bash
PROFILE=mobile npm run test:qa -- --grep @mobile
```

### Performance Benchmarking

```bash
PROFILE=performance npm run test:qa -- --grep @performance
```
