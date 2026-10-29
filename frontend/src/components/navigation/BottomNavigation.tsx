import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getMyUnreadCounts } from '../../features/chat/services/chatService';
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';

export type BottomNavTab =
  | 'swap'
  | 'like'
  | 'board'
  | 'chat'
  | 'profile';

type BottomNavigationProps = {
  style?: ViewStyle;
};

const NAV_ITEMS: {
  key: BottomNavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'swap', label: 'Swap', icon: 'happy' },
  { key: 'like', label: 'Like', icon: 'heart' },
  { key: 'board', label: 'Board', icon: 'albums-outline' },
  { key: 'chat', label: 'Chat', icon: 'chatbubble-ellipses' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

const ROUTES = {
  swap: '/swipe',
  like: '/like',
  board: '/feed',
  chat: '/chat',
  profile: '/profile',
} as const;

// หา tab ที่ active จาก path (รองรับหน้าย่อย เช่น /chat/123)
function getTabFromPath(pathname: string): BottomNavTab {
  if (pathname.startsWith('/like')) return 'like';
  if (pathname.startsWith('/feed')) return 'board';
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'swap';
}

const PADDING = 6;

export default function BottomNavigation({
  style,
}: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getTabFromPath(pathname);
  const [totalUnread, setTotalUnread] = useState(0);

useEffect(() => {
  let mounted = true;

  const loadTotalUnread = async () => {
    const result = await getMyUnreadCounts();

    if (!mounted) return;

    if (result.error) {
      console.error('BOTTOM NAV UNREAD ERROR:', result.error);
      return;
    }

    const total = result.data.reduce(
      (sum, item) => sum + item.unread_count,
      0
    );

    setTotalUnread(total);
  };

  void loadTotalUnread();

  const channel = supabase
    .channel(`bottom-nav-unread-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      () => {
        void loadTotalUnread();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      },
      () => {
        void loadTotalUnread();
      }
    )
    .subscribe((status) => {
      console.log('BOTTOM NAV REALTIME:', status);
    });

  return () => {
    mounted = false;
    void supabase.removeChannel(channel);
  };
}, []);

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

  const activeIndex = NAV_ITEMS.findIndex(
    (item) => item.key === activeTab
  );

  const [containerWidth, setContainerWidth] = useState(0);

  const slotWidth =
    containerWidth > 0
      ? (containerWidth - PADDING * 2) / NAV_ITEMS.length
      : 0;

  const pillX = (index: number) =>
    PADDING + index * slotWidth + (slotWidth - itemSize) / 2;

  const translateX = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  // refs เพื่อให้ PanResponder อ่านค่าล่าสุดได้เสมอ
  const startX = useRef(0);
  const currentX = useRef(0);

  const latest = useRef({
    slotWidth,
    itemSize,
    activeIndex,
    activeTab,
  });

  latest.current = {
    slotWidth,
    itemSize,
    activeIndex,
    activeTab,
  };

  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });

    return () => {
      translateX.removeListener(id);
    };
  }, [translateX]);

  // เลื่อน pill ไปที่ tab ที่ active
  useEffect(() => {
    if (slotWidth === 0 || activeIndex < 0) return;

    Animated.spring(translateX, {
      toValue: pillX(activeIndex),
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.8,
    }).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slotWidth, itemSize]);

  const goTo = (index: number) => {
    const item = NAV_ITEMS[index];

    if (!item || item.key === latest.current.activeTab) {
      return;
    }

    router.navigate(ROUTES[item.key]);
  };

  const finishDrag = () => {
    const {
      slotWidth: sw,
      itemSize: is,
      activeIndex: ai,
    } = latest.current;

    // ป้องกันการคำนวณตำแหน่งผิดในช่วง layout
    if (sw <= 0 || ai < 0) return;

    const center = currentX.current - PADDING + is / 2;

    const idx = Math.max(
      0,
      Math.min(
        Math.floor(center / sw),
        NAV_ITEMS.length - 1
      )
    );

    Animated.spring(pillScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    const target = NAV_ITEMS[idx];

    if (!target || idx === ai ) {
      // Board ยังไม่มีการเปลี่ยนหน้าจากการลาก
      // ให้ pill เด้งกลับตำแหน่งเดิม
      Animated.spring(translateX, {
        toValue: PADDING + ai * sw + (sw - is) / 2,
        useNativeDriver: true,
        damping: 16,
        stiffness: 180,
      }).start();

      return;
    }

    Animated.spring(translateX, {
      toValue: PADDING + idx * sw + (sw - is) / 2,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
    }).start();

    goTo(idx);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // จับเฉพาะการลากแนวนอน ไม่รบกวนการกดปุ่มปกติ
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),

        onPanResponderGrant: () => {
          translateX.stopAnimation((value) => {
            startX.current = value;
          });

          Animated.spring(pillScale, {
            toValue: 1.1,
            useNativeDriver: true,
            friction: 6,
          }).start();
        },

        onPanResponderMove: (_, gesture) => {
          const {
            slotWidth: sw,
            itemSize: is,
          } = latest.current;

          if (sw <= 0) return;

          const min = PADDING + (sw - is) / 2;
          const max =
            min + sw * (NAV_ITEMS.length - 1);

          const next = Math.max(
            min,
            Math.min(startX.current + gesture.dx, max)
          );

          translateX.setValue(next);
        },

        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 6) return;
             finishDrag();
        },

        onPanResponderTerminate: () => {
          finishDrag();
        },
      }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const newWidth = event.nativeEvent.layout.width;

    if (newWidth !== containerWidth) {
      setContainerWidth(newWidth);
    }
  };

  return (
    <View
      onLayout={onLayout}
      {...panResponder.panHandlers}
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
      {/* พื้นหลัง Gradient */}
      <LinearGradient
        colors={['#FF8D88', '#FFAF79', '#FFD86E']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.background}
      />

      {/* วงกลมเลื่อนตาม Tab ที่เลือก */}
      {slotWidth > 0 && activeIndex >= 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: itemSize,
              height: itemSize,
              borderRadius: itemSize / 2,
              transform: [
                { translateX },
                { scale: pillScale },
              ],
            },
          ]}
        >
          {/* เงาด้านบน */}
          <LinearGradient
            colors={[
              'rgba(170,40,32,0.45)',
              'rgba(170,40,32,0)',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={StyleSheet.absoluteFill}
          />

          {/* เงาด้านซ้าย */}
          <LinearGradient
            colors={[
              'rgba(170,40,32,0.25)',
              'rgba(170,40,32,0)',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.4, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          {/* เงาด้านขวา */}
          <LinearGradient
            colors={[
              'rgba(170,40,32,0.25)',
              'rgba(170,40,32,0)',
            ]}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 0.6, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          {/* แสงสะท้อนขอบล่าง */}
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.45)',
            ]}
            start={{ x: 0.5, y: 0.8 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {/* ปุ่ม Navigation: render เพียง 5 ปุ่ม */}
      {NAV_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          activeOpacity={0.75}
          style={[
            styles.navItem,
            { height: itemSize },
          ]}
          onPress={() => goTo(index)}
        >
          <View style={{ position: 'relative' }}>
  <Ionicons
    name={item.icon}
    size={iconSize}
    color="#f7f3f3"
  />

  {item.key === 'chat' && totalUnread > 0 && (
    <View style={styles.unreadBadge}>
      <Text style={styles.unreadBadgeText}>
        {totalUnread > 99 ? '99+' : totalUnread}
      </Text>
    </View>
  )}
</View>

          <Text style={styles.navLabel}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#FFAF79',
    borderRadius: 999,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: PADDING,
    paddingVertical: 4,

    ...Platform.select({
      ios: {
        shadowColor: '#FF6B5E',
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: {
          width: 0,
          height: 6,
        },
      },

      android: {
        elevation: 10,
        shadowColor: '#FF6B5E',
      },

      default: {},
    }),
  },

  background: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
  },

  pill: {
    position: 'absolute',
    top: 4,
    left: 0,

    overflow: 'hidden',

    backgroundColor: 'rgba(255, 104, 93, 0.65)',

    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navLabel: {
    marginTop: 1,

    fontSize: 10,
    fontWeight: '600',

    color: '#fbfafa',
  },
  unreadBadge: {
  position: 'absolute',
  top: -9,
  right: -13,
  minWidth: 17,
  height: 17,
  paddingHorizontal: 4,
  borderRadius: 9,
  backgroundColor: '#E53935',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#FFFFFF',
},

unreadBadgeText: {
  color: '#FFFFFF',
  fontSize: 9,
  fontWeight: '700',
},
});