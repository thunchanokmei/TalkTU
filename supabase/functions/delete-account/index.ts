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

      // Check that the account is accessible to the admin client
      // before deleting any profile photos.
      const { data: accountData, error: accountError } = await ctx.supabaseAdmin
        .auth.admin.getUserById(userId);

      if (accountError || !accountData.user) {
        console.error(
          "Unable to verify account before deletion:",
          accountError,
        );

        return Response.json(
          { error: "Unable to delete account" },
          { status: 500 },
        );
      }

      // Remove all profile photos belonging to this user.
      // Keep listing from the beginning because each batch is deleted.
      const bucket = ctx.supabaseAdmin.storage.from("profile-photos");
      let previousPaths: string[] = [];

      while (true) {
        const { data: files, error: listError } = await bucket.list(
          userId,
          {
            limit: 100,
            offset: 0,
          },
        );

        if (listError) {
          console.error("Unable to list profile photos:", listError);

          return Response.json(
            { error: "Unable to delete account" },
            { status: 500 },
          );
        }

        const paths = (files ?? [])
          .filter((file) => file.name && file.id)
          .map((file) => `${userId}/${file.name}`);

        if (paths.length === 0) {
          break;
        }

        if (
          paths.length === previousPaths.length &&
          paths.every((path, index) => path === previousPaths[index])
        ) {
          console.error("Profile photos were not removed from storage");

          return Response.json(
            { error: "Unable to delete account" },
            { status: 500 },
          );
        }

        previousPaths = paths;

        const { error: removeError } = await bucket.remove(paths);

        if (removeError) {
          console.error("Unable to remove profile photos:", removeError);

          return Response.json(
            { error: "Unable to delete account" },
            { status: 500 },
          );
        }
      }

      // Delete only the authenticated user's account.
      // Related database rows are removed by ON DELETE CASCADE.
      const { error: deleteError } = await ctx.supabaseAdmin.auth.admin
        .deleteUser(userId);

      if (deleteError) {
        console.error("Unable to delete user:", deleteError);

        return Response.json(
          { error: "Unable to delete account" },
          { status: 500 },
        );
      }

      return Response.json({ success: true });
    },
  ),
};
