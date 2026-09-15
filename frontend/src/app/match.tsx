import React from 'react';
import {
  Image,
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
import { router, useLocalSearchParams } from 'expo-router';

export default function MatchPage() {
  const { width, height } = useWindowDimensions();

  const params = useLocalSearchParams<{
    matchId?: string;
    name?: string;
    image?: string;
    myImage?: string;
  }>();

  const name =
    typeof params.name === 'string'
      ? params.name
      : 'peperth';

  const image =
    typeof params.image === 'string'
      ? params.image
      : '';

  const myImage =
    typeof params.myImage === 'string'
      ? params.myImage
      : '';

  const isTablet = width >= 768;

  const contentWidth = isTablet
    ? Math.min(width - 80, 560)
    : width - 32;

  const cardHeight = Math.min(
    height * 0.82,
    700
  );

  const photoSize = isTablet
    ? 185
    : Math.min(width * 0.42, 165);

  const openChat = () => {
    router.push({
      pathname: '/chat/[matchId]',
      params: {
        matchId:
          params.matchId ?? '1',
        name,
        image,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[
          '#FF7F87',
          '#FF9A7D',
          '#FFE5B8',
        ]}
        locations={[
          0,
          0.45,
          1,
        ]}
        style={styles.container}
      >

        {/* ================= TOP BAR ================= */}

        <View
          style={[
            styles.topBar,
            {
              width: contentWidth,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              «
            </Text>
          </TouchableOpacity>

          <Text style={styles.topTitle}>
            Match
          </Text>

          <View style={styles.topSpacer} />
        </View>

        {/* ================= MATCH CARD ================= */}

        <View
          style={[
            styles.matchCard,
            {
              width: contentWidth,
              height: cardHeight,
            },
          ]}
        >

          {/* Match title */}

          <Text style={styles.matchTitle}>
            It's a Match!
          </Text>

          <Text style={styles.matchSubtitle}>
            You and {name} liked each other 💕
          </Text>

          {/* ================= PHOTOS ================= */}

          <View
            style={[
              styles.photoArea,
              {
                height: photoSize + 70,
              },
            ]}
          >

            {/* Other person's photo */}

            <View
              style={[
                styles.photoCard,
                styles.otherPhoto,
                {
                  width: photoSize,
                  height: photoSize,
                  borderRadius: 20,
                },
              ]}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons
                    name="person"
                    size={48}
                    color="#AAAAAA"
                  />
                </View>
              )}
            </View>

            {/* My photo */}

            <View
              style={[
                styles.photoCard,
                styles.myPhoto,
                {
                  width: photoSize,
                  height: photoSize,
                  borderRadius: 20,
                },
              ]}
            >
              {myImage ? (
                <Image
                  source={{ uri: myImage }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons
                    name="person"
                    size={48}
                    color="#AAAAAA"
                  />
                </View>
              )}
            </View>

            {/* Heart */}

            <View style={styles.heartCircle}>
              <Ionicons
                name="heart"
                size={34}
                color="#FF6975"
              />
            </View>

          </View>

          {/* ================= TEXT ================= */}

          <View style={styles.textArea}>
            <Text style={styles.bigMatchText}>
              You matched with
            </Text>

            <Text style={styles.nameText}>
              {name}
            </Text>

            <Text style={styles.description}>
              Start a conversation and get to know
              each other!
            </Text>
          </View>

          {/* ================= MESSAGE ================= */}

          <TextInput
            placeholder={`Say something to ${name}`}
            placeholderTextColor="#AAAAAA"
            style={styles.messageInput}
          />

          {/* ================= CHAT BUTTON ================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openChat}
            style={styles.chatButtonWrapper}
          >
            <LinearGradient
              colors={[
                '#FF7F87',
                '#FFD37B',
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={styles.chatButton}
            >
              <Text style={styles.chatButtonText}>
                Say Hello 👋
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ================= DONE ================= */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/chat')}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>
              Done
            </Text>
          </TouchableOpacity>

        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE5B8',
  },

  container: {
    flex: 1,
    alignItems: 'center',
  },

  /* ================= TOP BAR ================= */

  topBar: {
    height: 58,

    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 6,
  },

  backButton: {
    width: 44,
    height: 36,

    borderRadius: 18,

    backgroundColor: '#FFD37B',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',

    marginTop: -4,
  },

  topTitle: {
    flex: 1,

    textAlign: 'center',

    color: '#FFFFFF',

    fontSize: 22,
    fontWeight: '700',

    textShadowColor:
      'rgba(0,0,0,0.15)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },

  topSpacer: {
    width: 44,
  },

  /* ================= CARD ================= */

  matchCard: {
    flex: 1,

    backgroundColor: '#FFFDF9',

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    alignItems: 'center',

    paddingHorizontal: 20,
    paddingTop: 28,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },

  matchTitle: {
    fontSize: 34,

    fontWeight: '800',

    color: '#FF737B',

    fontStyle: 'italic',

    textAlign: 'center',

    textShadowColor:
      'rgba(0,0,0,0.08)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },

  matchSubtitle: {
    marginTop: 5,

    fontSize: 14,

    color: '#777777',

    textAlign: 'center',
  },

  /* ================= PHOTOS ================= */

  photoArea: {
    width: '100%',

    marginTop: 24,

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',
  },

  photoCard: {
    position: 'absolute',

    overflow: 'hidden',

    backgroundColor: '#EEEEEE',

    borderWidth: 4,
    borderColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 6,
  },

  otherPhoto: {
    left: '12%',

    transform: [
      {
        rotate: '-8deg',
      },
    ],
  },

  myPhoto: {
    right: '12%',

    transform: [
      {
        rotate: '8deg',
      },
    ],
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#EEEEEE',
  },

  heartCircle: {
    width: 66,
    height: 66,

    borderRadius: 33,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 7,

    zIndex: 10,
  },

  /* ================= TEXT ================= */

  textArea: {
    alignItems: 'center',

    marginTop: 18,

    width: '100%',
  },

  bigMatchText: {
    fontSize: 17,

    color: '#555555',

    fontWeight: '600',
  },

  nameText: {
    marginTop: 3,

    fontSize: 26,

    color: '#FF7F87',

    fontWeight: '800',
  },

  description: {
    marginTop: 7,

    fontSize: 12,

    color: '#888888',

    textAlign: 'center',

    maxWidth: 300,
  },

  /* ================= INPUT ================= */

  messageInput: {
    width: '100%',

    minHeight: 46,

    borderRadius: 23,

    backgroundColor: '#FFFFFF',

    marginTop: 22,

    paddingHorizontal: 18,

    fontSize: 13,

    color: '#333333',

    borderWidth: 1,
    borderColor: '#EEEEEE',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  /* ================= BUTTON ================= */

  chatButtonWrapper: {
    width: '100%',

    marginTop: 12,
  },

  chatButton: {
    minHeight: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },

  chatButtonText: {
    fontSize: 15,

    fontWeight: '800',

    color: '#FFFFFF',
  },

  doneButton: {
    marginTop: 10,

    paddingHorizontal: 30,
    paddingVertical: 10,
  },

  doneText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#777777',
  },
});