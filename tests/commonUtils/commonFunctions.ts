import { Page } from '@playwright/test';
import urls from '../apiTests/endPointsDTO/uri.json';

// Make sure to adjust the import path to urls.json as needed

function getRandomString(characterLength: number): string {
  const possible = 'AutoQAABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-';
  return Array.from({ length: characterLength }, () =>
    possible.charAt(Math.floor(Math.random() * possible.length))
  ).join('');
}

function generateRandomInteger(length: number): string {
  const randomDigits = Array.from({ length: length }, () => Math.floor(Math.random() * 10));
  return randomDigits.join('');
}

function generateRandomEmail(): string {
  return Math.random().toString(36).substring(2, 8) + '@gmail.com';
}

async function fetchCSRFToken(page: Page): Promise<string> {
  const baseUrl = process.env.APP_URL || 'https://default-url.com/';
  const csrfGatewayURI = `${baseUrl}${urls.csrfTokenGateWay}`;
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'SESSION');
  if (!sessionCookie) {
    throw new Error('Session cookie not found.');
  }
  const response = await page.request.get(csrfGatewayURI, {
    headers: {
      Cookie: `SESSION=${sessionCookie.value}`,
    },
  });
  // Parse the response body as JSON and extract the CSRF token
  const responseBody = await response.json();
  return responseBody.csrfToken; // Adjust this to match the actual response structure
}

export { getRandomString, generateRandomInteger, generateRandomEmail, fetchCSRFToken };
