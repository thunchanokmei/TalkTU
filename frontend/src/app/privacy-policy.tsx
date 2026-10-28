import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SUPPORT_EMAIL = 'talktu.team@gmail.com';

export default function PrivacyPolicyPage() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>TalkTU Privacy Policy</Text>

        <Text style={styles.updated}>
          Last updated: October 28, 2026
        </Text>

        <Text style={styles.text}>
          This Privacy Policy explains how TalkTU collects, uses, stores,
          and handles information when you use the TalkTU application and
          related services.
        </Text>

        <Text style={styles.heading}>1. Information we collect</Text>

        <Text style={styles.text}>
          TalkTU may collect information that you provide when creating and
          using your account, including your TU account identifier, profile
          information, faculty, TU generation, date of birth, gender
          information, dating or friendship preferences, interests, campus
          preferences, biography, height, and profile photos.
        </Text>

        <Text style={styles.text}>
          We also process content and activity that you create within TalkTU,
          such as posts, comments, likes, swipes, matches, chat messages,
          reports, and blocks.
        </Text>

        <Text style={styles.heading}>2. TU account authentication</Text>

        <Text style={styles.text}>
          TalkTU uses your TU credentials only for the purpose of verifying
          your eligibility to use the service. Your TU password is sent for
          authentication and is not stored as part of your TalkTU profile or
          application database.
        </Text>

        <Text style={styles.heading}>3. How we use your information</Text>

        <Text style={styles.text}>
          We use your information to provide and operate TalkTU, authenticate
          eligible users, create and display profiles, provide matching and
          discovery features, enable messaging and community features,
          maintain account preferences, process reports and blocks, enforce
          community rules, improve safety, provide support, and comply with
          applicable requirements.
        </Text>

        <Text style={styles.heading}>4. User-generated content</Text>

        <Text style={styles.text}>
          Content that you choose to post or share with other TalkTU users may
          be visible to those users according to the features of the service.
          This may include profile information, profile photos, posts,
          comments, and messages sent to other users.
        </Text>

        <Text style={styles.heading}>5. Service providers</Text>

        <Text style={styles.text}>
          TalkTU uses third-party service providers to operate the service.
          These may include Supabase for authentication, database, storage,
          realtime, and backend infrastructure, and email service providers
          for operational, support, and moderation-related communications.
        </Text>

        <Text style={styles.text}>
          Information is provided to service providers only as necessary for
          them to perform services on behalf of TalkTU.
        </Text>

        <Text style={styles.heading}>6. Reports, safety, and moderation</Text>

        <Text style={styles.text}>
          When you report a profile, post, comment, message, or conversation,
          TalkTU may retain information related to the report so that the
          TalkTU team can investigate safety concerns, enforce community
          rules, and respond to abuse.
        </Text>

        <Text style={styles.heading}>7. Data storage and security</Text>

        <Text style={styles.text}>
          We take reasonable technical and organizational measures to protect
          information handled by TalkTU. Access to backend systems and
          administrative functions is restricted to authorized processes and
          personnel.
        </Text>

        <Text style={styles.heading}>8. Data retention</Text>

        <Text style={styles.text}>
          We retain information for as long as necessary to provide TalkTU,
          maintain the safety and integrity of the service, comply with
          applicable obligations, and resolve disputes.
        </Text>

        <Text style={styles.text}>
          Some safety or moderation information may need to be retained when
          reasonably necessary to investigate abuse, prevent misuse, or meet
          applicable legal requirements.
        </Text>

        <Text style={styles.heading}>9. Account and data deletion</Text>

        <Text style={styles.text}>
          You may request permanent deletion of your TalkTU account from
          Profile → Account Settings → Delete Account.
        </Text>

        <Text style={styles.text}>
          If you no longer have access to the app, you may request deletion
          through TalkTU's Account Deletion webpage or contact the TalkTU team
          at {SUPPORT_EMAIL}.
        </Text>

        <Text style={styles.text}>
          When an account deletion request is completed, the account and
          associated personal data are permanently deleted, subject to any
          information that must be retained for legitimate safety, fraud
          prevention, dispute resolution, or legal purposes.
        </Text>

        <Text style={styles.heading}>10. Age requirement</Text>

        <Text style={styles.text}>
          TalkTU is intended only for eligible Thammasat University students
          who are at least 18 years old.
        </Text>

        <Text style={styles.heading}>11. Changes to this policy</Text>

        <Text style={styles.text}>
          We may update this Privacy Policy when TalkTU's features, data
          practices, or applicable requirements change. The updated policy
          will display a revised "Last updated" date.
        </Text>

        <Text style={styles.heading}>12. Contact us</Text>

        <Text style={styles.text}>
          If you have questions, privacy concerns, or requests relating to
          your personal data, contact the TalkTU team at:
        </Text>

        <Text style={styles.contact}>
          {SUPPORT_EMAIL}
        </Text>

        <Text style={styles.footer}>
          TalkTU · Privacy Policy
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