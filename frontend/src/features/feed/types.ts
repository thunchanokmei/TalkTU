export type FeedImage = {
  id: string;
  storage_path: string;
  position: number;
};

export type FeedPost = {
  post_id: string;

  content: string;

  created_at: string;

  images: FeedImage[];

  like_count: number;

  comment_count: number;

  liked_by_me: boolean;

  is_mine: boolean;
};

export type ToggleLikeResult = {
  liked: boolean;

  like_count: number;
};


export type FeedComment = {
  comment_id: string;

  parent_comment_id: string | null;

  content: string;

  created_at: string;

  is_mine: boolean;
};
