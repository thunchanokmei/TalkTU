import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["user"] },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 },
        );
      }

      // Require an access token from the signed-in user.
      const authorization = req.headers.get("Authorization");

      if (!authorization?.startsWith("Bearer ")) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      }

      const accessToken = authorization.slice("Bearer ".length).trim();

      if (!accessToken) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      }

      // Verify the token with Supabase Auth.
      // Never trust a user ID supplied in the request body.
      const {
        data: { user },
        error: userError,
      } = await ctx.supabase.auth.getUser(accessToken);

      if (userError || !user) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      }

      const userId = user.id;
      const { error: enqueueError } = await ctx.supabaseAdmin.rpc(
        "enqueue_account_deletion",
        { p_user_id: userId },
      );

      if (enqueueError) {
        console.error("Unable to enqueue account deletion:", enqueueError);

        return Response.json(
          { error: "Unable to request account deletion" },
          { status: 500 },
        );
      }

      return Response.json(
        {
          success: true,
          status: "pending",
        },
        { status: 202 },
      );
    },
  ),
};
