// import { test, expect } from '@playwright/test';
// import { HomePage } from '../uiTests/pageObjects/HomePage';
// import urls from '../apiTests/endPointsDTO/uri.json';
// import { fetchCSRFToken } from '../commonUtils/commonFunctions'; // Assuming fetchCSRFToken is a named export from commonFunctions

// test.describe('MW/API- Fetch Session ID and Create a New Organization as Super Admin', () => {
//   let homePage: HomePage;

//   test.beforeEach(async ({ page }) => {
//         homePage = new HomePage(page);
//   });

//   test('API - Create Organization by fetching CSRF Token Within Same Session', async ({ page }) => {
//     // Assuming fetchCSRFToken is a helper function you've created for Playwright
//     const csrfTokenResponse = await fetchCSRFToken(page);
//     console.log(csrfTokenResponse);

//     // Assuming addOrgDataAPI is the request payload you've prepared
//     const addOrgDataAPI = {
//       // ... your request payload
//     };

//     const createOrgURI = `${process.env.APP_URL}${urls.createCompany}`;
//     const response = await page.request.post(createOrgURI, {
//       headers: { 'X-XSRF-TOKEN': csrfTokenResponse },
//       data: addOrgDataAPI,
//     });

//     console.log('API Response:', JSON.stringify(response, null, 2));
//     expect(response.status()).toBe(201);
//  });
// });

