import { test, expect } from "@playwright/test";

test("Afficher toutes les villes de descente et un tarif provisoire", async ({ page }) => {
  test.setTimeout(120000);
  page.setDefaultTimeout(10000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const cases = [
    { departure: "Dakar", route: "Via Ouro Sogui", stops: ["Ouro Sogui", "Touba", "Dara Djolof", "Ranérou", "Sèmè", "Hamédi Hounaré", "Bondji", "Bakel", "Béma", "Gabou", "Saré", "Ballou"] },
    { departure: "Ballou", route: "Via Ouro Sogui", stops: ["Saré", "Gabou", "Béma", "Bakel", "Bondji", "Hamédi Hounaré", "Sèmè", "Ranérou", "Dara Djolof", "Touba", "Ouro Sogui", "Dakar"] },
    { departure: "Dakar", route: "Via Tamba – Kidira", stops: ["Kaolack", "Fatick", "Tamba", "Goudiry", "Kidira", "Wour Thierna", "Ballou"] },
    { departure: "Ballou", route: "Via Tamba – Kidira", stops: ["Wour Thierna", "Kidira", "Goudiry", "Tamba", "Fatick", "Kaolack", "Dakar"] },
  ];
  for (const entry of cases) {
    await page.getByLabel("Trajet *", { exact: true }).click();
    await page.getByRole("option", { name: entry.route, exact: true }).click();
    await page.getByLabel("Départ *", { exact: true }).click();
    await page.getByRole("option", { name: entry.departure, exact: true }).click();
    await page.getByRole("combobox", { name: "Ville de descente" }).click();
    for (const stop of entry.stops) await expect(page.getByRole("option", { name: stop, exact: true })).toBeVisible();
    await page.getByRole("option", { name: entry.stops[0], exact: true }).click();
    await expect(page.getByTestId("home-fare")).toHaveText("Tarif défini par la compagnie");
  }
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 14);
  while (date.getUTCDay() !== 2) date.setUTCDate(date.getUTCDate() + 1);
  await page.goto(`/reservation?route=tamba_kidira&departure=Dakar&arrival=Goudiry&date=${date.toISOString().slice(0, 10)}`);
  await expect(page.getByTestId("booking-total")).toHaveText("12 000 FCFA");
  await page.getByRole("button", { name: "Ajouter un passager" }).click();
  await expect(page.getByTestId("booking-total")).toHaveText("24 000 FCFA");
  await expect(page.getByText("Le tarif définitif est fixé par la compagnie et sera confirmé par l’agent.")).toBeVisible();
});
