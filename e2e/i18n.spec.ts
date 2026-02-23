import { expect, test } from "@playwright/test";

test.describe("i18n", () => {
	test("redirects root to default lang or user lang", async ({ page }) => {
		await page.goto("/");
		// Should redirect to /en/ or other depending on browser context (default is usually en in playwright)
		await expect(page).toHaveURL(/\/en\/$/);
		await expect(
			page.getByRole("heading", { name: "Astro Template" }),
		).toBeVisible();
	});

	test("loads spanish version", async ({ page }) => {
		await page.goto("/es/");
		await expect(
			page.getByRole("heading", { name: "Plantilla Astro" }),
		).toBeVisible();
	});
});

test.describe("Theme Toggle", () => {
	test("toggles dark mode", async ({ page }) => {
		await page.goto("/en/");

		// Check initial state (assuming light mode default)
		const html = page.locator("html");
		await expect(html).not.toHaveClass(/dark/);

		// Click toggle
		await page.getByRole("button", { name: "Toggle Dark Mode" }).click();

		// Check dark mode
		await expect(html).toHaveClass(/dark/);

		// Reload to check persistence
		await page.reload();
		await expect(html).toHaveClass(/dark/);
	});
});
