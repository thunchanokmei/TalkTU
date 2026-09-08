import { supabase } from '../../../lib/supabase';

export type TuLoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function loginWithTu(
  username: string,
  password: string
): Promise<TuLoginResult> {
  const cleanUsername = username.trim();

  if (!cleanUsername || !password) {
    return {
      success: false,
      message: 'Please enter your TU account and password.',
    };
  }

  try {
    // Call Supabase Edge Function: tu-login
    const { data, error } = await supabase.functions.invoke('tu-login', {
      body: {
        username: cleanUsername,
        password,
      },
    });

    if (error) {
  console.error('TU login function error:', error);

  const functionError = error as {
    message?: string;
    context?: Response;
  };

  console.error('TU login status:', functionError.context?.status);

  if (functionError.context) {
    try {
      const errorBody = await functionError.context.text();
      console.error('TU login response body:', errorBody);
    } catch (readError) {
      console.error('Unable to read TU login error body:', readError);
    }
  }

  return {
    success: false,
    message:
      functionError.message || 'Unable to connect to the login service.',
  };
}

    if (!data?.success) {
      return {
        success: false,
        message: data?.message || 'TU authentication failed.',
      };
    }

    // Edge Function returns a one-time token_hash.
    if (!data.token_hash) {
      return {
        success: false,
        message: 'Login succeeded, but no authentication token was returned.',
      };
    }

    // Exchange the one-time token for a Supabase session.
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: data.token_hash,
      type: 'email',
    });

    if (verifyError) {
      console.error('Supabase session error:', verifyError);

      return {
        success: false,
        message:
          verifyError.message || 'Unable to create Supabase session.',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('TU login error:', error);

    return {
      success: false,
      message: 'Something went wrong while logging in.',
    };
  }
}