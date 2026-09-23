import { test, expect } from "@playwright/test";

test.describe("Real Estate App UI & Protected Route Flows", () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to local server baseline URL
    await page.goto("/");
  });

  test("should load the landing page successfully and verify structural layout elements", async ({ page }) => {
    // Assert navigation links are rendered
    const homeLink = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Home", exact: true });
    await expect(homeLink).toBeVisible();

    // Verify main marketing headline
    const mainHeader = page.getByRole("heading", { name: /Find a place to call home/i });
    await expect(mainHeader).toBeVisible();
  });

  test("should allow typing into the search input box", async ({ page }) => {
    // Locate the search input
    const searchInput = page.getByPlaceholder("Search by place or address");
    await expect(searchInput).toBeVisible({ timeout: 20000 });

    // Perform typing actions
    await searchInput.fill("Cairo");
    await expect(searchInput).toHaveValue("Cairo");

    // Click the search button
    const searchButton = page.getByRole("button", { name: "Search homes", exact: true });
    await searchButton.click();
  });

  test("should redirect guest visitors trying to access protected Add Property view", async ({ page }) => {
    // Navigate directly to the protected route /AddProperty
    await page.goto("/AddProperty");

    // Verify that the route guard catches and redirects to the sign-in URL parameter
    await page.waitForURL("**/#/?sign-in=true", { timeout: 5000 }).catch(() => {});
    const currentUrl = page.url();
    expect(currentUrl).toContain("sign-in=true");
  });
});
