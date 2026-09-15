import { createClient } from '../frontend/node_modules/@supabase/supabase-js/dist/index.cjs';

const SUPABASE_URL = 'https://ogcrwsgkygejherjufhf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sMeDgxIHTfrSXcQLP9Fzaw_1mk1VHn1';

const EMAIL = 'chat-test-a@talktu.local';
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

const { data, error } =
  await supabase.rpc('get_my_chat_list');

if (error) {
  console.error('CHAT LIST ERROR:', error);
  process.exit(1);
}

console.log('CHAT LIST OK');
console.dir(data, { depth: null });

const {
  data: profile,
  error: profileError,
} = await supabase
  .from('profiles')
  .select('id, display_name')
  .eq(
    'id',
    'e69b249e-7fa2-4e89-80bf-dcdcc584b43a'
  )
  .single();

console.log('PROFILE TEST:', profile);
console.log('PROFILE ERROR:', profileError);

await supabase.auth.signOut();