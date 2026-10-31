import React, { useState } from 'react';

import { useRouter } from 'expo-router';

import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Language = 'en' | 'th';

const SUPPORT_EMAIL =
  'talktu.team@gmail.com';

export default function AccountDeletionPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<Language>('en');

  const isThai = language === 'th';

  const canGoBack = router.canGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    }
  };

  const handleRequestDeletion = async () => {
    const subject = isThai
      ? 'คำขอลบบัญชี TalkTU'
      : 'TalkTU Account Deletion Request';

    const body = isThai
      ? `สวัสดีทีม TalkTU

ฉันต้องการลบบัญชี TalkTU และข้อมูลส่วนบุคคลที่เกี่ยวข้อง

TU Username:

ฉันเข้าใจว่าการลบบัญชีเป็นการดำเนินการถาวร

ขอบคุณ`
      : `Hello TalkTU Team,

I would like to permanently delete my TalkTU account and associated personal data.

TU Username:

I understand that account deletion is permanent.

Thank you.`;

    const encodedSubject =
      encodeURIComponent(subject);

    const encodedBody =
      encodeURIComponent(body);

    if (Platform.OS === 'web') {
      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(
          SUPPORT_EMAIL,
        )}` +
        `&su=${encodedSubject}` +
        `&body=${encodedBody}`;

      await Linking.openURL(gmailUrl);
      return;
    }

    const mailtoUrl =
      `mailto:${SUPPORT_EMAIL}` +
      `?subject=${encodedSubject}` +
      `&body=${encodedBody}`;

    await Linking.openURL(mailtoUrl);
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
                isThai
                  ? 'ย้อนกลับ'
                  : 'Go back'
              }
            >
              <Text
                style={styles.backButtonText}
              >
                ‹{' '}
                {isThai
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

                isThai &&
                  styles.languageButtonActive,

                pressed &&
                  styles.languageButtonPressed,
              ]}
              onPress={() =>
                setLanguage('th')
              }
              accessibilityRole="button"
              accessibilityLabel="ภาษาไทย"
            >
              <Text
                style={[
                  styles.languageText,

                  isThai &&
                    styles.languageTextActive,
                ]}
              >
                ไทย
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.languageButton,

                !isThai &&
                  styles.languageButtonActive,

                pressed &&
                  styles.languageButtonPressed,
              ]}
              onPress={() =>
                setLanguage('en')
              }
              accessibilityRole="button"
              accessibilityLabel="English"
            >
              <Text
                style={[
                  styles.languageText,

                  !isThai &&
                    styles.languageTextActive,
                ]}
              >
                EN
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.title}>
          {isThai
            ? 'ลบบัญชี TalkTU'
            : 'Delete your TalkTU account'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'ผู้ใช้ TalkTU สามารถขอลบบัญชีและข้อมูลส่วนบุคคลที่เกี่ยวข้องได้ การลบบัญชีเป็นการดำเนินการถาวรและไม่สามารถย้อนกลับได้เมื่อกระบวนการเสร็จสมบูรณ์'
            : 'TalkTU users can request deletion of their account and associated personal data. Account deletion is permanent and cannot be reversed once the process is completed.'}
        </Text>

        {/* Delete inside app */}
        <Text style={styles.heading}>
          {isThai
            ? 'ลบบัญชีผ่านแอป TalkTU'
            : 'Delete your account in TalkTU'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'หากยังสามารถเข้าใช้งาน TalkTU ได้ ให้เปิดแอปและไปที่ Profile → Account Settings → Delete Account จากนั้นตรวจสอบข้อมูลและยืนยันคำขอลบบัญชี'
            : 'If you still have access to TalkTU, open the app and go to Profile → Account Settings → Delete Account, then review the information and confirm the deletion request.'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'การลบบัญชีผ่านฟังก์ชันภายในแอปเป็นวิธีหลักในการลบบัญชี TalkTU'
            : 'Using the in-app Delete Account feature is the primary method for deleting a TalkTU account.'}
        </Text>

        {/* Delete outside app */}
        <Text style={styles.heading}>
          {isThai
            ? 'ขอลบบัญชีเมื่อไม่สามารถเข้าแอปได้'
            : 'Request deletion without the app'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'หากไม่สามารถเข้าถึงแอป TalkTU ได้ เช่น ลบแอปออกจากอุปกรณ์หรือไม่สามารถเข้าสู่บัญชีได้ สามารถส่งคำขอลบบัญชีจากหน้านี้ได้'
            : 'If you no longer have access to the TalkTU app, for example because the app has been removed from your device or you cannot access your account, you may submit an account-deletion request from this page.'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'กดปุ่มด้านล่างเพื่อเปิดอีเมลสำหรับส่งคำขอไปยังทีม TalkTU'
            : 'Use the button below to open an email and send your request to the TalkTU team.'}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,

            pressed &&
              styles.buttonPressed,
          ]}
          onPress={
            handleRequestDeletion
          }
          accessibilityRole="button"
          accessibilityLabel={
            isThai
              ? 'ส่งคำขอลบบัญชี'
              : 'Request account deletion'
          }
        >
          <Text style={styles.buttonText}>
            {isThai
              ? 'ส่งคำขอลบบัญชี'
              : 'Request Account Deletion'}
          </Text>
        </Pressable>

        {/* Contact */}
        <View style={styles.contactBlock}>
          <Text style={styles.contactTitle}>
            {isThai
              ? 'ช่องทางติดต่อ'
              : 'Contact'}
          </Text>

          <Text style={styles.contact}>
            {isThai
              ? 'อีเมล: talktu.team@gmail.com'
              : 'Contact email: talktu.team@gmail.com'}
          </Text>

          <Text style={styles.contact}>
            LINE OA: @927qejxh
          </Text>

          <Text style={styles.contact}>
            Instagram: talktu.team
          </Text>
        </View>

        {/* Data removed */}
        <Text style={styles.heading}>
          {isThai
            ? 'ข้อมูลที่เกี่ยวข้องกับบัญชี'
            : 'Account-related data'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'เมื่อกระบวนการลบบัญชีเสร็จสมบูรณ์ TalkTU จะลบบัญชีและข้อมูลที่เชื่อมโยงกับบัญชีออกจากระบบที่ใช้งานอยู่ตามกระบวนการของระบบ'
            : 'When account deletion is completed, TalkTU removes the account and information associated with the account from its active systems in accordance with the account-deletion process.'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'ข้อมูลดังกล่าวอาจรวมถึงข้อมูลโปรไฟล์ รูปภาพ ข้อมูลและความชอบที่ผู้ใช้ให้ไว้ โพสต์ ความคิดเห็น การตอบกลับ การกด Like การ Swipe การจับคู่ ข้อความ และข้อมูลบัญชีอื่นที่เกี่ยวข้อง'
            : 'This may include profile information, photos, information and preferences provided by the user, posts, comments, replies, Likes, swipes, matches, messages, and other account-related information.'}
        </Text>

        {/* Possible retention */}
        <Text style={styles.heading}>
          {isThai
            ? 'ข้อมูลบางประเภทที่อาจต้องเก็บรักษา'
            : 'Information that may need to be retained'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'ข้อมูลบางประเภทอาจได้รับการเก็บรักษาไว้เท่าที่จำเป็นเพื่อความปลอดภัย การป้องกันการทุจริต การตรวจสอบการใช้งานในทางที่ผิด การจัดการข้อพิพาท การใช้สิทธิเรียกร้อง หรือหน้าที่ตามกฎหมาย ตามที่อธิบายไว้ในนโยบายความเป็นส่วนตัวของ TalkTU'
            : 'Certain information may be retained where reasonably necessary for safety, fraud prevention, investigation of misuse, dispute resolution, the establishment or defense of legal claims, or applicable legal obligations, as described in the TalkTU Privacy Policy.'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'ข้อมูลที่อยู่ในระบบสำรองของผู้ให้บริการอาจคงอยู่ตามรอบระยะเวลาและกระบวนการของผู้ให้บริการ ก่อนที่จะถูกลบตามวงจรการทำงานปกติของระบบดังกล่าว'
            : "Information contained in service-provider backup systems may remain for the period required by the provider's backup and deletion processes before being removed through the normal lifecycle of those systems."}
        </Text>

        {/* Verification */}
        <Text style={styles.heading}>
          {isThai
            ? 'การยืนยันคำขอ'
            : 'Verification of deletion requests'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'สำหรับคำขอที่ส่งจากภายนอกแอป TalkTU อาจขอข้อมูลเพิ่มเติมเท่าที่จำเป็นเพื่อยืนยันว่าผู้ส่งคำขอเป็นเจ้าของบัญชี ก่อนดำเนินการลบบัญชี'
            : 'For deletion requests submitted outside the app, TalkTU may request additional information where reasonably necessary to verify that the requester owns the account before processing the deletion request.'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'ทีม TalkTU จะไม่ขอรหัสผ่านบัญชี TU ผ่านอีเมล LINE OA หรือ Instagram'
            : 'The TalkTU team will not ask for your TU account password through email, LINE OA, or Instagram.'}
        </Text>

        {/* Permanent action */}
        <Text style={styles.heading}>
          {isThai
            ? 'การลบบัญชีเป็นการดำเนินการถาวร'
            : 'Account deletion is permanent'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'หลังจากกระบวนการลบบัญชีเสร็จสมบูรณ์ ผู้ใช้อาจไม่สามารถกู้คืนบัญชี โปรไฟล์ การจับคู่ ข้อความ หรือข้อมูลอื่นที่ถูกลบไปแล้วได้'
            : 'After the account-deletion process is completed, you may not be able to recover your account, profile, matches, messages, or other information that has been deleted.'}
        </Text>

        <Text style={styles.footer}>
          {isThai
            ? 'TalkTU · การลบบัญชี'
            : 'TalkTU · Account Deletion'}
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

  /* TOP BAR */

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

  /* LANGUAGE */

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
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },

  languageTextActive: {
    color: '#FFFFFF',
  },

  /* CONTENT */

  title: {
    fontSize: 28,
    fontWeight: '700',

    lineHeight: 36,

    color: '#2B2B2B',

    marginBottom: 18,
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

  /* DELETION BUTTON */

  button: {
    marginTop: 16,

    backgroundColor: '#FF8F8F',

    borderRadius: 16,

    paddingVertical: 14,
    paddingHorizontal: 20,

    alignItems: 'center',
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 16,
    fontWeight: '700',
  },

  /* CONTACT */

  contactBlock: {
    marginTop: 20,

    padding: 16,

    borderRadius: 16,

    backgroundColor: '#FFF8F5',

    alignItems: 'center',
  },

  contactTitle: {
    marginBottom: 8,

    fontSize: 15,
    fontWeight: '700',

    color: '#555555',
  },

  contact: {
    fontSize: 14,
    lineHeight: 22,

    color: '#777777',

    textAlign: 'center',
  },

  /* FOOTER */

  footer: {
    marginTop: 36,

    fontSize: 13,

    color: '#999999',

    textAlign: 'center',
  },
});