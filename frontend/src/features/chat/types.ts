export type ChatListItem = {
  match_id: string;
  other_user_id: string;
  other_display_name: string | null;
  profile_photo_path: string | null;
  last_message: string | null;
  last_message_at: string | null;
};

export type ChatMessage = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  deleted_at: string | null;
};