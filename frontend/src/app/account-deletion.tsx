import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SUPPORT_EMAIL = 'talktu.team@gmail.com';

export default function AccountDeletionPage() {
  const handleRequestDeletion = async () => {
  const subject = 'TalkTU Account Deletion Request';

  const body = `Hello TalkTU Team,

I would like to permanently delete my TalkTU account and associated personal data.

TU Username:

I understand that account deletion is permanent.

Thank you.`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  if (Platform.OS === 'web') {
    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(SUPPORT_EMAIL)}` +
      `&su=${encodedSubject}` +
      `&body=${encodedBody}`;

    await Linking.openURL(gmailUrl);
    return;
  }

  const mailtoUrl =
    `mailto:${SUPPORT_EMAIL}` +
    `?subject=${encodedSubject}` +
    `&body=${encodedBody}`;

  await Linking.openURL(mailtoUrl);
};

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Delete your TalkTU account</Text>

        <Text style={styles.text}>
          TalkTU users can permanently delete their account and associated
          personal data.
        </Text>

        <Text style={styles.heading}>Delete your account in TalkTU</Text>

        <Text style={styles.text}>
          Open TalkTU, go to Profile → Account Settings → Delete Account,
          then confirm the deletion request.
        </Text>

        <Text style={styles.heading}>Request deletion without the app</Text>

        <Text style={styles.text}>
          If you no longer have access to the TalkTU app, you can request
          account deletion by contacting the TalkTU team.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleRequestDeletion}
        >
          <Text style={styles.buttonText}>
            Request Account Deletion
          </Text>
        </Pressable>

        <Text style={styles.contact}>
          Contact: {SUPPORT_EMAIL}
        </Text>

        <Text style={styles.heading}>Data that will be deleted</Text>

        <Text style={styles.text}>
          Your TalkTU account and associated personal data will be permanently
          deleted. This includes your profile information, profile photos,
          preferences, posts, comments, likes, matches, messages, and other
          account-related information.
        </Text>

        <Text style={styles.heading}>Verification and processing</Text>

        <Text style={styles.text}>
          For deletion requests submitted outside the app, we may ask you to
          verify that you own the account before processing the request.
          Once verified, the account and associated personal data will be
          permanently deleted.
        </Text>

        <Text style={styles.footer}>
          TalkTU · {SUPPORT_EMAIL}
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
    marginBottom: 18,
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
  },

  button: {
    marginTop: 20,
    backgroundColor: '#FF8F8F',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  contact: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },

  footer: {
    marginTop: 36,
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
});