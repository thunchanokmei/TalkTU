export const CURRENT_TERMS_VERSION = '2026-10-28';

export const CURRENT_COMMUNITY_GUIDELINES_VERSION =
  '2026-10-28';

type PolicyAcceptanceProfile = {
  terms_accepted_at?: string | null;
  terms_version?: string | null;
  community_guidelines_accepted_at?: string | null;
  community_guidelines_version?: string | null;
};

export function hasAcceptedCurrentPolicies(
  profile: PolicyAcceptanceProfile | null | undefined,
) {
  return (
    profile?.terms_accepted_at != null &&
    profile?.terms_version === CURRENT_TERMS_VERSION &&
    profile?.community_guidelines_accepted_at != null &&
    profile?.community_guidelines_version ===
      CURRENT_COMMUNITY_GUIDELINES_VERSION
  );
}