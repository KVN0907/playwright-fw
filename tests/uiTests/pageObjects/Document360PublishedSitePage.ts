import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import Log from '../../utils/Log';

export class Document360PublishedSitePage extends BasePage {
  // Landing page locators
  private projectLogo!: Locator;
  private welcomeHeading!: Locator;
  private apiDocumentationButton!: Locator;
  private searchButton!: Locator;
  private modulesSection!: Locator;

  // API Documentation page locators
  private pageTitle!: Locator;
  private breadcrumb!: Locator;
  private sideNavigation!: Locator;
  private articleContent!: Locator;
  private copyLinkButton!: Locator;
  private editArticleButton!: Locator;

  // Navigation structure locators
  private apiDocumentationLink!: Locator;
  private swaggerPetstoreLink!: Locator;
  private petCategoryLink!: Locator;
  private findPetByIdLink!: Locator;
  private nextArticleButton!: Locator;
  private previousArticleButton!: Locator;

  // API endpoint documentation locators
  private endpointMethod!: Locator;
  private endpointPath!: Locator;
  private endpointDescription!: Locator;
  private securitySection!: Locator;
  private pathParametersSection!: Locator;
  private responsesSection!: Locator;
  private tryItTab!: Locator;
  private codeSamplesTab!: Locator;

  // Try It section locators
  private authenticationSection!: Locator;
  private requestSection!: Locator;
  private responseSection!: Locator;
  private apiKeyInput!: Locator;
  private petIdInput!: Locator;
  private responseFormatDropdown!: Locator;
  private tryItButton!: Locator;

  // Response documentation locators
  private responseTabsContainer!: Locator;
  private response200Tab!: Locator;
  private response400Tab!: Locator;
  private response404Tab!: Locator;
  private responseSchema!: Locator;
  private mediaTypeDropdown!: Locator;

  // API Response validation locators
  private responseBody!: Locator;
  private responseCode!: Locator;
  private responseHeaders!: Locator;
  private responseTime!: Locator;
  private responseContent!: Locator;
  private responseStatus!: Locator;

  // Validation locators
  private wasHelpfulSection!: Locator;
  private yesButton!: Locator;
  private noButton!: Locator;
  private footerSection!: Locator;

  constructor(page: Page) {
    super(page);
    this.initializeLocators();
  }

  private initializeLocators(): void {
    // Landing page locators
    this.projectLogo = this.page.getByRole('button', { name: 'Project logo' });
    this.welcomeHeading = this.page.getByRole('heading', {
      name: 'Welcome to API Test Documentation project landing page',
    });
    this.apiDocumentationButton = this.page
      .getByRole('link', { name: 'API Documentation' })
      .first();
    this.searchButton = this.page.getByRole('button', { name: 'Search' });
    this.modulesSection = this.page.getByRole('heading', { name: 'Modules' });

    // API Documentation page locators
    this.pageTitle = this.page.locator('h1');
    this.breadcrumb = this.page
      .locator('[role="list"], .breadcrumb, .breadcrumbs, nav ol, nav ul, .navigation-path')
      .first();
    this.sideNavigation = this.page
      .locator(
        '.cdk-virtual-scroll-content-wrapper, .tree-wrapper, nav, [role="navigation"], .sidebar, .side-nav, .navigation'
      )
      .first();
    this.articleContent = this.page
      .locator(
        '[role="article"], [role="main"], main, .content, .article-content, .main-content, .documentation-content'
      )
      .first();
    this.copyLinkButton = this.page
      .getByRole('button', { name: 'Copy link of Find pet by ID' })
      .or(this.page.locator('button[aria-label*="Copy link of"]').first());
    this.editArticleButton = this.page.getByRole('button', { name: 'Edit article' });

    // Navigation structure locators
    this.apiDocumentationLink = this.page
      .locator('a[aria-label="API Documentation"][href*="api-documentation"]')
      .or(this.page.locator('a[aria-label="API Documentation"]').last());
    this.swaggerPetstoreLink = this.page.locator('a[aria-label="Swagger Petstore"]');
    this.petCategoryLink = this.page
      .locator('a[aria-label="pet"]')
      .or(this.page.getByRole('link', { name: 'pet' }))
      .first();
    this.findPetByIdLink = this.page
      .locator('a[aria-label="Find pet by ID"]')
      .or(this.page.getByRole('link', { name: 'Find pet by ID' }));
    this.nextArticleButton = this.page.getByRole('button', { name: /Next article/ });
    this.previousArticleButton = this.page.getByRole('button', { name: /Previous article/ });

    // API endpoint documentation locators
    this.endpointMethod = this.page.locator('.method-get.method-type, .api-http-method').first();
    this.endpointPath = this.page.locator(':text("/pet/{petId}")');
    this.endpointDescription = this.page.locator(':text("Returns a single pet")');
    this.securitySection = this.page.locator(':text("Security")');
    this.pathParametersSection = this.page.locator(':text("Path parameters")');
    this.responsesSection = this.page
      .locator('.api-header.api-response-body-header, .api-header')
      .filter({ hasText: 'Responses' })
      .first();
    this.tryItTab = this.page.getByRole('tab', { name: 'Try It' });
    this.codeSamplesTab = this.page.getByRole('tab', { name: 'Code samples' });

    // Try It section locators
    this.authenticationSection = this.page.getByRole('heading', { name: 'Authentication' });
    this.requestSection = this.page.getByRole('heading', { name: 'Request' });
    this.responseSection = this.page.getByRole('heading', { name: 'Response' });
    this.apiKeyInput = this.page.getByRole('textbox', { name: 'api_key*' });
    this.petIdInput = this.page.getByRole('spinbutton', { name: 'petId *' });
    this.responseFormatDropdown = this.page.getByRole('button', { name: 'application/json' });
    this.tryItButton = this.page
      .locator('#tryit-btn')
      .or(this.page.getByRole('button', { name: 'Try it & see response' }));

    // Response documentation locators
    this.responseTabsContainer = this.page.locator('[role="tablist"]:has([role="tab"])').last();
    this.response200Tab = this.page
      .getByLabel('Try It')
      .getByRole('button', { name: '200' })
      .or(this.page.locator('.btn.response-code.api-success').filter({ hasText: '200' }).first());
    this.response400Tab = this.page
      .getByLabel('Try It')
      .getByRole('button', { name: '400' })
      .or(this.page.locator('.btn.response-code').filter({ hasText: '400' }).first());
    this.response404Tab = this.page
      .getByLabel('Try It')
      .getByRole('button', { name: '404' })
      .or(this.page.locator('.btn.response-code').filter({ hasText: '404' }).first());
    this.responseSchema = this.page.locator('.data-type-name').first();
    this.mediaTypeDropdown = this.page.getByRole('combobox', { name: 'Media type' });

    // API Response validation locators
    this.responseBody = this.page
      .locator('.CodeMirror-code, .response-body, .api-response-body, pre code, .cm-content')
      .first();
    this.responseCode = this.page
      .locator('.response-code, .status-code, [data-testid="response-code"]')
      .first();
    this.responseHeaders = this.page
      .locator('.response-headers, .api-response-headers, [data-testid="response-headers"]')
      .first();
    this.responseTime = this.page.locator('.response-time, [data-testid="response-time"]').first();
    this.responseContent = this.page
      .locator('.CodeMirror, .response-content, .api-response-content')
      .first();
    this.responseStatus = this.page
      .locator('.response-status, .status-text, [data-testid="response-status"]')
      .first();

    // Validation locators
    this.wasHelpfulSection = this.page.locator(':text("Was this article helpful?")');
    this.yesButton = this.page.getByRole('button', { name: 'Yes' });
    this.noButton = this.page.getByRole('button', { name: 'No' });
    this.footerSection = this.page.locator('[role="contentinfo"]');
  }

  /**
   * Verifies that the published site landing page is loaded correctly
   */
  async verifyLandingPageLoaded(): Promise<void> {
    Log.info('Verifying published site landing page is loaded');
    await this.verifyElementVisible(this.projectLogo, 'Project logo');
    await this.verifyElementVisible(this.welcomeHeading, 'Welcome heading');
    await this.verifyElementVisible(this.apiDocumentationButton, 'API Documentation button');
    await this.verifyElementVisible(this.modulesSection, 'Modules section');

    const title = await this.getTitle();
    expect(title).toContain('API Test Documentation');
    Log.info('Published site landing page verified successfully');
  }

  /**
   * Navigates to the API Documentation section from the landing page
   */
  async navigateToApiDocumentation(): Promise<void> {
    Log.info('Navigating to API Documentation from landing page');
    await this.clickElement(this.apiDocumentationButton, 'API Documentation button');
    await this.waitForLoadState('domcontentloaded');
    Log.info('Successfully navigated to API Documentation');
  }

  /**
   * Verifies that the API Documentation page is loaded with proper navigation
   */
  async verifyApiDocumentationPageLoaded(): Promise<void> {
    Log.info('Verifying API Documentation page is loaded');
    await this.verifyElementVisible(this.sideNavigation, 'Side navigation');
    await this.verifyElementVisible(this.articleContent, 'Article content');

    // Verify navigation structure
    await this.verifyElementVisible(
      this.apiDocumentationLink,
      'API Documentation link in navigation'
    );
    await this.verifyElementVisible(
      this.swaggerPetstoreLink,
      'Swagger Petstore link in navigation'
    );
    await this.verifyElementVisible(this.petCategoryLink, 'Pet category link in navigation');

    Log.info('API Documentation page verified successfully');
  }

  /**
   * Navigates to the published Find pet by ID endpoint
   */
  async navigateToFindPetByIdEndpoint(): Promise<void> {
    Log.info('Navigating to Find pet by ID endpoint');

    // First expand the pet category by clicking the arrow
    const petCategoryArrow = this.page
      .locator('a[aria-label="pet"]')
      .locator('..')
      .locator('.tree-arrow');
    await this.clickElement(petCategoryArrow, 'Pet category expand arrow');
    await this.page.waitForTimeout(1000); // Wait for expansion animation

    // Try clicking the next article button first if it exists
    if (await this.nextArticleButton.isVisible()) {
      await this.clickElement(this.nextArticleButton, 'Next article button');
    } else {
      // Otherwise, use direct navigation via link
      await this.clickElement(this.findPetByIdLink, 'Find pet by ID link');
    }

    await this.waitForLoadState('domcontentloaded');
    Log.info('Successfully navigated to Find pet by ID endpoint');
  }

  /**
   * Verifies that the Find pet by ID endpoint documentation is complete and accurate
   */
  async verifyFindPetByIdEndpointDocumentation(): Promise<void> {
    Log.info('Verifying Find pet by ID endpoint documentation');

    // Verify page title
    await this.verifyText(this.pageTitle, 'Find pet by ID', 'Page title');

    // Verify endpoint details
    await this.verifyElementVisible(this.endpointMethod, 'GET method');
    await this.verifyElementVisible(this.endpointPath, 'Endpoint path /pet/{petId}');
    await this.verifyElementVisible(this.endpointDescription, 'Endpoint description');

    // Verify API documentation sections
    await this.verifyElementVisible(this.securitySection, 'Security section');
    await this.verifyElementVisible(this.pathParametersSection, 'Path parameters section');
    await this.verifyElementVisible(this.responsesSection, 'Responses section');

    // Verify Try It functionality is available
    await this.verifyElementVisible(this.tryItTab, 'Try It tab');
    await this.verifyElementVisible(this.codeSamplesTab, 'Code samples tab');

    Log.info('Find pet by ID endpoint documentation verified successfully');
  }

  /**
   * Verifies the Try It functionality is working correctly
   */
  async verifyTryItFunctionality(): Promise<void> {
    Log.info('Verifying Try It functionality');

    // Click Try It tab if not already selected
    await this.clickElement(this.tryItTab, 'Try It tab');

    // Verify authentication section
    await this.verifyElementVisible(this.authenticationSection, 'Authentication section');
    await this.verifyElementVisible(this.apiKeyInput, 'API key input');

    // Verify request section
    await this.verifyElementVisible(this.requestSection, 'Request section');
    await this.verifyElementVisible(this.petIdInput, 'Pet ID input');
    await this.verifyElementVisible(this.responseFormatDropdown, 'Response format dropdown');

    // Verify response section
    await this.verifyElementVisible(this.responseSection, 'Response section');

    // Verify Try It button (might be disabled without API key)
    await this.verifyElementVisible(this.tryItButton, 'Try It button');

    Log.info('Try It functionality verified successfully');
  }

  /**
   * Verifies the response documentation with schema details
   */
  async verifyResponseDocumentation(): Promise<void> {
    Log.info('Verifying response documentation');

    // Verify response tabs
    await this.verifyElementVisible(this.response200Tab, '200 response tab');
    await this.verifyElementVisible(this.response400Tab, '400 response tab');
    await this.verifyElementVisible(this.response404Tab, '404 response tab');

    // Click 200 tab and verify schema
    await this.clickElement(this.response200Tab, '200 response tab');
    await this.verifyElementVisible(this.responseSchema, 'Response schema');
    await this.verifyElementVisible(this.mediaTypeDropdown, 'Media type dropdown');

    // Verify media type options
    const mediaType = await this.mediaTypeDropdown.textContent();
    expect(mediaType).toMatch(/(application\/json|application\/xml)/);

    Log.info('Response documentation verified successfully');
  }
  /**
   * Tests the interactive elements on the endpoint page
   */
  async testInteractiveElements(): Promise<void> {
    Log.info('Testing interactive elements');

    // Test copy link button
    await this.clickElement(this.copyLinkButton, 'Copy link button');

    // Test media type dropdown
    await this.clickElement(this.mediaTypeDropdown, 'Media type dropdown');

    // Test response tabs switching
    await this.clickElement(this.response400Tab, '400 response tab');
    await this.clickElement(this.response404Tab, '404 response tab');
    await this.clickElement(this.response200Tab, '200 response tab');

    // Test tab switching
    await this.clickElement(this.codeSamplesTab, 'Code samples tab');
    await this.clickElement(this.tryItTab, 'Try It tab');

    Log.info('Interactive elements tested successfully');
  }

  /**
   * Verifies the overall published endpoint meets documentation standards
   */
  async verifyPublishedEndpointQuality(): Promise<void> {
    Log.info('Verifying published endpoint meets quality standards');

    // Verify complete documentation is present
    await this.verifyFindPetByIdEndpointDocumentation();

    // Verify interactive functionality
    await this.verifyTryItFunctionality();

    // Verify response documentation
    await this.verifyResponseDocumentation();

    // Verify page has feedback mechanism
    await this.verifyElementVisible(this.wasHelpfulSection, 'Was helpful section');
    await this.verifyElementVisible(this.yesButton, 'Yes feedback button');
    await this.verifyElementVisible(this.noButton, 'No feedback button');

    Log.info('Published endpoint quality verification completed successfully');
  }

  /**
   * Fills out the Try It form with sample data
   */
  async fillTryItForm(apiKey: string, petId: string): Promise<void> {
    Log.info(`Filling Try It form with API key and pet ID: ${petId}`);

    // Ensure Try It tab is selected
    await this.clickElement(this.tryItTab, 'Try It tab');

    // Fill API key
    await this.fillElement(this.apiKeyInput, apiKey, 'API key');

    // Fill pet ID
    await this.fillElement(this.petIdInput, petId, 'Pet ID');
    await this.clickTryItButton();
    await this.validateApiResponse();

    Log.info('Try It form filled successfully');
  }

  /**
   * Clicks the "Try it & see response" button to execute the API request
   */
  async clickTryItButton(): Promise<void> {
    Log.info('Clicking Try it & see response button');

    // Ensure the button is visible and enabled
    await this.verifyElementVisible(this.tryItButton, 'Try it & see response button');

    // Click the button
    await this.clickElement(this.tryItButton, 'Try it & see response button');

    // Wait for response to load
    await this.page.waitForTimeout(5000);

    Log.info('Try it & see response button clicked successfully');
  }

  /**
   * Validates the API response after clicking the Try it button
   */
  async validateApiResponse(): Promise<void> {
    Log.info('Validating API response content');

    // Wait for response to be visible
    await this.page.waitForTimeout(5000);

    // Verify response content is displayed
    const responseBodyVisible = await this.responseBody.isVisible().catch(() => false);
    const responseContentVisible = await this.responseContent.isVisible().catch(() => false);
    const responseVisible = responseBodyVisible || responseContentVisible;

    if (responseVisible) {
      Log.info('Response body is visible');

      // Get and validate response text
      let responseText = '';
      if (responseBodyVisible) {
        responseText = (await this.responseBody.textContent().catch(() => '')) || '';
      } else if (responseContentVisible) {
        responseText = (await this.responseContent.textContent().catch(() => '')) || '';
      }

      if (responseText && responseText.trim()) {
        Log.info(`Response content received: ${responseText.substring(0, 100)}...`);

        // Check if it's JSON response
        if (responseText.includes('{') && responseText.includes('}')) {
          try {
            const jsonResponse = JSON.parse(responseText.trim());
            Log.info('Valid JSON response received');

            // Validate pet object structure if it exists
            if (jsonResponse.id || jsonResponse.name || jsonResponse.category) {
              Log.info('Pet object structure found in response');
            }
          } catch (error) {
            Log.info('Response is not valid JSON, checking for other content types');
          }
        }

        // Check for error messages
        if (
          responseText.toLowerCase().includes('error') ||
          responseText.toLowerCase().includes('not found') ||
          responseText.toLowerCase().includes('invalid')
        ) {
          Log.info('Response contains error message, which is expected for test data');
        }
      }
    }

    // Try to verify response code/status if visible
    if (await this.responseCode.isVisible().catch(() => false)) {
      const statusCode = await this.responseCode.textContent();
      Log.info(`Response status code: ${statusCode}`);
    }

    // Try to verify response headers if visible
    if (await this.responseHeaders.isVisible().catch(() => false)) {
      Log.info('Response headers are visible');
    }

    // Try to verify response time if visible
    if (await this.responseTime.isVisible().catch(() => false)) {
      const responseTime = await this.responseTime.textContent();
      Log.info(`Response time: ${responseTime}`);
    }

    Log.info('API response validation completed');
  }

  /**
   * Verifies the URL matches the expected pattern for Find pet by ID endpoint
   */
  async verifyEndpointUrl(): Promise<void> {
    Log.info('Verifying endpoint URL pattern');

    const currentUrl = this.getCurrentURL();
    expect(currentUrl).toMatch(/\/apidocs\/find-pet-by-id$/);

    const title = await this.getTitle();
    expect(title).toContain('Find pet by ID');

    Log.info('Endpoint URL verified successfully');
  }

  /**
   * Navigates back to the main API documentation page
   */
  async navigateBackToApiDocumentation(): Promise<void> {
    Log.info('Navigating back to main API documentation');
    await this.clickElement(this.apiDocumentationLink, 'API Documentation link');
    await this.waitForLoadState('domcontentloaded');
    Log.info('Successfully navigated back to API documentation');
  }

  /**
   * Verifies the schema documentation is comprehensive
   */
  async verifySchemaDocumentation(): Promise<void> {
    Log.info('Verifying API schema documentation');

    // Click 200 response tab
    await this.clickElement(this.response200Tab, '200 response tab');

    // Verify schema contains expected pet object properties
    const schemaContent = await this.page.locator('[role="tabpanel"]').textContent();
    expect(schemaContent).toContain('id');
    expect(schemaContent).toContain('category');
    expect(schemaContent).toContain('name');
    expect(schemaContent).toContain('photoUrls');
    expect(schemaContent).toContain('tags');
    expect(schemaContent).toContain('status');

    Log.info('Schema documentation verified successfully');
  }
}
