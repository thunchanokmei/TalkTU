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
        throw enqueueError;
      }

      // Block any NEW login immediately while account deletion is pending.
      // 876000h ≈ 100 years. The Auth user will normally be deleted
      // by the deletion worker within the next cron run.
      const { error: banError } =
        await ctx.supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: "876000h",
        });

      if (banError) {
        console.error("Failed to ban user pending deletion:", {
          userId,
          message: banError.message,
        });
      }

      // Revoke refresh tokens for all currently active sessions.
      // Existing access-token JWTs can remain valid until they expire,
      // but they will no longer be refreshable.
      const { error: signOutError } =
        await ctx.supabaseAdmin.auth.admin.signOut(accessToken, "global");

      if (signOutError) {
        console.error("Failed to revoke user sessions:", {
          userId,
          message: signOutError.message,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: "pending",
        }),
        {
          status: 202,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    },
  ),
};
