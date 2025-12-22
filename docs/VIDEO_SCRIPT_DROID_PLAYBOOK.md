# Video Script: Droid + Playwright Playbook Walkthrough

## Video Details

- **Duration:** 12-15 minutes
- **Format:** Screen recording with voiceover
- **Target Audience:** Developers, QE Engineers, Product Team Members

---

## Pre-Recording Checklist

- [ ] VS Code open with Factory.ai Droid extension installed
- [ ] Project `tests/automation/` folder open
- [ ] Terminal ready with `npm run test:qa` command
- [ ] Sample ADO story ready (e.g., #197592)
- [ ] Clean test environment (no pending changes)
- [ ] Screen resolution: 1920x1080 minimum
- [ ] Microphone tested

---

## SCENE 1: Introduction (1 minute)

### Visual

- Title card: "Factory.ai Droid + Playwright: Accelerating Test Automation"
- Fade to VS Code with automation project open

### Script

```
"Welcome to the Droid and Playwright Symphony. In the next 15 minutes,
you'll learn how to leverage AI-assisted development to accelerate your
test automation, regardless of your QE background.

By the end of this walkthrough, you'll be able to:
- Generate comprehensive API and UI tests from natural language descriptions
- Link tests directly to ADO work items
- Expand test coverage with edge cases and security scenarios
- Debug and improve existing tests

Let's begin with a simple example."
```

---

## SCENE 2: Quick Start - Your First Generated Test (3 minutes)

### Visual

1. Show empty test file or folder structure
2. Open Droid with `Cmd/Ctrl + I`
3. Type prompt and show generation in real-time
4. Run the generated test

### Actions to Record

**Step 1: Open Droid**

- Press `Cmd + I` (Mac) or `Ctrl + I` (Windows)
- Show the Droid chat panel opening

**Step 2: Enter Prompt**

```
Create a simple API test for the /api/admin/api/ey-admins endpoint that:
- Makes a GET request to list all EY admins
- Verifies the response status is 200
- Validates the response is an array
Use our framework's fixtures pattern
```

**Step 3: Show Generation**

- Droid generates the test code
- Highlight key parts: imports, test structure, assertions

**Step 4: Run Test**

```bash
npm test -- --grep "list all EY admins"
```

### Script

```
"Let's start by opening Droid. Press Command-I on Mac or Control-I on Windows.

Now I'll describe what I need in plain English: 'Create a simple API test
for the ey-admins endpoint that makes a GET request and validates the response.'

Watch as Droid analyzes our framework patterns and generates a complete test.
Notice it automatically:
- Uses our advancedFixtures import
- Follows our test structure conventions
- Adds proper assertions
- Includes descriptive test names

Let's run this test to verify it works... And there we go - passing test
in under 30 seconds from prompt to execution."
```

---

## SCENE 3: Generating Tests from ADO Stories (3 minutes)

### Visual

1. Show ADO story #197592 in browser (brief)
2. Return to VS Code
3. Use Droid to generate comprehensive tests
4. Show generated test file

### Actions to Record

**Step 1: Show ADO Context**

- Briefly show ADO story #197592 with acceptance criteria

**Step 2: Enter Comprehensive Prompt**

```
Read the acceptance criteria for creating EY Admin users and generate
comprehensive API tests including:
- Success case: valid user creation
- Validation: missing fields, invalid email format
- Security: XSS injection, SQL injection attempts
- Edge cases: duplicate email, case sensitivity
- Tag each test with @ADO-{testCaseId}
```

**Step 3: Review Generated Tests**

- Scroll through generated tests
- Highlight ADO tags
- Point out test categories (validation, security, edge cases)

### Script

```
"Now let's tackle a real-world scenario. I have ADO Story 197592 about
creating EY Admin users. Instead of manually reading through acceptance
criteria and writing tests one by one, I'll ask Droid to generate
comprehensive coverage.

Watch as Droid creates not just happy-path tests, but also:
- Validation tests for missing fields and invalid formats
- Security tests for XSS and SQL injection
- Edge cases like duplicate emails and case sensitivity

Notice each test is tagged with the corresponding ADO test case ID, making
traceability automatic. This would typically take hours of manual work -
Droid did it in seconds."
```

---

## SCENE 4: UI Test Generation with Page Objects (3 minutes)

### Visual

1. Show existing Page Object file
2. Generate UI tests using the Page Object
3. Show test execution with visible browser

### Actions to Record

**Step 1: Show Page Object**

- Open `EYAdminUserManagementPage.ts`
- Highlight key methods: `createEYAdmin`, `verifyUserInTable`

**Step 2: Generate UI Tests**

```
Create UI tests for the User Management page that:
- Test the complete user creation flow
- Validate form field requirements
- Test keyboard navigation (Tab order)
- Check error message display
Use the EYAdminUserManagementPage object
```

**Step 3: Run with Visible Browser**

```bash
npm run test:headed -- --grep "User Management"
```

### Script

```
"UI testing follows the same pattern. Here's our Page Object for User
Management - it encapsulates all the locators and actions for this page.

I'll ask Droid to generate tests that use this Page Object. Notice I'm
requesting not just functional tests, but also UX validations like
keyboard navigation.

Let's run these with a visible browser so you can see the automation
in action... The test opens the dialog, fills the form, submits, and
verifies the result - all automatically generated from my description."
```

---

## SCENE 5: Enhancing & Debugging Tests (2 minutes)

### Visual

1. Show a failing or flaky test
2. Use Droid to diagnose and fix
3. Show improved test passing

### Actions to Record

**Step 1: Show Problem Test**

- Open a test with timing issues or flakiness

**Step 2: Ask Droid for Help**

```
This test fails intermittently. Analyze it and:
1. Identify the timing/race condition issue
2. Add proper waits or assertions
3. Improve the reliability
```

**Step 3: Show Fixed Test**

- Apply Droid's suggestions
- Run test multiple times to show stability

### Script

```
"What about existing tests that are flaky or failing? Here's a test that
passes sometimes but fails randomly.

I'll ask Droid to analyze it. Droid identifies that we're not waiting
for the network response before asserting, causing a race condition.

The fix adds a waitForResponse before the assertion. Let's run it
several times... consistently passing now. Droid saved me 30 minutes
of debugging."
```

---

## SCENE 6: Best Practices & Tips (2 minutes)

### Visual

- Split screen or bullet points overlay
- Show good vs bad prompt examples

### Script

```
"A few best practices for getting the most out of Droid:

First, be specific. Instead of 'write some tests,' say 'create CRUD
tests for the clients endpoint with validation scenarios.'

Second, reference existing patterns. Say 'follow the pattern in
197592-create-users.spec.ts' and Droid will match your conventions.

Third, always request tags. Adding '@regression @ADO-12345' makes
your tests discoverable and traceable.

Fourth, ask for edge cases explicitly. 'Include boundary values,
security tests, and error scenarios' gives you comprehensive coverage.

And finally, iterate. If the first generation isn't perfect, refine
your prompt or ask Droid to improve specific areas."
```

---

## SCENE 7: Closing & Call to Action (1 minute)

### Visual

- Show completed test suite
- Display test report
- End card with resources

### Script

```
"In just 15 minutes, we've generated comprehensive API and UI tests,
linked them to ADO work items, and fixed a flaky test - all with
natural language prompts.

This approach lets anyone on the team contribute to test automation,
freeing your QE specialists for higher-order activities like test
strategy, exploratory testing, and quality coaching.

The playbook document in your docs folder has more examples, prompt
templates, and command references. Start with a simple test, build
confidence, and expand from there.

Happy testing!"
```

---

## Recording Tips

### Audio

- Speak clearly and at moderate pace
- Pause briefly before each major action
- Avoid filler words ("um", "uh")

### Visual

- Zoom VS Code to 125% for readability
- Use a clean terminal (no error messages)
- Highlight cursor movements for clarity

### Editing Notes

- Add chapter markers for each scene
- Include captions/subtitles
- Add on-screen text for key commands

---

## Post-Production

### Suggested Overlays

| Timestamp | Overlay Text                      |
| --------- | --------------------------------- |
| 0:00      | "Droid + Playwright Playbook"     |
| 0:30      | "What You'll Learn" (bullet list) |
| 1:00      | "Quick Start"                     |
| 4:00      | "ADO Integration"                 |
| 7:00      | "UI Testing"                      |
| 10:00     | "Debugging Tips"                  |
| 12:00     | "Best Practices"                  |

### Call-to-Action Slide

```
Get Started Today:
1. Open any test file in VS Code
2. Press Cmd/Ctrl + I to open Droid
3. Describe your test in plain English

Resources:
- docs/DROID_PLAYWRIGHT_PLAYBOOK.md
- docs/FRAMEWORK_OVERVIEW.md
- Ask #qa-automation on Slack
```

---

_Video Script Version: 1.0 | Last Updated: December 2024_
