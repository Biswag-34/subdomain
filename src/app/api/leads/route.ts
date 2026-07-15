type LeadPayload = {
  callbackTime?: string;
  email?: string;
  interestedIn?: string;
  interest?: string;
  lead_action?: string;
  lead_callback_time?: string;
  lead_name?: string;
  lead_phone?: string;
  lead_unit_type?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  note?: string;
  phone?: string;
  preferredAction?: string;
  source?: string;
};

const ROUTE_VERSION = "2026-07-15-leads-vercel-safe-v2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: Record<string, unknown>, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Leads-Route-Version", ROUTE_VERSION);

  return Response.json(body, {
    ...init,
    headers,
  });
}

function getWebhookConfig() {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL?.trim() ?? "";
  const crmUrl = process.env.CRM_WEBHOOK_URL?.trim() ?? "";

  return {
    destination: sheetsUrl ? "google_sheets" : crmUrl ? "crm" : "none",
    sheetsUrl,
    webhookUrl: sheetsUrl || crmUrl,
  };
}

function shouldWriteLocalBackup() {
  if (process.env.LEAD_LOCAL_BACKUP_ENABLED === "true") {
    return true;
  }

  return !process.env.VERCEL && process.env.NODE_ENV !== "production";
}

async function sendLeadWebhook(
  webhookUrl: string,
  destination: "google_sheets" | "crm",
  payload: LeadPayload & { createdAt: string },
) {
  const webhookResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  const responseText = await webhookResponse.text();

  if (!webhookResponse.ok) {
    throw new Error(
      `Lead webhook failed with ${webhookResponse.status}: ${responseText.slice(0, 500)}`,
    );
  }

  if (destination !== "google_sheets") {
    return;
  }

  try {
    const result = JSON.parse(responseText) as { ok?: boolean; error?: string };

    if (result.ok === false) {
      throw new Error(result.error ?? "Google Sheets Apps Script returned ok:false");
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Google Sheets Apps Script did not return JSON. Check Web App access/deployment. Response: ${responseText.slice(0, 500)}`,
      );
    }

    throw error;
  }
}

async function writeLocalBackup(payload: LeadPayload & { createdAt: string }) {
  if (!shouldWriteLocalBackup()) {
    return false;
  }

  const [{ mkdir, readFile, writeFile }, { join }] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const submissionsDir = join(process.cwd(), "content", "submissions");
  const submissionsFile = join(submissionsDir, "leads.json");

  await mkdir(submissionsDir, { recursive: true });

  let existing: LeadPayload[] = [];

  try {
    const raw = await readFile(submissionsFile, "utf8");
    existing = JSON.parse(raw) as LeadPayload[];
  } catch {
    existing = [];
  }

  existing.unshift(payload);

  await writeFile(submissionsFile, JSON.stringify(existing, null, 2), "utf8");

  return true;
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    console.error("Unhandled lead route failure", error);

    return json({ error: "Lead submission failed." }, { status: 500 });
  }
}

async function handlePost(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return json({ error: "Invalid lead payload." }, { status: 400 });
  }

  const leadName = payload.name ?? payload.lead_name;
  const leadPhone = payload.phone ?? payload.lead_phone;

  if (!leadName || !leadPhone) {
    return json(
      { error: "Missing required lead fields." },
      { status: 400 },
    );
  }

  const savedPayload = {
    ...payload,
    name: leadName,
    phone: leadPhone,
    source: payload.source ?? "website",
    interest:
      payload.interest ??
      payload.preferredAction ??
      payload.lead_action ??
      "general",
    createdAt: new Date().toISOString(),
  } as LeadPayload & { createdAt: string };

  const { destination, sheetsUrl, webhookUrl } = getWebhookConfig();

  if (webhookUrl) {
    try {
      await sendLeadWebhook(
        webhookUrl,
        destination === "google_sheets" ? "google_sheets" : "crm",
        savedPayload,
      );
    } catch (error) {
      console.error("Lead webhook failed", error);

      return json(
        { error: "Lead webhook failed." },
        { status: 502 },
      );
    }
  }

  let localBackupSaved = false;

  try {
    localBackupSaved = await writeLocalBackup(savedPayload);
  } catch (error) {
    console.warn("Lead local backup failed", error);
  }

  if (!webhookUrl && !localBackupSaved) {
    return json(
      { error: "No lead destination configured." },
      { status: 503 },
    );
  }

  return json({
    ok: true,
    routeVersion: ROUTE_VERSION,
    sheetsConfigured: Boolean(sheetsUrl),
    webhookConfigured: Boolean(webhookUrl),
    localBackupSaved,
  });
}

export function GET() {
  const { sheetsUrl, webhookUrl } = getWebhookConfig();

  return json({
    ok: true,
    routeVersion: ROUTE_VERSION,
    sheetsConfigured: Boolean(sheetsUrl),
    webhookConfigured: Boolean(webhookUrl),
    localBackupEnabled: shouldWriteLocalBackup(),
  });
}
