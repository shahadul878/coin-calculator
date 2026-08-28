import { readFileSync } from "fs";
import { resolve } from "path";
import {
  DEMO_REQUEST_COUNT,
  generateDemoCoinRequests,
  getDemoRequestIds,
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

async function resolveDemoProfile(): Promise<{ id: string; email: string }> {
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

  return profile;
}

async function clearDemoData(profile: { id: string; email: string }) {
  const demoRequestIds = getDemoRequestIds();
  const requestIdFilter = demoRequestIds.join(",");

  const demoRequests = (await supabaseRequest(
    `coin_requests?select=id,request_id&user_id=eq.${profile.id}&request_id=in.(${requestIdFilter})`
  )) as Array<{ id: string; request_id: string }> | null;

  const requestCount = demoRequests?.length ?? 0;
  if (requestCount === 0) {
    console.log("No demo coin requests found to delete.");
    return { coinRequests: 0, statusLogs: 0, auditLogs: 0 };
  }

  const coinRequestIds = demoRequests!.map((row) => row.id);
  const coinRequestIdFilter = coinRequestIds.join(",");

  const statusLogs = (await supabaseRequest(
    `coin_request_status_logs?select=id&coin_request_id=in.(${coinRequestIdFilter})`
  )) as Array<{ id: string }> | null;
  const statusLogCount = statusLogs?.length ?? 0;

  const auditLogs = (await supabaseRequest(
    `audit_logs?select=id&entity_type=eq.coin_request&entity_id=in.(${coinRequestIdFilter})`
  )) as Array<{ id: string }> | null;
  const auditLogCount = auditLogs?.length ?? 0;

  if (auditLogCount > 0) {
    await supabaseRequest(
      `audit_logs?entity_type=eq.coin_request&entity_id=in.(${coinRequestIdFilter})`,
      { method: "DELETE", prefer: "return=minimal" }
    );
  }

  await supabaseRequest(
    `coin_requests?user_id=eq.${profile.id}&request_id=in.(${requestIdFilter})`,
    { method: "DELETE", prefer: "return=minimal" }
  );

  return {
    coinRequests: requestCount,
    statusLogs: statusLogCount,
    auditLogs: auditLogCount,
  };
}

async function main() {
  loadEnvFile(".env.local");

  const profile = await resolveDemoProfile();
  console.log(`Using profile: ${profile.email}`);

  const clearOnly =
    process.argv.includes("--clear") || process.argv.includes("--clear-only");
  if (clearOnly) {
    const deleted = await clearDemoData(profile);
    console.log("\nDemo clear complete");
    console.log(`Deleted coin_requests: ${deleted.coinRequests}`);
    console.log(`Deleted coin_request_status_logs: ${deleted.statusLogs}`);
    console.log(`Deleted audit_logs: ${deleted.auditLogs}`);
    console.log(`Profile preserved: ${profile.email}`);
    return;
  }

  const reset = process.argv.includes("--reset");
  if (reset) {
    await supabaseRequest(`coin_requests?user_id=eq.${profile.id}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });
    console.log("Cleared existing coin requests for user.");
  }

  const rows = generateDemoCoinRequests(profile.id, DEMO_REQUEST_COUNT);
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
