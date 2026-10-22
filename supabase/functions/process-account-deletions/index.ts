import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type DeletionJob = {
  user_id: string;
  claim_token: string;
  auth_deleted_at: string | null;
  storage_deleted_at: string | null;
};

async function deleteProfilePhotos(
  admin: {
    storage: {
      from: (bucket: string) => {
        list: (
          path: string,
          options: { limit: number; offset: number },
        ) => Promise<{
          data: { id?: string | null; name: string }[] | null;
          error: unknown;
        }>;
        remove: (paths: string[]) => Promise<{ error: unknown }>;
      };
    };
  },
  userId: string,
): Promise<void> {
  const bucket = admin.storage.from("profile-photos");
  let previousPaths: string[] = [];

  while (true) {
    const { data: files, error: listError } = await bucket.list(userId, {
      limit: 100,
      offset: 0,
    });

    if (listError) {
      throw new Error("Storage listing failed");
    }

    const paths = (files ?? [])
      .filter((file) => file.id && file.name)
      .map((file) => `${userId}/${file.name}`);

    if (paths.length === 0) {
      return;
    }

    if (
      paths.length === previousPaths.length &&
      paths.every((path, index) => path === previousPaths[index])
    ) {
      throw new Error("Storage files were not removed");
    }

    previousPaths = paths;

    const { error: removeError } = await bucket.remove(paths);

    if (removeError) {
      throw new Error("Storage cleanup failed");
    }
  }
}

async function deleteAuthUser(
  admin: {
    auth: {
      admin: {
        getUserById: (userId: string) => Promise<{
          data: { user: unknown | null };
          error: unknown;
        }>;
        deleteUser: (userId: string) => Promise<{
          error: unknown;
        }>;
      };
    };
  },
  userId: string,
): Promise<void> {
  const { data, error: lookupError } = await admin.auth.admin.getUserById(
    userId,
  );

  if (lookupError) {
    // A user-not-found response is expected during retries.
    const code = (lookupError as { code?: string }).code;

    if (code === "user_not_found") {
      return;
    }

    throw new Error("Auth lookup failed");
  }

  if (!data.user) {
    return;
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

  if (deleteError) {
    const code = (deleteError as { code?: string }).code;

    if (code === "user_not_found") {
      return;
    }

    throw new Error("Auth deletion failed");
  }
}

export default {
  fetch: withSupabase(
    { auth: ["secret"] },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 },
        );
      }

      // The deletion processor must never be callable
      // using an ordinary user's access token.
      const { data: jobs, error } = await ctx.supabaseAdmin.rpc(
        "claim_account_deletion_jobs",
        { p_limit: 10 },
      );

      if (error) {
        console.error("Unable to claim deletion jobs:", error);

        return Response.json(
          { error: "Unable to claim deletion jobs" },
          { status: 500 },
        );
      }

      let completedCount = 0;
      let failedCount = 0;

      for (const job of (jobs ?? []) as DeletionJob[]) {
        let currentStep = "auth";
        try {
          if (!job.auth_deleted_at) {
            await deleteAuthUser(ctx.supabaseAdmin, job.user_id);

            const { data: marked, error: markError } = await ctx.supabaseAdmin
              .rpc(
                "mark_account_deletion_step",
                {
                  p_user_id: job.user_id,
                  p_claim_token: job.claim_token,
                  p_step: "auth",
                },
              );

            if (markError || marked !== true) {
              throw new Error("Unable to record Auth deletion");
            }
          }

          currentStep = "storage";
          if (!job.storage_deleted_at) {
            await deleteProfilePhotos(ctx.supabaseAdmin, job.user_id);

            const { data: marked, error: markError } = await ctx.supabaseAdmin
              .rpc(
                "mark_account_deletion_step",
                {
                  p_user_id: job.user_id,
                  p_claim_token: job.claim_token,
                  p_step: "storage",
                },
              );

            if (markError || marked !== true) {
              throw new Error("Unable to record Storage deletion");
            }
          }

          currentStep = "completion";

          const { data: completed, error: completeError } = await ctx
            .supabaseAdmin.rpc(
              "complete_account_deletion_job",
              {
                p_user_id: job.user_id,
                p_claim_token: job.claim_token,
              },
            );

          if (completeError || completed !== true) {
            throw new Error("Unable to complete deletion job");
          }
          completedCount++;
        } catch (error) {
          failedCount++;
          console.error("Account deletion job failed:", error);

          const { error: failError } = await ctx.supabaseAdmin.rpc(
            "fail_account_deletion_job",
            {
              p_user_id: job.user_id,
              p_claim_token: job.claim_token,
              p_error: `${currentStep} processing failed`,
            },
          );

          if (failError) {
            console.error("Unable to record job failure:", failError);
          }
        }
      }

      return Response.json({
        success: failedCount === 0,
        claimed: jobs?.length ?? 0,
        completed: completedCount,
        failed: failedCount,
      }, {
        status: failedCount > 0 ? 500 : 200,
      });
    },
  ),
};
