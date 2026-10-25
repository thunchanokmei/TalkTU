import { supabase } from '../../../lib/supabase';

export type ProfileReportReason =
  | 'harassment'
  | 'violence_or_hate'
  | 'self_harm'
  | 'sexual_content'
  | 'scam'
  | 'impersonation'
  | 'spam_or_false_information'
  | 'illegal_goods'
  | 'intellectual_property'
  | 'other';

export const PROFILE_REPORT_REASONS: {
  label: string;
  value: ProfileReportReason;
}[] = [
  {
    label: 'Harassment or unwanted contact',
    value: 'harassment',
  },
  {
    label: 'Violence, hate, or exploitation',
    value: 'violence_or_hate',
  },
  {
    label: 'Self-harm or risky behavior',
    value: 'self_harm',
  },
  {
    label: 'Sexual content',
    value: 'sexual_content',
  },
  {
    label: 'Fraud or scam',
    value: 'scam',
  },
  {
    label: 'Impersonation',
    value: 'impersonation',
  },
  {
    label: 'False information or spam',
    value: 'spam_or_false_information',
  },
  {
    label: 'Prohibited sales or promotion',
    value: 'illegal_goods',
  },
  {
    label: 'Intellectual property',
    value: 'intellectual_property',
  },
  {
    label: 'Other',
    value: 'other',
  },
];

export async function blockProfile(
  targetUserId: string
): Promise<{
  error: Error | null;
}> {
  if (!targetUserId) {
    return {
      error: new Error(
        'Target user is required.'
      ),
    };
  }

  const { error } =
    await supabase.rpc(
      'block_user',
      {
        p_blocked_id:
          targetUserId,
      }
    );

  if (error) {
    return {
      error: new Error(
        error.message
      ),
    };
  }

  return {
    error: null,
  };
}

export async function reportProfile(
  targetUserId: string,
  reason: ProfileReportReason,
  details = ''
): Promise<{
  data: {
    ok?: boolean;
    reportId?: string;
    alreadyReported?: boolean;
    emailSent?: boolean;
    emailError?: string;
  } | null;
  error: Error | null;
}> {
  if (!targetUserId) {
    return {
      data: null,
      error: new Error(
        'Target user is required.'
      ),
    };
  }

  const trimmed =
    details.trim();

  if (
    trimmed.length > 1000
  ) {
    return {
      data: null,
      error: new Error(
        'Report details cannot exceed 1000 characters.'
      ),
    };
  }

  const {
    data,
    error,
  } =
    await supabase
      .functions
      .invoke(
        'submit-profile-report',
        {
          body: {
            targetUserId,
            reason,
            details:
              trimmed,
          },
        }
      );

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data?.ok) {
    return {
      data: null,
      error: new Error(
        data?.error ??
          'Unable to report this profile.'
      ),
    };
  }

  return {
    data,
    error: null,
  };
}