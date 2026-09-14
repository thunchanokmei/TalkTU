import { createClient } from '../frontend/node_modules/@supabase/supabase-js/dist/index.cjs';

const SUPABASE_URL = 'https://ogcrwsgkygejherjufhf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_sMeDgxIHTfrSXcQLP9Fzaw_1mk1VHn1';

const EMAIL = 'chat-test-b@talktu.local';
const PASSWORD = 'TalkTUtest123!';

const MATCH_ID = '206b0442-a3d7-4bba-ba58-5e069b245319';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const { data: authData, error: authError } =
  await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

if (authError) {
  console.error('LOGIN ERROR:', authError.message);
  process.exit(1);
}

console.log('LOGIN OK');
console.log('USER ID:', authData.user.id);

const channel = supabase
  .channel(`chat-${MATCH_ID}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `match_id=eq.${MATCH_ID}`,
    },
    (payload) => {
      console.log('REALTIME MESSAGE RECEIVED');
      console.log(payload.new);
    }
  )
  .subscribe((status) => {
    console.log('REALTIME STATUS:', status);

    if (status === 'SUBSCRIBED') {
      console.log('LISTENING FOR NEW MESSAGES...');
    }
  });

process.on('SIGINT', async () => {
  await supabase.removeChannel(channel);
  await supabase.auth.signOut();
  process.exit(0);
});