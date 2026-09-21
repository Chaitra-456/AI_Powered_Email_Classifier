

const BASE = "https://ai-powered-email-classifier-backend.onrender.com";

async function safeJson(resp) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

export async function fetchEmails(email, app_password) {
  const payloads = [
    { url: `${BASE}/emails`, body: { email_id: email, app_password } },
    { url: `${BASE}/fetch_emails`, body: { email_id: email, app_password } },
    { url: `${BASE}/fetch`, body : { gmail: email, appPassword: app_password } },
    { url: `${BASE}/fetch_emails `,body: { email, app_password } }
  ];

  for (const p of payloads) {
    try {
      const resp = await fetch(p.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p.body)
      });

      if (resp.status === 404) continue;

      const j = await safeJson(resp);
      if (!j) continue;

      if (
        j.status === "success" ||
        j.status === "ok" ||
        Array.isArray(j.emails) ||
        Array.isArray(j)
      ) {
        if (Array.isArray(j.emails)) return { emails: j.emails };
        if (Array.isArray(j)) return { emails: j };
        return j;
      }

      if (j.error) return { error: j.error };
    } catch (err) {
      console.warn("fetchEmails failed:", p.url, err);
    }
  }

  return { error: "All attempts failed. Check backend." };
}

export async function getCategory(cat) {
  const encoded = encodeURIComponent(cat);

  const urls = [
    `${BASE}/get_category/${encoded}`,
    `${BASE}/getCategory/${encoded}`,
    `${BASE}/category/${encoded}`
  ];

  for (const u of urls) {
    try {
      const resp = await fetch(u);
      if (!resp.ok) continue;

      const j = await safeJson(resp);
      if (Array.isArray(j)) return j;
      if (j && Array.isArray(j.emails)) return j.emails;
    } catch (err) {
      console.warn("getCategory failed:", u, err);
    }
  }

  return [];
}