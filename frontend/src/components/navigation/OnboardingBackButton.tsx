import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  top: number;
  left: number;
  onPress: () => void;
};

const THEME_GRADIENT = ['#FF8D88', '#FFAF79', '#FFD86E'] as const;

// เดิมปุ่มมี marginTop: 50 อยู่ข้างใน ย้ายมาบวกที่ top เพื่อให้ตำแหน่งบนจอเท่าเดิม
const TOP_OFFSET = 50;

export default function OnboardingBackButton({
  top,
  left,
  onPress,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 30,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          top: top + TOP_OFFSET,
          left,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.94)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <LinearGradient
          colors={THEME_GRADIENT}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.circleButton}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#FFFFFF"
          />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const softShadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  android: {
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 20,
    borderRadius: 24,
    backgroundColor: '#FFAF79',
    ...softShadow,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
