import { createClient } from '../frontend/node_modules/@supabase/supabase-js/dist/index.cjs';

const SUPABASE_URL = 'https://ogcrwsgkygejherjufhf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sMeDgxIHTfrSXcQLP9Fzaw_1mk1VHn1';

const EMAIL = 'chat-test-c@talktu.local';
const PASSWORD = 'TalkTUtest123!';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const { error: loginError } =
  await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

if (loginError) {
  throw loginError;
}

console.log('LOGIN OK');

const {
  data: { user },
} = await supabase.auth.getUser();

console.log('USER ID:', user?.id);

const channel = supabase
  .channel('test-match-realtime-a')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'matches',
    },
    (payload) => {
      console.log('MATCH INSERT RECEIVED');
      console.dir(payload.new, { depth: null });
    }
  )
  .subscribe((status) => {
    console.log('REALTIME STATUS:', status);

    if (status === 'SUBSCRIBED') {
      console.log('LISTENING FOR NEW MATCHES...');
    }
  });

process.on('SIGINT', async () => {
  console.log('\nSTOPPING...');

  await supabase.removeChannel(channel);
  await supabase.auth.signOut();

  process.exit(0);
});