import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type DeletionJob = {
  user_id: string;
  claim_token: string;
  auth_deleted_at: string | null;
  storage_deleted_at: string | null;
};

type OwnedStorageObject = {
  bucket_id: string;
  object_name: string;
};

type AuthError = {
  name?: string;
  code?: string;
  message?: string;
  status?: number;
};

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }

  return result;
}

async function deleteOwnedStorageObjects(
  userId: string,
  getOwnedObjects: () => PromiseLike<{
    data: unknown;
    error: unknown;
  }>,
  removeObjects: (
    bucketId: string,
    paths: string[],
  ) => PromiseLike<{
    error: unknown;
  }>,
): Promise<void> {
  let previousFingerprint: string | null = null;

  while (true) {
    const { data, error } = await getOwnedObjects();

    if (error) {
      console.error("Storage object lookup failed:", {
        userId,
        error,
      });

      throw new Error("Storage object lookup failed");
    }

    if (data !== null && !Array.isArray(data)) {
      throw new Error("Invalid Storage object response");
    }

    const objects = (data ?? []) as OwnedStorageObject[];

    if (objects.length === 0) {
      return;
    }

    const fingerprint = objects
      .map((object) => `${object.bucket_id}:${object.object_name}`)
      .sort()
      .join("|");

    if (fingerprint === previousFingerprint) {
      throw new Error("Storage objects were not removed");
    }

    previousFingerprint = fingerprint;

    const groupedByBucket = new Map<string, string[]>();

    for (const object of objects) {
      if (
        typeof object.bucket_id !== "string" ||
        typeof object.object_name !== "string"
      ) {
        throw new Error("Invalid Storage object row");
      }

      const paths = groupedByBucket.get(object.bucket_id) ?? [];
      paths.push(object.object_name);

      groupedByBucket.set(object.bucket_id, paths);
    }

    for (const [bucketId, paths] of groupedByBucket) {
      for (const batch of chunk(paths, 100)) {
        const { error: removeError } = await removeObjects(
          bucketId,
          batch,
        );

        if (removeError) {
          console.error("Storage cleanup failed:", {
            userId,
            bucketId,
            paths: batch,
            error: removeError,
          });

          throw new Error("Storage cleanup failed");
        }
      }
    }
  }
}

async function deleteAuthUser(
  admin: {
    auth: {
      admin: {
        deleteUser: (
          userId: string,
        ) => PromiseLike<{
          error: unknown;
        }>;

        getUserById: (
          userId: string,
        ) => PromiseLike<{
          data: { user: unknown | null };
          error: unknown;
        }>;
      };
    };
  },
  userId: string,
): Promise<void> {
  const { error: deleteError } =
    await admin.auth.admin.deleteUser(userId);

  if (deleteError) {
    const authError = deleteError as {
      name?: string;
      code?: string;
      message?: string;
      status?: number;
    };

    if (
      authError.code === "user_not_found" ||
      authError.status === 404
    ) {
      return;
    }

    console.error("Auth deleteUser failed:", {
      userId,
      name: authError.name ?? null,
      code: authError.code ?? null,
      message: authError.message ?? null,
      status: authError.status ?? null,
    });

    throw new Error("Auth deletion failed");
  }

  // Verify that the Auth record is actually gone.
  const {
    data,
    error: verifyError,
  } = await admin.auth.admin.getUserById(userId);

  if (verifyError) {
    const authError = verifyError as {
      code?: string;
      message?: string;
      status?: number;
    };

    if (
      authError.code === "user_not_found" ||
      authError.status === 404
    ) {
      return;
    }

    console.error("Auth deletion verification failed:", {
      userId,
      code: authError.code ?? null,
      message: authError.message ?? null,
      status: authError.status ?? null,
    });

    throw new Error("Auth deletion verification failed");
  }

  if (data.user) {
    console.error(
      "Auth user still exists after deleteUser:",
      { userId },
    );

    throw new Error(
      "Auth user still exists after deletion",
    );
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

      const { data: jobs, error: claimError } =
        await ctx.supabaseAdmin.rpc(
          "claim_account_deletion_jobs",
          {
            p_limit: 10,
          },
        );

      if (claimError) {
        console.error(
          "Unable to claim deletion jobs:",
          claimError,
        );

        return Response.json(
          { error: "Unable to claim deletion jobs" },
          { status: 500 },
        );
      }

      let completedCount = 0;
      let failedCount = 0;

      for (const job of (jobs ?? []) as DeletionJob[]) {
        let currentStep = "storage";

        try {
          // =====================================================
          // STEP 1: STORAGE
          // =====================================================
          if (!job.storage_deleted_at) {
            await deleteOwnedStorageObjects(
              job.user_id,

              () =>
                ctx.supabaseAdmin.rpc(
                  "get_account_owned_storage_objects",
                  {
                    p_user_id: job.user_id,
                  },
                ),

              (bucketId, paths) =>
                ctx.supabaseAdmin.storage
                  .from(bucketId)
                  .remove(paths),
            );

            const {
              data: marked,
              error: markError,
            } = await ctx.supabaseAdmin.rpc(
              "mark_account_deletion_step",
              {
                p_user_id: job.user_id,
                p_claim_token: job.claim_token,
                p_step: "storage",
              },
            );

            if (markError || marked !== true) {
              console.error(
                "Unable to record Storage deletion:",
                markError,
              );

              throw new Error(
                "Unable to record Storage deletion",
              );
            }
          }

          // =====================================================
          // STEP 2: APPLICATION DATABASE
          // =====================================================
          currentStep = "database";

          const {
            data: purged,
            error: purgeError,
          } = await ctx.supabaseAdmin.rpc(
            "purge_account_application_data",
            {
              p_user_id: job.user_id,
            },
          );

          if (purgeError || purged !== true) {
            console.error(
              "Unable to purge application data:",
              {
                userId: job.user_id,
                result: purged,
                error: purgeError,
              },
            );

            throw new Error(
              "Application data purge failed",
            );
          }

          // =====================================================
          // STEP 3: AUTH
          // =====================================================
          currentStep = "auth";

          if (!job.auth_deleted_at) {
            await deleteAuthUser(
              ctx.supabaseAdmin,
              job.user_id,
            );

            const {
              data: marked,
              error: markError,
            } = await ctx.supabaseAdmin.rpc(
              "mark_account_deletion_step",
              {
                p_user_id: job.user_id,
                p_claim_token: job.claim_token,
                p_step: "auth",
              },
            );

            if (markError || marked !== true) {
              console.error(
                "Unable to record Auth deletion:",
                markError,
              );

              throw new Error(
                "Unable to record Auth deletion",
              );
            }
          }

          // =====================================================
          // STEP 4: COMPLETE
          // =====================================================
          currentStep = "completion";

          const {
            data: completed,
            error: completeError,
          } = await ctx.supabaseAdmin.rpc(
            "complete_account_deletion_job",
            {
              p_user_id: job.user_id,
              p_claim_token: job.claim_token,
            },
          );

          if (completeError || completed !== true) {
            console.error(
              "Unable to complete deletion job:",
              {
                userId: job.user_id,
                result: completed,
                error: completeError,
              },
            );

            throw new Error(
              "Unable to complete deletion job",
            );
          }

          completedCount++;
        } catch (error) {
          failedCount++;

          console.error(
            "Account deletion job failed:",
            {
              userId: job.user_id,
              step: currentStep,
              error,
            },
          );

          const { error: failError } =
            await ctx.supabaseAdmin.rpc(
              "fail_account_deletion_job",
              {
                p_user_id: job.user_id,
                p_claim_token: job.claim_token,
                p_error:
                  `${currentStep} processing failed`,
              },
            );

          if (failError) {
            console.error(
              "Unable to record job failure:",
              {
                userId: job.user_id,
                error: failError,
              },
            );
          }
        }
      }

      return Response.json(
        {
          success: failedCount === 0,
          claimed: jobs?.length ?? 0,
          completed: completedCount,
          failed: failedCount,
        },
        {
          status: failedCount > 0 ? 500 : 200,
        },
      );
    },
  ),
};