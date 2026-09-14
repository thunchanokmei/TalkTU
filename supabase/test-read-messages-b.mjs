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

// Login as test B
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

// Read messages
const { data: messages, error: messagesError } =
  await supabase
    .from('messages')
    .select('*')
    .eq('match_id', MATCH_ID)
    .order('created_at', { ascending: true });

if (messagesError) {
  console.error('READ MESSAGES ERROR:', messagesError.message);
  process.exit(1);
}

console.log('READ MESSAGES OK');
console.log(messages);

await supabase.auth.signOut();