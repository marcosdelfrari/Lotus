export type AcceptanceDevice = {
  hash: string;
  userAgent: string;
  language: string;
  timezone: string;
  screen: string;
  platform: string;
};

export async function collectAcceptanceDevice(): Promise<AcceptanceDevice> {
  const userAgent = navigator.userAgent;
  const language = navigator.language || "pt-BR";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const platform = navigator.platform || "desconhecido";
  const material = [userAgent, language, timezone, screenSize, platform].join("|");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material),
  );
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    hash,
    userAgent,
    language,
    timezone,
    screen: screenSize,
    platform,
  };
}
