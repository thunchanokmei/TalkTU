import { View } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNavigation from '../../components/navigation/BottomNavigation';

export default function MainLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];

  // segments ในห้องแชตคือ ["(main)", "chat", "[matchId]"]
  const isInChatRoom = segments.includes('chat') && segments.includes('[matchId]');

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() =>
        isInChatRoom ? null : (
          <View style={{ backgroundColor: '#FFFFFF', paddingBottom: insets.bottom }}>
            <BottomNavigation />
          </View>
        )
      }
    >
      <Tabs.Screen name="swipe" />
      <Tabs.Screen name="like" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="chat" />
    </Tabs>
  );
}