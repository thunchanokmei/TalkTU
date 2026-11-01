import React from 'react';
import { usePathname, useRouter } from 'expo-router';
import {
  Platform,
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
  numbered?: string[];
};

type Props = {
  language: PolicyLanguage;
  onChangeLanguage: (
    language: PolicyLanguage
  ) => void;

  title: string;
  updated: string;

  sections: PolicySection[];

  footer: string;
};

export default function PolicyPageLayout({
  language,
  onChangeLanguage,
  title,
  updated,
  sections,
  footer,
}: Props) {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  const pathname = usePathname();

  const webPolicyLinks =
    language === 'th'
      ? [
        {
          label: 'นโยบายความเป็นส่วนตัว',
          href: '/privacy-policy' as const,
        },
        {
          label: 'ข้อกำหนดการใช้บริการ',
          href: '/terms-of-service' as const,
        },
        {
          label: 'แนวทางชุมชน',
          href: '/community-guidelines' as const,
        },
        {
          label: 'การลบบัญชี',
          href: '/account-deletion' as const,
        },
      ]
      : [
        {
          label: 'Privacy Policy',
          href: '/privacy-policy' as const,
        },
        {
          label: 'Terms of Service',
          href: '/terms-of-service' as const,
        },
        {
          label: 'Community Guidelines',
          href: '/community-guidelines' as const,
        },
        {
          label: 'Account Deletion',
          href: '/account-deletion' as const,
        },
      ];

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.page}
    >
      <View style={styles.card}>
        {/* Top navigation */}
        <View style={styles.topRow}>
          {canGoBack ? (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                styles.backButtonPressed,
              ]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={
                language === 'th'
                  ? 'ย้อนกลับ'
                  : 'Go back'
              }
            >
              <Text
                style={styles.backButtonText}
              >
                ‹{' '}
                {language === 'th'
                  ? 'ย้อนกลับ'
                  : 'Back'}
              </Text>
            </Pressable>
          ) : (
            <View />
          )}

          {/* Language switch */}
          <View style={styles.languageRow}>
            <Pressable
              style={({ pressed }) => [
                styles.languageButton,

                language === 'th' &&
                styles.languageButtonActive,

                pressed &&
                styles.languageButtonPressed,
              ]}
              onPress={() =>
                onChangeLanguage('th')
              }
              accessibilityRole="button"
              accessibilityLabel="ภาษาไทย"
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
              style={({ pressed }) => [
                styles.languageButton,

                language === 'en' &&
                styles.languageButtonActive,

                pressed &&
                styles.languageButtonPressed,
              ]}
              onPress={() =>
                onChangeLanguage('en')
              }
              accessibilityRole="button"
              accessibilityLabel="English"
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
        </View>

        {/* Page title */}
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.updated}>
          {updated}
        </Text>

        {/* Policy sections */}
        {sections.map((section, index) => (
          <View
            key={`${section.heading}-${index}`}
          >
            <Text style={styles.heading}>
              {section.heading}
            </Text>

            {/* Paragraphs */}
            {section.paragraphs?.map(
              (
                paragraph,
                paragraphIndex
              ) => (
                <Text
                  key={`p-${paragraphIndex}`}
                  style={styles.text}
                >
                  {paragraph}
                </Text>
              ),
            )}

            {/* Bullet list */}
            {section.bullets?.map(
              (bullet, bulletIndex) => (
                <View
                  key={`b-${bulletIndex}`}
                  style={styles.listRow}
                >
                  <Text
                    style={styles.bullet}
                  >
                    •
                  </Text>

                  <Text
                    style={styles.listText}
                  >
                    {bullet}
                  </Text>
                </View>
              ),
            )}

            {/* Numbered list */}
            {section.numbered?.map(
              (item, itemIndex) => (
                <View
                  key={`n-${itemIndex}`}
                  style={styles.listRow}
                >
                  <Text
                    style={styles.number}
                  >
                    {itemIndex + 1}.
                  </Text>

                  <Text
                    style={styles.listText}
                  >
                    {item}
                  </Text>
                </View>
              ),
            )}
          </View>
        ))}

        {Platform.OS === 'web' && (
          <View style={styles.webPolicyNav}>
            <Text style={styles.webPolicyNavTitle}>TalkTU</Text>

            <View style={styles.webPolicyNavLinks}>
              {webPolicyLinks.map((link, index) => {
                const isCurrentPage = pathname === link.href;

                return (
                  <React.Fragment key={link.href}>
                    <Pressable
                      accessibilityRole="link"
                      disabled={isCurrentPage}
                      onPress={() => router.push(link.href)}
                      style={({ pressed }) => [
                        styles.webPolicyNavLink,
                        pressed && !isCurrentPage && styles.webPolicyNavLinkPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.webPolicyNavLinkText,
                          isCurrentPage && styles.webPolicyNavLinkTextActive,
                        ]}
                      >
                        {link.label}
                      </Text>
                    </Pressable>

                    {index < webPolicyLinks.length - 1 && (
                      <Text style={styles.webPolicyNavSeparator}>·</Text>
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {/* Footer */}
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

  /* -------------------------------------------------- */
  /* TOP BAR                                            */
  /* -------------------------------------------------- */

  topRow: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 20,
  },

  backButton: {
    minHeight: 36,

    justifyContent: 'center',

    paddingVertical: 7,
    paddingRight: 12,
  },

  backButtonPressed: {
    opacity: 0.6,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: '600',

    color: '#777777',
  },

  /* -------------------------------------------------- */
  /* LANGUAGE SWITCH                                    */
  /* -------------------------------------------------- */

  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },

  languageButton: {
    minWidth: 48,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 14,
    paddingVertical: 7,

    borderRadius: 999,

    backgroundColor: '#F3F3F3',
  },

  languageButtonActive: {
    backgroundColor: '#FF8F8F',
  },

  languageButtonPressed: {
    opacity: 0.75,
  },

  languageText: {
    fontSize: 13,
    fontWeight: '600',

    color: '#666666',
  },

  languageTextActive: {
    color: '#FFFFFF',
  },

  /* -------------------------------------------------- */
  /* CONTENT                                            */
  /* -------------------------------------------------- */

  title: {
    fontSize: 28,
    fontWeight: '700',

    lineHeight: 36,

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

    lineHeight: 25,

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

  /* -------------------------------------------------- */
  /* LISTS                                              */
  /* -------------------------------------------------- */

  listRow: {
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

  number: {
    width: 28,

    fontSize: 15,
    lineHeight: 23,

    color: '#555555',
  },

  listText: {
    flex: 1,

    fontSize: 15,
    lineHeight: 23,

    color: '#555555',
  },

  /* -------------------------------------------------- */
  /* FOOTER                                             */
  /* -------------------------------------------------- */

  footer: {
    marginTop: 36,

    fontSize: 13,

    color: '#999999',

    textAlign: 'center',
  },

  webPolicyNav: {
    marginTop: 28,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },

  webPolicyNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  webPolicyNavLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  webPolicyNavLink: {
    paddingVertical: 4,
  },

  webPolicyNavLinkPressed: {
    opacity: 0.6,
  },

  webPolicyNavLinkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  webPolicyNavLinkTextActive: {
    fontWeight: '700',
    textDecorationLine: 'none',
  },

  webPolicyNavSeparator: {
    fontSize: 14,
    opacity: 0.45,
  },
});