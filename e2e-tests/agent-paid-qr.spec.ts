import { test, expect } from "@playwright/test";

test("L’agent confirme le règlement puis télécharge et partage le PDF final avec QR", async ({ page }) => {
  test.setTimeout(60000);
  // Mocked agent session and server responses; no live login or payment mutation.
  let paid = false;
  const reservationId = "d2181ff6-7869-4cda-af76-e4e51b99671d";
  const qrToken = "579b5acf-6d1a-4c10-8f87-8b371df794a0";
  const greeting = "DABO TRANSPORT VOUS SOUHAITE UN TRES BON VOYAGE !!!";
  const filename = "BSE-D2181FF678694CDAAF76E4E51B99671D.pdf";
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data: { files: File[]; text: string }) => {
      const file = data.files[0];
      const contents = await file.text();
      (window as unknown as { sharedTicket: unknown }).sharedTicket = { name: file.name, type: file.type, text: data.text, hasQr: contents.includes("/Subtype /Image") && contents.includes("/verification/") };
    } });
  });
  await page.route("**/functions/v1/dabo-ticket-control", async route => {
    const body = route.request().postDataJSON();
    if (body.action === "login") {
      await route.fulfill({ json: { token: "a".repeat(64), expires_at: new Date(Date.now() + 3600000).toISOString() } });
    } else if (body.action === "access") {
      await route.fulfill({ json: { allowed: true, label: "Agent de démonstration" } });
    } else if (body.action === "rewards") {
      await route.fulfill({ json: { rewards: [], total: 0 } });
    } else if (body.action === "list") {
      await route.fulfill({ json: { tickets: [{ id: reservationId, ticket_id: filename.replace(".pdf", ""), created_at: new Date().toISOString(), full_name: "Voyageur Démonstration", departure_city: "Dakar", arrival_city: "Ballou", route_id: "tamba_kidira", rendezvous_time: "05:00", departure_time: "06:00", travel_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), seat_number: "1", passenger_count: 1, payment_status: paid ? "Payé" : "En attente", payment_method: "Wave", total_amount: 12000, verification_token: paid ? qrToken : null }], total: 1 } });
    } else if (body.action === "confirm") {
      expect(body.reservation_id).toBe(reservationId);
      expect(route.request().headers()["x-agent-session"]).toBe("a".repeat(64));
      paid = true;
      await route.fulfill({ json: { confirmed: true, already_paid: false } });
    } else if (body.action === "paid_ticket") {
      expect(body.reservation_id).toBe(reservationId);
      expect(route.request().headers()["x-agent-session"]).toBe("a".repeat(64));
      await route.fulfill(paid ? { json: { ticket: { ticket_id: filename.replace(".pdf", ""), full_name: "Voyageur Démonstration", phone: "+221771234567", departure_city: "Dakar", arrival_city: "Ballou", route_id: "tamba_kidira", rendezvous_time: "05:00", departure_time: "06:00", travel_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), seat_number: "1", passenger_count: 1, boarding_point: "Gare de Dakar", luggage_count: 1, payment_status: "Payé", payment_method: "Wave", total_amount: 12000, verification_token: qrToken } } } : { status: 409, json: { error: "Le PDF final avec QR est disponible uniquement après validation du paiement." } });
    } else {
      await route.abort();
    }
  });
  await page.goto("/agent/connexion");
  await page.getByLabel("Code agent").fill("1234");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByText("Voyageur Démonstration", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Afficher le QR" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "PDF / WhatsApp" })).toHaveCount(0);
  await page.getByRole("button", { name: "Confirmer le paiement", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirmer payé" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /J’ai vérifié la réception réelle du paiement/ }).check();
  await page.getByRole("button", { name: "Confirmer payé" }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Télécharger et envoyer le ticket final" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("img", { name: "QR de vérification du ticket avant embarquement" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText(greeting, { exact: true })).toBeVisible();
  const whatsapp = page.getByRole("link", { name: "Ouvrir WhatsApp du client" });
  await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/221771234567\?text=/);
  const message = new URL((await whatsapp.getAttribute("href"))!).searchParams.get("text");
  expect(message).toContain(greeting);
  expect(message).toContain("Rendez-vous 05h00 • Départ 06h00");

  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Télécharger le PDF final" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe(filename);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const pdf = Buffer.concat(chunks).toString("latin1");
  expect(pdf).toContain("/Subtype /Image");
  expect(pdf).toContain(`/verification/${qrToken}`);
  expect(pdf).toContain(greeting);
  expect(pdf).toContain("06h00");
  expect(pdf).toContain("05h00");
  expect(pdf).not.toContain("Payé, DABO TRANSPORT");

  await page.getByRole("button", { name: "Partager le PDF via WhatsApp" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { sharedTicket?: unknown }).sharedTicket)).toEqual({ name: filename, type: "application/pdf", text: greeting, hasQr: true });
  await page.evaluate(() => Object.defineProperty(navigator, "canShare", { configurable: true, value: () => false }));
  const fallbackDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Partager le PDF via WhatsApp" }).click();
  expect((await fallbackDownload).suggestedFilename()).toBe(filename);
  await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Afficher le QR" }).click();
  await expect(page.getByRole("dialog").getByText(greeting, { exact: true })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();

  paid = false;
  await page.getByRole("button", { name: "PDF / WhatsApp" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Le PDF final avec QR est disponible uniquement après validation du paiement.");
  await expect(page.getByRole("button", { name: "Télécharger le PDF final" })).toHaveCount(0);
});
