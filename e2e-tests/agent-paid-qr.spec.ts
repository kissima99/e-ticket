import { test, expect } from "@playwright/test";

test("L’agent obtient le QR après confirmation du règlement réel", async ({ page }) => {
  // Mocked agent session and server responses; no live login or payment mutation.
  let paid = false;
  const reservationId = "d2181ff6-7869-4cda-af76-e4e51b99671d";
  const qrToken = "579b5acf-6d1a-4c10-8f87-8b371df794a0";
  await page.route("**/functions/v1/dabo-ticket-control", async route => {
    const body = route.request().postDataJSON();
    if (body.action === "login") {
      await route.fulfill({ json: { token: "a".repeat(64), expires_at: new Date(Date.now() + 3600000).toISOString() } });
    } else if (body.action === "access") {
      await route.fulfill({ json: { allowed: true, label: "Agent de démonstration" } });
    } else if (body.action === "rewards") {
      await route.fulfill({ json: { rewards: [], total: 0 } });
    } else if (body.action === "list") {
      await route.fulfill({ json: { tickets: [{ id: reservationId, ticket_id: "BSE-D2181FF678694CDAAF76E4E51B99671D", created_at: new Date().toISOString(), full_name: "Voyageur Démonstration", departure_city: "Dakar", arrival_city: "Ballou", travel_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), seat_number: "1", passenger_count: 1, payment_status: paid ? "Payé" : "En attente", payment_method: "Wave", total_amount: 12000, verification_token: paid ? qrToken : null }], total: 1 } });
    } else if (body.action === "confirm") {
      expect(body.reservation_id).toBe(reservationId);
      expect(route.request().headers()["x-agent-session"]).toBe("a".repeat(64));
      paid = true;
      await route.fulfill({ json: { confirmed: true, already_paid: false } });
    } else {
      await route.abort();
    }
  });
  await page.goto("/agent/connexion");
  await page.getByLabel("Code agent").fill("1234");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByText("Voyageur Démonstration", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Afficher le QR" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Vérifier le ticket" })).toHaveCount(0);
  await page.getByRole("button", { name: "Confirmer le paiement", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirmer payé" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /J’ai vérifié la réception réelle du paiement/ }).check();
  await page.getByRole("button", { name: "Confirmer payé" }).click();
  await page.getByRole("button", { name: "Afficher le QR" }).click();
  await expect(page.getByRole("dialog").getByRole("img", { name: "QR de vérification du ticket avant embarquement" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("Payé, DABO TRANSPORT vous souhaite un très bon voyage !!!!!!!!", { exact: true })).toBeVisible();
});
