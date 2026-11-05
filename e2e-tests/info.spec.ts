import { test, expect } from "@playwright/test";

test("Afficher la section INFO de la compagnie", async ({ page }) => {
  await page.goto("/info");
  await expect(page.getByRole("heading", { name: "INFO", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "INFO", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText(/Aucune nouvelle information|Les informations sont temporairement indisponibles/)).toBeVisible();
});
