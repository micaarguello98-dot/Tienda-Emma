const STORAGE_KEY = "emma-order-tokens";

export function getStoredOrderTokens(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string" && t.length > 0)
      : [];
  } catch {
    return [];
  }
}

export function appendOrderToken(token: string): void {
  if (typeof window === "undefined" || !token) return;
  const cur = new Set(getStoredOrderTokens());
  cur.add(token);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cur]));
}
