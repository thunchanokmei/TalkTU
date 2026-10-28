import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import * as ImagePicker
  from 'expo-image-picker';

import {
  router,
} from 'expo-router';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  supabase,
} from '@/lib/supabase';


import {
  createComment,
  createReply,
  createPost,
  deletePost,
  getFeedPosts,
  getPostComments,
  getPostImageUrl,
  togglePostLike,
} from '../../features/feed/services/feedService';


import type {
  FeedComment,
  FeedPost,
} from '../../features/feed/types';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SIZE = 20;

const MAX_POST_IMAGES = 4;

const webNoOutline =
  Platform.OS === 'web'
    ? ({
      outlineStyle:
        'none',
      outlineWidth:
        0,
    } as any)
    : undefined;


type FeedTab =
  | 'feed'
  | 'mine';


type SelectedFeedImage = {
  uri: string;

  width?: number;

  height?: number;
};


type ReportReason = {
  value: string;

  label: string;

  icon:
  keyof typeof Ionicons.glyphMap;
};


const REPORT_REASONS:
  ReportReason[] = [
    {
      value:
        'harassment',

      label:
        'การกลั่นแกล้งหรือการติดต่อที่ไม่พึงประสงค์',

      icon:
        'person-remove-outline',
    },

    {
      value:
        'violence_or_hate',

      label:
        'ความรุนแรง ความเกลียดชัง หรือการแสวงหาประโยชน์',

      icon:
        'warning-outline',
    },

    {
      value:
        'self_harm',

      label:
        'การทำร้ายตนเองหรือพฤติกรรมเสี่ยง',

      icon:
        'heart-dislike-outline',
    },

    {
      value:
        'sexual_content',

      label:
        'เนื้อหาทางเพศที่ไม่เหมาะสม',

      icon:
        'eye-off-outline',
    },

    {
      value:
        'scam',

      label:
        'การหลอกลวง ฉ้อโกง หรือ Scam',

      icon:
        'card-outline',
    },

    {
      value:
        'impersonation',

      label:
        'การปลอมเป็นบุคคลอื่น',

      icon:
        'people-outline',
    },

    {
      value:
        'spam_or_false_information',

      label:
        'Spam หรือข้อมูลที่ทำให้เข้าใจผิด',

      icon:
        'megaphone-outline',
    },

    {
      value:
        'illegal_goods',

      label:
        'การขายหรือโปรโมตสิ่งของที่ผิดกฎ',

      icon:
        'bag-remove-outline',
    },

    {
      value:
        'intellectual_property',

      label:
        'ทรัพย์สินทางปัญญา',

      icon:
        'document-text-outline',
    },

    {
      value:
        'other',

      label:
        'อื่น ๆ',

      icon:
        'ellipsis-horizontal-circle-outline',
    },
  ];

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function FeedScreen() {
  const {
    width,
  } =
    useWindowDimensions();


  /* =======================================================
     FEED STATE
  ======================================================= */

  const [
    posts,
    setPosts,
  ] =
    useState<FeedPost[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    loadingMore,
    setLoadingMore,
  ] =
    useState(false);

  const [
    hasMore,
    setHasMore,
  ] =
    useState(true);

  const [
    activeFeedTab,
    setActiveFeedTab,
  ] =
    useState<FeedTab>(
      'feed'
    );


  /* =======================================================
     CREATE POST STATE
  ======================================================= */

  const [
    createVisible,
    setCreateVisible,
  ] =
    useState(false);

  const [
    newPostText,
    setNewPostText,
  ] =
    useState('');

  const [
    newPostImages,
    setNewPostImages,
  ] =
    useState<
      SelectedFeedImage[]
    >([]);

  const [
    creating,
    setCreating,
  ] =
    useState(false);


  /* =======================================================
     POST DETAIL / COMMENT STATE
  ======================================================= */

  const [
    detailVisible,
    setDetailVisible,
  ] =
    useState(false);

  const [
    selectedPost,
    setSelectedPost,
  ] =
    useState<
      FeedPost | null
    >(null);

  const [
    comments,
    setComments,
  ] =
    useState<
      FeedComment[]
    >([]);

  const [
    commentsLoading,
    setCommentsLoading,
  ] =
    useState(false);

  const [
    commentText,
    setCommentText,
  ] =
    useState('');

  const [
    replyingTo,
    setReplyingTo,
  ] = useState<FeedComment | null>(null);


  const [
    commentSending,
    setCommentSending,
  ] =
    useState(false);


  /* =======================================================
     EDIT STATE
  ======================================================= */

  const [
    editVisible,
    setEditVisible,
  ] =
    useState(false);

  const [
    editingPost,
    setEditingPost,
  ] =
    useState<
      FeedPost | null
    >(null);

  const [
    editText,
    setEditText,
  ] =
    useState('');

  const [
    editSaving,
    setEditSaving,
  ] =
    useState(false);


  /* =======================================================
     REPORT STATE
  ======================================================= */

  const [
    reportVisible,
    setReportVisible,
  ] =
    useState(false);

  const [
    reportTarget,
    setReportTarget,
  ] =
    useState<
      FeedPost | null
    >(null);

  const [
    selectedReportReason,
    setSelectedReportReason,
  ] =
    useState<
      string | null
    >(null);

  const [
    reportDetails,
    setReportDetails,
  ] =
    useState('');

  const [
    reportSending,
    setReportSending,
  ] =
    useState(false);

  const [reportView, setReportView] = useState<'form' | 'submitting' | 'success'>('form');

  /* =======================================================
     POST OPTIONS STATE
  ======================================================= */

  const [
    optionsVisible,
    setOptionsVisible,
  ] =
    useState(false);

  const [
    optionsPost,
    setOptionsPost,
  ] =
    useState<FeedPost | null>(
      null
    );

  const [
    deleteConfirmVisible,
    setDeleteConfirmVisible,
  ] =
    useState(false);

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<FeedPost | null>(
      null
    );

  const [
    deleteLoading,
    setDeleteLoading,
  ] =
    useState(false);


  /* =======================================================
     RESPONSIVE SIZE
  ======================================================= */

  const isTablet =
    width >= 768;

  const pageWidth =
    isTablet
      ? Math.min(
        width - 80,
        620
      )
      : width - 24;


  const visiblePosts =
    activeFeedTab ===
      'mine'
      ? posts.filter(
        (post) =>
          post.is_mine
      )
      : posts;


  /* ======================================================
     LOAD FEED
  ====================================================== */

  const loadFeed =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          const data =
            await getFeedPosts(
              PAGE_SIZE,
              0
            );

          setPosts(
            data
          );

          setHasMore(
            data.length ===
            PAGE_SIZE
          );
        } catch (error) {
          console.error(
            'Load feed error:',
            error
          );

          Alert.alert(
            'Error',
            'Unable to load feed.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);


  const refreshFeed =
    async () => {
      try {
        setRefreshing(
          true
        );

        const data =
          await getFeedPosts(
            PAGE_SIZE,
            0
          );

        setPosts(
          data
        );

        setHasMore(
          data.length ===
          PAGE_SIZE
        );
      } catch (error) {
        console.error(
          'Refresh feed error:',
          error
        );
      } finally {
        setRefreshing(
          false
        );
      }
    };


  const loadMore =
    async () => {
      if (
        loading ||
        loadingMore ||
        !hasMore
      ) {
        return;
      }

      try {
        setLoadingMore(
          true
        );

        const more =
          await getFeedPosts(
            PAGE_SIZE,
            posts.length
          );

        setPosts(
          (current) => [
            ...current,
            ...more,
          ]
        );

        if (
          more.length <
          PAGE_SIZE
        ) {
          setHasMore(
            false
          );
        }
      } catch (error) {
        console.error(
          'Load more feed error:',
          error
        );
      } finally {
        setLoadingMore(
          false
        );
      }
    };


  /* ======================================================
     CREATE POST
  ====================================================== */

  const openCreatePost =
    () => {
      setCreateVisible(
        true
      );
    };


  const closeCreatePost =
    () => {
      if (creating) {
        return;
      }

      setCreateVisible(
        false
      );
    };


  const pickPostImages =
    async () => {
      try {
        const remaining =
          MAX_POST_IMAGES -
          newPostImages.length;

        if (
          remaining <= 0
        ) {
          Alert.alert(
            'Photos',
            'เพิ่มรูปได้สูงสุด 4 รูป'
          );

          return;
        }


        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();


        if (
          !permission.granted
        ) {
          Alert.alert(
            'Permission required',
            'Please allow access to your photos.'
          );

          return;
        }


        const result =
          await ImagePicker
            .launchImageLibraryAsync({
              mediaTypes: [
                'images',
              ],

              allowsMultipleSelection:
                true,

              selectionLimit:
                remaining,

              quality:
                1,
            });


        if (
          result.canceled
        ) {
          return;
        }


        const selected =
          result.assets.map(
            (asset) => ({
              uri:
                asset.uri,

              width:
                asset.width,

              height:
                asset.height,
            })
          );


        setNewPostImages(
          (current) => [
            ...current,
            ...selected,
          ].slice(
            0,
            MAX_POST_IMAGES
          )
        );
      } catch (error) {
        console.error(
          'Pick feed images error:',
          error
        );

        Alert.alert(
          'Error',
          'Unable to select photos.'
        );
      }
    };


  const removeSelectedImage =
    (
      index: number
    ) => {
      setNewPostImages(
        (current) =>
          current.filter(
            (
              _,
              currentIndex
            ) =>
              currentIndex !==
              index
          )
      );
    };


  const submitPost =
    async () => {
      if (
        !newPostText.trim()
      ) {
        Alert.alert(
          'Post',
          'กรุณาพิมพ์ข้อความก่อนโพสต์'
        );

        return;
      }


      if (
        newPostImages.length >
        MAX_POST_IMAGES
      ) {
        Alert.alert(
          'Photos',
          'เพิ่มรูปได้สูงสุด 4 รูป'
        );

        return;
      }


      try {
        setCreating(
          true
        );


        await createPost(
          newPostText,
          newPostImages
        );

        setNewPostText('');
        setNewPostImages([]);

        setCreateVisible(false);

        await refreshFeed();

      } catch (error) {
        console.error(
          'Create post error:',
          error
        );

        Alert.alert(
          'Error',
          error instanceof Error
            ? error.message
            : 'Unable to create post.'
        );
      } finally {
        setCreating(
          false
        );
      }
    };


  /* ======================================================
     LIKE
  ====================================================== */

  const handleLike =
    async (
      post: FeedPost
    ) => {
      const optimisticUpdate =
        (
          item: FeedPost
        ): FeedPost => ({
          ...item,

          liked_by_me:
            !item.liked_by_me,

          like_count:
            Math.max(
              0,
              item.like_count +
              (
                item.liked_by_me
                  ? -1
                  : 1
              )
            ),
        });


      setPosts(
        (current) =>
          current.map(
            (item) =>
              item.post_id ===
                post.post_id
                ? optimisticUpdate(
                  item
                )
                : item
          )
      );


      setSelectedPost(
        (current) =>
          current &&
            current.post_id ===
            post.post_id
            ? optimisticUpdate(
              current
            )
            : current
      );


      try {
        const result =
          await togglePostLike(
            post.post_id
          );


        const applyResult =
          (
            item:
              FeedPost
          ): FeedPost => ({
            ...item,

            liked_by_me:
              result.liked,

            like_count:
              Number(
                result.like_count
              ),
          });


        setPosts(
          (current) =>
            current.map(
              (item) =>
                item.post_id ===
                  post.post_id
                  ? applyResult(
                    item
                  )
                  : item
            )
        );


        setSelectedPost(
          (current) =>
            current &&
              current.post_id ===
              post.post_id
              ? applyResult(
                current
              )
              : current
        );
      } catch (error) {
        console.error(
          'Like error:',
          error
        );

        await refreshFeed();
      }
    };


  /* ======================================================
     POST DETAIL + COMMENTS
  ====================================================== */

  const openPostDetail =
    async (
      post: FeedPost
    ) => {
      setSelectedPost(
        post
      );

      setDetailVisible(
        true
      );

      setCommentText(
        ''
      );

      setComments(
        []
      );
      setReplyingTo(null);


      try {
        setCommentsLoading(
          true
        );

        const data =
          await getPostComments(
            post.post_id
          );

        setComments(
          data
        );
      } catch (error) {
        console.error(
          'Load comments error:',
          error
        );

        Alert.alert(
          'Error',
          'Unable to load comments.'
        );
      } finally {
        setCommentsLoading(
          false
        );
      }
    };


  const closePostDetail =
    () => {
      setDetailVisible(
        false
      );

      setSelectedPost(
        null
      );

      setComments(
        []
      );

      setCommentText(
        ''
      );
      setReplyingTo(null);
    };


  const sendComment = async () => {
    if (!selectedPost || !commentText.trim()) {
      return;
    }

    try {
      setCommentSending(true);

      if (replyingTo) {
        await createReply(
          selectedPost.post_id,
          replyingTo.comment_id,
          commentText
        );
      } else {
        await createComment(
          selectedPost.post_id,
          commentText
        );
      }

      setCommentText('');
      setReplyingTo(null);

      const data = await getPostComments(
        selectedPost.post_id
      );

      setComments(data);

      // Count top-level comments only.
      const topLevelCount = data.filter(
        (comment) => !comment.parent_comment_id
      ).length;

      const updateCount = (
        post: FeedPost
      ): FeedPost => ({
        ...post,
        comment_count: topLevelCount,
      });

      setPosts((current) =>
        current.map((post) =>
          post.post_id === selectedPost.post_id
            ? updateCount(post)
            : post
        )
      );

      setSelectedPost((current) =>
        current &&
          current.post_id === selectedPost.post_id
          ? updateCount(current)
          : current
      );
    } catch (error) {
      console.error('Send comment/reply error:', error);

      Alert.alert(
        'Error',
        replyingTo
          ? 'Unable to send reply.'
          : 'Unable to send comment.'
      );
    } finally {
      setCommentSending(false);
    }
  };



  /* ======================================================
     POST OPTIONS
  ====================================================== */

  const openPostOptions =
    (
      post: FeedPost
    ) => {
      setOptionsPost(
        post
      );

      setOptionsVisible(
        true
      );
    };


  const closePostOptions =
    () => {
      setOptionsVisible(
        false
      );

      setOptionsPost(
        null
      );
    };


  const handleEditOption =
    () => {
      const post =
        optionsPost;

      closePostOptions();

      if (!post) {
        return;
      }

      setEditingPost(
        post
      );

      setEditText(
        post.content
      );

      setEditVisible(
        true
      );
    };


  const handleReportOption =
    () => {
      const post =
        optionsPost;

      closePostOptions();

      if (!post) {
        return;
      }

      setReportTarget(
        post
      );

      setSelectedReportReason(
        null
      );

      setReportDetails(
        ''
      );

      setReportView(
        'form'
      );

      setReportVisible(
        true
      );
    };

  const closeReportModal =
    () => {
      if (
        reportSending ||
        reportView ===
        'submitting'
      ) {
        return;
      }

      setReportVisible(
        false
      );

      setReportTarget(
        null
      );

      setSelectedReportReason(
        null
      );

      setReportDetails(
        ''
      );

      setReportView(
        'form'
      );
    };

  const handleDeleteOption =
    () => {
      const post =
        optionsPost;

      closePostOptions();

      if (!post) {
        return;
      }

      setDeleteTarget(
        post
      );

      setDeleteConfirmVisible(
        true
      );
    };


  /* ======================================================
     EDIT POST
  ====================================================== */

  const saveEditPost =
    async () => {
      if (
        !editingPost
      ) {
        return;
      }


      const cleanText =
        editText.trim();


      if (
        !cleanText
      ) {
        Alert.alert(
          'Edit post',
          'ข้อความโพสต์ต้องไม่ว่าง'
        );

        return;
      }


      try {
        setEditSaving(
          true
        );


        const {
          error,
        } =
          await supabase
            .from(
              'posts'
            )
            .update({
              content:
                cleanText,
            })
            .eq(
              'id',
              editingPost.post_id
            );


        if (error) {
          throw error;
        }


        const updatePost =
          (
            post:
              FeedPost
          ): FeedPost => ({
            ...post,

            content:
              cleanText,
          });


        setPosts(
          (current) =>
            current.map(
              (post) =>
                post.post_id ===
                  editingPost.post_id
                  ? updatePost(
                    post
                  )
                  : post
            )
        );


        setSelectedPost(
          (current) =>
            current &&
              current.post_id ===
              editingPost.post_id
              ? updatePost(
                current
              )
              : current
        );


        setEditVisible(
          false
        );

        setEditingPost(
          null
        );

        setEditText(
          ''
        );
      } catch (error) {
        console.error(
          'Edit post error:',
          error
        );

        Alert.alert(
          'Error',
          'Unable to edit this post.'
        );
      } finally {
        setEditSaving(
          false
        );
      }
    };


  /* ======================================================
     DELETE POST
  ====================================================== */

  const confirmDeletePost =
    async () => {
      if (
        !deleteTarget
      ) {
        return;
      }

      const postId =
        deleteTarget.post_id;

      try {
        setDeleteLoading(
          true
        );

        await deletePost(
          postId
        );

        setPosts(
          (current) =>
            current.filter(
              (item) =>
                item.post_id !==
                postId
            )
        );

        if (
          selectedPost?.post_id ===
          postId
        ) {
          closePostDetail();
        }

        setDeleteConfirmVisible(
          false
        );

        setDeleteTarget(
          null
        );

        Alert.alert(
          'ลบโพสต์แล้ว',
          'โพสต์ของคุณถูกลบเรียบร้อยแล้ว'
        );
      } catch (error) {
        console.error(
          'Delete post error:',
          error
        );

        Alert.alert(
          'Error',
          error instanceof Error
            ? error.message
            : 'Unable to delete this post.'
        );
      } finally {
        setDeleteLoading(
          false
        );
      }
    };


  /* ======================================================
     REPORT POST
  ====================================================== */

  const submitReport =
    async () => {
      if (
        !reportTarget
      ) {
        return;
      }

      if (
        !selectedReportReason
      ) {
        Alert.alert(
          'Report',
          'กรุณาเลือกเหตุผลในการรายงาน'
        );

        return;
      }

      try {
        setReportSending(
          true
        );

        setReportView(
          'submitting'
        );

        const {
          data,
          error,
        } =
          await supabase
            .functions
            .invoke(
              'submit-report',
              {
                body: {
                  postId:
                    reportTarget.post_id,

                  reason:
                    selectedReportReason,

                  details:
                    reportDetails
                      .trim(),
                },
              }
            );

        if (error) {
          throw error;
        }

        if (!data?.ok) {
          throw new Error(
            data?.error ??
            'Unable to report this post.'
          );
        }

        if (
          data.emailSent ===
          false
        ) {
          console.warn(
            'Report saved but email was not sent:',
            data.emailError
          );
        }

        setReportView(
          'success'
        );
      } catch (error) {
        console.error(
          'Report post error:',
          error
        );

        setReportView(
          'form'
        );

        Alert.alert(
          'Report failed',
          error instanceof Error
            ? error.message
            : 'Unable to report this post.'
        );
      } finally {
        setReportSending(
          false
        );
      }
    };

  const detailPost =
    selectedPost;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={
        styles.safeArea
      }
    >
      <View
        style={
          styles.container
        }
      >

        {/* =================================================
            LOGO HEADER
        ================================================= */}

        <View
          style={[
            styles.header,
            {
              width:
                pageWidth,
            },
          ]}
        >
          <Image
            source={require(
              '../../../assets/images/talktu-logo2.png'
            )}
            style={
              styles.headerLogo
            }
            resizeMode="contain"
          />
        </View>


        {/* =================================================
            FEED / MY POST TABS
        ================================================= */}

        <View
          style={[
            styles.feedTabs,
            {
              width:
                pageWidth,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={
              0.8
            }
            style={[
              styles.feedTab,

              activeFeedTab ===
              'feed' &&
              styles.feedTabActive,
            ]}
            onPress={() =>
              setActiveFeedTab(
                'feed'
              )
            }
          >
            <Text
              style={[
                styles.feedTabText,

                activeFeedTab ===
                'feed' &&
                styles.feedTabTextActive,
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>


          <View
            style={
              styles.feedTabDivider
            }
          />


          <TouchableOpacity
            activeOpacity={
              0.8
            }
            style={[
              styles.feedTab,

              activeFeedTab ===
              'mine' &&
              styles.feedTabActive,
            ]}
            onPress={() =>
              setActiveFeedTab(
                'mine'
              )
            }
          >
            <Text
              style={[
                styles.feedTabText,

                activeFeedTab ===
                'mine' &&
                styles.feedTabTextActive,
              ]}
            >
              My post
            </Text>
          </TouchableOpacity>
        </View>


        {/* =================================================
            FEED LIST
        ================================================= */}

        <View
          style={[
            styles.feedContainer,
            {
              width:
                pageWidth,
            },
          ]}
        >
          {loading ? (
            <View
              style={
                styles.center
              }
            >
              <ActivityIndicator
                size="large"
                color="#FF7F87"
              />

              <Text
                style={
                  styles.stateText
                }
              >
                Loading board...
              </Text>
            </View>
          ) : (
            <FlatList
              data={
                visiblePosts
              }

              keyExtractor={(
                item
              ) =>
                item.post_id
              }

              showsVerticalScrollIndicator={
                false
              }

              contentContainerStyle={
                styles.feedContent
              }

              refreshControl={
                <RefreshControl
                  refreshing={
                    refreshing
                  }
                  onRefresh={
                    refreshFeed
                  }
                  tintColor="#FF7F87"
                />
              }

              onEndReached={
                activeFeedTab ===
                  'feed'
                  ? loadMore
                  : undefined
              }

              onEndReachedThreshold={
                0.5
              }

              ListHeaderComponent={
                activeFeedTab ===
                  'feed' ? (
                  <TouchableOpacity
                    activeOpacity={
                      0.88
                    }
                    style={
                      styles.composer
                    }
                    onPress={
                      openCreatePost
                    }
                  >
                    <View
                      style={
                        styles.composerAvatar
                      }
                    >
                      <Ionicons
                        name="person"
                        size={19}
                        color="#FFFFFF"
                      />
                    </View>


                    <View
                      style={
                        styles.composerTextArea
                      }
                    >
                      <Text
                        style={
                          styles.composerName
                        }
                      >
                        anonymous
                      </Text>

                      <Text
                        style={
                          styles.composerPlaceholder
                        }
                      >
                        มีอะไรอยากเล่าไหม...
                      </Text>
                    </View>


                    <View
                      style={
                        styles.composerPostButton
                      }
                    >
                      <Text
                        style={
                          styles.composerPostText
                        }
                      >
                        Post
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null
              }

              ListEmptyComponent={
                <View
                  style={
                    styles.empty
                  }
                >
                  <Ionicons
                    name={
                      activeFeedTab ===
                        'mine'
                        ? 'document-text-outline'
                        : 'chatbubbles-outline'
                    }
                    size={54}
                    color="#FF9B87"
                  />

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    {activeFeedTab ===
                      'mine'
                      ? 'No posts yet'
                      : 'Nothing here yet'}
                  </Text>

                  <Text
                    style={
                      styles.stateText
                    }
                  >
                    {activeFeedTab ===
                      'mine'
                      ? 'โพสต์ของคุณจะแสดงอยู่ที่นี่'
                      : 'Be the first anonymous post!'}
                  </Text>
                </View>
              }

              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator
                    style={{
                      marginVertical:
                        18,
                    }}
                    color="#FF7F87"
                  />
                ) : null
              }

              renderItem={({
                item,
              }) => (
                <FeedPostCard
                  post={
                    item
                  }

                  onOpen={() =>
                    openPostDetail(
                      item
                    )
                  }

                  onLike={() =>
                    handleLike(
                      item
                    )
                  }

                  onComment={() =>
                    openPostDetail(
                      item
                    )
                  }

                  onMore={() =>
                    openPostOptions(
                      item
                    )
                  }
                />
              )}
            />
          )}
        </View>


      </View>


      {/* ===================================================
          CREATE POST
      =================================================== */}

      <Modal
        visible={
          createVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeCreatePost
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS ===
              'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={[
              styles.createModalCard,
              {
                width:
                  pageWidth,
              },
            ]}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <TouchableOpacity
                onPress={
                  closeCreatePost
                }
              >
                <Ionicons
                  name="close"
                  size={27}
                  color="#333333"
                />
              </TouchableOpacity>


              <Text
                style={
                  styles.modalTitle
                }
              >
                NEW POST
              </Text>


              <View
                style={{
                  width: 27,
                }}
              />
            </View>
            <ScrollView
              style={
                styles.createScroll
              }
              contentContainerStyle={
                styles.createScrollContent
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={
                  styles.createIdentityRow
                }
              >
                <View
                  style={
                    styles.createAvatar
                  }
                >
                  <Ionicons
                    name="person"
                    size={19}
                    color="#FFFFFF"
                  />
                </View>

                <Text
                  style={
                    styles.createAnonymous
                  }
                >
                  anonymous
                </Text>
              </View>


              <TextInput
                value={
                  newPostText
                }
                onChangeText={
                  setNewPostText
                }
                multiline
                maxLength={3000}
                textAlignVertical="top"
                placeholder="มีอะไรอยากเล่าไหม..."
                placeholderTextColor="#AAAAAA"
                style={[
                  styles.postInput,
                  webNoOutline,
                ]}
              />


              <Text
                style={
                  styles.counter
                }
              >
                {newPostText.length}/3000
              </Text>


              {newPostImages.length > 0 ? (
                <View
                  style={
                    styles.previewGrid
                  }
                >
                  {newPostImages.map(
                    (
                      image,
                      index
                    ) => (
                      <View
                        key={
                          `${image.uri}-${index}`
                        }
                        style={
                          styles.previewContainer
                        }
                      >
                        <Image
                          source={{
                            uri:
                              image.uri,
                          }}
                          style={
                            styles.previewImage
                          }
                        />

                        <TouchableOpacity
                          style={
                            styles.removeImage
                          }
                          onPress={() =>
                            removeSelectedImage(
                              index
                            )
                          }
                        >
                          <Ionicons
                            name="close"
                            size={16}
                            color="#111111"
                          />
                        </TouchableOpacity>
                      </View>
                    )
                  )}
                </View>
              ) : null}


              <View
                style={
                  styles.photoCountRow
                }
              >
                <Text
                  style={
                    styles.photoCountText
                  }
                >
                  {newPostImages.length}/4 photos
                </Text>
              </View>
            </ScrollView>


            <View
              style={
                styles.createActions
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.imageButton
                }
                onPress={
                  pickPostImages
                }
              >
                <Ionicons
                  name="images-outline"
                  size={23}
                  color="#FF7F87"
                />

                <Text
                  style={
                    styles.imageButtonText
                  }
                >
                  Add photo
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                disabled={
                  creating
                }
                activeOpacity={0.85}
                onPress={
                  submitPost
                }
              >
                <LinearGradient
                  colors={[
                    '#FF7F87',
                    '#FFAE72',
                    '#FFD77D',
                  ]}
                  style={
                    styles.postButton
                  }
                >
                  {creating ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <Text
                      style={
                        styles.postButtonText
                      }
                    >
                      Post
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      {/* ===================================================
          POST DETAIL / COMMENTS
      =================================================== */}

      <Modal
        visible={detailVisible}
        animationType="slide"
        statusBarTranslucent={false}
        onRequestClose={closePostDetail}
      >
        <SafeAreaProvider>
          <SafeAreaView
            edges={['top', 'left', 'right']}
            style={styles.detailSafeArea}
          >
            <KeyboardAvoidingView
              style={{
                flex: 1,
              }}
              behavior={
                Platform.OS ===
                  'ios'
                  ? 'padding'
                  : undefined
              }
            >

              {/* DETAIL HEADER */}

              <View
                style={
                  styles.detailHeader
                }
              >
                <TouchableOpacity
                  style={
                    styles.detailBackButton
                  }
                  onPress={
                    closePostDetail
                  }
                >
                  <Ionicons
                    name="arrow-back"
                    size={25}
                    color="#FF817D"
                  />
                </TouchableOpacity>

                <Text
                  style={
                    styles.detailHeaderTitle
                  }
                >
                  Post
                </Text>

                <View
                  style={{
                    width: 40,
                  }}
                />
              </View>


              {detailPost ? (
                <FlatList
                  data={
                    comments
                  }

                  keyExtractor={(
                    item
                  ) =>
                    item.comment_id
                  }

                  contentContainerStyle={
                    styles.commentsList
                  }

                  ListHeaderComponent={
                    <View>
                      <FeedPostCard
                        post={
                          detailPost
                        }

                        onOpen={() =>
                          undefined
                        }

                        onLike={() =>
                          handleLike(
                            detailPost
                          )
                        }

                        onComment={() =>
                          undefined
                        }

                        onMore={() =>
                          openPostOptions(
                            detailPost
                          )
                        }

                        detailMode
                      />


                      <View
                        style={
                          styles.commentsTitleRow
                        }
                      >
                        <Text
                          style={
                            styles.commentsTitle
                          }
                        >
                          Comments
                        </Text>

                        <Text
                          style={
                            styles.commentsCount
                          }
                        >
                          {
                            detailPost
                              .comment_count
                          }
                        </Text>
                      </View>
                    </View>
                  }

                  ListEmptyComponent={
                    commentsLoading ? (
                      <ActivityIndicator
                        style={{
                          marginTop:
                            30,
                        }}
                        color="#FF7F87"
                      />
                    ) : (
                      <View
                        style={
                          styles.noComments
                        }
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={36}
                          color="#CCCCCC"
                        />

                        <Text
                          style={
                            styles.noCommentsText
                          }
                        >
                          ยังไม่มีคอมเมนต์
                        </Text>
                      </View>
                    )
                  }

                  renderItem={({ item }) => {
                    // Replies will be rendered inside their parent comment.
                    if (item.parent_comment_id) {
                      return null;
                    }

                    const replies = comments.filter(
                      (comment) =>
                        comment.parent_comment_id === item.comment_id
                    );

                    return (
                      <View style={styles.commentRow}>
                        <View
                          style={[
                            styles.commentAvatar,
                            item.is_mine
                              ? styles.avatarMine
                              : styles.avatarOther,
                          ]}
                        >
                          <Ionicons
                            name="person"
                            size={16}
                            color={item.is_mine ? '#FFFFFF' : '#8E8E8E'}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.commentBubble}>
                            <View style={styles.commentTop}>
                              <Text style={styles.commentAuthor}>
                                {item.is_mine ? 'anonymous · You' : 'anonymous'}
                              </Text>

                              <Text style={styles.commentTime}>
                                {formatDate(item.created_at)}
                              </Text>
                            </View>

                            <Text style={styles.commentContent}>
                              {item.content}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => {
                              setReplyingTo(item);
                              setCommentText('');
                            }}
                            style={{ paddingVertical: 7, paddingHorizontal: 8 }}
                          >
                            <Text style={{ color: '#FF817D', fontSize: 12, fontWeight: '600' }}>
                              Reply
                            </Text>
                          </TouchableOpacity>

                          {replies.map((reply) => (
                            <View
                              key={reply.comment_id}
                              style={{
                                flexDirection: 'row',
                                marginLeft: 18,
                                marginBottom: 10,
                                gap: 8,
                              }}
                            >
                              <View
                                style={[
                                  styles.commentAvatar,
                                  reply.is_mine
                                    ? styles.avatarMine
                                    : styles.avatarOther,
                                ]}
                              >
                                <Ionicons
                                  name="person"
                                  size={14}
                                  color={reply.is_mine ? '#FFFFFF' : '#8E8E8E'}
                                />
                              </View>

                              <View style={[styles.commentBubble, { flex: 1 }]}>
                                <View style={styles.commentTop}>
                                  <Text style={styles.commentAuthor}>
                                    {reply.is_mine ? 'anonymous · You' : 'anonymous'}
                                  </Text>

                                  <Text style={styles.commentTime}>
                                    {formatDate(reply.created_at)}
                                  </Text>
                                </View>

                                <Text style={styles.commentContent}>
                                  {reply.content}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  }}
                />
              ) : null}


              {/* COMMENT INPUT */}


              {replyingTo ? (
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: '#FFF5F4',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#FF817D', fontSize: 13, flex: 1 }}>
                    Replying to {replyingTo.is_mine ? 'your comment' : 'anonymous'}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setReplyingTo(null);
                      setCommentText('');
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF817D" />
                  </TouchableOpacity>
                </View>
              ) : null}


              {detailPost ? (

                <View
                  style={
                    styles.commentInputContainer
                  }
                >
                  <View
                    style={
                      styles.commentInputAvatar
                    }
                  >
                    <Ionicons
                      name="person"
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>

                  <TextInput
                    value={
                      commentText
                    }

                    onChangeText={
                      setCommentText
                    }

                    placeholder={
                      replyingTo ? 'Write a reply...' : 'Write a comment...'
                    }

                    placeholderTextColor="#AAAAAA"

                    maxLength={
                      1000
                    }

                    style={[
                      styles.commentInput,
                      webNoOutline,
                    ]}
                  />


                  <TouchableOpacity
                    disabled={
                      commentSending ||
                      !commentText.trim()
                    }
                    style={[
                      styles.sendButton,

                      !commentText.trim() &&
                      styles.sendButtonDisabled,
                    ]}
                    onPress={
                      sendComment
                    }
                  >
                    {commentSending ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Ionicons
                        name="send"
                        size={17}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>


      {/* ===================================================
          POST OPTIONS
      =================================================== */}

      <Modal
        visible={
          optionsVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closePostOptions
        }
      >
        <View
          style={
            styles.optionsOverlay
          }
        >
          <Pressable
            style={
              styles.optionsBackdrop
            }
            onPress={
              closePostOptions
            }
          />

          <View
            style={[
              styles.optionsSheet,
              {
                width:
                  pageWidth,
              },
            ]}
          >
            <View
              style={
                styles.optionsHandle
              }
            />

            {optionsPost?.is_mine ? (
              <>
                <TouchableOpacity
                  style={
                    styles.optionRow
                  }
                  onPress={
                    handleEditOption
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={22}
                    color="#333333"
                  />

                  <Text
                    style={
                      styles.optionText
                    }
                  >
                    Edit post
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.optionRow
                  }
                  onPress={
                    handleDeleteOption
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color="#E04F4F"
                  />

                  <Text
                    style={[
                      styles.optionText,
                      styles.deleteOptionText,
                    ]}
                  >
                    Delete post
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={
                  styles.optionRow
                }
                onPress={
                  handleReportOption
                }
              >
                <Ionicons
                  name="flag-outline"
                  size={22}
                  color="#E04F4F"
                />

                <Text
                  style={[
                    styles.optionText,
                    styles.deleteOptionText,
                  ]}
                >
                  Report post
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.optionRow,
                styles.cancelOption,
              ]}
              onPress={
                closePostOptions
              }
            >
              <Text
                style={
                  styles.cancelOptionText
                }
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* ===================================================
          DELETE CONFIRM
      =================================================== */}

      <Modal
        visible={
          deleteConfirmVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (
            deleteLoading
          ) {
            return;
          }

          setDeleteConfirmVisible(
            false
          );

          setDeleteTarget(
            null
          );
        }}
      >
        <View
          style={
            styles.deleteOverlay
          }
        >
          <Pressable
            style={
              styles.deleteBackdrop
            }
            onPress={() => {
              if (
                deleteLoading
              ) {
                return;
              }

              setDeleteConfirmVisible(
                false
              );

              setDeleteTarget(
                null
              );
            }}
          />

          <View
            style={
              styles.deleteDialog
            }
          >
            <View
              style={
                styles.deleteIconCircle
              }
            >
              <Ionicons
                name="trash-outline"
                size={25}
                color="#E65353"
              />
            </View>

            <Text
              style={
                styles.deleteTitle
              }
            >
              Delete post?
            </Text>

            <Text
              style={
                styles.deleteDescription
              }
            >
              คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?
            </Text>

            <View
              style={
                styles.deleteActions
              }
            >
              <TouchableOpacity
                style={
                  styles.deleteCancelButton
                }
                disabled={
                  deleteLoading
                }
                onPress={() => {
                  setDeleteConfirmVisible(
                    false
                  );

                  setDeleteTarget(
                    null
                  );
                }}
              >
                <Text
                  style={
                    styles.deleteCancelText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.deleteConfirmButton
                }
                disabled={
                  deleteLoading
                }
                onPress={
                  confirmDeletePost
                }
              >
                {deleteLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.deleteConfirmText
                    }
                  >
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* ===================================================
          EDIT POST
      =================================================== */}

      <Modal
        visible={
          editVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setEditVisible(
            false
          )
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS ===
              'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={[
              styles.editModalCard,
              {
                width:
                  pageWidth,
              },
            ]}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <TouchableOpacity
                onPress={() =>
                  setEditVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={27}
                  color="#333333"
                />
              </TouchableOpacity>

              <Text
                style={
                  styles.modalTitle
                }
              >
                Edit post
              </Text>

              <View
                style={{
                  width: 27,
                }}
              />
            </View>


            <TextInput
              value={
                editText
              }

              onChangeText={
                setEditText
              }

              multiline

              maxLength={
                3000
              }

              textAlignVertical="top"

              style={[
                styles.editInput,
                webNoOutline,
              ]}
            />


            <Text
              style={
                styles.counter
              }
            >
              {
                editText.length
              }
              /3000
            </Text>


            <TouchableOpacity
              disabled={
                editSaving
              }
              activeOpacity={
                0.85
              }
              style={
                styles.saveEditButton
              }
              onPress={
                saveEditPost
              }
            >
              {editSaving ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.saveEditText
                  }
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      {/* ===================================================
          REPORT POST
      =================================================== */}

      <Modal
        visible={
          reportVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeReportModal
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS ===
              'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={[
              styles.reportModalCard,
              {
                width:
                  pageWidth,
              },
            ]}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <TouchableOpacity
                onPress={
                  closeReportModal
                }
                disabled={
                  reportView ===
                  'submitting'
                }
              >
                <Ionicons
                  name="close"
                  size={27}
                  color="#333333"
                />
              </TouchableOpacity>

              <Text
                style={
                  styles.modalTitle
                }
              >
                Report
              </Text>

              <View
                style={{
                  width: 27,
                }}
              />
            </View>

            {reportView === 'form' && (
              <>
                <Text
                  style={
                    styles.reportHeading
                  }
                >
                  Why are you reporting this post?
                </Text>

                <FlatList
                  data={
                    REPORT_REASONS
                  }

                  keyExtractor={(
                    item
                  ) =>
                    item.value
                  }

                  style={
                    styles.reportReasonList
                  }

                  renderItem={({
                    item,
                  }) => {
                    const selected =
                      selectedReportReason ===
                      item.value;

                    return (
                      <TouchableOpacity
                        activeOpacity={
                          0.8
                        }
                        style={[
                          styles.reportReason,

                          selected &&
                          styles.reportReasonSelected,
                        ]}
                        onPress={() =>
                          setSelectedReportReason(
                            item.value
                          )
                        }
                      >
                        <View
                          style={
                            styles.reportReasonLeft
                          }
                        >
                          <Ionicons
                            name={
                              item.icon
                            }
                            size={21}
                            color={
                              selected
                                ? '#FF817B'
                                : '#555555'
                            }
                          />

                          <Text
                            style={[
                              styles.reportReasonText,

                              selected &&
                              styles.reportReasonTextSelected,
                            ]}
                          >
                            {
                              item.label
                            }
                          </Text>
                        </View>

                        <Ionicons
                          name={
                            selected
                              ? 'radio-button-on'
                              : 'radio-button-off'
                          }
                          size={20}
                          color={
                            selected
                              ? '#FF817B'
                              : '#BBBBBB'
                          }
                        />
                      </TouchableOpacity>
                    );
                  }}
                />


                <TextInput
                  value={
                    reportDetails
                  }

                  onChangeText={
                    setReportDetails
                  }

                  multiline

                  maxLength={
                    1000
                  }

                  textAlignVertical="top"

                  placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"

                  placeholderTextColor="#AAAAAA"

                  style={[
                    styles.reportDetailsInput,
                    webNoOutline,
                  ]}
                />


                <TouchableOpacity
                  disabled={
                    reportSending
                  }
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.reportSubmitButton
                  }
                  onPress={
                    submitReport
                  }
                >
                  {reportSending ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.reportSubmitText
                      }
                    >
                      Submit report
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
            {reportView ===
              'submitting' && (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color="#FF817B"
                  />

                  <Text
                    style={{
                      marginTop: 18,
                      fontSize: 17,
                      fontWeight: '700',
                      color: '#222222',
                      textAlign: 'center',
                    }}
                  >
                    Submitting your report...
                  </Text>

                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 19,
                      color: '#888888',
                      textAlign: 'center',
                    }}
                  >
                    Please wait while we send
                    your report to the TalkTU
                    Safety team.
                  </Text>
                </View>
              )}
            {reportView ===
              'success' && (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={58}
                    color="#E88A43"
                  />

                  <Text
                    style={{
                      marginTop: 14,
                      fontSize: 19,
                      fontWeight: '700',
                      color: '#222222',
                      textAlign: 'center',
                    }}
                  >
                    Report submitted
                  </Text>

                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 19,
                      color: '#777777',
                      textAlign: 'center',
                    }}
                  >
                    Your report has been
                    submitted successfully.
                    {'\n'}
                    The TalkTU Safety team
                    will review it.
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.reportSubmitButton,
                      {
                        width: '100%',
                        marginTop: 24,
                      },
                    ]}
                    onPress={
                      closeReportModal
                    }
                  >
                    <Text
                      style={
                        styles.reportSubmitText
                      }
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}


/* =========================================================
   POST CARD
========================================================= */

function FeedPostCard({
  post,
  onOpen,
  onLike,
  onComment,
  onMore,
  detailMode = false,
}: {
  post:
  FeedPost;

  onOpen:
  () => void;

  onLike:
  () => void;

  onComment:
  () => void;

  onMore:
  () => void;

  detailMode?:
  boolean;
}) {
  return (
    <View
      style={[
        styles.postCard,

        detailMode &&
        styles.postCardDetail,
      ]}
    >
      {/* POST HEADER */}

      <View
        style={
          styles.postTop
        }
      >
        <View
          style={
            styles.anonymousRow
          }
        >
          <View
            style={[
              styles.anonymousIcon,
              post.is_mine
                ? styles.avatarMine
                : styles.avatarOther,
            ]}
          >
            <Ionicons
              name="person"
              size={18}
              color={
                post.is_mine
                  ? '#FFFFFF'
                  : '#8E8E8E'
              }
            />
          </View>


          <View>
            <Text
              style={
                styles.anonymousText
              }
            >
              {post.is_mine
                ? 'anonymous · You'
                : 'anonymous'}
            </Text>

            <Text
              style={
                styles.timeText
              }
            >
              {formatDate(
                post.created_at
              )}
            </Text>
          </View>
        </View>


        <TouchableOpacity
          style={
            styles.moreButton
          }
          onPress={
            onMore
          }
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#777777"
          />
        </TouchableOpacity>
      </View>


      {/* CLICKABLE POST CONTENT */}

      <Pressable
        onPress={
          onOpen
        }
      >
        <Text
          style={
            styles.postContent
          }
        >
          {
            post.content
          }
        </Text>


        <PostImages
          post={
            post
          }
        />
      </Pressable>


      {/* ACTIONS */}

      <View
        style={
          styles.postActions
        }
      >
        <TouchableOpacity
          style={
            styles.action
          }
          onPress={
            onLike
          }
        >
          <Ionicons
            name={
              post.liked_by_me
                ? 'heart'
                : 'heart-outline'
            }
            size={22}
            color={
              post.liked_by_me
                ? '#FF5964'
                : '#555555'
            }
          />

          <Text
            style={
              styles.actionText
            }
          >
            {
              post.like_count
            }
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={
            styles.action
          }
          onPress={
            onComment
          }
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color="#555555"
          />

          <Text
            style={
              styles.actionText
            }
          >
            {
              post.comment_count
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================================================
Zoomable Post Images
========================================================= */

function ZoomablePostImage({
  uri,
  width,
  height,
}: {
  uri: string;
  width: number;
  height: number;
}) {
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = Math.max(
        1,
        Math.min(
          4,
          startScale.value * event.scale
        )
      );
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = 1;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.Image
        source={{ uri }}
        resizeMode="contain"
        style={[
          {
            width,
            height,
          },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
}

/* =========================================================
   POST IMAGE GRID
========================================================= */


function PostImages({
  post,
}: {
  post: FeedPost;
}) {
  const images = post.images ?? [];
  const { width, height } = useWindowDimensions();

  const [viewerVisible, setViewerVisible] =
    useState(false);

  const [viewerIndex, setViewerIndex] =
    useState(0);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  if (images.length === 0) {
    return null;
  }

  const viewerImages = images.map((image) => ({
    uri: getPostImageUrl(image.storage_path),
    key: image.id ?? image.storage_path,
  }));

  return (
    <>
      {images.length === 1 ? (
        <Pressable
          onPress={() => openViewer(0)}
          style={styles.singleImageContainer}
        >
          <Image
            source={{ uri: viewerImages[0].uri }}
            style={styles.singlePostImage}
            resizeMode="cover"
          />
        </Pressable>
      ) : (
        <View style={styles.postImageGrid}>
          {images.slice(0, 4).map((image, index) => (
            <Pressable
              key={image.id ?? image.storage_path}
              onPress={() => openViewer(index)}
              style={{
                width: '48%',
                height: 170,
                flexGrow: 0,
                flexShrink: 0,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#EEEEEE',
              }}
            >
              <Image
                source={{
                  uri: getPostImageUrl(
                    image.storage_path
                  ),
                }}
                resizeMode="cover"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </Pressable>
          ))}
        </View>
      )}

      <Modal
        visible={viewerVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() =>
          setViewerVisible(false)
        }
        statusBarTranslucent
      >
        <GestureHandlerRootView
          style={{
            flex: 1,
            backgroundColor: '#000000',
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: '#000000',
            }}
          >
            {viewerVisible && (
              <FlatList
                key={post.id}
                data={viewerImages}
                horizontal
                pagingEnabled
                initialScrollIndex={viewerIndex}
                getItemLayout={(_, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x /
                      width
                  );

                  setViewerIndex(index);
                }}
                renderItem={({ item }) => (
                  <View
                    style={{
                      width,
                      height,
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <ZoomablePostImage
                      key={item.key}
                      uri={item.uri}
                      width={width}
                      height={height}
                    />
                  </View>
                )}
              />
            )}

            <Pressable
              onPress={() => setViewerVisible(false)}
              hitSlop={12}
              style={{
                position: 'absolute',
                top: 48,
                right: 20,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#333333',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <Ionicons
                name="close"
                size={28}
                color="#FFFFFF"
              />
            </Pressable>

            {images.length > 1 && (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 58,
                  alignSelf: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                  }}
                >
                  {viewerIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value:
    string
) {
  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }


  const now =
    new Date();


  const diff =
    now.getTime() -
    date.getTime();


  const minute =
    60 * 1000;

  const hour =
    60 * minute;

  const day =
    24 * hour;


  if (
    diff <
    minute
  ) {
    return 'now';
  }


  if (
    diff <
    hour
  ) {
    return `${Math.floor(
      diff /
      minute
    )}m`;
  }


  if (
    diff <
    day
  ) {
    return `${Math.floor(
      diff /
      hour
    )}h`;
  }


  if (
    diff <
    7 * day
  ) {
    return `${Math.floor(
      diff /
      day
    )}d`;
  }


  return date.toLocaleDateString(
    [],
    {
      day:
        '2-digit',

      month:
        'short',
    }
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({

    /* =====================================================
       ROOT
    ===================================================== */

    safeArea: {
      flex: 1,

      backgroundColor:
        '#ffffff',
    },

    container: {
      flex: 1,

      alignItems:
        'center',
    },


    /* =====================================================
       HEADER
    ===================================================== */

    header: {
      marginTop: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },

    headerLogo: {
      width: 160,
      height: 75,
    },


    /* =====================================================
       TABS
    ===================================================== */

    feedTabs: {
      height:
        49,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        '#FFFFFF',

      borderBottomWidth:
        StyleSheet
          .hairlineWidth,

      borderBottomColor:
        '#DDDDDD',
    },

    feedTab: {
      flex: 1,

      height:
        '100%',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    feedTabActive: {
      borderBottomWidth:
        2,

      borderBottomColor:
        '#FF827C',
    },

    feedTabText: {
      fontSize:
        13,

      fontWeight:
        '500',

      color:
        '#AAAAAA',
    },

    feedTabTextActive: {
      fontWeight:
        '700',

      color:
        '#FF827C',
    },

    feedTabDivider: {
      width:
        StyleSheet
          .hairlineWidth,

      height:
        22,

      backgroundColor:
        '#E7E7E7',
    },


    /* =====================================================
       FEED
    ===================================================== */

    feedContainer: {
      flex: 1,
    },

    feedContent: {
      paddingBottom:
        18,
    },


    /* =====================================================
       QUICK COMPOSER
    ===================================================== */

    composer: {
      minHeight:
        78,

      paddingHorizontal:
        12,

      paddingVertical:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        '#FFFFFF',

      borderBottomWidth:
        StyleSheet
          .hairlineWidth,

      borderBottomColor:
        '#E1E1E1',
    },

    composerAvatar: {
      width:
        42,

      height:
        42,

      marginRight:
        10,

      borderRadius:
        21,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#FF9B88',
    },

    composerTextArea: {
      flex:
        1,
    },

    composerName: {
      marginBottom:
        3,

      fontSize:
        12,

      fontWeight:
        '700',

      color:
        '#222222',
    },

    composerPlaceholder: {
      fontSize:
        13,

      color:
        '#AAAAAA',
    },

    composerPostButton: {
      minWidth:
        58,

      height:
        34,

      paddingHorizontal:
        13,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        17,

      borderWidth:
        1,

      borderColor:
        '#EEEEEE',

      backgroundColor:
        '#FFFFFF',
    },

    composerPostText: {
      fontSize:
        12,

      fontWeight:
        '700',

      color:
        '#FF817B',
    },


    /* =====================================================
       POST
    ===================================================== */

    postCard: {
      padding:
        14,

      marginBottom:
        1,

      backgroundColor:
        '#FFFFFF',

      borderBottomWidth:
        StyleSheet
          .hairlineWidth,

      borderBottomColor:
        '#E8E8E8',
    },

    postCardDetail: {
      marginBottom:
        0,

      borderBottomWidth:
        0,
    },

    postTop: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    anonymousRow: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    anonymousIcon: {
      width:
        38,

      height:
        38,

      marginRight:
        9,

      borderRadius:
        19,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    avatarMine: {
      backgroundColor:
        '#FF9B88',
    },

    avatarOther: {
      backgroundColor:
        '#E2E2E2',
    },

    anonymousText: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        '#222222',
    },

    timeText: {
      marginTop:
        2,

      fontSize:
        10,

      color:
        '#999999',
    },

    moreButton: {
      width:
        34,

      height:
        34,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    postContent: {
      marginTop:
        13,

      fontSize:
        14,

      lineHeight:
        21,

      color:
        '#292929',
    },


    /* =====================================================
       POST IMAGES
    ===================================================== */

    singleImageContainer: {
      marginTop:
        13,

      overflow:
        'hidden',

      borderRadius:
        14,

      backgroundColor:
        '#EEEEEE',
    },

    singlePostImage: {
      width:
        '100%',

      aspectRatio:
        4 / 3,
    },
    
postImageGrid: {
  marginTop: 13,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 4,
  width: '100%',
  alignSelf: 'stretch',
},

gridPostImage: {
  width: '48%',
  aspectRatio: 1,
  borderRadius: 10,
  backgroundColor: '#EEEEEE',
},

gridPostImageFull: {
  width: '100%',
  aspectRatio: 1.8,
},


    /* =====================================================
       POST ACTIONS
    ===================================================== */

    postActions: {
      marginTop:
        12,

      paddingTop:
        10,

      flexDirection:
        'row',

      gap:
        25,

      borderTopWidth:
        StyleSheet
          .hairlineWidth,

      borderTopColor:
        '#ECECEC',
    },

    action: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        5,

      minHeight:
        30,
    },

    actionText: {
      fontSize:
        12,

      color:
        '#555555',
    },


    /* =====================================================
       GENERAL STATES
    ===================================================== */

    center: {
      flex: 1,

      padding:
        30,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    stateText: {
      marginTop:
        8,

      fontSize:
        12,

      textAlign:
        'center',

      color:
        '#888888',
    },

    empty: {
      marginTop:
        80,

      alignItems:
        'center',
    },

    emptyTitle: {
      marginTop:
        12,

      fontSize:
        18,

      fontWeight:
        '700',

      color:
        '#333333',
    },


    /* =====================================================
       SHARED MODAL
    ===================================================== */

    modalOverlay: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'flex-end',

      backgroundColor:
        'rgba(0,0,0,0.36)',
    },

    modalHeader: {
      marginBottom:
        15,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    modalTitle: {
      fontSize:
        16,

      fontWeight:
        '700',

      color:
        '#FF7E7E',
    },


    /* =====================================================
       CREATE POST
    ===================================================== */

    createModalCard: {
      maxHeight:
        '90%',
      padding: 18,
      overflow:
        'hidden',

      borderTopLeftRadius:
        30,

      borderTopRightRadius:
        30,
      backgroundColor:
        '#FFFFFF',
    },

    createScroll: {
      flexShrink:
        1,
    },

    createScrollContent: {
      paddingBottom:
        12,
    },

    createIdentityRow: {
      marginBottom:
        10,

      flexDirection:
        'row',

      alignItems:
        'center',
    },

    createAvatar: {
      width:
        36,

      height:
        36,

      marginRight:
        9,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#FF9B88',
    },

    createAnonymous: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        '#333333',
    },

    postInput: {
      minHeight:
        140,

      padding:
        10,

      fontSize:
        15,

      lineHeight:
        21,

      color:
        '#222222',

      backgroundColor:
        '#FFFFFF',
    },

    counter: {
      marginTop:
        4,

      marginBottom:
        10,

      textAlign:
        'right',

      fontSize:
        10,

      color:
        '#AAAAAA',
    },

    previewGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        7,

      marginBottom:
        6,
    },

    previewContainer: {
      width:
        '48.5%',

      aspectRatio:
        1,

      position:
        'relative',

      overflow:
        'hidden',

      borderRadius:
        13,

      backgroundColor:
        '#EEEEEE',
    },

    previewImage: {
      width:
        '100%',

      height:
        '100%',
    },

    removeImage: {
      position:
        'absolute',

      top:
        6,

      right:
        6,

      width:
        26,

      height:
        26,

      borderRadius:
        13,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(255,255,255,0.94)',
    },

    photoCountRow: {
      alignItems:
        'flex-end',

      marginBottom:
        8,
    },

    photoCountText: {
      fontSize:
        10,

      color:
        '#999999',
    },

    createActions: {
      paddingTop:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      borderTopWidth:
        StyleSheet
          .hairlineWidth,

      borderTopColor:
        '#E8E8E8',
    },

    imageButton: {
      minHeight:
        40,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        6,
    },

    imageButtonText: {
      fontSize:
        13,

      fontWeight:
        '600',

      color:
        '#555555',
    },

    postButton: {
      minWidth:
        90,

      height:
        40,

      borderRadius:
        20,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    postButtonText: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        '#FFFFFF',
    },


    /* =====================================================
       DETAIL
    ===================================================== */

    detailSafeArea: {
      flex:
        1,

      backgroundColor:
        '#ffffff',
    },

    detailHeader: {
      height: 56,

      paddingHorizontal: 12,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderBottomWidth:
        StyleSheet
          .hairlineWidth,

      borderBottomColor:
        '#E5E5E5',
    },

    detailBackButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    detailHeaderTitle: {
      fontSize:
        18,

      fontWeight:
        '700',

      color:
        '#FF817D',
    },

    commentsList: {
      paddingBottom:
        20,
    },

    commentsTitleRow: {
      paddingHorizontal:
        16,

      paddingVertical:
        13,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        6,

      backgroundColor:
        '#F7F7F7',
    },

    commentsTitle: {
      fontSize:
        14,

      fontWeight:
        '700',

      color:
        '#333333',
    },

    commentsCount: {
      fontSize:
        12,

      color:
        '#999999',
    },

    noComments: {
      paddingVertical:
        40,

      alignItems:
        'center',
    },

    noCommentsText: {
      marginTop:
        8,

      fontSize:
        12,

      color:
        '#AAAAAA',
    },


    /* =====================================================
       COMMENTS
    ===================================================== */

    commentRow: {
      paddingHorizontal:
        14,
      paddingVertical:
        10,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      backgroundColor:
        '#FFFFFF',

      borderBottomWidth:
        StyleSheet
          .hairlineWidth,

      borderBottomColor:
        '#EEEEEE',
    },

    commentAvatar: {
      width:
        34,

      height:
        34,

      marginRight:
        9,

      borderRadius:
        17,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    commentBubble: {
      flex:
        1,
    },

    commentTop: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    commentAuthor: {
      fontSize:
        11,

      fontWeight:
        '700',

      color:
        '#FF817D',
    },

    commentContent: {
      marginTop:
        4,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        '#333333',
    },

    commentTime: {
      fontSize:
        9,

      color:
        '#AAAAAA',
    },

    commentInputContainer: {
      paddingHorizontal: 15,
      paddingVertical: 35,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor:
        '#FFFFFF',
      borderTopWidth:
        StyleSheet
          .hairlineWidth,
      borderTopColor:
        '#DDDDDD',
    },

    commentInputAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF9B88',
    },
    commentInput: {
      flex: 1,
      minHeight: 50,
      paddingHorizontal: 14,
      borderRadius: 20,
      fontSize: 13,
      color: '#222222',
      backgroundColor: '#F2F2F2',
    },
    sendButton: {
      width:
        40,

      height:
        40,

      borderRadius:
        20,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#FF8982',
    },

    sendButtonDisabled: {
      opacity:
        0.45,
    },


    /* =====================================================
       POST OPTIONS
    ===================================================== */

    optionsOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    optionsBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    optionsSheet: {
      alignSelf:
        'center',

      paddingTop:
        10,

      paddingHorizontal:
        16,

      paddingBottom:
        18,

      borderTopLeftRadius:
        24,

      borderTopRightRadius:
        24,

      backgroundColor:
        '#FFFFFF',
    },

    optionsHandle: {
      width:
        42,

      height:
        4,

      alignSelf:
        'center',

      marginBottom:
        12,

      borderRadius:
        2,

      backgroundColor:
        '#D0D0D0',
    },

    optionRow: {
      minHeight:
        56,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        12,

      paddingHorizontal:
        8,

      borderBottomWidth:
        StyleSheet
          .hairlineWidth,

      borderBottomColor:
        '#EAEAEA',
    },

    optionText: {
      fontSize:
        14,

      fontWeight:
        '600',

      color:
        '#333333',
    },

    deleteOptionText: {
      color:
        '#E04F4F',
    },

    cancelOption: {
      justifyContent:
        'center',

      borderBottomWidth:
        0,

      marginTop:
        6,
    },

    cancelOptionText: {
      fontSize:
        14,

      fontWeight:
        '700',

      color:
        '#555555',
    },


    /* =====================================================
       DELETE CONFIRM
    ===================================================== */

    deleteOverlay: {
      flex: 1,
      paddingHorizontal: 24,
      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(0, 0, 0, 0.4)',
    },

    deleteBackdrop: {
      position:
        'absolute',

      top:
        0,

      left:
        0,

      right:
        0,

      bottom:
        0,
    },

    deleteDialog: {
      width:
        '100%',

      maxWidth:
        380,

      padding:
        22,

      alignItems:
        'center',

      borderRadius:
        22,

      backgroundColor:
        '#FFFFFF',
    },

    deleteIconCircle: {
      width:
        52,

      height:
        52,

      marginBottom:
        12,

      borderRadius:
        26,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#FFF0F0',
    },

    deleteTitle: {
      fontSize:
        18,

      fontWeight:
        '700',

      color:
        '#222222',
    },

    deleteDescription: {
      marginTop:
        7,

      marginBottom:
        20,

      fontSize:
        12,

      textAlign:
        'center',

      color:
        '#888888',
    },

    deleteActions: {
      width:
        '100%',

      flexDirection:
        'row',

      gap:
        10,
    },

    deleteCancelButton: {
      flex:
        1,

      height:
        43,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        22,

      backgroundColor:
        '#EEEEEE',
    },

    deleteCancelText: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        '#555555',
    },

    deleteConfirmButton: {
      flex:
        1,

      height:
        43,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        22,

      backgroundColor:
        '#E65353',
    },

    deleteConfirmText: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        '#FFFFFF',
    },


    /* =====================================================
       EDIT
    ===================================================== */

    editModalCard: {
      padding:
        18,

      borderTopLeftRadius:
        24,

      borderTopRightRadius:
        24,

      backgroundColor:
        '#FFFFFF',
    },

    editInput: {
      minHeight:
        140,

      padding:
        13,

      borderRadius:
        14,

      fontSize:
        14,

      lineHeight:
        21,

      color:
        '#222222',

      backgroundColor:
        '#F5F5F5',
    },

    saveEditButton: {
      height:
        43,

      marginTop:
        7,

      borderRadius:
        22,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#FF8580',
    },

    saveEditText: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        '#FFFFFF',
    },


    /* =====================================================
       REPORT
    ===================================================== */

    reportModalCard: {
      height:
        '88%',

      padding:
        18,

      borderRadius: 30,

      backgroundColor:
        '#FFFFFF',
    },

    reportHeading: {
      marginBottom:
        12,

      fontSize:
        17,

      fontWeight:
        '700',

      color:
        '#222222',
    },

    reportReasonList: {
      flex:
        1,
    },

    reportReason: {
      minHeight:
        56,

      paddingVertical:
        10,

      paddingHorizontal:
        8,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      borderBottomWidth:
        StyleSheet
          .hairlineWidth,

      borderBottomColor:
        '#E8E8E8',
    },

    reportReasonSelected: {
      backgroundColor:
        '#FFF6F5',
    },

    reportReasonLeft: {
      flex:
        1,

      paddingRight:
        10,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        10,
    },

    reportReasonText: {
      flex:
        1,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        '#444444',
    },

    reportReasonTextSelected: {
      fontWeight:
        '600',

      color:
        '#FF817B',
    },

    reportDetailsInput: {
      minHeight:
        80,

      maxHeight:
        110,

      marginTop:
        12,

      padding:
        12,

      borderRadius:
        30,

      fontSize:
        12,

      color:
        '#333333',

      backgroundColor:
        '#F5F5F5',
    },

    reportSubmitButton: {
      height:
        44,

      marginTop:
        12,

      borderRadius:
        22,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        '#FF817B',
    },

    reportSubmitText: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        '#FFFFFF',
    },
  });