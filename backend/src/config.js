import "dotenv/config";

// Every setting comes from the environment (see .env.example).
export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  // The salesperson's phone stays signed in; the owner's dashboard does not.
  appJwtExpiresIn: process.env.APP_JWT_EXPIRES_IN || "60d",
  dashboardJwtExpiresIn: process.env.DASHBOARD_JWT_EXPIRES_IN || "7d",
  otpTtlSeconds: parseInt(process.env.OTP_TTL_SECONDS || "300", 10),
  // WhatsApp Cloud API for login codes. Without a token the code is printed to
  // the server log instead (local development only).
  metaAccessToken: process.env.META_ACCESS_TOKEN,
  metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID,
  metaGraphVersion: process.env.META_GRAPH_VERSION || "v21.0",
  otpTemplate: process.env.OTP_TEMPLATE || "login_otp",
  otpTemplateLang: process.env.OTP_TEMPLATE_LANG || "en",
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
};

export function checkConfig() {
  const missing = ["supabaseUrl", "supabaseServiceKey", "jwtSecret"].filter((k) => !config[k]);
  if (missing.length) throw new Error(`Missing settings: ${missing.join(", ")} — see .env.example`);
  if (!config.metaAccessToken) console.warn("META_ACCESS_TOKEN not set: login codes will be printed to this log, not sent on WhatsApp.");
}
