export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("access_token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}
