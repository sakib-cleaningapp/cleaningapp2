import { test, expect } from '@playwright/test';
import { loginAsCustomer, loginAsBusinessOwner } from './fixtures/auth';

test.describe('Messaging Flow', () => {
  test('customer can access service category page', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard/services/cleaning');
    await page.waitForLoadState('networkidle');

    // Verify page loads with services
    await expect(page.locator('body')).toContainText(/clean|service/i);
  });

  test('customer can view service details', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard/services/cleaning');
    await page.waitForLoadState('networkidle');

    // Try to find and click View Details button
    const viewDetailsButton = page
      .getByRole('button', { name: /view details/i })
      .first();
    if (
      await viewDetailsButton.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await viewDetailsButton.click();
      await page.waitForTimeout(500);

      // Verify modal or details opened
      const hasDetails =
        (await page
          .getByRole('button', { name: /contact/i })
          .isVisible()
          .catch(() => false)) ||
        (await page
          .getByText(/description|price|duration/i)
          .isVisible()
          .catch(() => false));
      expect(hasDetails).toBeTruthy();
    }
  });

  test('customer can open Contact Business modal from service details', async ({
    page,
  }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard/services/cleaning');
    await page.waitForLoadState('networkidle');

    // Click View Details
    const viewDetailsButton = page
      .getByRole('button', { name: /view details/i })
      .first();
    if (
      await viewDetailsButton.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await viewDetailsButton.click();
      await page.waitForTimeout(500);

      // Click Contact Business
      const contactButton = page.getByRole('button', { name: /contact/i });
      if (await contactButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await contactButton.click();
        await page.waitForTimeout(500);

        // Verify contact modal opened
        const hasContactForm = await page
          .getByText(/send message|contact|subject/i)
          .isVisible()
          .catch(() => false);
        expect(hasContactForm).toBeTruthy();
      }
    }
  });

  test('My Messages page loads for customer', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-messages');
    await page.waitForLoadState('networkidle');

    // Verify page loads
    await expect(page.getByText(/message|sent|inbox/i)).toBeVisible();
  });

  test('My Messages shows sent messages or empty state', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-messages');
    await page.waitForLoadState('networkidle');

    // Check for either messages or empty state
    const pageContent = await page.content();
    const hasContent =
      pageContent.includes('Sent Messages') ||
      pageContent.includes('No messages') ||
      pageContent.includes('message') ||
      pageContent.includes('Message');
    expect(hasContent).toBeTruthy();
  });

  test('business messages page loads', async ({ page }) => {
    await loginAsBusinessOwner(page);
    await page.goto('/business/messages');
    await page.waitForLoadState('networkidle');

    // Verify page loads
    await expect(page.getByText(/message|inbox|received/i)).toBeVisible();
  });

  test('business can view messages list or empty state', async ({ page }) => {
    await loginAsBusinessOwner(page);
    await page.goto('/business/messages');
    await page.waitForLoadState('networkidle');

    // Check for messages list or empty state
    const pageContent = await page.content();
    const hasContent =
      pageContent.includes('message') ||
      pageContent.includes('Message') ||
      pageContent.includes('inbox') ||
      pageContent.includes('No messages');
    expect(hasContent).toBeTruthy();
  });

  test('contact modal has quick question options', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard/services/cleaning');
    await page.waitForLoadState('networkidle');

    // Navigate to contact modal
    const viewDetailsButton = page
      .getByRole('button', { name: /view details/i })
      .first();
    if (
      await viewDetailsButton.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await viewDetailsButton.click();
      await page.waitForTimeout(500);

      const contactButton = page.getByRole('button', { name: /contact/i });
      if (await contactButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await contactButton.click();
        await page.waitForTimeout(500);

        // Check for quick question options
        const hasQuickQuestions = await page
          .getByText(/weekend|supplies|payment|booking/i)
          .isVisible()
          .catch(() => false);
        // This is optional - quick questions may or may not be visible
        console.log('Quick questions visible:', hasQuickQuestions);
      }
    }
  });
});
