import { readFileSync } from "fs";
import { resolve } from "path";

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

  const email =
    process.argv.find((arg) => arg.includes("@")) ??
    process.env.SUPER_ADMIN_EMAIL;

  if (!email) {
    throw new Error(
      "Provide an email argument or set SUPER_ADMIN_EMAIL in .env.local"
    );
  }

  const rows = await supabaseRequest(
    `profiles?select=id,email,role&email=eq.${encodeURIComponent(email)}&limit=1`
  );
  const profile = rows?.[0];

  if (!profile) {
    throw new Error(
      `No profile found for ${email}. Register via the app first, then rerun.`
    );
  }

  if (profile.role === "admin") {
    console.log(`${email} is already a super admin.`);
    return;
  }

  await supabaseRequest(`profiles?id=eq.${profile.id}`, {
    method: "PATCH",
    body: JSON.stringify({ role: "admin" }),
    prefer: "return=minimal",
  });

  console.log(`Promoted ${email} to super admin (profiles.role = 'admin').`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
