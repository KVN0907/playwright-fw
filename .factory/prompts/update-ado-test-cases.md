# Update ADO Test Cases with Execution Results

## Purpose

This prompt guides the process of updating Azure DevOps test cases with execution results from automated test runs.

## Prerequisites

- Test execution completed (Playwright tests run against target environment)
- Test execution report generated at `tests/automation/test-results/`
- Access to Azure DevOps project: `eycompliancemanager`

## Input Required

1. **Test Execution Report** - Located at `tests/automation/test-results/` (e.g., `Sprint1-API-Test-Execution-Report.md`)
2. **Environment** - QA, DEV, or Production
3. **Execution Date** - Date when tests were executed

## Process Steps

### Step 1: Locate and Read Test Execution Report

Find the latest test execution report in `tests/automation/test-results/` directory. The report contains:

- Summary metrics (Total, Passed, Failed, Skipped)
- Test cases organized by Story
- Test Case IDs (ADO-XXXXXX format)
- Status (PASSED/FAILED/SKIPPED)
- Bug IDs for failed tests
- Root cause information

### Step 2: Extract Test Case Data

From the report, extract for each test case:

- **Test Case ID**: The numeric ID after "ADO-" prefix
- **Status**: PASSED, FAILED, or SKIPPED
- **Bug ID**: If failed, the associated bug number
- **Root Cause**: Brief description of failure reason

### Step 3: Update ADO Test Cases

For each test case in the report, add a comment with the following format:

**For PASSED tests:**

```
**Test Execution Result (YYYY-MM-DD)**
**Status:** PASSED
**Environment:** [QA/DEV/PROD]
```

**For FAILED tests:**

```
**Test Execution Result (YYYY-MM-DD)**
**Status:** FAILED
**Environment:** [QA/DEV/PROD]
**Bug:** #[BUG_ID]
**Root Cause:** [Brief description]
```

**For SKIPPED tests:**

```
**Test Execution Result (YYYY-MM-DD)**
**Status:** SKIPPED
**Environment:** [QA/DEV/PROD]
**Note:** [Reason for skip, e.g., "Test skipped due to dependency on user creation"]
```

### Step 4: Handle Missing Test Cases

If a test case ID doesn't exist in ADO:

1. Note the missing IDs
2. Continue with existing test cases
3. Report missing IDs at the end

### Step 5: Verification

After updates, confirm:

- Total test cases updated matches report
- Failed tests have bug links
- Skipped tests have skip reasons

## Example Command Flow

```
1. Read test execution report from tests/automation/test-results/
2. Parse test case statuses by story
3. For each story:
   - Update PASSED test cases with success comment
   - Update FAILED test cases with bug reference
   - Update SKIPPED test cases with skip reason
4. Report summary of updates
```

## ADO API Notes

- Use `ado___wit_add_work_item_comment` to add execution results
- Project: `eycompliancemanager`
- Work Item IDs are numeric (strip "ADO-" prefix)
- API may rate limit - batch requests appropriately

## Output

Provide summary including:

- Number of test cases updated per story
- Count of PASSED/FAILED/SKIPPED
- Any test cases that couldn't be found
- Any API errors encountered

---

## Bug Creation Process

### When to Create Bugs

Create a bug when:

- A test case FAILS due to an API/application issue
- The failure is NOT due to test environment issues
- No existing bug covers the same issue

### Step 1: Get Parent Story Details

Before creating a bug, retrieve the parent story to get:

- **Story Owner** (System.AssignedTo) - Bug will be assigned to this person
- **Area Path** - Bug should use same area path
- **Iteration Path** - Bug should use same iteration path
- **Story ID** - For linking bug as child

Use `ado___wit_get_work_item` with the story ID to get these details.

### Step 2: Create Bug with Required Fields

```
Title: [Brief description of the failure]
Work Item Type: Bug
Fields:
  - System.Title: "[API/Feature] - [Issue Description]"
  - System.AssignedTo: [Story Owner from parent story]
  - System.AreaPath: [Same as parent story]
  - System.IterationPath: [Same as parent story]
  - System.Tags: "api-bug; automation-detected; [sprint-tag]"
  - Microsoft.VSTS.Common.Severity: [1-Critical/2-High/3-Medium/4-Low]
  - Microsoft.VSTS.Common.Priority: [1/2/3]
  - System.Description: [Detailed bug description - see template below]
```

### Step 3: Bug Description Template

```html
<h3>Summary</h3>
<p>[Brief description of the issue]</p>

<h3>Environment</h3>
<ul>
  <li><b>Environment:</b> [QA/DEV/PROD]</li>
  <li><b>Base URL:</b> [API base URL]</li>
  <li><b>Test Execution Date:</b> [YYYY-MM-DD]</li>
</ul>

<h3>Steps to Reproduce</h3>
<ol>
  <li>[Step 1]</li>
  <li>[Step 2]</li>
  <li>[Step 3]</li>
</ol>

<h3>Expected Result</h3>
<p>[What should happen]</p>

<h3>Actual Result</h3>
<p>[What actually happened]</p>

<h3>API Details</h3>
<ul>
  <li><b>Endpoint:</b> [HTTP Method] [Endpoint URL]</li>
  <li><b>Response Code:</b> [Actual response code]</li>
  <li><b>Expected Code:</b> [Expected response code]</li>
</ul>

<h3>Affected Test Cases</h3>
<ul>
  <li>ADO-[Test Case ID 1] - [Test Case Title]</li>
  <li>ADO-[Test Case ID 2] - [Test Case Title]</li>
</ul>

<h3>Root Cause Analysis</h3>
<p>[Initial analysis of why this is failing]</p>
```

### Step 4: Link Bug to Parent Story

After creating the bug, link it as a child to the parent story:

```
Use: ado___wit_work_items_link
Parameters:
  - project: "eycompliancemanager"
  - updates: [
      {
        "id": [BUG_ID],
        "linkToId": [STORY_ID],
        "type": "child"
      }
    ]
```

### Step 5: Link Bug to Failed Test Cases

Link the bug to each failed test case using "Tested By" relationship:

```
Use: ado___wit_work_items_link
Parameters:
  - project: "eycompliancemanager"
  - updates: [
      {
        "id": [TEST_CASE_ID],
        "linkToId": [BUG_ID],
        "type": "tested by"
      }
    ]
```

### Severity Guidelines

| Severity     | Criteria                                          |
| ------------ | ------------------------------------------------- |
| 1 - Critical | API completely non-functional, blocks all testing |
| 2 - High     | Major feature broken, no workaround available     |
| 3 - Medium   | Feature partially working, workaround exists      |
| 4 - Low      | Minor issue, cosmetic, or edge case               |

### Tag Conventions

| Tag                        | Usage                         |
| -------------------------- | ----------------------------- |
| `api-bug`                  | All API-related bugs          |
| `automation-detected`      | Bugs found by automated tests |
| `sprint1` / `sprint2` etc. | Sprint identifier             |
| `security`                 | Security-related issues       |
| `validation`               | Input validation issues       |
| `performance`              | Performance-related issues    |
| `blocking`                 | Blocks other test execution   |

---

## Complete Workflow Example

```
1. Run automated tests
2. Generate test execution report
3. For each FAILED test case:
   a. Check if bug already exists for the issue
   b. If no existing bug:
      - Get parent story details (owner, area, iteration)
      - Create bug with proper fields and tags
      - Link bug as child to parent story
   c. Add execution comment to test case with bug reference
4. For PASSED/SKIPPED test cases:
   - Add execution comment only
5. Generate summary report
```

---

## ADO API Quick Reference

| Action                | Tool                              |
| --------------------- | --------------------------------- |
| Get work item details | `ado___wit_get_work_item`         |
| Create bug            | `ado___wit_create_work_item`      |
| Add comment           | `ado___wit_add_work_item_comment` |
| Link work items       | `ado___wit_work_items_link`       |
| Search work items     | `ado___search_workitem`           |
| Update work item      | `ado___wit_update_work_item`      |

---

## Related Files

- Test specs: `tests/automation/src/tests/api/Sprint*/`
- Test data: `tests/automation/src/tests/data/`
- Reports: `tests/automation/test-results/`
