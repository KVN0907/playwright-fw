# Azure DevOps MCP + ADOHelper Integration

## Quick Reference

### Azure DevOps MCP (Interactive via Droid)

```bash
# In Droid CLI
"List all Azure DevOps projects"
"Get my assigned work items in eycompliancemanager"
"Find work items with acceptance criteria"
```

### NPM Scripts (Automation)

```bash
npm run sprint:coverage              # Analyze test automation readiness
npm run generate:from-mcp -- <IDs>   # Generate tests from work items
```

---

## Overview

**Azure DevOps MCP** - Interactive queries via Droid CLI  
**ADOHelper** - Programmatic test generation automation

---

## Usage Examples

### 1. Find and Generate Tests

```bash
# Step 1: Find work items (Droid)
"Find work items with acceptance criteria in eycompliancemanager"

# Step 2: Generate tests
npm run generate:from-mcp -- 252423 240490 240426
```

### 2. Sprint Coverage Analysis

```bash
npm run sprint:coverage
```

---

## Workflow Scripts

**Available Scripts:**

- `scripts/generate-tests-from-mcp.ts` - Generate tests from discovered work items
- `scripts/sprint-test-coverage.ts` - Analyze sprint test automation readiness

**Usage:**

```bash
npm run generate:from-mcp -- 12345 67890
npm run sprint:coverage
```

---

## Environment Setup

Add to `config/environments/ado.env`:

```env
ADO_ORGANIZATION=EYGS2
ADO_PROJECT=eycompliancemanager
ADO_PAT=your-pat-token
```

MCP is configured at: `~/.factory/mcp.json`

---

## Troubleshooting

**MCP not working?** Check `/mcp` in Droid CLI  
**Scripts failing?** Verify `ADO_ORGANIZATION`, `ADO_PROJECT`, `ADO_PAT` environment variables
