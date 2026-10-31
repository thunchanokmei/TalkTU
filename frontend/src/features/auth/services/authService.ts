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
    const { data, error } = await supabase.functions.invoke('tu-login', {
      body: {
        username: cleanUsername,
        password,
      },
    });

    if (error) {
      const functionError = error as {
        message?: string;
        context?: Response;
      };

      if (functionError.context) {
        try {
          const errorBody = await functionError.context.json();
          if (errorBody?.message) {
            return {
              success: false,
              message: 'Invalid username or password.',
            };
          }
        } catch (readError) {
          console.warn('Unable to read TU login error body:', readError);
        }
      }

      return {
        success: false,
        message:
          'Unable to connect to the login service. Please try again.',
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
      const errorMessage = verifyError.message?.toLowerCase() ?? '';
      if (errorMessage.includes('user is banned')) {
        return {
          success: false,
          message:
            'Your account is currently being deleted. Please wait until the deletion process is complete.',
        };
      }

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