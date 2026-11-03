export async function getJson(url, { timeoutMs = 8000 } = {}) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "ProjetoWeb2/0.1" },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} em ${new URL(url).origin}`);
  }
  return res.json();
}