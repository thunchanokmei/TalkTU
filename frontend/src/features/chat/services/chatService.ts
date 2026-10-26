import { supabase } from '../../../lib/supabase';

import type {
  ChatListItem,
  ChatMessage,
} from '../types';

const PAGE_SIZE = 30;

export async function getChatList(): Promise<{
  data: ChatListItem[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc(
    'get_my_chat_list'
  );

  console.log('CHAT RPC ERROR:', error);
  console.log(
    'CHAT RPC RAW DATA:',
    JSON.stringify(data, null, 2)
  );

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data: (data ?? []) as ChatListItem[],
    error: null,
  };
}

/**
 * Get profile photo public URL.
 *
 * Bucket:
 * profile-photos
 */
export function getProfilePhotoUrl(
  path: string | null
): string | null {
  if (!path) {
    return null;
  }

  const {
    data,
  } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function getMessages(
  matchId: string,
  page = 0
): Promise<{
  data: ChatMessage[];
  hasMore: boolean;
  error: Error | null;
}> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data,
    error,
  } = await supabase
    .from('messages')
    .select(
      'id, match_id, sender_id, content, created_at, read_at, deleted_at'
    )
    .eq('match_id', matchId)
    .is('deleted_at', null)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    return {
      data: [],
      hasMore: false,
      error,
    };
  }

  const messages =
    (data ?? []) as ChatMessage[];

  return {
    data: messages,
    hasMore: messages.length === PAGE_SIZE,
    error: null,
  };
}

/**
 * Send a message.
 *
 * IMPORTANT:
 * Do not insert directly into messages.
 *
 * Backend:
 * public.send_message(
 *   p_match_id,
 *   p_content
 * )
 */
export async function sendMessage(
  matchId: string,
  content: string
): Promise<{
  data: unknown;
  error: Error | null;
}> {
  const trimmed = content.trim();

  if (!trimmed) {
    return {
      data: null,
      error: new Error(
        'Message cannot be empty.'
      ),
    };
  }

  if (trimmed.length > 5000) {
    return {
      data: null,
      error: new Error(
        'Message cannot exceed 5000 characters.'
      ),
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    'send_message',
    {
      p_match_id: matchId,
      p_content: trimmed,
    }
  );

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

/**
 * Subscribe to new messages for a specific match.
 */
export function subscribeToMessages(
  matchId: string,
  onMessage: (
    message: ChatMessage
  ) => void
) {
  const channel =
    supabase.channel(
      `chat:${matchId}`
    );

  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter:
        `match_id=eq.${matchId}`,
    },
    (payload) => {
      onMessage(
        payload.new as ChatMessage
      );
    }
  );

  channel.subscribe();

  return channel;
}

export async function unsubscribeFromChannel(
  channel: ReturnType<
    typeof supabase.channel
  >
) {
  await supabase.removeChannel(
    channel
  );
}

export function subscribeToMatches(
  onMatchChanged: () => void
) {
  const channel =
    supabase.channel(
      `chat-matches-${Date.now()}`
    );

  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'matches',
    },
    () => {
      onMatchChanged();
    }
  );

  channel.subscribe();

  return channel;
}

export type ChatReportReason =
  | 'harassment'
  | 'violence_or_hate'
  | 'self_harm'
  | 'sexual_content'
  | 'scam'
  | 'impersonation'
  | 'spam_or_false_information'
  | 'illegal_goods'
  | 'intellectual_property'
  | 'other';

export async function reportChat(
  matchId: string,
  reason: ChatReportReason,
  details = ''
): Promise<{
  data: {
    ok?: boolean;
    reportId?: string;
    alreadyReported?: boolean;
    emailSent?: boolean;
    emailError?: string;
  } | null;
  error: Error | null;
}> {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    'submit-chat-report',
    {
      body: {
        matchId,
        reason,
        details: details.trim(),
      },
    }
  );

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data?.ok) {
    return {
      data: null,
      error: new Error(
        data?.error ??
        'Unable to report this chat.'
      ),
    };
  }

  return {
    data,
    error: null,
  };
}