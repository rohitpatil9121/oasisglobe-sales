import { config } from "../config.js";

/* Send a login code as the approved authentication template (staff are almost
   always outside the 24-hour window, where free text does not deliver).
   Meta wants the code twice: in the body and on the copy-code button. */
export async function sendOtp(phone, code) {
  if (!config.metaAccessToken || !config.metaPhoneNumberId) {
    console.log(`[dev] login code for ${phone}: ${code}`);
    return;
  }
  const res = await fetch(`https://graph.facebook.com/${config.metaGraphVersion}/${config.metaPhoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.metaAccessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone.replace(/\D/g, ""),
      type: "template",
      template: {
        name: config.otpTemplate,
        language: { code: config.otpTemplateLang },
        components: [
          { type: "body", parameters: [{ type: "text", text: code }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
        ],
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("WhatsApp OTP send failed:", res.status, body.slice(0, 300));
    const e = new Error("Could not send the code on WhatsApp. Please try again."); e.status = 502; throw e;
  }
}
