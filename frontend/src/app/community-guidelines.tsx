import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SUPPORT_EMAIL = 'talktu.team@gmail.com';

export default function CommunityGuidelinesPage() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>TalkTU Community Guidelines</Text>

        <Text style={styles.updated}>
          Last updated: October 28, 2026
        </Text>

        <Text style={styles.text}>
          TalkTU is a community for eligible Thammasat University students
          aged 18 or older. These guidelines apply to profiles, posts,
          comments, messages, photos, and all other activity on TalkTU.
        </Text>

        <Text style={styles.heading}>1. Treat others with respect</Text>

        <Text style={styles.text}>
          Do not harass, bully, threaten, intimidate, shame, or deliberately
          target another person. Repeated unwanted contact or abusive behavior
          is not allowed.
        </Text>

        <Text style={styles.heading}>2. No hate or discrimination</Text>

        <Text style={styles.text}>
          Content that attacks, degrades, threatens, or promotes hatred toward
          people based on protected or personal characteristics is not allowed.
        </Text>

        <Text style={styles.heading}>3. No sexual exploitation or explicit content</Text>

        <Text style={styles.text}>
          Do not post or send pornographic material, sexually exploitative
          content, non-consensual intimate content, sexual harassment, or
          content that promotes prostitution or sexual exploitation.
        </Text>

        <Text style={styles.heading}>4. No threats or dangerous behavior</Text>

        <Text style={styles.text}>
          Do not make credible threats, encourage violence, promote dangerous
          acts, or use TalkTU to organize illegal or harmful activity.
        </Text>

        <Text style={styles.heading}>5. Protect privacy</Text>

        <Text style={styles.text}>
          Do not share another person's private information without permission.
          This includes private contact information, addresses, passwords,
          identification documents, private conversations, or other sensitive
          information.
        </Text>

        <Text style={styles.text}>
          Do not attempt to expose or identify users who choose to participate
          anonymously through TalkTU's community features.
        </Text>

        <Text style={styles.heading}>6. Be authentic</Text>

        <Text style={styles.text}>
          Do not impersonate another person, create misleading identities,
          falsely claim affiliation with another person or organization, or
          deliberately deceive users about who you are.
        </Text>

        <Text style={styles.heading}>7. No spam, scams, or manipulation</Text>

        <Text style={styles.text}>
          Do not use TalkTU for scams, phishing, spam, fraudulent activity,
          deceptive promotions, automated abuse, or attempts to manipulate
          other users.
        </Text>

        <Text style={styles.heading}>8. Respect consent and boundaries</Text>

        <Text style={styles.text}>
          Respect other users' decisions and personal boundaries. If someone
          asks you to stop contacting them, stop. Blocking or unmatching must
          not be bypassed using another account.
        </Text>

        <Text style={styles.heading}>9. Keep content lawful</Text>

        <Text style={styles.text}>
          Do not use TalkTU to sell, request, distribute, or facilitate illegal
          goods, services, substances, or activities.
        </Text>

        <Text style={styles.heading}>10. Eligibility</Text>

        <Text style={styles.text}>
          TalkTU is intended only for eligible Thammasat University students
          who are at least 18 years old. Attempts to bypass eligibility or age
          requirements may result in account removal.
        </Text>

        <Text style={styles.heading}>11. Reporting</Text>

        <Text style={styles.text}>
          If you see a profile, post, comment, message, or conversation that
          violates these guidelines, use the in-app Report feature. Reports
          may be reviewed by the TalkTU team and appropriate action may be
          taken.
        </Text>

        <Text style={styles.heading}>12. Blocking and unmatching</Text>

        <Text style={styles.text}>
          You can block users when necessary for your safety or comfort.
          Blocking restricts interaction between the accounts. You may also
          unmatch users through supported TalkTU features.
        </Text>

        <Text style={styles.heading}>13. Enforcement</Text>

        <Text style={styles.text}>
          TalkTU may remove content, restrict features, suspend accounts, or
          permanently remove accounts that violate these guidelines, threaten
          user safety, abuse the service, or repeatedly violate community
          standards.
        </Text>

        <Text style={styles.text}>
          Serious violations may result in immediate action without prior
          warning.
        </Text>

        <Text style={styles.heading}>14. Contact</Text>

        <Text style={styles.text}>
          For safety concerns, moderation questions, or other community issues,
          contact the TalkTU team at:
        </Text>

        <Text style={styles.contact}>
          {SUPPORT_EMAIL}
        </Text>

        <Text style={styles.footer}>
          TalkTU · Community Guidelines
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