import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type PolicyLanguage = 'en' | 'th';

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Props = {
  language: PolicyLanguage;
  onChangeLanguage: (language: PolicyLanguage) => void;

  title: string;
  updated: string;

  introduction?: string[];

  sections: PolicySection[];

  footer: string;
};

export default function PolicyPageLayout({
  language,
  onChangeLanguage,
  title,
  updated,
  introduction = [],
  sections,
  footer,
}: Props) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <View style={styles.languageRow}>
          <Pressable
            style={[
              styles.languageButton,
              language === 'th' &&
                styles.languageButtonActive,
            ]}
            onPress={() => onChangeLanguage('th')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'th' &&
                  styles.languageTextActive,
              ]}
            >
              ไทย
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.languageButton,
              language === 'en' &&
                styles.languageButtonActive,
            ]}
            onPress={() => onChangeLanguage('en')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'en' &&
                  styles.languageTextActive,
              ]}
            >
              EN
            </Text>
          </Pressable>
        </View>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.updated}>
          {updated}
        </Text>

        {introduction.map((paragraph, index) => (
          <Text
            key={`intro-${index}`}
            style={styles.text}
          >
            {paragraph}
          </Text>
        ))}

        {sections.map((section, index) => (
          <View key={`${section.heading}-${index}`}>
            <Text style={styles.heading}>
              {section.heading}
            </Text>

            {section.paragraphs?.map(
              (paragraph, paragraphIndex) => (
                <Text
                  key={`p-${paragraphIndex}`}
                  style={styles.text}
                >
                  {paragraph}
                </Text>
              ),
            )}

            {section.bullets?.map(
              (bullet, bulletIndex) => (
                <View
                  key={`b-${bulletIndex}`}
                  style={styles.bulletRow}
                >
                  <Text style={styles.bullet}>
                    •
                  </Text>

                  <Text style={styles.bulletText}>
                    {bullet}
                  </Text>
                </View>
              ),
            )}
          </View>
        ))}

        <Text style={styles.footer}>
          {footer}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,

    boxShadow:
      '0px 8px 24px rgba(0, 0, 0, 0.08)',
  },

  languageRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    gap: 8,
    marginBottom: 18,
  },

  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F3F3F3',
  },

  languageButtonActive: {
    backgroundColor: '#FF8F8F',
  },

  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },

  languageTextActive: {
    color: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2B2B2B',
    marginBottom: 6,
  },

  updated: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 24,
  },

  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2B2B',
    marginTop: 26,
    marginBottom: 8,
  },

  text: {
    fontSize: 15,
    lineHeight: 23,
    color: '#555555',
    marginBottom: 10,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
  },

  bullet: {
    width: 18,
    fontSize: 15,
    lineHeight: 23,
    color: '#555555',
  },

  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: '#555555',
  },

  footer: {
    marginTop: 36,
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
});