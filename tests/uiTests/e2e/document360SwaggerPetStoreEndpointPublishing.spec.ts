import { test } from '../../fixtures/baseTest';
import { Document360DocumentationPage } from '../pageObjects/Document360DocumentationPage';
import { Document360SwaggerPetStorePage } from '../pageObjects/Document360SwaggerPetStorePage';
import { Document360PublishedSitePage } from '../pageObjects/Document360PublishedSitePage';

test.describe('Document360 Swagger Pet Store API Endpoint Publishing', () => {
    let documentationPage: Document360DocumentationPage;
    let swaggerPetStorePage: Document360SwaggerPetStorePage;
    let publishedSitePage: Document360PublishedSitePage;

    test.beforeEach(async ({ loggedInPage, document360DashboardPage }) => {
        // Navigate to the API Test Documentation project from dashboard
        await document360DashboardPage.verifyPageLoaded();
        
        // Click on the API Test Documentation project
        const apiProject = loggedInPage.locator('text=API Test Documentation').first();
        if (await apiProject.isVisible()) {
            await apiProject.click();
            await loggedInPage.waitForLoadState('networkidle');
        }
        
        // Navigate to documentation page from project dashboard
        await document360DashboardPage.clickDocumentation();
        
        documentationPage = new Document360DocumentationPage(loggedInPage);
        swaggerPetStorePage = new Document360SwaggerPetStorePage(loggedInPage);
        publishedSitePage = new Document360PublishedSitePage(loggedInPage);
    });

    test('User can successfully publish Swagger Pet Store API endpoints and verify on published site', async () => {
        // Given user is on documentation page and navigates to API section
        await documentationPage.verifyDocumentationContainerVisible();
        await documentationPage.clickApiMenu();
        await documentationPage.verifyFrameLoaded();

        // And user navigates to Swagger Petstore API documentation section
        await swaggerPetStorePage.navigateToSwaggerPetstore();
        await swaggerPetStorePage.navigateToPetCategory();
        await swaggerPetStorePage.verifySwaggerPetstorePageLoaded();

        // When user captures the available API endpoints
        const availableEndpoints = await swaggerPetStorePage.captureEndpointsList();
        await swaggerPetStorePage.verifyPetEndpointsDisplayed();

        // And user selects Find pet by ID endpoint for publishing
        await swaggerPetStorePage.selectFindPetByIdEndpoint();
        await swaggerPetStorePage.verifyBulkActionToolbarVisible();

        // And user publishes the selected endpoint
        await swaggerPetStorePage.publishSelectedEndpoint('Publishing Find pet by ID endpoint for testing');

        // Then endpoint should be published successfully
        await swaggerPetStorePage.verifyEndpointPublished('Find pet by ID');
        await swaggerPetStorePage.verifyEndpointStatus('Find pet by ID', 'Published');

        // When user opens the published documentation site
        const publishedPage = await swaggerPetStorePage.openPublishedSite();
        publishedSitePage = new Document360PublishedSitePage(publishedPage);

        // Then published site should load with proper landing page
        await publishedSitePage.verifyLandingPageLoaded();

        // When user navigates to API documentation section
        await publishedSitePage.navigateToApiDocumentation();

        // Then API documentation page should load with proper navigation structure
        await publishedSitePage.verifyApiDocumentationPageLoaded();

        // When user navigates to the published Find pet by ID endpoint
        await publishedSitePage.navigateToFindPetByIdEndpoint();

        // Then endpoint documentation should be complete and functional
        await publishedSitePage.verifyFindPetByIdEndpointDocumentation();
        await publishedSitePage.verifyTryItFunctionality();
        await publishedSitePage.verifyResponseDocumentation();
        await publishedSitePage.verifyEndpointInNavigation();
        await publishedSitePage.verifyPublishedEndpointQuality();
    });

    test('User can view comprehensive API endpoint documentation on published site', async () => {
        // Given user navigates to API documentation from dashboard
        await documentationPage.verifyDocumentationContainerVisible();
        await documentationPage.clickApiMenu();
        await documentationPage.verifyFrameLoaded();

        // And user navigates to Swagger Pet Store
        await swaggerPetStorePage.navigateToSwaggerPetstore();
        const publishedPage = await swaggerPetStorePage.openPublishedSite();
        publishedSitePage = new Document360PublishedSitePage(publishedPage);

        // When user accesses the API documentation
        await publishedSitePage.verifyLandingPageLoaded();
        await publishedSitePage.navigateToApiDocumentation();

        // Then user should see properly structured documentation
        await publishedSitePage.verifyApiDocumentationPageLoaded();
        await publishedSitePage.verifyNavigationBreadcrumb();

        // When user navigates to Find pet by ID endpoint
        await publishedSitePage.navigateToFindPetByIdEndpoint();

        // Then endpoint should show complete OpenAPI specification
        await publishedSitePage.verifyEndpointUrl();
        await publishedSitePage.verifySchemaDocumentation();
        await publishedSitePage.testInteractiveElements();
    });

    test('User can interact with Try It functionality on published API endpoint', async () => {
        // Given user is on the published Find pet by ID endpoint page
        await swaggerPetStorePage.navigateToSwaggerPetstore();
        const publishedPage = await swaggerPetStorePage.openPublishedSite();
        publishedSitePage = new Document360PublishedSitePage(publishedPage);
        
        await publishedSitePage.navigateToApiDocumentation();
        await publishedSitePage.navigateToFindPetByIdEndpoint();

        // When user accesses the Try It functionality
        await publishedSitePage.verifyTryItFunctionality();

        // And user fills out the Try It form with test data
        await publishedSitePage.fillTryItForm('test-api-key', '123');

        // Then interactive elements should be functional and properly configured
        await publishedSitePage.verifyResponseDocumentation();
        await publishedSitePage.testInteractiveElements();
    });

    test('User can navigate between multiple API endpoints in published documentation', async () => {
        // Given user has access to published API documentation
        await swaggerPetStorePage.navigateToSwaggerPetstore();
        await swaggerPetStorePage.navigateToPetCategory();
        
        // When user captures all available endpoints
        const allEndpoints = await swaggerPetStorePage.captureEndpointsList();
        const endpointStatuses = await swaggerPetStorePage.getEndpointsWithStatus();

        // Then user should see comprehensive endpoint listing
        await swaggerPetStorePage.verifyPetEndpointsDisplayed();

        // When user opens published site
        const publishedPage = await swaggerPetStorePage.openPublishedSite();
        publishedSitePage = new Document360PublishedSitePage(publishedPage);

        // Then navigation should reflect the endpoint structure
        await publishedSitePage.verifyLandingPageLoaded();
        await publishedSitePage.navigateToApiDocumentation();
        await publishedSitePage.verifyApiDocumentationPageLoaded();
        await publishedSitePage.verifyEndpointInNavigation();
    });

    test('User can publish multiple endpoints and verify batch publishing workflow', async () => {
        // Given user is on Swagger Pet Store endpoints page
        await swaggerPetStorePage.navigateToSwaggerPetstore();
        await swaggerPetStorePage.navigateToPetCategory();

        // When user selects multiple endpoints for publishing
        const endpointsToPublish = ['Find pet by ID', 'Add a new pet to the store'];
        await swaggerPetStorePage.selectMultipleEndpoints(endpointsToPublish);
        await swaggerPetStorePage.verifyBulkActionToolbarVisible();

        // And user publishes the selected endpoints
        await swaggerPetStorePage.publishSelectedEndpoint('Batch publishing multiple pet endpoints');

        // Then all selected endpoints should be published successfully
        for (const endpoint of endpointsToPublish) {
            await swaggerPetStorePage.verifyEndpointStatus(endpoint, 'Published');
        }

        // When user opens published site
        const publishedPage = await swaggerPetStorePage.openPublishedSite();
        publishedSitePage = new Document360PublishedSitePage(publishedPage);

        // Then all published endpoints should be accessible
        await publishedSitePage.verifyLandingPageLoaded();
        await publishedSitePage.navigateToApiDocumentation();
        await publishedSitePage.verifyEndpointInNavigation();
    });

    test('User can cancel endpoint publishing operation', async () => {
        // Given user selects an endpoint for publishing
        await swaggerPetStorePage.navigateToSwaggerPetstore();
        await swaggerPetStorePage.navigateToPetCategory();
        await swaggerPetStorePage.selectFindPetByIdEndpoint();

        // When user initiates publish but cancels the operation
        await swaggerPetStorePage.cancelPublish();

        // Then endpoint should remain in Draft status
        await swaggerPetStorePage.verifyEndpointStatus('Find pet by ID', 'Draft');
        await swaggerPetStorePage.verifyNoEndpointsSelected();
    });

    test('User can verify endpoint documentation quality standards', async () => {
        // Given user has published an API endpoint
        await swaggerPetStorePage.navigateToSwaggerPetstore();
        await swaggerPetStorePage.navigateToPetCategory();
        await swaggerPetStorePage.selectFindPetByIdEndpoint();
        await swaggerPetStorePage.publishSelectedEndpoint();
        await swaggerPetStorePage.verifyEndpointPublished('Find pet by ID');

        // When user reviews the published documentation
        const publishedPage = await swaggerPetStorePage.openPublishedSite();
        publishedSitePage = new Document360PublishedSitePage(publishedPage);
        
        await publishedSitePage.navigateToApiDocumentation();
        await publishedSitePage.navigateToFindPetByIdEndpoint();

        // Then documentation should meet quality standards
        await publishedSitePage.verifyPublishedEndpointQuality();
        await publishedSitePage.verifySchemaDocumentation();
        await publishedSitePage.verifyResponseDocumentation();
        await publishedSitePage.verifyTryItFunctionality();
    });

    test.afterEach(async () => {
        // Clean up: Switch back to original page context if needed
        if (swaggerPetStorePage?.getPageContextHandler) {
            try {
                await swaggerPetStorePage.getPageContextHandler().switchToOriginalPage();
            } catch (error) {
                console.log('Context cleanup not needed or already handled');
            }
        }
    });
});