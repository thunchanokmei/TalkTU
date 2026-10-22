
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  top: number;
  left: number;
  onPress: () => void;
};

export default function OnboardingBackButton({
  top,
  left,
  onPress,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

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
          top,
          left,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          setPressed(true);
          animateTo(0.94);
        }}
        onPressOut={() => {
          setPressed(false);
          animateTo(1);
        }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={[
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <LinearGradient
          colors={['#FFE98F', '#FFB873']}
          style={styles.gradient}
        >
          <Text style={styles.text}>{'<<'}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 20,
    borderRadius: 999,
    elevation: 4,
    shadowColor: '#8D5140',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  button: {
    width: 75,
    height: 55,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop:50,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
    color: '#754C35',
  },
});
