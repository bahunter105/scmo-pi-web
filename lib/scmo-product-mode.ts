export const isScmoProductMode =
  process.env.NEXT_PUBLIC_SCMO_PRODUCT_MODE === "1" || process.env.SCMO_PRODUCT_MODE === "1";

export const scmoProductName = "SimplicityCMO";
export const scmoProductLabel = "SCMO Product Mode";
export const scmoFaviconUrl = "https://www.simplicitycmo.com/wp-content/uploads/2023/05/scmosocial-150x150.jpg";
export const scmoLogoPath = "/scmo-logo.png";
export const scmoDefaultProvider = "openai-codex";
export const scmoDefaultModel = "gpt-5.4-mini";
