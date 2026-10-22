
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { useRef, useState } from 'react';

type Props = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
};

export default function OnboardingGoButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Next',
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const isDisabled = disabled || loading;

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
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={() => {
          setPressed(true);
          animateTo(0.96);
        }}
        onPressOut={() => {
          setPressed(false);
          animateTo(1);
        }}
        accessibilityRole="button"
        style={[
          styles.button,
          pressed && styles.buttonPressed,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#754C35" />
        ) : (
          <Text style={styles.text}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-end',
    marginTop: 30,
  },
  button: {
    minWidth: 112,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF6AE',

    shadowColor: '#8D5140',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.30,
    shadowRadius: 7,
    elevation: 6,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  buttonPressed: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#754C35',
  },
  disabled: {
    opacity: 0.6,
  },
});
