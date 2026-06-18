import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type LeadPayload = {
  callbackTime?: string;
  email?: string;
  interestedIn?: string;
  interest?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  note?: string;
  phone?: string;
  preferredAction?: string;
  source?: string;
};

const submissionsDir = join(process.cwd(), "content", "submissions");
const submissionsFile = join(submissionsDir, "leads.json");

export async function POST(request: Request) {
  const payload = (await request.json()) as LeadPayload;

  if (!payload.name || (!payload.phone && !payload.email)) {
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

  existing.unshift({
    ...payload,
    source: payload.source ?? "website",
    interest: payload.interest ?? "general",
    createdAt: new Date().toISOString(),
  } as LeadPayload & { createdAt: string });

  await writeFile(submissionsFile, JSON.stringify(existing, null, 2), "utf8");

  return Response.json({ ok: true });
}
