import { createClient } from '../frontend/node_modules/@supabase/supabase-js/dist/index.cjs';

const SUPABASE_URL = 'https://ogcrwsgkygejherjufhf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_sMeDgxIHTfrSXcQLP9Fzaw_1mk1VHn1';

const EMAIL = 'chat-test-a@talktu.local';
const PASSWORD = 'TalkTUtest123!';

const MATCH_ID = '206b0442-a3d7-4bba-ba58-5e069b245319';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Login as test A
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

// Send message
const { data: message, error: messageError } =
  await supabase.rpc('send_message', {
    p_match_id: MATCH_ID,
    p_content: 'hello from chat-test-a',
  });

if (messageError) {
  console.error('SEND MESSAGE ERROR:', messageError.message);
  process.exit(1);
}

console.log('SEND MESSAGE OK');
console.log(message);

await supabase.auth.signOut();