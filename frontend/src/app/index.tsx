import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { supabase } from '../lib/supabase';

type Destination =
  | '/(auth)/login'
  | '/name'
  | '/swipe'
  | null;

export default function Index() {
  const [destination, setDestination] = useState<Destination>(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setDestination('/(auth)/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Unable to load profile:', error);
          setDestination('/(auth)/login');
          return;
        }

        if (profile?.onboarding_completed) {
          setDestination('/swipe');
          return;
        }

        setDestination('/name');
      } catch (error) {
        console.error('Unable to check auth state:', error);
        setDestination('/(auth)/login');
      }
    };

    checkAuthState();
  }, []);

  if (!destination) {
    return null;
  }

  return <Redirect href={destination} />;
}