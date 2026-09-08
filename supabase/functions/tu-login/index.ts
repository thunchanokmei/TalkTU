import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const TU_AUTH_URL =
  "https://restapi.tu.ac.th/api/v1/auth/Ad/verify";

type TuAuthResponse = {
  status?: boolean;
  message?: string;
  type?: string;
  username?: string;
  tu_status?: string;
  statusid?: string;
  displayname_th?: string;
  displayname_en?: string;
  email?: string;
  department?: string;
  faculty?: string;
};

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },
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

      let tuData: TuAuthResponse;

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

      // TU Authentication API rejected the credentials
      if (!tuResponse.ok || tuData.status !== true) {
        return Response.json(
          {
            success: false,
            message: tuData.message ?? "TU authentication failed",
          },
          { status: 401 },
        );
      }

      // TalkTU eligibility:
      // 1. Must be a student
      // 2. Must have a @dome.tu.ac.th email
      const isStudent = tuData.type === "student";

      const email = tuData.email?.trim().toLowerCase() ?? "";
      const hasDomeEmail = email.endsWith("@dome.tu.ac.th");

      if (!isStudent || !hasDomeEmail) {
        return Response.json(
          {
            success: false,
            message: "Only eligible TU students can use TalkTU.",
          },
          { status: 403 },
        );
      }

      // TU authentication and TalkTU eligibility passed
      return Response.json(
        {
          success: true,
          student: {
            username: tuData.username,
            email: email,
            display_name_th: tuData.displayname_th,
            display_name_en: tuData.displayname_en,
            faculty: tuData.faculty,
            department: tuData.department,
            tu_status: tuData.tu_status,
            status_id: tuData.statusid,
            account_type: tuData.type,
          },
        },
        { status: 200 },
      );
    },
  ),
};