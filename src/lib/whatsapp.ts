/**
 * WhatsApp Cloud API integration for Litus Taste.
 *
 * ⚠️ IMPORTANT: WhatsApp Cloud API requires an approved TEMPLATE for
 * business-initiated conversations. Text messages (type: "text") only work
 * within a 24-hour customer service window after the admin sends a message
 * to the WhatsApp Business number first.
 *
 * For production, create a template in WhatsApp Manager:
 * - Name: "new_order_notification" (Spanish, Utility category)
 * - Body: "🛵 Nuevo Pedido — {{1}}\n\n{{2}}\n\n📋 {{3}}"
 * - Variables: {{1}} = customer name, {{2}} = items summary, {{3}} = admin link
 * Then change `type: "text"` to a template message instead.
 *
 * Setup:
 * 1. Go to https://developers.facebook.com → Create App → Business → WhatsApp
 * 2. Add the WhatsApp product, set up WABA, get Phone Number ID
 * 3. Generate a permanent access token (Settings → Token)
 * 4. Admin must send a "Hello" to the WhatsApp Business number first
 *    (this opens the 24h service window for text messages)
 *
 * Required env vars:
 *   WHATSAPP_PHONE_NUMBER_ID - Your WhatsApp Business phone number ID
 *   WHATSAPP_ACCESS_TOKEN   - Permanent access token from Meta
 *   WHATSAPP_TO_NUMBER      - Admin's WhatsApp number (format: 506XXXXXXXX)
 */

const WHATSAPP_API_VERSION = "v22.0";
const BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

/** Shared helper: sends a text message to the admin via WhatsApp Cloud API. */
async function sendWhatsAppText(body: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminNumber = process.env.WHATSAPP_TO_NUMBER;

  if (!phoneNumberId || !accessToken || !adminNumber) {
    console.warn(
      "WhatsApp not configured — set WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_TO_NUMBER"
    );
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: adminNumber,
          type: "text",
          text: { preview_url: true, body },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("WhatsApp API error:", error);
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}

/**
 * Send an order notification to the admin via WhatsApp.
 */
export async function sendOrderWhatsApp(
  customerName: string,
  items: Array<{ mealName: string; quantity: number; unitPrice: string }>,
  customerPhone?: string | null,
  notes?: string | null
): Promise<void> {
  const total = items.reduce(
    (sum, i) => sum + Number(i.unitPrice) * i.quantity,
    0
  );

  const itemLines = items
    .map((i) => `• ${i.quantity}x ${i.mealName}`)
    .join("\n");

  const messageBody = [
    `🛵 *Nuevo Pedido — ${customerName}*`,
    ``,
    `${itemLines}`,
    ``,
    `*Total:* ₡${total.toLocaleString()}`,
    customerPhone ? `📞 ${customerPhone}` : "",
    notes ? `📝 ${notes}` : "",
    ``,
    `📋 ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendWhatsAppText(messageBody);
}

/**
 * Send a new registration notification to the admin via WhatsApp.
 */
export async function sendNewRegistrationWhatsApp(
  name: string,
  email: string,
  phone?: string | null
): Promise<void> {
  const messageBody = [
    `👤 *Nuevo Registro Pendiente*`,
    ``,
    `*Nombre:* ${name}`,
    `*Email:* ${email}`,
    phone ? `*Teléfono:* ${phone}` : "",
    ``,
    `📋 ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/approvals`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendWhatsAppText(messageBody);
}
