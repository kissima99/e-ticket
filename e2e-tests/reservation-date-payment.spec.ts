import { test, expect } from "@playwright/test";

test("Choisir un trajet puis obtenir le QR uniquement après paiement validé", async ({ page }) => {
  test.setTimeout(90000);
  page.setDefaultTimeout(10000);
  await page.setViewportSize({ width: 390, height: 844 });
  // Simulated server responses: no live reservation or payment is created.
  let paid = false;
  let bookingRequest = "";
  const qrToken = "579b5acf-6d1a-4c10-8f87-8b371df794a0";
  await page.route("**/functions/v1/dabo-booking", async route => {
    const body = route.request().postDataJSON();
    if (body?.action === "availability") {
      expect(body.data.route_id).toBe("ouro_sogui");
      await route.fulfill({ json: { taken: ["70"] } });
    } else if (body?.action === "book") {
      bookingRequest = body.request_id;
      expect(body.data.route_id).toBe("ouro_sogui");
      expect(body.data.arrival_city).toBe("Ouro Sogui");
      await route.fulfill({ json: { ticket: { ...body.data, rendezvous_time: "12:00", departure_time: "14:00", ticket_id: `BSE-${body.request_id.replace(/-/g, "").toUpperCase()}`, seat_number: body.data.seats.join(", "), passenger_count: body.data.seats.length, total_amount: 24000, payment_status: "En attente", verification_token: null } } });
    } else if (body?.action === "payment_status") {
      expect(body.request_id).toBe(bookingRequest);
      expect(body.phone).toBe("+221771234567");
      await route.fulfill({ json: { payment_status: paid ? "Payé" : "En attente", verification_token: paid ? qrToken : null } });
    } else {
      await route.abort();
    }
  });
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 10);
  date.setUTCHours(12, 0, 0, 0);
  while (date.getUTCDay() !== 1) date.setUTCDate(date.getUTCDate() + 1);
  const dateValue = date.toISOString().slice(0, 10);
  const dateName = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  await page.goto("/");
  await page.getByRole("combobox", { name: "Ville de descente" }).click();
  await expect(page.getByRole("option", { name: "Tamba", exact: true })).toHaveCount(0);
  await page.getByRole("option", { name: "Ouro Sogui", exact: true }).click();
  await expect(page.getByTestId("route-schedule")).toHaveText("Rendez-vous 12h00 • Départ 14h00");
  await page.getByLabel("Choisir une autre date").fill(dateValue);
  await page.getByRole("button", { name: dateName, exact: true }).click();
  await expect(page.getByRole("button", { name: dateName, exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await page.getByRole("link", { name: "Continuer la réservation" }).click();
  await expect(page.getByLabel("Choisir une autre date")).toHaveValue(dateValue);
  await expect(page.getByRole("combobox", { name: "Ville de descente" })).toHaveText("Ouro Sogui");
  await expect(page.getByTestId("route-schedule")).toHaveText("Rendez-vous 12h00 • Départ 14h00");

  await page.getByRole("button", { name: "Dates suivantes" }).click();
  await expect(page.getByRole("button", { name: dateName, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Dates précédentes" }).click();
  await expect(page.getByRole("button", { name: dateName, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Retirer un passager" })).toBeDisabled();
  await page.getByRole("button", { name: "Ajouter un passager" }).click();
  await expect(page.getByLabel("Nombre de passagers").getByRole("status")).toHaveText("2Passagers");
  await expect(page.getByTestId("booking-total")).toHaveText("24 000 FCFA");
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
  await page.getByRole("checkbox", { name: /J’ai vérifié les renseignements/ }).check();
  await page.getByRole("button", { name: "Confirmer le ticket" }).click();
  await expect(page.getByRole("heading", { name: "Votre réservation est enregistrée" })).toBeVisible();
  await expect(page.getByText("Paiement en attente", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("img", { name: "QR de vérification du ticket avant embarquement" })).toHaveCount(0);
  await expect(page.getByText(/DABO TRANSPORT VOUS SOUHAITE/)).toHaveCount(0);

  const pendingDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Télécharger le PDF" }).click();
  const pendingStream = await (await pendingDownload).createReadStream();
  const pendingChunks: Buffer[] = [];
  for await (const chunk of pendingStream!) pendingChunks.push(Buffer.from(chunk));
  const pendingPdf = Buffer.concat(pendingChunks).toString("latin1");
  expect(pendingPdf).not.toContain("/Subtype /Image");
  expect(pendingPdf).not.toContain("/verification/");
  expect(pendingPdf).toContain("14h00");
  expect(pendingPdf).toContain("12h00");
  expect(pendingPdf).toContain("24 000 FCFA");

  paid = true;
  await page.getByRole("button", { name: "Actualiser le paiement" }).click();
  await expect(page.getByRole("heading", { name: "Votre e-ticket payé est prêt !" })).toBeVisible();
  await expect(page.getByRole("img", { name: "QR de vérification du ticket avant embarquement" })).toBeVisible();
  await expect(page.getByText("DABO TRANSPORT VOUS SOUHAITE UN TRES BON VOYAGE !!!", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ouvrir la page de vérification" })).toHaveAttribute("href", `/verification/${qrToken}`);
  const paidDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Télécharger le PDF" }).click();
  const paidStream = await (await paidDownload).createReadStream();
  const paidChunks: Buffer[] = [];
  for await (const chunk of paidStream!) paidChunks.push(Buffer.from(chunk));
  const paidPdf = Buffer.concat(paidChunks).toString("latin1");
  expect(paidPdf).toContain("/Subtype /Image");
  expect(paidPdf).toContain(`/verification/${qrToken}`);
  expect(paidPdf).toContain("DABO TRANSPORT VOUS SOUHAITE UN TRES BON VOYAGE !!!");

  paid = false;
  await page.getByRole("button", { name: "Actualiser le paiement" }).click();
  await expect(page.getByRole("heading", { name: "Votre réservation est enregistrée" })).toBeVisible();
  await expect(page.getByRole("img", { name: "QR de vérification du ticket avant embarquement" })).toHaveCount(0);
});
