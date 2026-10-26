import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppMode,
  DatingInterest,
  getDatingPreferences,
  getMode,
  saveDatingPreferences,
  saveMode,
} from '../features/onboarding/services/onboardingService';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved?: (mode: AppMode) => void;
};

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.optionText}>{label}</Text>
      <View style={[styles.circle, selected && styles.circleSelected]} />
    </TouchableOpacity>
  );
}

export default function SettingsSheet({
  visible,
  onClose,
  onSaved,
}: Props) {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AppMode | null>(null);
  const [interest, setInterest] = useState<DatingInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // โหลดค่าใหม่ทุกครั้งที่เปิดชีต
  useEffect(() => {
    if (!visible) {
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [savedMode, savedInterests] = await Promise.all([
          getMode(),
          getDatingPreferences(),
        ]);

        setMode(savedMode);
        setInterest(savedInterests[0] ?? null);
      } catch (error) {
        console.error('Load settings error:', error);
        setErrorMessage('Unable to load settings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [visible]);

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setErrorMessage('');

      if (!mode) {
        setErrorMessage('Please select what you are looking for.');
        return;
      }

      if (mode === 'date' && !interest) {
        setErrorMessage('Please select who you are interested in.');
        return;
      }

      setSaving(true);

      await saveMode(mode);

      if (mode === 'date' && interest) {
        await saveDatingPreferences([interest]);
      }

      onSaved?.(mode);
      onClose();
    } catch (error) {
      console.error('Save settings error:', error);
      setErrorMessage('Unable to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={saving}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Discovery Preference </Text>

            <TouchableOpacity
              style={styles.checkButton}
              onPress={handleSave}
              disabled={saving || loading}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="checkmark"
                  size={22}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#FF8D88" />
            </View>
          ) : (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
              >
                <Text style={styles.sectionTitleFirst}>
                  What are you looking for?
                </Text>

                <OptionRow
                  label="Date"
                  selected={mode === 'date'}
                  onPress={() => setMode('date')}
                />

                <OptionRow
                  label="Friends"
                  selected={mode === 'friends'}
                  onPress={() => setMode('friends')}
                />

                {mode === 'date' && (
                  <>
                    <Text style={styles.sectionTitle}>
                      Who are you interested in?
                    </Text>

                    <OptionRow
                      label="Men"
                      selected={interest === 'men'}
                      onPress={() => setInterest('men')}
                    />

                    <OptionRow
                      label="Women"
                      selected={interest === 'women'}
                      onPress={() => setInterest('women')}
                    />

                    <OptionRow
                      label="Beyond Binary"
                      selected={interest === 'beyond_binary'}
                      onPress={() => setInterest('beyond_binary')}
                    />
                  </>
                )}
              </ScrollView>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  sheet: {
    maxHeight: '85%',
    width:'100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DDDDDD',
    marginBottom: 8,
  },

  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFB56F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '300',
  },

  center: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingBottom: 8,
  },

  sectionTitleFirst: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '700',
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '700',
  },

  option: {
    minHeight: 48,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
  },

  optionSelected: {
    backgroundColor: '#FFF0E8',
  },

  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0E0E0',
  },

  circleSelected: {
    backgroundColor: '#F19068',
  },

  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F19068',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorText: {
    marginTop: 8,
    color: '#C62828',
  },
});
