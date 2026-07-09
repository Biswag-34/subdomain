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
  lead_unit_type?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  note?: string;
  preferredAction?: string;
  source?: string;
};

const submissionsDir = join(process.cwd(), "content", "submissions");
const submissionsFile = join(submissionsDir, "leads.json");
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL ?? "YOUR_WEBHOOK_URL_HERE";

export async function POST(request: Request) {
  const payload = (await request.json()) as LeadPayload;
  const leadName = payload.name ?? payload.lead_name;
  const leadEmail = payload.email;

  if (!leadName || !leadEmail) {
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
    source: payload.source ?? "website",
    interest:
      payload.interest ??
      payload.preferredAction ??
      payload.lead_action ??
      "general",
    createdAt: new Date().toISOString(),
  } as LeadPayload & { createdAt: string };

  if (CRM_WEBHOOK_URL !== "YOUR_WEBHOOK_URL_HERE") {
    const crmResponse = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savedPayload),
    });

    if (!crmResponse.ok) {
      return Response.json(
        { error: "CRM webhook failed.", fallback: true },
        { status: 502 },
      );
    }
  }

  existing.unshift(savedPayload);

  await writeFile(submissionsFile, JSON.stringify(existing, null, 2), "utf8");

  return Response.json({ ok: true, crmConfigured: CRM_WEBHOOK_URL !== "YOUR_WEBHOOK_URL_HERE" });
}
