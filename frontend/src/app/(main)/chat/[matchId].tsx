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
  Keyboard,
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

import { useLocalSearchParams, useRouter } from 'expo-router';


import { supabase } from '../../../lib/supabase';
import Header from '../../../components/chat/Header';


import {
  getChatList,
  getMessages,
  reportChat,
  sendMessage,
  subscribeToMessages,
  unsubscribeFromChannel,
  markMessagesAsRead,
} from '../../../features/chat/services/chatService';

import type { ChatReportReason, } from '../../../features/chat/services/chatService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatMessage, } from '../../../features/chat/types';

export default function ChatRoom() {
  const params =
    useLocalSearchParams<{
      matchId?: string;
      name?: string;
      image?: string;
    }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

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

  const markCurrentChatAsRead = async () => {
    const result = await markMessagesAsRead(matchId);

    if (result.error) {
      console.error(
        'MARK AS READ ERROR:',
        result.error
      );
    }
  };

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


  const [showSafety, setShowSafety] = useState(false);
  const insets = useSafeAreaInsets();
  const [safetyView, setSafetyView] = useState<
    | 'menu'
    | 'unmatchConfirm'
    | 'blockConfirm'
    | 'reportForm'
    | 'reportBlockPrompt'
    | 'success'
  >('menu');

  const [reportReason, setReportReason] = useState<ChatReportReason | ''>('');
  const [reportDetails, setReportDetails] = useState('');
  const [safetyBusy, setSafetyBusy] = useState(false);
  const [safetySuccessMessage, setSafetySuccessMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const didInitialScroll = useRef(false);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    if (loading || error || messages.length === 0) return;
    if (didInitialScroll.current) return;

    let cancelled = false;

    const scrollAfterLayout = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {

          if (cancelled) return;

          scrollRef.current?.scrollToEnd({
            animated: false,
          });



          // ตรวจอีกครั้งหลัง layout ปรับขนาดเสร็จ
          setTimeout(() => {
            if (cancelled) return;

            scrollRef.current?.scrollToEnd({
              animated: false,
            });

            didInitialScroll.current = true;
            setShowMessages(true);
          }, 250);
        });
      });
    };

    scrollAfterLayout();

    return () => {
      cancelled = true;
    };
  }, [loading, error, messages.length]);



  const scrollRef =
    useRef<React.ElementRef<typeof ScrollView>>(null);

  // Keep the latest message visible when the user is already at the bottom,
  // or has just sent a message. Do not interrupt someone reading older messages.
  useEffect(() => {
    if (loading || error || messages.length === 0) return;
    if (!isNearBottomRef.current && !stickToBottomRef.current) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    });
  }, [messages, loading, error]);

  const pageRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const stickToBottomRef = useRef(false);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  /* ================= KEYBOARD ================= */

  // เมื่อแป้นพิมพ์เปิด ให้ดันข้อความล่าสุดขึ้นมาให้เห็นเสมอ
  // เมื่อแป้นพิมพ์เปิด: ยึดข้อความล่าสุดไว้ แล้วเลื่อนลงสุดแบบมีแอนิเมชัน 1 ครั้ง
  // หน่วงตามเวลาที่แป้นพิมพ์ใช้เปิดจริง เพื่อให้เลื่อนหลัง layout ปรับขนาดแล้ว
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: any) => {
        stickToBottomRef.current = true;

        // เลื่อนหลังแป้นพิมพ์เปิดเสร็จ (layout หดครบแล้ว) เพื่อให้ถึงข้อความสุดท้ายจริงๆ
        const delay =
          Platform.OS === 'ios'
            ? Number(e?.duration ?? 250) + 60
            : 120;

        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, delay);
      }
    );

    return () => {
      if (timer) clearTimeout(timer);
      showSub.remove();
    };
  }, []);

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
    const loadAndMarkRead = async () => {
      await loadInitialMessages();

      if (!matchId) return;

      const result = await markMessagesAsRead(matchId);

      if (result.error) {
        console.error('MARK AS READ ERROR:', result.error);
      }
    };

    void loadAndMarkRead();
  }, [loadInitialMessages, matchId]);
  /* ================= REALTIME ================= */
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`chat:${matchId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
          if (newMsg.sender_id !== currentUserId) {
            void markMessagesAsRead(matchId).then((result) => {
              if (result.error) {
                console.error('MARK AS READ ERROR:', result.error);
              }

            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

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
    const content = input.trim();

    if (!content || sending || !matchId) {
      return;
    }

    if (content.length > 5000) {
      Alert.alert('Message too long', 'Message cannot exceed 5000 characters.');
      return;
    }


    setSending(true);
    stickToBottomRef.current = true;


    const result = await sendMessage(matchId, content);

    if (result.error) {
      Alert.alert('Unable to send message', result.error.message);
      setSending(false);
      return;
    }
    setInput('');
    setSending(false);

    inputRef.current?.focus();

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /* ================= SCROLL ================= */

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const y = contentOffset.y;

    isNearBottomRef.current =
      contentSize.height - (y + layoutMeasurement.height) < 80;

    if (y <= 30 && !loadingOlder && hasMore) {
      void loadOlderMessages();
    }
  };


  /* ================= SAFETY ================= */

  const closeSafety = () => {
    if (safetyBusy) return;

    if (safetyView === 'success') {
      router.dismissTo('/chat'); // ถอยกลับไปหน้า Chat List ที่อยู่ใน Stack แล้ว ทิ้งทุกหน้าที่ซ้อนอยู่ด้านบน
      return;
    }

    setShowSafety(false);
    setSafetyView('menu');
    setReportReason('');
    setReportDetails('');
  };

  const openSafety = () => {
    setSafetyView('menu');
    setShowSafety(true);
  };

  const getOtherUserId = async (): Promise<string> => {
    if (!matchId) throw new Error('ไม่พบ Match ID');

    const result = await getChatList();

    if (result.error) throw result.error;

    const chat = result.data?.find(
      item => item.match_id === matchId
    );

    if (!chat?.other_user_id) {
      throw new Error('ไม่พบข้อมูลผู้ใช้ที่ต้องการดำเนินการ');
    }

    return chat.other_user_id;
  };
  const openProfile = async () => {
    try {
      const userId = await getOtherUserId();
      router.push({
        pathname: '/user/[userId]',
        params: {
          userId,
          source: 'chat',
        },
      } as any);
    } catch (error) {
      Alert.alert(
        'Unable to open profile',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const unmatch = () => {
    setSafetyView('unmatchConfirm');
  };

  const block = () => {
    setSafetyView('blockConfirm');
  };

  const report = () => {
    setReportReason('');
    setReportDetails('');
    setSafetyView('reportForm');
  };

  const confirmUnmatch = async () => {
    if (!matchId || safetyBusy) return;

    setSafetyBusy(true);

    try {
      const { error } = await supabase.rpc('unmatch_match', {
        p_match_id: matchId,
      });

      if (error) throw error;

      setSafetySuccessMessage(`Unmatched ${name} successfully.`);
      setSafetyView('success');
    } catch (error) {
      Alert.alert(
        'Unmatch failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSafetyBusy(false);
    }
  };

  const confirmBlock = async () => {
    if (safetyBusy) {
      return;
    }

    setSafetyBusy(true);

    try {
      const targetId =
        await getOtherUserId();

      const {
        error,
      } =
        await supabase.rpc(
          'block_user',
          {
            p_blocked_id:
              targetId,
          }
        );

      if (error) {
        throw error;
      }

      /*
       * Block succeeded.
       *
       * Do not leave the blocked
       * conversation visible.
       */
      setMessages([]);

      setShowSafety(false);
      setSafetyView('menu');

      setReportReason('');
      setReportDetails('');

      router.replace('/chat');
    } catch (error) {
      console.error(
        '[confirmBlock] failed:',
        error
      );

      Alert.alert(
        'Block failed',
        error instanceof Error
          ? error.message
          : 'Please try again.'
      );
    } finally {
      setSafetyBusy(false);
    }
  };

  const submitReport = async () => {
    if (!reportReason || safetyBusy) {
      Alert.alert(
        'Select a reason',
        'Please choose a report reason.'
      );

      return;
    }

    if (!matchId) {
      Alert.alert(
        'Report failed',
        'Invalid chat.'
      );

      return;
    }

    setSafetyBusy(true);

    try {
      const result =
        await reportChat(
          matchId,
          reportReason,
          reportDetails
        );

      if (result.error) {
        throw result.error;
      }

      if (
        result.data?.emailSent === false
      ) {
        console.error(
          '[submitReport] report saved but email notification failed:',
          result.data.emailError
        );
      }

      setSafetyView(
        'reportBlockPrompt'
      );
    } catch (error) {
      console.error(
        '[submitReport] failed:',
        error
      );

      Alert.alert(
        'Report failed',
        error instanceof Error
          ? error.message
          : 'Please try again.'
      );
    } finally {
      setSafetyBusy(false);
    }
  };
  const scrollToLatest = (animated = false) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  };


  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>



      {/* ================= HEADER ================= */}
      <Header
        variant="chat"
        title={name}
        onReportPress={openSafety}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >

        {/* ================= CHAT ================= */}

        <View style={[styles.chatArea, { width: pageWidth }]}>
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
                size={45}
                color="#FF7F87"
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
              <ScrollView
                ref={scrollRef}
                style={[
                  styles.messages,
                  { opacity: messages.length === 0 || showMessages ? 1 : 0 },
                ]}
                contentContainerStyle={styles.messageContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={200}
                onScrollBeginDrag={() => {
                  stickToBottomRef.current = false;
                }}
                onLayout={() => {
                  // พื้นที่แชทหดลงตอนแป้นพิมพ์เปิด -> ดันข้อความล่าสุดขึ้นมาให้เห็น
                  if (isNearBottomRef.current || stickToBottomRef.current) {
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }
                }}
                onContentSizeChange={() => {
                  if (isNearBottomRef.current || stickToBottomRef.current) {
                    scrollRef.current?.scrollToEnd({ animated: false });
                  }
                }}
              >
                {loadingOlder && (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    style={{ marginBottom: 12 }}
                  />
                )}

                {!hasMore && messages.length > 0 && (
                  <Text style={styles.startConversation}>
                    Start of conversation
                  </Text>
                )}

                {messages.length === 0 ? (
                  <View style={styles.emptyChatText}>
                    <Text style={styles.emptyChatText}>
                      Say hi to {name} 👋
                    </Text>
                  </View>
                ) : (
                  messages.map((message, index) => {
                    const isMe =
                      currentUserId !== null &&
                      message.sender_id === currentUserId;

                    const next = messages[index + 1];
                    const showAvatar = !next || next.sender_id !== message.sender_id;

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isMe={isMe}
                        showAvatar={showAvatar}
                        avatarUri={image}
                        onAvatarPress={openProfile}
                      />
                    );
                  })
                )}
              </ScrollView>
          )}

          {/* INPUT (แสดงตลอด ไม่ซ่อนตอนโหลด) */}

              <View style={styles.inputBar}>
                <TextInput
                  ref={inputRef}
                  value={input}
                  onChangeText={setInput}
                  placeholder={`Say something to ${name}`}
                  placeholderTextColor="#999999"
                  multiline
                  maxLength={5000}
                  style={[
                    styles.input,
                    Platform.OS === 'web' && ({
                      outline: 'none',
                    } as any),
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!input.trim() || loading || !!error) && styles.sendDisabled,
                  ]}
                  disabled={!input.trim() || sending || loading || !!error}
                  onPress={handleSend}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
        </View>

        {/* ================= SAFETY MODAL ================= */}

        <Modal
          visible={showSafety}
          transparent
          animationType="fade"
          onRequestClose={closeSafety}
        >
          <Pressable
            style={styles.overlay}
            onPress={closeSafety}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
              style={{
                flex: 1,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: Platform.OS === 'ios' ? 28 : 8,
              }}
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
                onPress={(event) => { event.stopPropagation(); }}
              >
                {/* MODAL HEADER */}


                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={
                      safetyView === 'menu' || safetyView === 'success' || safetyView === 'reportBlockPrompt'
                        ? closeSafety
                        : () => setSafetyView('menu')
                    }
                    disabled={safetyBusy}
                  >
                    <Text style={styles.modalCloseText}>
                      {safetyView === 'menu' || safetyView === 'success' || safetyView === 'reportBlockPrompt' ? '×' : '‹'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.modalTitle}>
                    {safetyView === 'menu' && 'Safety Tools'}
                    {safetyView === 'unmatchConfirm' && 'Unmatch'}
                    {safetyView === 'blockConfirm' && 'Block User'}
                    {safetyView === 'reportForm' && 'Report User'}
                    {safetyView === 'reportBlockPrompt' && 'Report Submitted'}
                    {safetyView === 'success' && 'Success'}
                  </Text>

                  <View style={styles.headerSpacer} />
                </View>

                {safetyView === 'menu' && (
                  <>
                    <TouchableOpacity style={styles.safetyOption} onPress={unmatch}>
                      <Ionicons name="heart-dislike-outline" size={17} color="#333333" />
                      <Text style={styles.safetyText}>Unmatch {name}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.safetyOption} onPress={block}>
                      <Ionicons name="ban-outline" size={17} color="#333333" />
                      <Text style={styles.safetyText}>Block {name}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.safetyOption} onPress={report}>
                      <Ionicons name="flag-outline" size={17} color="#333333" />
                      <Text style={styles.safetyText}>Report {name}</Text>
                    </TouchableOpacity>
                  </>
                )}

                {(safetyView === 'unmatchConfirm' || safetyView === 'blockConfirm') && (
                  <>
                    <Text style={styles.safetyBody}>
                      {safetyView === 'unmatchConfirm'
                        ? `Are you sure you want to unmatch ${name}?`
                        : `Are you sure you want to block ${name}?`}
                    </Text>

                    <View style={styles.safetyActions}>
                      <TouchableOpacity
                        style={styles.safetyCancel}
                        onPress={() => setSafetyView('menu')}
                        disabled={safetyBusy}
                      >
                        <Text style={styles.safetyCancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.safetyConfirm}
                        onPress={safetyView === 'unmatchConfirm' ? confirmUnmatch : confirmBlock}
                        disabled={safetyBusy}
                      >
                        <Text style={styles.safetyConfirmText}>
                          {safetyBusy ? 'Please wait...' : 'Confirm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {safetyView === 'reportForm' && (
                  <>
                    <Text style={styles.safetyBody}>Why are you reporting {name}?</Text>

                    {([
                      {
                        label:
                          'Harassment or unwanted contact',
                        value:
                          'harassment',
                      },
                      {
                        label:
                          'Violence, hate, or exploitation',
                        value:
                          'violence_or_hate',
                      },
                      {
                        label:
                          'Self-harm or risky behavior',
                        value:
                          'self_harm',
                      },
                      {
                        label:
                          'Sexual content',
                        value:
                          'sexual_content',
                      },
                      {
                        label:
                          'Fraud or scam',
                        value:
                          'scam',
                      },
                      {
                        label:
                          'Impersonation',
                        value:
                          'impersonation',
                      },
                      {
                        label:
                          'False information or spam',
                        value:
                          'spam_or_false_information',
                      },
                      {
                        label:
                          'Prohibited sales or promotion',
                        value:
                          'illegal_goods',
                      },
                      {
                        label:
                          'Intellectual property',
                        value:
                          'intellectual_property',
                      },
                      {
                        label:
                          'Other',
                        value:
                          'other',
                      },
                    ] as const).map((reason) => (
                      <TouchableOpacity
                        key={reason.value}
                        style={[
                          styles.reportReason,
                          reportReason === reason.value && {
                            backgroundColor: '#FFF0E3',
                            borderWidth: 1,
                            borderColor: '#E88A43',
                          },
                        ]}
                        onPress={() => setReportReason(reason.value)}
                      >
                        <Ionicons
                          name={reportReason === reason.value ? 'radio-button-on' : 'radio-button-off'}
                          size={17}
                          color={reportReason === reason.value ? '#E88A43' : '#666666'}
                        />
                        <Text style={styles.safetyText}>{reason.label}</Text>
                      </TouchableOpacity>
                    ))}

                    <TextInput
                      style={styles.reportDetails}
                      placeholder="Additional details (optional)"
                      placeholderTextColor="#888888"
                      multiline
                      maxLength={1000}
                      value={reportDetails}
                      onChangeText={setReportDetails}
                      textAlignVertical="top"
                    />

                    <View style={styles.safetyActions}>
                      <TouchableOpacity
                        style={styles.safetyCancel}
                        onPress={() => setSafetyView('menu')}
                        disabled={safetyBusy}
                      >
                        <Text style={styles.safetyCancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.safetyConfirm}
                        onPress={submitReport}
                        disabled={safetyBusy}
                      >
                        <Text style={styles.safetyConfirmText}>
                          {safetyBusy ? 'Submitting...' : 'Submit Report'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {safetyView === 'reportBlockPrompt' && (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={42}
                      color="#E88A43"
                      style={{
                        alignSelf: 'center',
                        marginVertical: 12,
                      }}
                    />

                    <Text style={styles.safetyBody}>
                      Your report has been submitted.
                      {'\n\n'}
                      Would you also like to block {name}?
                    </Text>

                    <View style={styles.safetyActions}>
                      <TouchableOpacity
                        style={styles.safetyCancel}
                        onPress={closeSafety}
                        disabled={safetyBusy}
                      >
                        <Text style={styles.safetyCancelText}>
                          Not now
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.safetyConfirm}
                        onPress={confirmBlock}
                        disabled={safetyBusy}
                      >
                        <Text style={styles.safetyConfirmText}>
                          {safetyBusy
                            ? 'Blocking...'
                            : `Block ${name}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {safetyView === 'success' && (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={42}
                      color="#E88A43"
                      style={{ alignSelf: 'center', marginVertical: 12 }}
                    />

                    <Text style={styles.safetyBody}>{safetySuccessMessage}</Text>

                    <TouchableOpacity
                      style={styles.safetyConfirm}
                      onPress={() => {
                        closeSafety();
                      }}
                    >
                      <Text style={styles.safetyConfirmText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}

              </Pressable>
            </KeyboardAvoidingView>
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
  showAvatar,
  avatarUri,
  onAvatarPress,
}: {
  message: ChatMessage;
  isMe: boolean;
  showAvatar: boolean;
  avatarUri?: string;
  onAvatarPress?: () => void;
}) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={[
        styles.messageRow,
        isMe ? styles.messageRight : styles.messageLeft,
      ]}
    >

      {!isMe && showAvatar ? (
        <TouchableOpacity
          style={styles.messageAvatar}
          activeOpacity={0.7}
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.messageAvatarImg} />
          ) : (
            <Ionicons name="person" size={13} color="#888888" />
          )}
        </TouchableOpacity>
      ) : !isMe ? (
        <View style={styles.messageAvatarPlaceholder} />
      ) : null}
      {isMe ? (
        <LinearGradient
          colors={['#FFB078', '#FF7D88']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.myBubble]}
        >
          <Text style={[styles.myBubbleText, styles.myBubbleText]}>
            {message.content}
          </Text>
          <Text style={[styles.messageTime, styles.myMessageTime]}>
            {time}
          </Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.otherBubble]}>
          <Text style={styles.otherBubbleText}>{message.content}</Text>
          <Text style={styles.messageTime}>{time}</Text>
        </View>
      )}
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
    width: '100%',
    minHeight: 0,
  },


  /* CHAT */
  chatArea: {
    flex: 1,
    minHeight: 0,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: '#f3f3f3',
  },

  messages: {
    flex: 1,
    minHeight: 0,
  },

  messageContent: {
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 18,
  },

  startConversation: {
    textAlign: 'center',
    color: '#B9A59A',
    fontSize: 10,
    marginBottom: 12,
  },

  emptyChatText: {
    color: '#FF7F87',
    fontSize: 14,
    fontWeight: '600',
    alignItems: 'center',
    paddingTop: 60,
  },

  loadingText: {
    marginTop: 9,
    color: '#FF7F87',
    fontSize: 12,
  },

  retryButton: {
    marginTop: 15,
    backgroundColor: '#FF7F87',
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 20,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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

    backgroundColor: '#ffffff',

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
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  otherBubbleText: {
    color: '#2a2929',
    fontSize: 16,
  },

  myBubble: {
    borderBottomRightRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  myBubbleText: {
    fontSize: 16,
    color: '#FFFFFF',
  },

  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },

  messageTime: {
    color: '#999999',

    fontSize: 8,

    textAlign: 'right',

    marginTop: 2,
  },

  /* INPUT */

  inputBar: {
    position: 'relative',
    left: undefined,
    right: undefined,
    bottom: undefined,
    marginHorizontal: 10,
    marginBottom: 12,
    minHeight: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  input: {
    flex: 1,

    minHeight: 38,
    maxHeight: 90,

    paddingVertical: 8,

    fontSize: 16,

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

    borderRadius: 30,

    paddingHorizontal: 15,
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
    minHeight: 46,

    borderRadius: 20,

    backgroundColor: '#E6E6E6',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,

    marginTop: 8,
  },

  safetyText: {
    marginLeft: 9,

    color: '#222222',

    fontSize: 13,

    fontWeight: '600',
  },

  safetyBody: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  safetyActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  safetyCancel: {
    flex: 1,
    height: 46,
    borderRadius: 17,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  safetyCancelText: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '600',
  },
  safetyConfirm: {
    flex: 1,
    height: 46,
    borderRadius: 17,
    backgroundColor: '#E88A43',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  safetyConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  reportReason: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#F3F3F3',
  },
  reportReasonSelected: {
    backgroundColor: '#FFF0E3',
    borderWidth: 1,
    borderColor: '#E88A43',
  },
  reportDetails: {
    minHeight: 75,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    padding: 10,
    marginTop: 10,
    color: '#222222',
    fontSize: 13,
  },

  messageAvatarPlaceholder: {
    width: 33,
    height: 1,
  },

  messageAvatarImg: {
    width: 27,
    height: 27,
    borderRadius: 14,
  },

});
