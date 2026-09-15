import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { supabase } from '../../lib/supabase';

import {
  getChatList,
  getMessages,
  sendMessage,
  subscribeToMessages,
} from '../../features/chat/services/chatService';

import type {
  ChatMessage,
} from '../../features/chat/types';

export default function ChatRoom() {
  const params =
    useLocalSearchParams<{
      matchId?: string;
      name?: string;
      image?: string;
    }>();

  const { width } =
    useWindowDimensions();

  const matchId =
    typeof params.matchId === 'string'
      ? params.matchId
      : '';

  const name =
    typeof params.name === 'string'
      ? params.name
      : 'Unknown';

  const image =
    typeof params.image === 'string'
      ? params.image
      : '';

  const pageWidth =
    width >= 768
      ? Math.min(width - 80, 620)
      : width - 24;

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [input, setInput] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [loadingOlder, setLoadingOlder] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [hasMore, setHasMore] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [showSafety, setShowSafety] =
    useState(false);

  const scrollRef =
    useRef<ScrollView>(null);

  const pageRef =
    useRef(0);

  /* ================= CURRENT USER ================= */

  useEffect(() => {
    const loadUser = async () => {
      const {
        data,
      } = await supabase.auth.getUser();

      setCurrentUserId(
        data.user?.id ?? null
      );
    };

    void loadUser();
  }, []);

  /* ================= LOAD CHAT ================= */

  const loadInitialMessages =
    useCallback(async () => {
      if (!matchId) {
        setError('Invalid match.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      pageRef.current = 0;

      const result =
        await getMessages(
          matchId,
          0
        );

      if (result.error) {
        setError(
          result.error.message ||
            'Unable to load messages.'
        );

        setMessages([]);
      } else {
        setMessages(
          [...result.data].reverse()
        );

        setHasMore(
          result.hasMore
        );
      }

      setLoading(false);
    }, [matchId]);

  useEffect(() => {
    void loadInitialMessages();
  }, [loadInitialMessages]);

  /* ================= REALTIME ================= */

  useEffect(() => {
    if (!matchId) {
      return;
    }

    const channel =
      subscribeToMessages(
        matchId,
        (message) => {
          setMessages((current) => {
            if (
              current.some(
                (item) =>
                  item.id === message.id
              )
            ) {
              return current;
            }

            return [
              ...current,
              message,
            ];
          });

          setTimeout(() => {
            scrollRef.current?.scrollToEnd({
              animated: true,
            });
          }, 100);
        }
      );

    return () => {
      void channel.unsubscribe();
    };
  }, [matchId]);

  /* ================= OLDER ================= */

  const loadOlderMessages = async () => {
    if (
      loadingOlder ||
      !hasMore ||
      !matchId
    ) {
      return;
    }

    setLoadingOlder(true);

    const nextPage =
      pageRef.current + 1;

    const result =
      await getMessages(
        matchId,
        nextPage
      );

    if (result.error) {
      setLoadingOlder(false);

      Alert.alert(
        'Unable to load messages',
        result.error.message
      );

      return;
    }

    const older =
      [...result.data].reverse();

    setMessages((current) => {
      const existing =
        new Set(
          current.map(
            (item) => item.id
          )
        );

      const unique =
        older.filter(
          (item) =>
            !existing.has(item.id)
        );

      return [
        ...unique,
        ...current,
      ];
    });

    pageRef.current =
      nextPage;

    setHasMore(
      result.hasMore
    );

    setLoadingOlder(false);
  };

  /* ================= SEND ================= */

  const handleSend = async () => {
    const content =
      input.trim();

    if (
      !content ||
      sending ||
      !matchId
    ) {
      return;
    }

    if (content.length > 5000) {
      Alert.alert(
        'Message too long',
        'Message cannot exceed 5000 characters.'
      );
      return;
    }

    setSending(true);

    const result =
      await sendMessage(
        matchId,
        content
      );

    if (result.error) {
      Alert.alert(
        'Unable to send message',
        result.error.message
      );

      setSending(false);
      return;
    }

    setInput('');
    setSending(false);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  };

  /* ================= SCROLL ================= */

  const handleScroll = (
    event: any
  ) => {
    const y =
      event.nativeEvent
        .contentOffset.y;

    if (
      y <= 30 &&
      !loadingOlder &&
      hasMore
    ) {
      void loadOlderMessages();
    }
  };

  /* ================= SAFETY ================= */

  const unmatch = () => {
    setShowSafety(false);

    Alert.alert(
      'Unmatch',
      `Unmatch ${name}?`
    );
  };

  const block = () => {
    setShowSafety(false);

    Alert.alert(
      'Block',
      `Block ${name}?`
    );
  };

  const report = () => {
    setShowSafety(false);

    Alert.alert(
      'Report',
      `Report ${name}?`
    );
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        {/* ================= HEADER ================= */}

        <View
          style={[
            styles.header,
            { width: pageWidth },
          ]}
        >
          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() =>
              router.back()
            }
          >
            <Text style={styles.backText}>
              «
            </Text>
          </TouchableOpacity>

          {/* NAME */}

          <View style={styles.headerUser}>
            {image ? (
              <Image
                source={{
                  uri: image,
                }}
                style={styles.headerAvatar}
              />
            ) : (
              <View
                style={
                  styles.headerAvatarPlaceholder
                }
              >
                <Ionicons
                  name="person"
                  size={16}
                  color="#999999"
                />
              </View>
            )}

            <Text
              style={styles.headerName}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>

          {/* SAFETY */}

          <TouchableOpacity
            style={styles.safetyIcon}
            onPress={() =>
              setShowSafety(true)
            }
          >
            <Ionicons
              name="shield-outline"
              size={21}
              color="#FF7F87"
            />
          </TouchableOpacity>
        </View>

        {/* ================= CHAT ================= */}

        <LinearGradient
          colors={[
            '#FFE0B8',
            '#FFB078',
            '#FF7D88',
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 0,
            y: 1,
          }}
          style={[
            styles.chatArea,
            { width: pageWidth },
          ]}
        >
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator
                size="large"
                color="#FFFFFF"
              />

              <Text style={styles.loadingText}>
                Loading...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Ionicons
                name="cloud-offline-outline"
                size={45}
                color="#FFFFFF"
              />

              <Text style={styles.loadingText}>
                {error}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() =>
                  loadInitialMessages()
                }
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* MESSAGES */}

              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                contentContainerStyle={
                  styles.messageContent
                }
                showsVerticalScrollIndicator={
                  false
                }
                onScroll={handleScroll}
                scrollEventThrottle={200}
              >
                {loadingOlder && (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    style={{
                      marginBottom: 12,
                    }}
                  />
                )}

                {!hasMore &&
                  messages.length > 0 && (
                    <Text
                      style={
                        styles.startConversation
                      }
                    >
                      Start of conversation
                    </Text>
                  )}

                {messages.length === 0 ? (
                  <View
                    style={
                      styles.emptyChat
                    }
                  >
                    <Text
                      style={
                        styles.emptyChatText
                      }
                    >
                      Say hi to {name} 👋
                    </Text>
                  </View>
                ) : (
                  messages.map(
                    (message) => {
                      const isMe =
                        currentUserId !==
                          null &&
                        message.sender_id ===
                          currentUserId;

                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isMe={isMe}
                        />
                      );
                    }
                  )
                )}
              </ScrollView>

              {/* INPUT */}

              <View style={styles.inputBar}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder={`Say something to ${name}`}
                  placeholderTextColor="#999999"
                  multiline
                  maxLength={5000}
                  editable={!sending}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !input.trim() &&
                      styles.sendDisabled,
                  ]}
                  disabled={
                    !input.trim() ||
                    sending
                  }
                  onPress={
                    handleSend
                  }
                >
                  {sending ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </LinearGradient>

        {/* ================= SAFETY MODAL ================= */}

        <Modal
          visible={showSafety}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowSafety(false)
          }
        >
          <Pressable
            style={styles.overlay}
            onPress={() =>
              setShowSafety(false)
            }
          >
            <Pressable
              style={[
                styles.safetyModal,
                {
                  width:
                    width >= 768
                      ? 420
                      : width - 40,
                },
              ]}
              onPress={(event) =>
                event.stopPropagation()
              }
            >
              {/* MODAL HEADER */}

              <View
                style={
                  styles.modalHeader
                }
              >
                <TouchableOpacity
                  style={
                    styles.modalClose
                  }
                  onPress={() =>
                    setShowSafety(false)
                  }
                >
                  <Text
                    style={
                      styles.modalCloseText
                    }
                  >
                    ×
                  </Text>
                </TouchableOpacity>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Safety Tools
                </Text>

                <View
                  style={
                    styles.headerSpacer
                  }
                />
              </View>

              {/* UNMATCH */}

              <TouchableOpacity
                style={
                  styles.safetyOption
                }
                onPress={unmatch}
              >
                <Ionicons
                  name="heart-dislike-outline"
                  size={17}
                  color="#333333"
                />

                <Text
                  style={
                    styles.safetyText
                  }
                >
                  Unmatch {name}
                </Text>
              </TouchableOpacity>

              {/* BLOCK */}

              <TouchableOpacity
                style={
                  styles.safetyOption
                }
                onPress={block}
              >
                <Ionicons
                  name="ban-outline"
                  size={17}
                  color="#333333"
                />

                <Text
                  style={
                    styles.safetyText
                  }
                >
                  Block {name}
                </Text>
              </TouchableOpacity>

              {/* REPORT */}

              <TouchableOpacity
                style={
                  styles.safetyOption
                }
                onPress={report}
              >
                <Ionicons
                  name="flag-outline"
                  size={17}
                  color="#333333"
                />

                <Text
                  style={
                    styles.safetyText
                  }
                >
                  Report {name}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
 * MESSAGE BUBBLE
 * ========================================================= */

function MessageBubble({
  message,
  isMe,
}: {
  message: ChatMessage;
  isMe: boolean;
}) {
  return (
    <View
      style={[
        styles.messageRow,
        isMe
          ? styles.messageRight
          : styles.messageLeft,
      ]}
    >
      {!isMe && (
        <View style={styles.messageAvatar}>
          <Ionicons
            name="person"
            size={13}
            color="#888888"
          />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isMe
            ? styles.myBubble
            : styles.otherBubble,
        ]}
      >
        <Text style={styles.bubbleText}>
          {message.content}
        </Text>

        <Text style={styles.messageTime}>
          {new Date(
            message.created_at
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
 * STYLES
 * ========================================================= */

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
    height: 58,

    marginTop: 7,

    paddingHorizontal: 8,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,

    zIndex: 5,
  },

  backButton: {
    width: 43,
    height: 32,

    borderRadius: 17,

    backgroundColor: '#FFD080',

    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#FFFFFF',

    fontSize: 27,
    fontWeight: '800',

    marginTop: -3,
  },

  headerUser: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerAvatar: {
    width: 30,
    height: 30,

    borderRadius: 15,

    marginRight: 8,
  },

  headerAvatarPlaceholder: {
    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor: '#EEEEEE',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 8,
  },

  headerName: {
    color: '#FF8A80',

    fontSize: 17,
    fontWeight: '700',
  },

  safetyIcon: {
    width: 43,
    height: 36,

    justifyContent: 'center',
    alignItems: 'center',
  },

  /* CHAT */

  chatArea: {
    flex: 1,

    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,

    overflow: 'hidden',

    position: 'relative',
  },

  messages: {
    flex: 1,
  },

  messageContent: {
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 85,
  },

  startConversation: {
    textAlign: 'center',

    color: 'rgba(255,255,255,0.72)',

    fontSize: 10,

    marginBottom: 12,
  },

  emptyChat: {
    alignItems: 'center',

    paddingTop: 60,
  },

  emptyChatText: {
    color: '#FFFFFF',

    fontSize: 14,
    fontWeight: '600',
  },

  messageRow: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'flex-end',

    marginBottom: 12,
  },

  messageLeft: {
    justifyContent: 'flex-start',
  },

  messageRight: {
    justifyContent: 'flex-end',
  },

  messageAvatar: {
    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 6,
  },

  bubble: {
    maxWidth: '72%',

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 17,
  },

  otherBubble: {
    backgroundColor: '#FFFFFF',

    borderBottomLeftRadius: 5,
  },

  myBubble: {
    backgroundColor: '#FFFDF9',

    borderBottomRightRadius: 5,
  },

  bubbleText: {
    color: '#333333',

    fontSize: 13,

    lineHeight: 19,
  },

  messageTime: {
    color: '#999999',

    fontSize: 8,

    textAlign: 'right',

    marginTop: 2,
  },

  /* INPUT */

  inputBar: {
    position: 'absolute',

    left: 10,
    right: 10,
    bottom: 12,

    minHeight: 43,

    backgroundColor: '#FFFFFF',

    borderRadius: 23,

    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 15,
    paddingRight: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  input: {
    flex: 1,

    minHeight: 38,
    maxHeight: 90,

    paddingVertical: 8,

    fontSize: 11,

    color: '#333333',
  },

  sendButton: {
    width: 35,
    height: 35,

    borderRadius: 18,

    backgroundColor: '#FF7F87',

    justifyContent: 'center',
    alignItems: 'center',
  },

  sendDisabled: {
    opacity: 0.35,
  },

  /* LOADING */

  center: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 9,

    color: '#FFFFFF',

    fontSize: 12,
  },

  retryButton: {
    marginTop: 15,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 22,
    paddingVertical: 9,

    borderRadius: 20,
  },

  retryText: {
    color: '#FF7F87',

    fontWeight: '700',

    fontSize: 12,
  },

  /* MODAL */

  overlay: {
    flex: 1,

    backgroundColor:
      'rgba(0,0,0,0.30)',

    justifyContent: 'flex-end',

    alignItems: 'center',

    paddingBottom: 28,
  },

  safetyModal: {
    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  modalHeader: {
    height: 48,

    flexDirection: 'row',
    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 5,
  },

  modalClose: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: '#FFB56F',

    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCloseText: {
    color: '#FFFFFF',

    fontSize: 27,

    lineHeight: 29,

    fontWeight: '300',
  },

  modalTitle: {
    fontSize: 16,

    fontWeight: '600',

    color: '#222222',
  },

  headerSpacer: {
    width: 34,
  },

  safetyOption: {
    height: 37,

    borderRadius: 13,

    backgroundColor: '#E6E6E6',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,

    marginTop: 8,
  },

  safetyText: {
    marginLeft: 9,

    color: '#222222',

    fontSize: 12,

    fontWeight: '600',
  },
});