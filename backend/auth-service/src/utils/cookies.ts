type Response = import("express").Response;

const cookieOptions = (secure: boolean) => ({
  path: "/api/auth",
  // JavaScript bu cookie'yi okuyamaz; tarayıcı Auth isteklerinde otomatik gönderir.
  httpOnly: true,
  secure,
  sameSite: "strict" as const,
});

const readCookie = (
  cookieHeader: string | undefined,
  name: string,
): string | undefined => {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== name) continue;

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const setRefreshCookie = (
  res: Response,
  refreshToken: string,
  secure: boolean,
) => {
  res.cookie("refresh_token", refreshToken, {
    ...cookieOptions(secure),
    maxAge: 7 * 24 * 60 * 60 * 1_000,
  });
};

const clearRefreshCookie = (res: Response, secure: boolean) => {
  // Logout sırasında tarayıcıya refresh_token cookie'sini silmesi söylenir.
  res.clearCookie("refresh_token", cookieOptions(secure));
};

module.exports = { readCookie, setRefreshCookie, clearRefreshCookie };
