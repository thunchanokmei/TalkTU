import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const TU_AUTH_URL =
  "https://restapi.tu.ac.th/api/v1/auth/Ad/verify";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req) => {
      // Only allow POST requests
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 },
        );
      }

      // Read TU Application Key from Supabase Secret
      const tuApplicationKey = Deno.env.get("TU_APPLICATION_KEY");

      if (!tuApplicationKey) {
        return Response.json(
          { error: "TU_APPLICATION_KEY is not configured" },
          { status: 500 },
        );
      }

      // Read username and password from request body
      let body: {
        username?: string;
        password?: string;
      };

      try {
        body = await req.json();
      } catch {
        return Response.json(
          { error: "Invalid JSON body" },
          { status: 400 },
        );
      }

      const { username, password } = body;

      if (!username || !password) {
        return Response.json(
          { error: "username and password are required" },
          { status: 400 },
        );
      }

      // Call TU Authentication API
      const tuResponse = await fetch(TU_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Application-Key": tuApplicationKey,
        },
        body: JSON.stringify({
          UserName: username,
          PassWord: password,
        }),
      });

      let tuData: unknown;

      try {
        tuData = await tuResponse.json();
      } catch {
        return Response.json(
          {
            error: "Invalid response from TU Authentication API",
            status: tuResponse.status,
          },
          { status: 502 },
        );
      }

      // Return TU verification result
      return Response.json(
        {
          verified: tuResponse.ok,
          tu: tuData,
        },
        { status: tuResponse.ok ? 200 : tuResponse.status },
      );
    },
  ),
};