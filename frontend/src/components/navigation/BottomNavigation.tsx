import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type BottomNavTab =
  | 'swap'
  | 'like'
  | 'board'
  | 'chat'
  | 'profile';

type BottomNavigationProps = {
  activeTab: BottomNavTab;
  onTabPress?: (tab: BottomNavTab) => void;
  style?: ViewStyle;
};

const NAV_ITEMS: {
  key: BottomNavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'swap',
    label: 'Swap',
    icon: 'happy',
  },
  {
    key: 'like',
    label: 'Like',
    icon: 'heart',
  },
  {
    key: 'board',
    label: 'Board',
    icon: 'albums-outline',
  },
  {
    key: 'chat',
    label: 'Chat',
    icon: 'chatbubble-ellipses',
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'person',
  },
];

export default function BottomNavigation({
  activeTab,
  onTabPress,
  style,
}: BottomNavigationProps) {
  const { width, height } = useWindowDimensions();

  const shortSide = Math.min(width, height);

  const horizontalMargin = Math.max(
    20,
    Math.min(shortSide * 0.06, 32)
  );

  const bottomMargin = Math.max(
    10,
    Math.min(shortSide * 0.025, 18)
  );

  const navHeight = Math.max(
    58,
    Math.min(shortSide * 0.16, 68)
  );

  const itemSize = navHeight - 8;

  const iconSize = Math.max(
    19,
    Math.min(shortSide * 0.052, 24)
  );

  return (
    <LinearGradient
      colors={[
        '#FF8D88',
        '#FFAF79',
        '#FFD86E',
      ]}
      start={{
        x: 0,
        y: 0.5,
      }}
      end={{
        x: 1,
        y: 0.5,
      }}
      style={[
        styles.bottomNav,
        {
          marginHorizontal: horizontalMargin,
          marginBottom: bottomMargin,
          minHeight: navHeight,
        },
        style,
      ]}
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.key === activeTab;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.75}
            style={[
              styles.navItem,
              {
                width: itemSize,
                height: itemSize,
                borderRadius: itemSize / 2,
              },
              active &&
                styles.navItemActive,
            ]}
            onPress={() => {
              if (onTabPress) {
                onTabPress(item.key);
                return;
              }

              // Routes for Like/Board/Chat/Profile can be connected
              // when those screens are added.
              console.log(
                'Navigation:',
                item.key
              );
            }}
          >
            <Ionicons
              name={item.icon}
              size={iconSize}
              color="#000000"
            />

            <Text style={styles.navLabel}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    borderRadius: 999,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  navItem: {
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 4,
  },

  navItemActive: {
    backgroundColor:
      'rgba(255, 104, 93, 0.65)',
  },

  navLabel: {
    marginTop: 1,

    fontSize: 10,
    fontWeight: '600',

    color: '#000000',
  },
});
