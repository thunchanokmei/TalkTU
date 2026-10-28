
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const slideUp = {
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
} as const;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ...screen เดิมของคุณ... */}

        <Stack.Screen name="edit-profile" options={slideUp} />
        <Stack.Screen name="preview-profile" options={slideUp} />
        <Stack.Screen name="account-settings" options={slideUp} />
      </Stack>
    </GestureHandlerRootView>
  );
}
