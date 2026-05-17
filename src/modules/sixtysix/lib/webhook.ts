// Fires a POST to the user-configured N8N webhook URL with the snapshot payload.
// Called fire-and-forget from snapshot.ts. Silent on error or empty URL.

export async function fireWebhook(url: string, payload: unknown): Promise<void> {
  if (!url.trim()) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (_) { /* network error or CORS — silent */ }
}
