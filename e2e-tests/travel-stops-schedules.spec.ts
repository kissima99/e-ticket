import { test, expect } from "@playwright/test";

test("Choisir les arrêts et horaires des deux trajets dans les deux sens", async ({ page }) => {
  test.setTimeout(90000);
  page.setDefaultTimeout(10000);
  await page.route("**/functions/v1/dabo-booking", async route => {
    const body = route.request().postDataJSON();
    expect(body.action).toBe("availability");
    await route.fulfill({ json: { taken: body.data.route_id === "ouro_sogui" ? ["1"] : ["2"] } });
  });
  await page.goto("/reservation");
  const schedule = page.getByTestId("route-schedule");
  await expect(schedule).toHaveText("Rendez-vous 12h00 • Départ 14h00");
  await page.getByLabel("Trajet *", { exact: true }).click();
  await page.getByRole("option", { name: "Via Tamba – Kidira", exact: true }).click();
  await expect(schedule).toHaveText("Rendez-vous 05h00 • Départ 06h00");
  await page.getByRole("combobox", { name: "Ville de descente" }).click();
    await expect(page.getByRole("option", { name: "Ouro Sogui", exact: true })).toHaveCount(0);
    await expect(page.getByRole("option", { name: "Tamba", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Kaolack", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Fatick", exact: true })).toBeVisible();
    await expect(page.getByRole("option", { name: "Wour Thierna", exact: true })).toBeVisible();
    await page.getByRole("option", { name: "Kidira", exact: true }).click();
  await page.getByLabel("Départ *", { exact: true }).click();
  await page.getByRole("option", { name: "Ballou", exact: true }).click();
  await expect(schedule).toHaveText("Rendez-vous 07h00 • Départ 08h00");
  await expect(page.getByRole("list", { name: "Arrêts du trajet" })).toHaveText("Ballou→Kidira→Goudiry→Tamba→Dakar");
  await page.getByRole("combobox", { name: "Ville de descente" }).click();
  await page.getByRole("option", { name: "Tamba", exact: true }).click();
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 14);
  date.setUTCHours(12, 0, 0, 0);
  while (date.getUTCDay() !== 1) date.setUTCDate(date.getUTCDate() + 1);
  for (const offset of [0, 1, 2, 3, 4, 5, 6]) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + offset);
    await page.getByLabel("Choisir une autre date").fill(d.toISOString().slice(0, 10));
    const button = page.getByRole("button", { name: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), exact: true });
    if ([1, 2, 4, 6].includes(d.getUTCDay())) await expect(button).toBeEnabled();
    else await expect(button).toBeDisabled();
  }
  await page.getByLabel("Choisir une autre date").fill(date.toISOString().slice(0, 10));
  await page.getByRole("combobox", { name: "Siège du passager 1" }).click();
  await expect(page.getByRole("option", { name: "Siège 2 — réservé", exact: true })).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("option", { name: "Siège 1", exact: true }).click();
  await page.getByLabel("Trajet *", { exact: true }).click();
  await page.getByRole("option", { name: "Via Ouro Sogui", exact: true }).click();
  await expect(schedule).toHaveText("Rendez-vous 06h00 • Départ 08h00");
  await expect(page.getByRole("combobox", { name: "Ville de descente" })).toHaveText("Dakar");
  await expect(page.getByRole("combobox", { name: "Siège du passager 1" })).toHaveText("Choisir un siège");
  await page.getByRole("combobox", { name: "Siège du passager 1" }).click();
  await expect(page.getByRole("option", { name: "Siège 1 — réservé", exact: true })).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("option", { name: "Siège 2", exact: true }).click();
});
