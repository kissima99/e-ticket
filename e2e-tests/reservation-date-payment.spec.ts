import { test, expect } from "@playwright/test";

test("Choisir une date, ajuster les passagers et sélectionner un paiement", async ({ page }) => {
  test.setTimeout(90000);
  page.setDefaultTimeout(10000);
  await page.setViewportSize({ width: 390, height: 844 });
  // This test covers the selection UI; no live reservation or payment is created.
  await page.route("**/functions/v1/dabo-booking", async route => {
    const body = route.request().postDataJSON();
    if (body?.action === "availability") {
      await route.fulfill({ json: { taken: ["70"] } });
    } else {
      await route.abort();
    }
  });
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 10);
  date.setUTCHours(15, 0, 0, 0);
  while (date.getUTCDay() !== 2) date.setUTCDate(date.getUTCDate() + 1);
  const dateValue = date.toISOString().slice(0, 10);
  const dateName = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  await page.goto("/");
  await page.getByLabel("Choisir une autre date").fill(dateValue);
  await page.getByRole("button", { name: dateName, exact: true }).click();
  await expect(page.getByRole("button", { name: dateName, exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await page.getByRole("link", { name: "Continuer la réservation" }).click();
  await expect(page.getByLabel("Choisir une autre date")).toHaveValue(dateValue);

  await page.getByRole("button", { name: "Dates suivantes" }).click();
  await expect(page.getByRole("button", { name: dateName, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Dates précédentes" }).click();
  await expect(page.getByRole("button", { name: dateName, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Retirer un passager" })).toBeDisabled();
  await page.getByRole("button", { name: "Ajouter un passager" }).click();
  await expect(page.getByLabel("Nombre de passagers").getByRole("status")).toHaveText("2Passagers");
  await expect(page.getByText("24 000 FCFA", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Siège du passager 1" }).click();
  await page.getByRole("option", { name: "Siège 1", exact: true }).click();
  await page.getByRole("combobox", { name: "Siège du passager 2" }).click();
  await expect(page.getByRole("option", { name: "Siège 70 — réservé", exact: true })).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("option", { name: "Siège 2", exact: true }).click();
  await page.getByRole("button", { name: "Réserver", exact: true }).click();
  await page.getByLabel("Nom complet").fill("Voyageur Démonstration");
  await page.getByLabel(/^Téléphone\s*\*$/).fill("77 123 45 67");
  await page.getByLabel("Numéro CNI / passeport").fill("DEMO123456");
  await page.getByLabel("Téléphone du contact d’urgence").fill("78 123 45 67");
  await page.getByLabel("Point de montée").fill("Gare de Dakar");
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(page.getByText("Choisissez votre moyen de paiement", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Cash", exact: true })).toBeChecked();
  await page.getByText("Wave", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Wave", exact: true })).toBeChecked();
  await expect(page.getByText(/Aucun débit automatique/)).toBeVisible();
  await page.getByText("OM", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "OM", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Retour", exact: true }).click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(page.getByRole("radio", { name: "OM", exact: true })).toBeChecked();
  await expect(page.getByRole("button", { name: "Confirmer le ticket" })).toBeVisible();
});
