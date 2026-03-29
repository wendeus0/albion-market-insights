import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function generateToken() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Missing Supabase environment variables." }, 500);
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const jwt = authHeader.slice("Bearer ".length);
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(jwt);

  if (userError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error: updateError } = await adminClient.from("profiles").upsert({
    id: user.id,
    discord_link_token: token,
    discord_link_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });

  if (updateError) {
    return json({ error: updateError.message }, 500);
  }

  return json({
    token,
    command: `/register ${token}`,
    expiresAt,
  });
});
