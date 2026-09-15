import { createClient } from '../frontend/node_modules/@supabase/supabase-js/dist/index.cjs';

const SUPABASE_URL = 'https://ogcrwsgkygejherjufhf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_sMeDgxIHTfrSXcQLP9Fzaw_1mk1VHn1';

const EMAIL = 'chat-test-d@talktu.local';
const PASSWORD = 'TalkTUtest123!';

const TARGET_ID = 'ccf2fe43-a0b6-48d3-8068-16d55da0918b';

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

// A likes B
const { data, error } = await supabase.rpc('submit_swipe', {
  p_target_id: TARGET_ID,
  p_mode: 'date',
  p_action: 'like',
});

if (error) {
  console.error('SWIPE ERROR:', error.message);
  process.exit(1);
}

console.log('SWIPE OK');
console.log(data);

await supabase.auth.signOut();
