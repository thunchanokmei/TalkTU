import {
    supabase,
} from '../../../lib/supabase';

import {
    prepareFeedImage,
} from '../utils/prepareFeedImage';

import type {
    FeedComment,
    FeedPost,
    ToggleLikeResult,
} from '../types';

export type FeedImageToUpload = {
    uri: string;

    width?: number;

    height?: number;
};

const POST_IMAGE_BUCKET =
    'post-images';


/* ======================================================
   GET FEED
====================================================== */

export async function getFeedPosts(
    limit = 20,
    offset = 0
): Promise<FeedPost[]> {
    const {
        data,
        error,
    } = await supabase.rpc(
        'get_feed_posts',
        {
            p_limit: limit,
            p_offset: offset,
        }
    );

    if (error) {
        throw error;
    }

    return (
        (data ?? []) as FeedPost[]
    );
}


/* ======================================================
   CREATE POST
====================================================== */

export async function createPost(
    content: string,
    images: FeedImageToUpload[]
) {
    const cleanContent =
        content.trim();

    if (!cleanContent) {
        throw new Error(
            'Post content is required.'
        );
    }

    const {
        data: postId,
        error: postError,
    } = await supabase.rpc(
        'create_anonymous_post',
        {
            p_content:
                cleanContent,
        }
    );

    if (postError) {
        throw postError;
    }

    if (!postId) {
        throw new Error(
            'Unable to create post.'
        );
    }

    const uploadedPaths:
        string[] = [];

    if (
        images.length > 4
    ) {
        throw new Error(
            'You can upload up to 4 photos.'
        );
    }

    try {
        for (
            let index = 0;
            index < images.length;
            index++
        ) {
            const image =
                images[index];

            const prepared =
                await prepareFeedImage(
                    image.uri,
                    {
                        width:
                            image.width,

                        height:
                            image.height,
                    }
                );


            console.log(
                'Feed image prepared:',
                {
                    before:
                        image.uri,

                    afterSizeKB:
                        Math.round(
                            prepared.sizeBytes /
                            1024
                        ),

                    width:
                        prepared.width,

                    height:
                        prepared.height,
                }
            );


            const randomPart =
                Math.random()
                    .toString(36)
                    .slice(2);


            const storagePath =
                `${postId}/` +
                `${Date.now()}-` +
                `${index}-` +
                `${randomPart}.jpg`;


            const {
                error:
                uploadError,
            } =
                await supabase.storage
                    .from(
                        'post-images'
                    )
                    .upload(
                        storagePath,
                        prepared.arrayBuffer,
                        {
                            contentType:
                                prepared.contentType,

                            /*
                             * Filename is unique,
                             * so long cache is safe.
                             */
                            cacheControl:
                                '31536000',

                            upsert:
                                false,
                        }
                    );


            if (uploadError) {
                throw uploadError;
            }


            uploadedPaths.push(
                storagePath
            );


            const {
                error:
                imageRowError,
            } =
                await supabase
                    .from(
                        'post_images'
                    )
                    .insert({
                        post_id:
                            postId,

                        storage_path:
                            storagePath,

                        position:
                            index + 1,
                    });


            if (imageRowError) {
                throw imageRowError;
            }
        }

        return postId;
    } catch (error) {
        /*
         * Rollback partially uploaded images
         * if creating the post fails halfway.
         */
        if (
            uploadedPaths.length >
            0
        ) {
            await supabase.storage
                .from(
                    POST_IMAGE_BUCKET
                )
                .remove(
                    uploadedPaths
                );
        }

        await supabase
            .from('posts')
            .delete()
            .eq(
                'id',
                postId
            );

        throw error;
    }
}


/* ======================================================
   IMAGE URL
====================================================== */

export function getPostImageUrl(
    storagePath: string
) {
    return supabase.storage
        .from(
            POST_IMAGE_BUCKET
        )
        .getPublicUrl(
            storagePath
        ).data.publicUrl;
}


/* ======================================================
   LIKE
====================================================== */

export async function togglePostLike(
    postId: string
): Promise<ToggleLikeResult> {
    const {
        data,
        error,
    } = await supabase.rpc(
        'toggle_post_like',
        {
            p_post_id:
                postId,
        }
    );

    if (error) {
        throw error;
    }

    const result =
        data?.[0];

    if (!result) {
        throw new Error(
            'Unable to update like.'
        );
    }

    return result as ToggleLikeResult;
}


/* ======================================================
   COMMENTS
====================================================== */

export async function getPostComments(
    postId: string
): Promise<FeedComment[]> {
    const {
        data,
        error,
    } = await supabase.rpc(
        'get_post_comments',
        {
            p_post_id:
                postId,

            p_limit: 100,

            p_offset: 0,
        }
    );

    if (error) {
        throw error;
    }

    return (
        (data ?? []) as FeedComment[]
    );
}


export async function createComment(
    postId: string,
    content: string
) {
    const cleanContent =
        content.trim();

    if (!cleanContent) {
        throw new Error(
            'Comment is required.'
        );
    }

    const {
        data,
        error,
    } = await supabase.rpc(
        'create_anonymous_comment',
        {
            p_post_id:
                postId,

            p_content:
                cleanContent,
        }
    );

    if (error) {
        throw error;
    }

    return data;
}


/* ======================================================
   DELETE OWN POST
====================================================== */

export async function deletePost(
  postId: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from('posts')
      .update({
        deleted_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        postId
      )
      .select('id')
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'Post not found or you do not have permission to delete it.'
    );
  }
}


/* ======================================================
   REPORT POST
====================================================== */

export async function reportPost(
    postId: string,
    reason: string
) {
    const {
        data: {
            user,
        },
        error:
        userError,
    } =
        await supabase.auth
            .getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        throw new Error(
            'Not authenticated.'
        );
    }

    const {
        error,
    } =
        await supabase
            .from('reports')
            .insert({
                reporter_id:
                    user.id,

                target_id:
                    postId,

                target_type:
                    'post',

                reason,
            });

    if (error) {
        throw error;
    }
}