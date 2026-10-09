import { test, expect } from '@playwright/test';

test.describe('Application Tracker', () => {
  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const testEmail = `tracker_${timestamp}@example.com`;
    const testPassword = 'Password123!';
    // Register
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Tracker User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Login
    await expect(page).toHaveURL(/\/login/);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('http://localhost:3000/');

    // Now call API to create an application using request context from Playwright? 
    // Playwright APIRequestContext preserves session cookies if derived from page?
    // Actually, `page.request` preserves session cookies from `page`.
    const response = await page.request.post('/api/applications', {
      data: {
        company: 'Google',
        role: 'Software Engineer',
        status: 'SAVED',
      },
    });
    expect(response.status()).toBe(201);
  });

  test('user can see their applications and apply a filter', async ({ page }) => {
    await page.goto('/applications');

    // Should see the created application
    await expect(page.locator('text=Software Engineer')).toBeVisible();
    await expect(page.locator('text=at Google')).toBeVisible();

    // Search filter
    await page.fill('input[id="search"]', 'NonExistent');
    await expect(page.locator('text=Software Engineer')).not.toBeVisible({ timeout: 10000 });
    
    await page.fill('input[id="search"]', 'Google');
    await expect(page.locator('text=Software Engineer')).toBeVisible({ timeout: 10000 });

    // Status filter
    await page.check('input[value="APPLIED"]');
    await expect(page.locator('text=Software Engineer')).not.toBeVisible({ timeout: 10000 }); // Google app is SAVED

    await page.check('input[value="SAVED"]');
    await expect(page.locator('text=Software Engineer')).toBeVisible({ timeout: 10000 });
  });

  test('user can add a new application via the UI', async ({ page }) => {
    await page.goto('/applications');
    await page.click('text=Add Application');
    
    await expect(page).toHaveURL(/\/applications\/new/);
    
    await page.fill('input[name="company"]', 'Microsoft');
    await page.fill('input[name="role"]', 'Frontend Developer');
    await page.fill('input[name="location"]', 'Redmond, WA');
    await page.selectOption('select[name="status"]', 'APPLIED');
    await page.selectOption('select[name="priority"]', 'HIGH');

    await page.click('button:has-text("Save Application")');

    // Wait for redirect to details page (which we haven't built yet, but it will go to /applications/[id])
    await page.waitForTimeout(2000);
    console.log('Final URL:', page.url());
    console.log('Cookies:', (await page.context().cookies()).map(c => c.name));
    await expect(page).toHaveURL(/\/applications\/c[a-z0-9]+/);
    
    // Go back to tracker
    await page.goto('/applications');
    await expect(page.locator('text=Frontend Developer')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=at Microsoft')).toBeVisible({ timeout: 10000 });
  });
});
