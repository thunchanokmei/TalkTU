import React, { useState } from 'react';

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
  const [language, setLanguage] =
    useState<Language>('en');

  const isThai = language === 'th';

  const handleRequestDeletion = async () => {
    const subject = isThai
      ? 'คำขอลบบัญชี TalkTU'
      : 'TalkTU Account Deletion Request';

    const body = isThai
      ? `สวัสดีทีม TalkTU

ฉันต้องการลบบัญชี TalkTU และข้อมูลส่วนบุคคลที่เกี่ยวข้องอย่างถาวร

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
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <View style={styles.languageRow}>
          <Pressable
            style={[
              styles.languageButton,
              isThai &&
              styles.languageButtonActive,
            ]}
            onPress={() =>
              setLanguage('th')
            }
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
            style={[
              styles.languageButton,
              !isThai &&
              styles.languageButtonActive,
            ]}
            onPress={() =>
              setLanguage('en')
            }
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

        <Text style={styles.title}>
          {isThai
            ? 'ลบบัญชี TalkTU'
            : 'Delete your TalkTU account'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'ผู้ใช้ TalkTU สามารถขอลบบัญชีและข้อมูลส่วนบุคคลที่เกี่ยวข้องอย่างถาวรได้'
            : 'TalkTU users can request permanent deletion of their account and associated personal data.'}
        </Text>

        <Text style={styles.heading}>
          {isThai
            ? 'ลบบัญชีผ่านแอป TalkTU'
            : 'Delete your account in TalkTU'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'เปิด TalkTU แล้วไปที่ Profile → Account Settings → Delete Account จากนั้นยืนยันคำขอลบบัญชี'
            : 'Open TalkTU, go to Profile → Account Settings → Delete Account, then confirm the deletion request.'}
        </Text>

        <Text style={styles.heading}>
          {isThai
            ? 'ขอลบบัญชีเมื่อไม่สามารถเข้าแอปได้'
            : 'Request deletion without the app'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'หากไม่สามารถเข้าถึงแอป TalkTU ได้ สามารถส่งคำขอลบบัญชีโดยติดต่อทีม TalkTU'
            : 'If you no longer have access to the TalkTU app, you can request account deletion by contacting the TalkTU team.'}
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
        >
          <Text style={styles.buttonText}>
            {isThai
              ? 'ส่งคำขอลบบัญชี'
              : 'Request Account Deletion'}
          </Text>
        </Pressable>

        <View style={styles.contactBlock}>
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
        <Text style={styles.heading}>
          {isThai
            ? 'ข้อมูลที่เกี่ยวข้องกับบัญชี'
            : 'Account-related data'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'เมื่อกระบวนการลบบัญชีเสร็จสมบูรณ์ TalkTU จะลบบัญชีและข้อมูลที่เชื่อมโยงกับบัญชีออกจากระบบที่ใช้งานอยู่ตามกระบวนการของระบบ ซึ่งอาจรวมถึงข้อมูลโปรไฟล์ รูปภาพ การตั้งค่า โพสต์ ความคิดเห็น การตอบกลับ Likes, Swipes, Matches, ข้อความ และข้อมูลบัญชีอื่นที่เกี่ยวข้อง'
            : 'When account deletion is completed, TalkTU removes the account and information associated with the account from its active systems in accordance with the deletion process. This may include profile information, photos, preferences, posts, comments, replies, Likes, Swipes, Matches, messages, and other account-related information.'}
        </Text>

        <Text style={styles.heading}>
          {isThai
            ? 'ข้อมูลบางประเภทที่อาจต้องเก็บรักษา'
            : 'Information that may need to be retained'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'ข้อมูลบางประเภทอาจได้รับการเก็บรักษาไว้เท่าที่จำเป็นเพื่อความปลอดภัย การป้องกันการทุจริต การตรวจสอบการใช้งานในทางที่ผิด การจัดการข้อพิพาท หรือหน้าที่ตามกฎหมาย ตามที่อธิบายไว้ในนโยบายความเป็นส่วนตัวของ TalkTU'
            : 'Certain information may be retained where reasonably necessary for safety, fraud prevention, investigation of misuse, dispute resolution, or applicable legal obligations, as described in the TalkTU Privacy Policy.'}
        </Text>

        <Text style={styles.heading}>
          {isThai
            ? 'การยืนยันคำขอ'
            : 'Verification and processing'}
        </Text>

        <Text style={styles.text}>
          {isThai
            ? 'สำหรับคำขอที่ส่งจากภายนอกแอป TalkTU อาจขอให้ผู้ส่งคำขอยืนยันว่าเป็นเจ้าของบัญชีก่อนดำเนินการ'
            : 'For deletion requests submitted outside the app, TalkTU may ask you to verify that you own the account before processing the request.'}
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
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },

  languageTextActive: {
    color: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2B2B2B',
    marginBottom: 18,
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

  button: {
    marginTop: 20,
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

  contactBlock: {
    marginTop: 12,
    alignItems: 'center',
  },

  contact: {
    fontSize: 14,
    lineHeight: 22,
    color: '#777777',
    textAlign: 'center',
  },

  footer: {
    marginTop: 36,
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
});