import { test, expect } from "@playwright/test";

test("Afficher les tarifs par arrêt et recalculer le total des passagers", async ({ page }) => {
  test.setTimeout(120000);
  page.setDefaultTimeout(10000);
  await page.setViewportSize({ width: 390, height: 844 });
  // The flow only checks prices and navigation; no reservation is created.
  await page.goto("/");
  const cases = [
    { departure: "Dakar", route: "Via Ouro Sogui", arrival: "Ouro Sogui", fare: 10000 },
    { departure: "Ballou", route: "Via Ouro Sogui", arrival: "Ouro Sogui", fare: 10000 },
    { departure: "Dakar", route: "Via Tamba – Kidira", arrival: "Tamba", fare: 8000 },
    { departure: "Dakar", route: "Via Tamba – Kidira", arrival: "Goudiry", fare: 11000 },
    { departure: "Dakar", route: "Via Tamba – Kidira", arrival: "Kidira", fare: 11000 },
    { departure: "Ballou", route: "Via Tamba – Kidira", arrival: "Kidira", fare: 1500 },
    { departure: "Ballou", route: "Via Tamba – Kidira", arrival: "Tamba", fare: 6000 },
    { departure: "Ballou", route: "Via Tamba – Kidira", arrival: "Goudiry", fare: 5000 },
    { departure: "Ballou", route: "Via Tamba – Kidira", arrival: "Dakar", fare: 12000 },
    { departure: "Dakar", route: "Via Tamba – Kidira", arrival: "Ballou", fare: 12000 },
    { departure: "Dakar", route: "Via Tamba – Kidira", arrival: "Goudiry", fare: 11000 },
  ];
  for (const entry of cases) {
    await page.getByLabel("Trajet *", { exact: true }).click();
    await page.getByRole("option", { name: entry.route, exact: true }).click();
    await expect(page.getByLabel("Trajet *", { exact: true })).toHaveText(entry.route);
    await page.getByLabel("Départ *", { exact: true }).click();
    await page.getByRole("option", { name: entry.departure, exact: true }).click();
    await expect(page.getByLabel("Départ *", { exact: true })).toHaveText(entry.departure);
    await page.getByRole("combobox", { name: "Ville de descente" }).click();
    await page.getByRole("option", { name: entry.arrival, exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Ville de descente" })).toHaveText(entry.arrival);
    await expect(page.getByLabel("Départ *", { exact: true })).toHaveText(entry.departure);
    await expect(page.getByTestId("home-fare")).toHaveText(`${entry.fare.toLocaleString("fr-FR")} FCFA par personne`);
  }
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 14);
  while (date.getUTCDay() !== 2) date.setUTCDate(date.getUTCDate() + 1);
  await page.getByLabel("Choisir une autre date").fill(date.toISOString().slice(0, 10));
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await page.route("**/functions/v1/dabo-booking", async route => {
    expect(route.request().postDataJSON().action).toBe("availability");
    await route.fulfill({ json: { taken: [] } });
  });
  await page.getByRole("link", { name: "Continuer la réservation" }).click();
  await expect(page.getByRole("combobox", { name: "Ville de descente" })).toHaveText("Goudiry");
  await expect(page.getByTestId("booking-total")).toHaveText("11 000 FCFA");
  await page.getByRole("button", { name: "Ajouter un passager" }).click();
  await expect(page.getByTestId("booking-total")).toHaveText("22 000 FCFA");
  await page.getByRole("combobox", { name: "Ville de descente" }).click();
  await page.getByRole("option", { name: "Tamba", exact: true }).click();
  await expect(page.getByTestId("booking-total")).toHaveText("16 000 FCFA");
  await page.getByLabel("Départ *", { exact: true }).click();
  await page.getByRole("option", { name: "Ballou", exact: true }).click();
  await expect(page.getByTestId("booking-total")).toHaveText("12 000 FCFA");
  await page.getByRole("combobox", { name: "Ville de descente" }).click();
  await page.getByRole("option", { name: "Kidira", exact: true }).click();
  await expect(page.getByTestId("booking-total")).toHaveText("3 000 FCFA");
  await page.getByRole("link", { name: "Accueil", exact: true }).click();
  await page.getByRole("link", { name: "Contrôle du ticket — Espace agent", exact: true }).click();
  await expect(page).toHaveURL(/\/agent\/connexion$/);
  await expect(page.getByLabel("Code agent")).toBeVisible();
});
