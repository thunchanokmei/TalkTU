import { supabase } from '../../../lib/supabase';

export type SexAtBirth =
  | 'male'
  | 'female';

export type AppMode =
  | 'date'
  | 'friends';

export type DatingInterest =
  | 'men'
  | 'women'
  | 'beyond_binary';

async function getCurrentUserId():
Promise<string> {
  const {
    data: { session },
    error,
  } =
    await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.user) {
    throw new Error(
      'User is not authenticated.'
    );
  }

  return session.user.id;
}

/* ===================== NAME ===================== */

export async function saveDisplayName(
  displayName: string
) {
  const userId =
    await getCurrentUserId();

  const cleanName =
    displayName.trim();

  if (!cleanName) {
    throw new Error(
      'Display name is required.'
    );
  }

  const { error } =
    await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          display_name:
            cleanName,
        },
        {
          onConflict: 'id',
        }
      );

  if (error) {
    throw error;
  }
}

export async function getDisplayName() {
  const userId =
    await getCurrentUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.display_name ??
    null
  );
}

/* =================== BIRTHDAY =================== */

export async function saveBirthDate(
  birthDate: string
) {
  const userId =
    await getCurrentUserId();

  const { error } =
    await supabase
      .from('user_private')
      .upsert(
        {
          user_id: userId,
          birth_date:
            birthDate,
        },
        {
          onConflict:
            'user_id',
        }
      );

  if (error) {
    throw error;
  }
}

export async function getBirthDate() {
  const userId =
    await getCurrentUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from('user_private')
      .select('birth_date')
      .eq(
        'user_id',
        userId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.birth_date ??
    null
  );
}

/* ==================== FACULTY =================== */

export async function getMyFaculty() {
  const userId =
    await getCurrentUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from('student_accounts')
      .select('faculty')
      .eq(
        'user_id',
        userId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.faculty ??
    null
  );
}

/* ================ TU GENERATION ================= */

export async function getTuGenerations() {
  const {
    data,
    error,
  } =
    await supabase
      .from('tu_generations')
      .select('code')
      .eq(
        'is_active',
        true
      )
      .order(
        'code',
        {
          ascending: false,
        }
      );

  if (error) {
    throw error;
  }

  return data.map(
    (item) => item.code
  );
}

export async function saveTuGeneration(
  generation: number
) {
  const userId =
    await getCurrentUserId();

  const { error } =
    await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          tu_generation:
            generation,
        },
        {
          onConflict: 'id',
        }
      );

  if (error) {
    throw error;
  }
}

/* ================= SEX AT BIRTH ================= */

export async function saveSexAtBirth(
  sexAtBirth: SexAtBirth
) {
  const userId =
    await getCurrentUserId();

  const { error } =
    await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          sex_at_birth:
            sexAtBirth,
        },
        {
          onConflict: 'id',
        }
      );

  if (error) {
    throw error;
  }
}

export async function getSexAtBirth():
Promise<SexAtBirth | null> {
  const userId =
    await getCurrentUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from('profiles')
      .select('sex_at_birth')
      .eq('id', userId)
      .maybeSingle();

  if (error) {
    throw error;
  }

  const value =
    data?.sex_at_birth;

  if (
    value === 'male' ||
    value === 'female'
  ) {
    return value;
  }

  return null;
}

/* ====================== MODE ===================== */

export async function saveMode(
  mode: AppMode
) {
  const userId =
    await getCurrentUserId();

  const { error } =
    await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          mode,
        },
        {
          onConflict: 'id',
        }
      );

  if (error) {
    throw error;
  }
}

/* ============== DATING PREFERENCES ============== */

export async function saveDatingPreferences(
  interestedIn:
    DatingInterest[]
) {
  const userId =
    await getCurrentUserId();

  if (
    interestedIn.length === 0
  ) {
    throw new Error(
      'At least one dating preference is required.'
    );
  }

  const { error } =
    await supabase
      .from(
        'dating_preferences'
      )
      .upsert(
        {
          user_id: userId,
          interested_in:
            interestedIn,
        },
        {
          onConflict:
            'user_id',
        }
      );

  if (error) {
    throw error;
  }
}

export async function getDatingPreferences():
Promise<DatingInterest[]> {
  const userId =
    await getCurrentUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        'dating_preferences'
      )
      .select(
        'interested_in'
      )
      .eq(
        'user_id',
        userId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  const value =
    data?.interested_in;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item
    ): item is DatingInterest =>
      item === 'men' ||
      item === 'women' ||
      item ===
        'beyond_binary'
  );
}

/* ================ ONBOARDING ==================== */

export async function getOnboardingStatus() {
  const userId =
    await getCurrentUserId();

  const {
    data,
    error,
  } =
    await supabase
      .from('profiles')
      .select(
        'onboarding_completed'
      )
      .eq('id', userId)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data?.onboarding_completed ??
    false
  );
}

export async function completeOnboarding() {
  const userId =
    await getCurrentUserId();

  const { error } =
    await supabase
      .from('profiles')
      .update({
        onboarding_completed:
          true,
      })
      .eq('id', userId);

  if (error) {
    throw error;
  }
}