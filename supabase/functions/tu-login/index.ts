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
    async (req, ctx) => {
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

      // --------------------------------------------------
      // Supabase Auth
      // --------------------------------------------------

      // Generate a one-time magic-link token for the verified
      // TU student. This does NOT send an email by itself.
      const { data: authData, error: authError } =
        await ctx.supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email,
        });

      if (authError || !authData?.properties?.hashed_token) {
        console.error("Supabase Auth error:", authError);

        return Response.json(
          {
            success: false,
            message: "Unable to create Supabase Auth session.",
          },
          { status: 500 },
        );
      }

      const userId = authData.user?.id;

      if (!userId) {
        return Response.json(
          {
            success: false,
            message: "Supabase Auth user was not created.",
          },
          { status: 500 },
        );
      }

      // --------------------------------------------------
      // student_accounts
      // --------------------------------------------------

      const { error: studentAccountError } =
        await ctx.supabaseAdmin
          .from("student_accounts")
          .upsert(
            {
              user_id: userId,
              tu_username: tuData.username,
              tu_email: email,
              display_name_th: tuData.displayname_th,
              display_name_en: tuData.displayname_en,
              faculty: tuData.faculty,
              department: tuData.department,
              tu_status: tuData.tu_status,
              status_id: tuData.statusid,
              account_type: tuData.type,
              is_current_student: true,
              last_verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            },
          );

      if (studentAccountError) {
        console.error(
          "student_accounts error:",
          studentAccountError,
        );

        return Response.json(
          {
            success: false,
            message: "Unable to save student account.",
          },
          { status: 500 },
        );
      }

      // Return the one-time token to the mobile app.
      // The mobile app will exchange this token for
      // a normal Supabase Auth session.
      return Response.json(
        {
          success: true,
          token_hash: authData.properties.hashed_token,
          student: {
            username: tuData.username,
            email,
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