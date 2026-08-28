import { readFileSync } from "fs";
import { resolve } from "path";
import {
  generateDemoCoinRequests,
  summarizeDemoRows,
} from "./demo-data";

function loadEnvFile(filename: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), filename), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore missing env file
  }
}

async function supabaseRequest(
  path: string,
  options: RequestInit & { prefer?: string } = {}
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function main() {
  loadEnvFile(".env.local");

  const targetEmail = process.env.DEMO_USER_EMAIL;
  let profile: { id: string; email: string } | null = null;

  if (targetEmail) {
    const rows = await supabaseRequest(
      `profiles?select=id,email&email=eq.${encodeURIComponent(targetEmail)}&limit=1`
    );
    profile = rows?.[0] ?? null;
    if (!profile) {
      throw new Error(`No profile found for DEMO_USER_EMAIL=${targetEmail}`);
    }
  } else {
    const rows = await supabaseRequest(
      "profiles?select=id,email&order=created_at.asc&limit=1"
    );
    profile = rows?.[0] ?? null;
    if (!profile) {
      throw new Error("No profiles found. Register a user first, then rerun seed:demo.");
    }
  }

  console.log(`Using profile: ${profile.email}`);

  const reset = process.argv.includes("--reset");
  if (reset) {
    await supabaseRequest(`coin_requests?user_id=eq.${profile.id}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });
    console.log("Cleared existing coin requests for user.");
  }

  const rows = generateDemoCoinRequests(profile.id, 200);
  const summary = summarizeDemoRows(rows);

  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await supabaseRequest("coin_requests", {
      method: "POST",
      body: JSON.stringify(chunk),
      prefer: "return=minimal",
    });
    console.log(`Inserted ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`);
  }

  const countRows = await supabaseRequest(
    `coin_requests?select=id&user_id=eq.${profile.id}`,
    { method: "GET", headers: { Prefer: "count=exact" } }
  );

  console.log("\nDemo seed complete");
  console.log(`Generated rows: ${summary.total}`);
  console.log(`Unique IDs: ${summary.uniqueRequestIds}`);
  console.log(
    `Payment -> paid: ${summary.paid}, due: ${summary.due}, partial: ${summary.partial}`
  );
  console.log(
    `Send -> done: ${summary.sendDone}, pending: ${summary.sendPending}, cancel: ${summary.sendCancel}`
  );
  console.log(`Total coin requests for user: ${Array.isArray(countRows) ? countRows.length : summary.total}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
