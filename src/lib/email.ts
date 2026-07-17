import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const adminEmail = process.env.ADMIN_EMAIL || "kayfas12@gmail.com";
const fromEmail = "Litus Taste <onboarding@resend.dev>";

/**
 * Send a customer invite email with a sign-up link.
 */
export async function sendInviteEmail(email: string, inviteToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/auth/sign-up?invite=${inviteToken}`;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "¡Has sido invitado a Litus Taste!",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; padding: 24px 0;">
            <h1 style="color: #D4764A; font-size: 24px; margin: 0;">Litus Taste</h1>
            <p style="color: #6B8E3E; font-size: 14px;">Comida Preparada</p>
          </div>
          <div style="background: #FFF8F0; border-radius: 16px; padding: 32px;">
            <h2 style="color: #3D2B1F; font-size: 20px; margin: 0 0 12px;">
              ¡Bienvenido a Litus Taste!
            </h2>
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              Has sido invitado a crear una cuenta en Litus Taste para ordenar
              nuestro menú semanal de comida preparada fresca y deliciosa.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${inviteUrl}"
                 style="display: inline-block; background: #D4764A; color: white;
                        text-decoration: none; padding: 14px 32px; border-radius: 12px;
                        font-weight: 600; font-size: 14px;">
                Crear mi Cuenta
              </a>
            </div>
            <p style="color: #999; font-size: 12px;">
              Este enlace expira en 7 días. Si no esperabas esta invitación,
              puedes ignorar este correo.
            </p>
          </div>
          <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
            <p>Litus Taste — Hecho en Costa Rica 🇨🇷</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending invite email:", error);
  }
}

/**
 * Send an order notification to the admin.
 */
export async function sendOrderNotification(
  customerName: string,
  customerEmail: string,
  items: Array<{ mealName: string; quantity: number; unitPrice: string }>,
  notes?: string | null
) {
  const total = items.reduce(
    (sum, i) => sum + Number(i.unitPrice) * i.quantity,
    0
  );

  const itemsList = items
    .map((i) => `<tr><td>${i.quantity}x ${i.mealName}</td><td style="text-align: right;">₡${(Number(i.unitPrice) * i.quantity).toLocaleString()}</td></tr>`)
    .join("");

  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nuevo Pedido — ${customerName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #D4764A; border-radius: 16px 16px 0 0; padding: 24px; color: white;">
            <h1 style="font-size: 20px; margin: 0;">¡Nuevo Pedido! 🎉</h1>
          </div>
          <div style="background: #FFF8F0; padding: 24px;">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #3D2B1F; font-size: 14px; margin: 0 0 8px;">Cliente</h3>
              <p style="color: #666; font-size: 14px; margin: 0;">${customerName}</p>
              <p style="color: #666; font-size: 12px; margin: 2px 0 0;">${customerEmail}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 1px solid #E8DCC8;">
                  <th style="text-align: left; padding: 8px 0; color: #999;">Artículo</th>
                  <th style="text-align: right; padding: 8px 0; color: #999;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding-top: 12px; font-weight: bold; color: #3D2B1F;">Total</td>
                  <td style="padding-top: 12px; text-align: right; font-weight: bold; color: #D4764A;">
                    ₡${total.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
            ${notes ? `<div style="margin-top: 16px;"><p style="color: #999; font-size: 12px;"><strong>Notas:</strong> ${notes}</p></div>` : ""}
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders"
                 style="display: inline-block; background: #D4764A; color: white;
                        text-decoration: none; padding: 12px 24px; border-radius: 12px;
                        font-weight: 600; font-size: 14px;">
                Ver Pedido
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending order notification:", error);
  }
}

/**
 * Notify the admin when a new user registers and needs approval.
 */
export async function notifyAdminNewRegistration(
  name: string,
  email: string,
  phone: string | null,
  deliveryAddress: string | null,
  city: string | null
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nuevo registro pendiente — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #D4764A; border-radius: 16px 16px 0 0; padding: 24px; color: white;">
            <h1 style="font-size: 20px; margin: 0;">Nuevo Usuario Pendiente</h1>
          </div>
          <div style="background: #FFF8F0; padding: 24px;">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #3D2B1F; font-size: 14px; margin: 0 0 8px;">Datos del solicitante</h3>
              <p style="color: #666; font-size: 14px; margin: 0;"><strong>Nombre:</strong> ${name}</p>
              <p style="color: #666; font-size: 14px; margin: 2px 0 0;"><strong>Email:</strong> ${email}</p>
              ${phone ? `<p style="color: #666; font-size: 14px; margin: 2px 0 0;"><strong>Teléfono:</strong> ${phone}</p>` : ""}
              ${deliveryAddress ? `<p style="color: #666; font-size: 14px; margin: 2px 0 0;"><strong>Dirección:</strong> ${deliveryAddress}${city ? `, ${city}` : ""}</p>` : ""}
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${baseUrl}/admin/approvals"
                 style="display: inline-block; background: #D4764A; color: white;
                        text-decoration: none; padding: 14px 32px; border-radius: 12px;
                        font-weight: 600; font-size: 14px;">
                Revisar Solicitudes
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
            <p>Litus Taste — Panel de Administración</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

/**
 * Notify a user when their account is approved or declined.
 */
export async function notifyUserApprovalStatus(
  userEmail: string,
  userName: string,
  status: "approved" | "declined"
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (status === "approved") {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject: "¡Tu cuenta en Litus Taste ha sido aprobada!",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 0;">
              <h1 style="color: #D4764A; font-size: 24px; margin: 0;">Litus Taste</h1>
              <p style="color: #6B8E3E; font-size: 14px;">Comida Preparada</p>
            </div>
            <div style="background: #FFF8F0; border-radius: 16px; padding: 32px;">
              <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h2 style="color: #3D2B1F; font-size: 20px; margin: 0 0 12px; text-align: center;">
                ¡Bienvenido, ${userName}!
              </h2>
              <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
                Tu cuenta ha sido aprobada. Ya puedes iniciar sesión y hacer tu
                primer pedido del menú semanal.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${baseUrl}/auth/sign-in"
                   style="display: inline-block; background: #D4764A; color: white;
                          text-decoration: none; padding: 14px 32px; border-radius: 12px;
                          font-weight: 600; font-size: 14px;">
                  Iniciar Sesión
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
              <p>Litus Taste — Hecho en Costa Rica 🇨🇷</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending approval email:", error);
    }
  } else {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject: "Actualización sobre tu cuenta en Litus Taste",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 0;">
              <h1 style="color: #D4764A; font-size: 24px; margin: 0;">Litus Taste</h1>
              <p style="color: #6B8E3E; font-size: 14px;">Comida Preparada</p>
            </div>
            <div style="background: #FFF8F0; border-radius: 16px; padding: 32px;">
              <h2 style="color: #3D2B1F; font-size: 20px; margin: 0 0 12px; text-align: center;">
                Hola, ${userName}
              </h2>
              <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
                Lamentamos informarte que tu solicitud de registro en Litus Taste
                no ha sido aprobada en este momento.
              </p>
              <p style="color: #999; font-size: 13px; text-align: center; margin-top: 16px;">
                Si crees que esto es un error, puedes contactarnos para más información.
              </p>
            </div>
            <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
              <p>Litus Taste — Hecho en Costa Rica 🇨🇷</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending decline email:", error);
    }
  }
}

/**
 * Send an email to the customer when their order is marked as "Recibido".
 */
export async function sendOrderReceivedEmail(
  userEmail: string,
  userName: string,
  orderId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: "¡Hemos recibido tu pedido! ✅",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; padding: 24px 0;">
            <h1 style="color: #D4764A; font-size: 24px; margin: 0;">Litus Taste</h1>
            <p style="color: #6B8E3E; font-size: 14px;">Comida Preparada</p>
          </div>
          <div style="background: #FFF8F0; border-radius: 16px; padding: 32px;">
            <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">✅</div>
            <h2 style="color: #3D2B1F; font-size: 20px; margin: 0 0 12px; text-align: center;">
              ¡Pedido Recibido, ${userName}!
            </h2>
            <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
              Hemos recibido tu pedido correctamente. El equipo de Litus Taste
              ya está trabajando para preparar tus comidas. Te notificaremos
              cuando esté listo.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${baseUrl}/account/orders/${orderId}"
                 style="display: inline-block; background: #D4764A; color: white;
                        text-decoration: none; padding: 14px 32px; border-radius: 12px;
                        font-weight: 600; font-size: 14px;">
                Ver Pedido
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
            <p>Litus Taste — Hecho en Costa Rica 🇨🇷</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending order received email:", error);
  }
}

/**
 * Send an email to the customer when their order is marked as "Completado".
 */
export async function sendOrderCompletedEmail(
  userEmail: string,
  userName: string,
  orderId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: "¡Tu pedido está listo! 🎉🍽️",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; padding: 24px 0;">
            <h1 style="color: #D4764A; font-size: 24px; margin: 0;">Litus Taste</h1>
            <p style="color: #6B8E3E; font-size: 14px;">Comida Preparada</p>
          </div>
          <div style="background: #FFF8F0; border-radius: 16px; padding: 32px;">
            <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">🍽️</div>
            <h2 style="color: #3D2B1F; font-size: 20px; margin: 0 0 12px; text-align: center;">
              ¡Pedido Completado, ${userName}!
            </h2>
            <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
              Tu pedido ha sido completado. Esperamos que disfrutes cada bocado.
              ¡Buen provecho!
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${baseUrl}/account/orders/${orderId}"
                 style="display: inline-block; background: #D4764A; color: white;
                        text-decoration: none; padding: 14px 32px; border-radius: 12px;
                        font-weight: 600; font-size: 14px;">
                Ver Pedido
              </a>
            </div>
            <p style="color: #999; font-size: 13px; text-align: center;">
              ¿Listo para tu próximo pedido? El menú de la próxima semana ya está disponible.
            </p>
            <div style="text-align: center; margin-top: 8px;">
              <a href="${baseUrl}/menu"
                 style="color: #D4764A; font-size: 14px; text-decoration: underline;">
                Ver Menú Semanal →
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
            <p>Litus Taste — Hecho en Costa Rica 🇨🇷</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending order completed email:", error);
  }
}

/**
 * Send menu notification to all registered customers.
 */
export async function sendMenuNotification(
  customerEmails: string[],
  menuLabel: string,
  cutoffDate?: Date | null
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cutoffText = cutoffDate
    ? ` antes del ${cutoffDate.toLocaleDateString("es-CR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
      })}`
    : "";

  // Batch send to all customers (Resend allows up to 50 recipients per send)
  for (let i = 0; i < customerEmails.length; i += 50) {
    const batch = customerEmails.slice(i, i + 50);

    try {
      await resend.emails.send({
        from: fromEmail,
        to: batch,
        subject: `Nuevo Menú Semanal — ${menuLabel}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 0;">
              <h1 style="color: #D4764A; font-size: 24px; margin: 0;">Litus Taste</h1>
              <p style="color: #6B8E3E; font-size: 14px;">Comida Preparada</p>
            </div>
            <div style="background: #FFF8F0; border-radius: 16px; padding: 32px;">
              <h2 style="color: #3D2B1F; font-size: 20px; margin: 0 0 12px;">
                ¡Nuevo Menú Disponible!
              </h2>
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                El menú ${menuLabel} ya está disponible. Haz tu pedido${cutoffText}
                para recibir tus comidas frescas y listas para disfrutar.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${baseUrl}/menu"
                   style="display: inline-block; background: #D4764A; color: white;
                          text-decoration: none; padding: 14px 32px; border-radius: 12px;
                          font-weight: 600; font-size: 14px;">
                  Ver Menú
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
              <p>Litus Taste — Hecho en Costa Rica 🇨🇷</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending menu notification:", error);
    }
  }
}
