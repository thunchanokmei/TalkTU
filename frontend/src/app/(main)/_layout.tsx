import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNavigation from '../../components/navigation/BottomNavigation';

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            paddingBottom: insets.bottom,
          }}
        >
          <BottomNavigation />
        </View>
      )}
    >
      <Tabs.Screen name="swipe" />
      <Tabs.Screen name="like" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="chat" />
    </Tabs>
  );
}