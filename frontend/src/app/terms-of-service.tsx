import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SUPPORT_EMAIL = 'talktu.team@gmail.com';

export default function TermsOfServicePage() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>TalkTU Terms of Service</Text>

        <Text style={styles.updated}>
          Last updated: October 28, 2026
        </Text>

        <Text style={styles.text}>
          These Terms of Service govern your access to and use of TalkTU.
          By creating an account or using TalkTU, you agree to these Terms
          and the TalkTU Community Guidelines.
        </Text>

        <Text style={styles.heading}>1. Eligibility</Text>

        <Text style={styles.text}>
          TalkTU is intended only for eligible Thammasat University students
          who are at least 18 years old.
        </Text>

        <Text style={styles.text}>
          You must provide accurate information and must not attempt to bypass
          TalkTU's eligibility or age requirements.
        </Text>

        <Text style={styles.heading}>2. Your account</Text>

        <Text style={styles.text}>
          You are responsible for activity performed through your TalkTU
          account and for keeping access to your account secure.
        </Text>

        <Text style={styles.text}>
          You may not impersonate another person, create an account for another
          person without authorization, or use another person's account.
        </Text>

        <Text style={styles.heading}>3. TU authentication</Text>

        <Text style={styles.text}>
          TalkTU may use Thammasat University account information to verify
          eligibility to use the service. TalkTU is not responsible for the
          availability or operation of external authentication services.
        </Text>

        <Text style={styles.heading}>4. Acceptable use</Text>

        <Text style={styles.text}>
          You agree to use TalkTU lawfully and in accordance with these Terms
          and the TalkTU Community Guidelines.
        </Text>

        <Text style={styles.text}>
          You must not use TalkTU to harass others, distribute illegal or
          harmful content, commit fraud, interfere with the service, bypass
          safety features, gain unauthorized access to systems or accounts,
          or otherwise misuse the platform.
        </Text>

        <Text style={styles.heading}>5. User-generated content</Text>

        <Text style={styles.text}>
          TalkTU allows users to create and share content, including profile
          information, photos, posts, comments, and messages.
        </Text>

        <Text style={styles.text}>
          You are responsible for content that you submit through TalkTU and
          must have the right to submit that content.
        </Text>

        <Text style={styles.text}>
          You must not upload or share content that violates these Terms,
          the Community Guidelines, another person's rights, or applicable
          law.
        </Text>

        <Text style={styles.heading}>6. Permission to operate the service</Text>

        <Text style={styles.text}>
          You retain ownership of content that you create. By submitting
          content to TalkTU, you grant TalkTU permission to host, store,
          process, display, and distribute that content as necessary to
          operate and provide the features of the service.
        </Text>

        <Text style={styles.heading}>7. Moderation and enforcement</Text>

        <Text style={styles.text}>
          TalkTU may review reports and take reasonable action to protect
          users and the service. This may include removing content,
          restricting features, suspending accounts, or permanently
          removing accounts.
        </Text>

        <Text style={styles.text}>
          Serious safety violations or repeated violations may result in
          immediate action.
        </Text>

        <Text style={styles.heading}>8. Reporting and blocking</Text>

        <Text style={styles.text}>
          TalkTU provides features that allow users to report inappropriate
          content or behavior and block other users. Misuse of reporting or
          safety systems may itself result in enforcement action.
        </Text>

        <Text style={styles.heading}>9. Account deletion</Text>

        <Text style={styles.text}>
          You may request permanent deletion of your TalkTU account through
          Profile → Account Settings → Delete Account.
        </Text>

        <Text style={styles.text}>
          If you no longer have access to the app, you may use the TalkTU
          Account Deletion webpage or contact the TalkTU team.
        </Text>

        <Text style={styles.text}>
          Account deletion is permanent. Information may be retained only
          where reasonably necessary for safety, fraud prevention, dispute
          resolution, or applicable legal obligations, as described in the
          Privacy Policy.
        </Text>

        <Text style={styles.heading}>10. Service availability</Text>

        <Text style={styles.text}>
          TalkTU may change, update, suspend, or discontinue features when
          necessary. We do not guarantee that every feature will always be
          available or operate without interruption.
        </Text>

        <Text style={styles.heading}>11. Safety</Text>

        <Text style={styles.text}>
          TalkTU cannot guarantee the identity, intentions, conduct, or
          accuracy of information provided by other users.
        </Text>

        <Text style={styles.text}>
          You are responsible for exercising appropriate judgment when
          communicating with or meeting other users, including when arranging
          in-person meetings.
        </Text>

        <Text style={styles.heading}>12. Privacy</Text>

        <Text style={styles.text}>
          Information about how TalkTU collects, uses, stores, and deletes
          personal information is described in the TalkTU Privacy Policy.
        </Text>

        <Text style={styles.heading}>13. Changes to these Terms</Text>

        <Text style={styles.text}>
          We may update these Terms when the service, features, or applicable
          requirements change. The updated version will display a revised
          "Last updated" date.
        </Text>

        <Text style={styles.heading}>14. Contact</Text>

        <Text style={styles.text}>
          If you have questions about these Terms, contact the TalkTU team at:
        </Text>

        <Text style={styles.contact}>
          {SUPPORT_EMAIL}
        </Text>

        <Text style={styles.footer}>
          TalkTU · Terms of Service
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2B2B2B',
    marginBottom: 6,
  },

  updated: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 24,
  },

  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2B2B',
    marginTop: 26,
    marginBottom: 8,
  },

  text: {
    fontSize: 15,
    lineHeight: 23,
    color: '#555555',
    marginBottom: 10,
  },

  contact: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF7F87',
    marginTop: 8,
  },

  footer: {
    marginTop: 36,
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
});