import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function BirthdayScreen() {
  return (
    <LinearGradient
      colors={['#FF7F87', '#FFA577', '#FFE8C8']}
      style={styles.container}
    >
      <Text style={styles.text}>
        Birthday Screen
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
});