import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  test('user can register, login, and access dashboard', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test E2E User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await expect(page).toHaveURL(/\/login/);

    // 2. Login
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/');

    // Verify the email verification banner is visible
    await expect(page.locator('body')).toContainText('Please verify your email address');

    // 3. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
    
    // 4. Verify Route Protection
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
