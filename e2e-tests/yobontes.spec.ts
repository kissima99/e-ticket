import { test, expect } from "@playwright/test";

test("Envoyer une demande d’expédition YOBONTÉS", async ({ page }) => {
  let submitted: Record<string, unknown> | null = null;
  await page.route("**yobontes_shipments**", async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
  });
  await page.goto("/yobontes");
  await page.getByLabel("Nom de l’expéditeur *").fill("Awa Diop");
  await page.getByLabel("Numéro de l’expéditeur *").fill("77 302 50 08");
  await page.getByLabel("Résidence de l’expéditeur *").fill("Grand Dakar");
  await page.getByLabel("Nom du receveur *").fill("Mamadou Fall");
  await page.getByLabel("Numéro du receveur *").fill("78 339 51 54");
  await page.getByLabel("Adresse d’expédition / réception *").fill("Ballou, près de la gare");
  await page.getByLabel("Choisissez le type de colis *").click();
  await page.getByRole("option", { name: "GRD CARTON — 3 500 FCFA", exact: true }).click();
  await expect(page.getByText("3 500 FCFA", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Envoyer la demande d’expédition" }).click();
  await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible();
  expect(submitted).toMatchObject({ sender_name: "Awa Diop", receiver_name: "Mamadou Fall", package_type: "GRD CARTON", amount_fcfa: 3500 });
});
