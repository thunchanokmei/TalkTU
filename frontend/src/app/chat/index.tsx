import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import BottomNavigation from '../../components/navigation/BottomNavigation';

import {
  getChatList,
  getProfilePhotoUrl,
  subscribeToMatches,
} from '../../features/chat/services/chatService';

import type {
  ChatListItem,
} from '../../features/chat/types';

export default function ChatPage() {
  const { width } = useWindowDimensions();

  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTablet = width >= 768;

  const pageWidth = isTablet
    ? Math.min(width - 80, 620)
    : width - 24;

  const loadChats = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      const result = await getChatList();

      if (result.error) {
        setError(
          result.error.message ||
            'Unable to load chats.'
        );
        setChats([]);
      } else {
        setChats(result.data ?? []);
      }

      setLoading(false);
    },
    []
  );

  useEffect(() => {
    void loadChats(true);

    const channel = subscribeToMatches(() => {
      void loadChats(false);
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [loadChats]);

  useFocusEffect(
    useCallback(() => {
      void loadChats(false);
    }, [loadChats])
  );

  const refresh = async () => {
    setRefreshing(true);

    await loadChats(false);

    setRefreshing(false);
  };

  const openChat = (item: ChatListItem) => {
    router.push({
      pathname: '/chat/[matchId]',
      params: {
        matchId: item.match_id,
        name: item.other_display_name ?? 'Unknown',
        image:
          getProfilePhotoUrl(
            item.profile_photo_path
          ) ?? '',
      },
    });
  };

  const formatTime = (
    value: string | null
  ) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();

    if (
      date.toDateString() ===
      now.toDateString()
    ) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ================= HEADER ================= */}

        <View
          style={[
            styles.header,
            { width: pageWidth },
          ]}
        >
          <Image
            source={require('../../../assets/images/chat-header.png')}
            style={styles.chatLogo}
            resizeMode="contain"
          />
        </View>

        {/* ================= CHAT LIST ================= */}

        <View
          style={[
            styles.listContainer,
            { width: pageWidth },
          ]}
        >
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator
                size="large"
                color="#FF7F87"
              />

              <Text style={styles.loadingText}>
                Loading...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Ionicons
                name="cloud-offline-outline"
                size={48}
                color="#FF8585"
              />

              <Text style={styles.errorTitle}>
                Unable to load chats
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() =>
                  loadChats(true)
                }
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : chats.length === 0 ? (
            <View style={styles.center}>
              <Ionicons
                name="chatbubbles-outline"
                size={62}
                color="#FF9A82"
              />

              <Text style={styles.emptyTitle}>
                No chats yet
              </Text>

              <Text style={styles.emptyText}>
                Match with someone and start
                a conversation!
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.listContent
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refresh}
                  tintColor="#FF7F87"
                />
              }
            >
              {chats.map((item) => {
                const imageUrl =
                  getProfilePhotoUrl(
                    item.profile_photo_path
                  );

                return (
                  <TouchableOpacity
                    key={item.match_id}
                    activeOpacity={0.82}
                    onPress={() =>
                      openChat(item)
                    }
                    style={styles.chatCard}
                  >
                    {/* PROFILE IMAGE */}

                    <View style={styles.avatar}>
                      {imageUrl ? (
                        <Image
                          source={{
                            uri: imageUrl,
                          }}
                          style={
                            styles.avatarImage
                          }
                        />
                      ) : (
                        <Ionicons
                          name="person"
                          size={27}
                          color="#AAAAAA"
                        />
                      )}
                    </View>

                    {/* NAME + MESSAGE */}

                    <View style={styles.chatInfo}>
                      <Text
                        style={styles.name}
                        numberOfLines={1}
                      >
                        {item.other_display_name ??
                          'Unknown'}
                      </Text>

                      <Text
                        style={styles.message}
                        numberOfLines={1}
                      >
                        {item.last_message ??
                          'Say hello 👋'}
                      </Text>
                    </View>

                    {/* TIME */}

                    <Text style={styles.time}>
                      {formatTime(
                        item.last_message_at
                      )}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ================= BOTTOM NAV ================= */}

        <BottomNavigation
  activeTab="chat"
  onTabPress={(tab) => {
    if (tab === 'swap') {
      router.replace('/swipe');
    }
  }}
/>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  container: {
    flex: 1,
    alignItems: 'center',
  },

  /* HEADER */

  header: {
    height: 78,

    marginTop: 7,

    backgroundColor: '#FFFFFF',

    borderRadius: 17,

    justifyContent: 'center',
    alignItems: 'flex-start',

    paddingLeft: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  chatLogo: {
    width: 105,
    height: 60,
  },

  /* LIST */

  listContainer: {
    flex: 1,
  },

  listContent: {
    paddingTop: 24,
    paddingBottom: 20,
  },

  chatCard: {
    height: 66,

    marginBottom: 10,

    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 17,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },

  avatar: {
    width: 47,
    height: 47,

    borderRadius: 24,

    backgroundColor: '#EEEEEE',

    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',

    marginRight: 10,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  chatInfo: {
    flex: 1,

    justifyContent: 'center',
  },

  name: {
    fontSize: 14,
    fontWeight: '700',

    color: '#222222',

    marginBottom: 4,
  },

  message: {
    fontSize: 11,

    color: '#777777',
  },

  time: {
    fontSize: 9,

    color: '#999999',

    marginLeft: 5,
  },

  /* STATES */

  center: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 8,

    color: '#888888',

    fontSize: 12,
  },

  errorTitle: {
    marginTop: 12,

    fontSize: 17,
    fontWeight: '700',

    color: '#333333',
  },

  errorText: {
    marginTop: 7,

    fontSize: 12,

    color: '#888888',

    textAlign: 'center',
  },

  retryButton: {
    marginTop: 15,

    paddingHorizontal: 22,
    paddingVertical: 9,

    borderRadius: 20,

    backgroundColor: '#FF8585',
  },

  retryText: {
    color: '#FFFFFF',

    fontSize: 12,
    fontWeight: '700',
  },

  emptyTitle: {
    marginTop: 14,

    fontSize: 19,
    fontWeight: '700',

    color: '#333333',
  },

  emptyText: {
    marginTop: 7,

    fontSize: 12,

    color: '#888888',

    textAlign: 'center',
  },
});