import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

const submissionsDir = join(process.cwd(), "content", "submissions");
const submissionsFile = join(submissionsDir, "leads.json");
const GOOGLE_SHEETS_WEBAPP_URL = process.env.GOOGLE_SHEETS_WEBAPP_URL ?? "";
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL ?? "";

export async function POST(request: Request) {
  const payload = (await request.json()) as LeadPayload;
  const leadName = payload.name ?? payload.lead_name;
  const leadPhone = payload.phone ?? payload.lead_phone;

  if (!leadName || !leadPhone) {
    return Response.json(
      { error: "Missing required lead fields." },
      { status: 400 },
    );
  }

  await mkdir(submissionsDir, { recursive: true });

  let existing: LeadPayload[] = [];

  try {
    const raw = await readFile(submissionsFile, "utf8");
    existing = JSON.parse(raw) as LeadPayload[];
  } catch {
    existing = [];
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

  const webhookUrl = GOOGLE_SHEETS_WEBAPP_URL || CRM_WEBHOOK_URL;

  if (webhookUrl) {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savedPayload),
    });

    if (!webhookResponse.ok) {
      return Response.json(
        { error: "Lead webhook failed.", fallback: true },
        { status: 502 },
      );
    }
  }

  existing.unshift(savedPayload);

  await writeFile(submissionsFile, JSON.stringify(existing, null, 2), "utf8");

  return Response.json({
    ok: true,
    sheetsConfigured: Boolean(GOOGLE_SHEETS_WEBAPP_URL),
    webhookConfigured: Boolean(webhookUrl),
  });
}
