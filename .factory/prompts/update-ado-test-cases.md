# Execute Tests and Update ADO for a Story

## Purpose

This prompt guides the complete process of executing automated tests for a story, creating bugs for failures, and updating Azure DevOps with all results.

## Quick Command

When user says: **"Execute the tests for [STORY_ID] and raise bugs for valid failures"**

Follow the complete workflow below.

---

## Complete Workflow

### Phase 1: Test Discovery and Execution

#### Step 1.1: Find Test File

```
Location: tests/automation/src/tests/api/Sprint*/[STORY_ID]-*.spec.ts
```

Read the test file to understand:

- All test case IDs (@ADO-XXXXXX tags)
- Test scenarios covered
- API endpoints being tested

#### Step 1.2: Execute Tests

Run Playwright tests in batches to avoid timeouts:

```powershell
cd "C:\EYCM-CORE\eycompliancemanager\tests\automation"
npx playwright test "src/tests/api/Sprint1/[STORY_ID]-*.spec.ts" --grep "@ADO-204122|@ADO-204124|@ADO-204125" --reporter=list --timeout=120000
```

**Note:** Run tests in groups of 3-5 to avoid timeout issues.

#### Step 1.3: Collect Results

Track results for each test case:

- Test Case ID
- Status (PASSED/FAILED)
- Error message if failed
- HTTP status codes received vs expected

---

### Phase 2: Bug Creation for Failures

#### Step 2.1: Get Story Details

```
Use: ado___wit_get_work_item
Parameters:
  - project: "eycompliancemanager"
  - id: [STORY_ID]
```

Extract from story:

- **Assigned To** - Bugs will be assigned to this person
- **Story Title** - For reference

**IMPORTANT - Required Field Values:**

- **Area Path** - MUST be `eycompliancemanager\MVP1`
- **Iteration Path** - MUST be the current sprint (e.g., `eycompliancemanager\Sprint 5`)

#### Step 2.2: Analyze Failures and Group

Group failures by root cause to create consolidated bugs:

- File type validation failures → 1 bug
- Content validation failures → 1 bug
- Server stability issues → 1 bug
- etc.

#### Step 2.3: Create Bugs with Detailed Repro Steps

Use `ado___wit_create_work_item` with these fields:

```
Work Item Type: Bug
Fields:
  - System.Title: "[API] [Brief Issue Description]"
  - System.AssignedTo: [Story Owner Email]
  - System.AreaPath: "eycompliancemanager\\MVP1"  # REQUIRED - Always use MVP1
  - System.IterationPath: "eycompliancemanager\\Sprint X"  # REQUIRED - Use current sprint
  - System.Tags: "api-bug; automation-detected; sprintX; [category]"
  - Custom.TestPhase: "QA"
  - Microsoft.VSTS.Common.Severity: "2 - High"
  - Microsoft.VSTS.Common.Priority: 2
  - Microsoft.VSTS.TCM.ReproSteps: [DETAILED HTML - see template below]
```

**Note:** Always set Area Path to `eycompliancemanager\MVP1` and Iteration Path to the current sprint.

#### Step 2.4: Detailed Repro Steps Template (REQUIRED FORMAT)

```html
<h3>Summary</h3>
<p>[One paragraph describing the issue clearly]</p>

<h3>Environment</h3>
<ul>
  <li><b>Environment:</b> QA</li>
  <li><b>Base URL:</b> https://eycompliancemanager-dev.ey.com/</li>
  <li><b>Test Execution Date:</b> [YYYY-MM-DD]</li>
</ul>

<h3>Steps to Reproduce</h3>
<ol>
  <li>[Detailed step 1]</li>
  <li>[Detailed step 2]</li>
  <li>[Detailed step 3]</li>
  <li>[Observe the error]</li>
</ol>

<h3>Expected Result</h3>
<p>[What should happen - be specific about HTTP codes and messages]</p>

<h3>Actual Result</h3>
<p>[What actually happened - include actual HTTP codes and error messages]</p>

<h3>API Details</h3>
<ul>
  <li><b>Endpoint:</b> [HTTP Method] [Endpoint URL]</li>
  <li><b>Content-Type:</b> [Content type]</li>
  <li><b>Response Code:</b> [Actual code]</li>
  <li><b>Expected Code:</b> [Expected code(s)]</li>
</ul>

<h3>Request Details - Test Case 1 ([Scenario Name])</h3>
<pre>[Full request details including parameters, headers, file info]</pre>

<h3>Request Details - Test Case 2 ([Scenario Name])</h3>
<pre>[If multiple scenarios fail for same bug]</pre>

<h3>Response Details</h3>
<pre>[Full JSON error response]</pre>

<h3>Test Code Reference</h3>
<pre>[Relevant test code snippet showing what was tested]</pre>

<h3>Affected Test Cases</h3>
<ul>
  <li>ADO-[ID] - [Test Case Title]</li>
  <li>ADO-[ID] - [Test Case Title]</li>
</ul>

<h3>Root Cause Analysis</h3>
<p>[Technical analysis of why this is failing - mention specific code/components if known]</p>

<h3>Impact</h3>
<p><b>[CRITICAL/HIGH/MEDIUM/LOW]:</b> [Description of impact on users/system]</p>
```

#### Step 2.5: Link Bugs to Story

```
Use: ado___wit_work_items_link
Parameters:
  - project: "eycompliancemanager"
  - updates: [{"id": [BUG_ID], "linkToId": [STORY_ID], "type": "related"}]
```

**Note:** Use "related" link type (not "child") due to hierarchy constraints.

---

### Phase 3: Link Test Cases to Bugs

#### Step 3.1: Create "Tested By" Links

For each failed test case, link it to the corresponding bug:

```
Use: ado___wit_work_items_link
Parameters:
  - project: "eycompliancemanager"
  - updates: [
      {"id": [TEST_CASE_ID], "linkToId": [BUG_ID], "type": "tested by", "comment": "[Brief failure description]"}
    ]
```

---

### Phase 4: Update Test Cases

#### Step 4.1: Update Test Case State

```
Use: ado___wit_update_work_item
Parameters:
  - id: [TEST_CASE_ID]
  - updates: [{"path": "/fields/System.State", "value": "Ready"}]
```

#### Step 4.2: Add Execution Comments

**For PASSED tests:**

```html
<b>Test Execution - [YYYY-MM-DD HH:MM]</b><br /><br />
<b>Result: PASSED</b><br />
Environment: QA (https://eycompliancemanager-dev.ey.com)<br />
Duration: [X.Xs]<br /><br />
[Brief success description]
```

**For FAILED tests:**

```html
<b>Test Execution - [YYYY-MM-DD HH:MM]</b><br /><br />
<b>Result: FAILED</b><br />
Environment: QA (https://eycompliancemanager-dev.ey.com)<br /><br />
<b>Failure Details:</b><br />
[Specific failure info - expected vs actual]<br /><br />
<b>Linked Bug:</b> #[BUG_ID]
```

---

### Phase 5: Final Summary

Provide a summary table:

```
| Test Case | Title | Result | Bug |
|-----------|-------|--------|-----|
| ADO-XXXXX | [Title] | PASSED/FAILED | #XXXXX |
```

And totals:

- X Passed (XX%)
- X Failed (XX%)
- X Bugs raised

---

## Tag Conventions

| Tag                   | Usage                         |
| --------------------- | ----------------------------- |
| `api-bug`             | All API-related bugs          |
| `automation-detected` | Bugs found by automated tests |
| `sprint1` / `sprint2` | Sprint identifier             |
| `validation`          | Input validation issues       |
| `stability`           | Server stability/crash issues |
| `security`            | Security-related issues       |

---

## Severity Guidelines

| Severity     | Criteria                                          |
| ------------ | ------------------------------------------------- |
| 1 - Critical | API completely non-functional, blocks all testing |
| 2 - High     | Major feature broken, returns 500 errors          |
| 3 - Medium   | Feature partially working, workaround exists      |
| 4 - Low      | Minor issue, cosmetic, or edge case               |

---

## ADO API Quick Reference

| Action           | Tool                              |
| ---------------- | --------------------------------- |
| Get work item    | `ado___wit_get_work_item`         |
| Create bug       | `ado___wit_create_work_item`      |
| Update work item | `ado___wit_update_work_item`      |
| Add comment      | `ado___wit_add_work_item_comment` |
| Link work items  | `ado___wit_work_items_link`       |
| List test plans  | `ado___testplan_list_test_plans`  |

---

## Example Reference Bug

See Bug #278784 for the expected format of detailed repro steps.

---

## Legacy: Update from Existing Report

If a test execution report already exists, follow the process below instead.

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
  - System.AreaPath: "eycompliancemanager\\MVP1"  # REQUIRED - Always use MVP1
  - System.IterationPath: "eycompliancemanager\\Sprint X"  # REQUIRED - Use current sprint
  - System.Tags: "api-bug; automation-detected; [sprint-tag]"
  - Custom.TestPhase: "QA"  # REQUIRED field
  - Microsoft.VSTS.Common.Severity: [1-Critical/2-High/3-Medium/4-Low]
  - Microsoft.VSTS.Common.Priority: [1/2/3]
  - System.Description: [Detailed bug description - see template below]
```

**IMPORTANT:** Area Path MUST be `eycompliancemanager\MVP1` and Iteration Path MUST be the current sprint.

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
