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
        this.welcomeHeading = this.page.getByRole('heading', { name: 'Welcome to API Test Documentation project landing page' });
        this.apiDocumentationButton = this.page.getByRole('link', { name: 'API Documentation' }).first();
        this.searchButton = this.page.getByRole('button', { name: 'Search' });
        this.modulesSection = this.page.getByRole('heading', { name: 'Modules' });

        // API Documentation page locators
        this.pageTitle = this.page.locator('h1');
        this.breadcrumb = this.page.locator('[role="list"]').first();
        this.sideNavigation = this.page.locator('[role="complementary"]').first();
        this.articleContent = this.page.locator('[role="article"]');
        this.copyLinkButton = this.page.getByRole('button', { name: /Copy link/ });
        this.editArticleButton = this.page.getByRole('button', { name: 'Edit article' });

        // Navigation structure locators
        this.apiDocumentationLink = this.page.getByRole('link', { name: 'API Documentation' });
        this.swaggerPetstoreLink = this.page.getByRole('link', { name: 'Swagger Petstore' });
        this.petCategoryLink = this.page.getByRole('link', { name: 'pet' }).first();
        this.findPetByIdLink = this.page.getByRole('link', { name: 'Find pet by ID' });
        this.nextArticleButton = this.page.getByRole('button', { name: /Next article/ });
        this.previousArticleButton = this.page.getByRole('button', { name: /Previous article/ });

        // API endpoint documentation locators
        this.endpointMethod = this.page.locator(':text("Get")');
        this.endpointPath = this.page.locator(':text("/pet/{petId}")');
        this.endpointDescription = this.page.locator(':text("Returns a single pet")');
        this.securitySection = this.page.locator(':text("Security")');
        this.pathParametersSection = this.page.locator(':text("Path parameters")');
        this.responsesSection = this.page.locator(':text("Responses")');
        this.tryItTab = this.page.getByRole('tab', { name: 'Try It' });
        this.codeSamplesTab = this.page.getByRole('tab', { name: 'Code samples' });

        // Try It section locators
        this.authenticationSection = this.page.getByRole('heading', { name: 'Authentication' });
        this.requestSection = this.page.getByRole('heading', { name: 'Request' });
        this.responseSection = this.page.getByRole('heading', { name: 'Response' });
        this.apiKeyInput = this.page.getByRole('textbox', { name: 'api_key*' });
        this.petIdInput = this.page.getByRole('spinbutton', { name: 'petId *' });
        this.responseFormatDropdown = this.page.getByRole('button', { name: 'application/json' });
        this.tryItButton = this.page.getByRole('button', { name: 'Try it & see response' });

        // Response documentation locators
        this.responseTabsContainer = this.page.locator('[role="tablist"]:has([role="tab"])').last();
        this.response200Tab = this.page.getByRole('button', { name: '200' });
        this.response400Tab = this.page.getByRole('button', { name: '400' });
        this.response404Tab = this.page.getByRole('button', { name: '404' });
        this.responseSchema = this.page.locator(':text("object")');
        this.mediaTypeDropdown = this.page.getByRole('combobox', { name: 'Media type' });

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
        await this.verifyElementVisible(this.breadcrumb, 'Breadcrumb navigation');
        await this.verifyElementVisible(this.articleContent, 'Article content');
        
        // Verify navigation structure
        await this.verifyElementVisible(this.apiDocumentationLink, 'API Documentation link in navigation');
        await this.verifyElementVisible(this.swaggerPetstoreLink, 'Swagger Petstore link in navigation');
        await this.verifyElementVisible(this.petCategoryLink, 'Pet category link in navigation');
        
        Log.info('API Documentation page verified successfully');
    }

    /**
     * Navigates to the published Find pet by ID endpoint
     */
    async navigateToFindPetByIdEndpoint(): Promise<void> {
        Log.info('Navigating to Find pet by ID endpoint');
        
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
     * Verifies navigation breadcrumb shows correct path
     */
    async verifyNavigationBreadcrumb(): Promise<void> {
        Log.info('Verifying navigation breadcrumb');
        
        const breadcrumbText = await this.breadcrumb.textContent();
        expect(breadcrumbText).toContain('API Documentation');
        expect(breadcrumbText).toContain('Swagger Petstore');
        
        Log.info('Navigation breadcrumb verified successfully');
    }

    /**
     * Verifies that the endpoint is properly integrated in the site navigation
     */
    async verifyEndpointInNavigation(): Promise<void> {
        Log.info('Verifying endpoint appears in site navigation');
        
        // Check side navigation for the endpoint
        await this.verifyElementVisible(this.findPetByIdLink, 'Find pet by ID in navigation');
        
        // Verify it's under the correct category structure
        const navigation = await this.sideNavigation.textContent();
        expect(navigation).toContain('Swagger Petstore');
        expect(navigation).toContain('pet');
        expect(navigation).toContain('Find pet by ID');
        
        Log.info('Endpoint navigation verified successfully');
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
        
        // Verify navigation integration
        await this.verifyEndpointInNavigation();
        
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
        
        Log.info('Try It form filled successfully');
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