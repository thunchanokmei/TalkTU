import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type MatchModalProps = {
  visible: boolean;
  displayName: string;
  onContinue: () => void;
};

export default function MatchModal({
  visible,
  displayName,
  onContinue,
}: MatchModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            It's a Match! 💕
          </Text>

          <Text style={styles.description}>
            You and {displayName} liked each other!
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.continueButton}
            onPress={onContinue}
          >
            <Text style={styles.continueText}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 24,
  },

  continueButton: {
    width: '100%',
    backgroundColor: '#FF7B82',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});