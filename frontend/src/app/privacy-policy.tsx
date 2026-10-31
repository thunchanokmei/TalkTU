import React, { useState } from 'react';

import PolicyPageLayout, {
  type PolicyLanguage,
} from '@/components/policy/PolicyPageLayout';

const SUPPORT_EMAIL =
  'talktu.team@gmail.com';

export default function PrivacyPolicyPage() {
  const [language, setLanguage] =
    useState<PolicyLanguage>('en');

  const isThai = language === 'th';

  return (
    <PolicyPageLayout
      language={language}
      onChangeLanguage={setLanguage}
      title={
        isThai
          ? 'นโยบายความเป็นส่วนตัวของ TalkTU'
          : 'TalkTU Privacy Policy'
      }
      updated={
        isThai
          ? 'อัปเดตล่าสุด: 28 ตุลาคม 2569'
          : 'Last updated: October 28, 2026'
      }
      introduction={
        isThai
          ? [
            'TalkTU ให้ความสำคัญกับความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้งาน นโยบายฉบับนี้อธิบายว่า TalkTU เก็บรวบรวม ใช้ จัดเก็บ เปิดเผย และจัดการข้อมูลอย่างไรเมื่อผู้ใช้ใช้งานแอปพลิเคชันและบริการที่เกี่ยวข้อง',
          ]
          : [
            'This Privacy Policy explains how TalkTU collects, uses, stores, discloses, and handles information when you use the TalkTU application and related services.',
          ]
      }
      sections={
        isThai
          ? [
            {
              heading:
                '1. ข้อมูลที่เราเก็บรวบรวม',
              paragraphs: [
                'TalkTU อาจเก็บรวบรวมข้อมูลที่ผู้ใช้ให้ไว้หรือข้อมูลที่จำเป็นต่อการสร้างและใช้งานบัญชี',
              ],
              bullets: [
                'รหัสนักศึกษา ซึ่งใช้ประกอบกระบวนการยืนยันตัวตนกับระบบของมหาวิทยาลัย',
                'รหัสประจำตัวผู้ใช้ที่ระบบสร้างขึ้น เพื่อเชื่อมโยงบัญชีกับข้อมูลและกิจกรรมภายใน TalkTU',
                'ชื่อที่ใช้แสดง',
                'วันเกิด',
                'เพศกำเนิด',
                'อัตลักษณ์ทางเพศ หากผู้ใช้เลือกให้ข้อมูล',
                'ความสนใจในการทำความรู้จักหรือการเดต',
                'รุ่นหรือชั้นปีของมหาวิทยาลัย (TU generation)',
                'คณะ',
                'สาขาหรือหลักสูตรการศึกษา',
                'ความสนใจ (Interests)',
                'ข้อมูลแนะนำตัว (Bio)',
                'ส่วนสูง หากผู้ใช้เลือกให้ข้อมูล',
                'รูปภาพโปรไฟล์',
                'โพสต์ ความคิดเห็น และการตอบกลับความคิดเห็น',
                'การกด Like การ Swipe และข้อมูลการจับคู่',
                'ข้อความแชท',
                'ข้อมูลการบล็อกและการยกเลิกการจับคู่',
                'รายงานเกี่ยวกับบัญชี เนื้อหา หรือพฤติกรรม รวมถึงเหตุผลและรายละเอียดที่ผู้ใช้เลือกส่ง',
                'ตัวระบุของข้อมูลภายในระบบ เช่น รหัสโพสต์ ความคิดเห็น ข้อความ หรือการจับคู่',
                'วันที่และเวลาที่เกี่ยวข้องกับกิจกรรมภายในระบบ',
                'ข้อมูลที่จำเป็นต่อการยืนยันตัวตน การจัดการ session การวินิจฉัยข้อผิดพลาด และการรักษาความปลอดภัยของระบบ',
              ],
            },

            {
              heading:
                '2. การยืนยันตัวตนผ่านบัญชี TU',
              paragraphs: [
                'TalkTU ใช้ข้อมูลบัญชีมหาวิทยาลัยธรรมศาสตร์เพื่อยืนยันตัวตนและตรวจสอบสิทธิ์ในการใช้งาน',
                'รหัสผ่านบัญชี TU ใช้เฉพาะในกระบวนการยืนยันตัวตน และ TalkTU ไม่จัดเก็บรหัสผ่านบัญชี TU ไว้ในฐานข้อมูลของแอปพลิเคชัน',
                'TalkTU เชื่อมต่อกับ TU REST API เพื่อรับข้อมูลที่จำเป็นต่อการให้บริการ เช่น อีเมลมหาวิทยาลัย ข้อมูลคณะ และข้อมูลสาขาหรือหลักสูตรการศึกษา',
              ],
            },

            {
              heading:
                '3. วิธีที่เราใช้ข้อมูล',
              paragraphs: [
                'TalkTU ใช้ข้อมูลเพื่อให้บริการและดูแลระบบ ยืนยันผู้ใช้ที่มีสิทธิ์ใช้งาน สร้างและแสดงโปรไฟล์ รองรับการค้นพบผู้ใช้ การ Swipe การ Like และการจับคู่ ให้บริการแชทและ Feed จัดการการตั้งค่าบัญชี รองรับ Report, Block และ Unmatch รักษาความปลอดภัย ป้องกันการใช้งานในทางที่ผิด ให้การสนับสนุน และปฏิบัติตามข้อกำหนดที่เกี่ยวข้อง',
              ],
            },

            {
              heading:
                '4. เนื้อหาที่ผู้ใช้สร้างขึ้น',
              paragraphs: [
                'ข้อมูลหรือเนื้อหาที่ผู้ใช้เลือกเผยแพร่หรือส่งให้ผู้ใช้อื่นอาจปรากฏแก่ผู้ใช้อื่นตามการทำงานของ TalkTU เช่น ข้อมูลโปรไฟล์ รูปภาพโปรไฟล์ โพสต์ ความคิดเห็น การตอบกลับ และข้อความที่ส่งผ่านระบบแชท',
                'ผู้ใช้ควรพิจารณาข้อมูลก่อนเผยแพร่หรือส่งให้ผู้อื่น เนื่องจากผู้รับอาจบันทึก คัดลอก หรือเผยแพร่ข้อมูลต่อได้',
              ],
            },

            {
              heading:
                '5. ผู้ให้บริการภายนอก',
              paragraphs: [
                'TalkTU ใช้ Supabase สำหรับบริการระบบหลังบ้านบางส่วน เช่น Authentication, Database, Storage, Realtime และบริการทางเทคนิคที่จำเป็นต่อการทำงานของระบบ',
                'ข้อมูลที่ประมวลผลผ่านบริการดังกล่าวอาจรวมถึงข้อมูลบัญชี ข้อมูลโปรไฟล์ เนื้อหา ข้อความ การจับคู่ ข้อมูลด้านความปลอดภัย และไฟล์หรือรูปภาพที่ผู้ใช้อัปโหลด ทั้งนี้ขึ้นอยู่กับฟังก์ชันที่ใช้งาน',
                'TalkTU จะส่งหรือประมวลผลข้อมูลผ่านผู้ให้บริการภายนอกเท่าที่จำเป็นต่อการให้บริการ',
              ],
            },

            {
              heading:
                '6. รายงาน ความปลอดภัย และการดูแลชุมชน',
              paragraphs: [
                'เมื่อผู้ใช้รายงานโปรไฟล์ เนื้อหา หรือพฤติกรรม TalkTU อาจจัดเก็บข้อมูลที่เกี่ยวข้องกับรายงานเพื่อใช้ตรวจสอบปัญหาด้านความปลอดภัย บังคับใช้ข้อกำหนดและแนวทางชุมชน และดำเนินการต่อการใช้งานที่ไม่เหมาะสม',
              ],
            },

            {
              heading:
                '7. การจัดเก็บและความปลอดภัยของข้อมูล',
              paragraphs: [
                'TalkTU ใช้มาตรการทางเทคนิคและการบริหารจัดการที่เหมาะสมเพื่อป้องกันข้อมูลจากการเข้าถึง การเปิดเผย การเปลี่ยนแปลง การสูญหาย หรือการทำลายโดยไม่ได้รับอนุญาต',
                'อย่างไรก็ตาม ไม่มีระบบจัดเก็บข้อมูลหรือการส่งข้อมูลผ่านอินเทอร์เน็ตใดที่สามารถรับประกันความปลอดภัยได้อย่างสมบูรณ์',
              ],
            },

            {
              heading:
                '8. ระยะเวลาการจัดเก็บข้อมูล',
              paragraphs: [
                'TalkTU เก็บข้อมูลเท่าที่จำเป็นต่อการให้บริการ รักษาความปลอดภัยและความถูกต้องของระบบ จัดการข้อพิพาท ป้องกันการใช้งานในทางที่ผิด และปฏิบัติตามข้อกำหนดทางกฎหมายที่เกี่ยวข้อง',
                'ข้อมูลบางประเภทที่เกี่ยวข้องกับความปลอดภัย การรายงาน หรือการดูแลระบบอาจถูกเก็บรักษาไว้เท่าที่จำเป็นเพื่อจัดการเหตุการณ์หรือปฏิบัติตามข้อกำหนดที่เกี่ยวข้อง',
              ],
            },

            {
              heading:
                '9. การลบบัญชีและข้อมูล',
              paragraphs: [
                'ผู้ใช้สามารถขอลบบัญชี TalkTU อย่างถาวรได้ที่ Profile → Account Settings → Delete Account',
                `หากไม่สามารถเข้าถึงแอปได้ ผู้ใช้สามารถส่งคำขอลบผ่านหน้า Account Deletion ของ TalkTU หรือติดต่อ ${SUPPORT_EMAIL}`,
                'เมื่อกระบวนการลบบัญชีเสร็จสมบูรณ์ TalkTU จะลบบัญชีและข้อมูลส่วนบุคคลที่เกี่ยวข้องออกจากระบบที่ใช้งานอยู่ตามกระบวนการของระบบ ยกเว้นข้อมูลที่จำเป็นต้องเก็บรักษาเพื่อความปลอดภัย การป้องกันการทุจริต การจัดการข้อพิพาท หรือหน้าที่ตามกฎหมาย',
              ],
            },

            {
              heading:
                '10. ข้อกำหนดด้านอายุ',
              paragraphs: [
                'TalkTU มีไว้สำหรับนักศึกษามหาวิทยาลัยธรรมศาสตร์ที่มีสิทธิ์ใช้งานและมีอายุตั้งแต่ 18 ปีบริบูรณ์ขึ้นไป',
              ],
            },

            {
              heading:
                '11. การเปลี่ยนแปลงนโยบาย',
              paragraphs: [
                'TalkTU อาจปรับปรุงนโยบายนี้เมื่อฟังก์ชัน วิธีการประมวลผลข้อมูล หรือข้อกำหนดที่เกี่ยวข้องเปลี่ยนแปลง โดยจะแสดงวันที่อัปเดตล่าสุดของนโยบาย',
              ],
            },

            {
              heading:
                '12. ช่องทางติดต่อ',
              paragraphs: [
                'หากมีคำถาม ข้อกังวลด้านความเป็นส่วนตัว หรือคำขอเกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อทีม TalkTU ผ่านช่องทางอย่างเป็นทางการดังต่อไปนี้',
              ],
              bullets: [
                'อีเมล: talktu.team@gmail.com',
                'LINE OA: @927qejxh',
                'Instagram: talktu.team',
              ],
            },
          ]
          : [
            {
              heading:
                '1. Information we collect',
              paragraphs: [
                'TalkTU may collect information that you provide or that is necessary to create and operate your account.',
              ],
              bullets: [
                'Student ID used as part of authentication with Thammasat University systems',
                'A system-generated user identifier used to link your account with information and activity within TalkTU',
                'Display name',
                'Date of birth',
                'Sex assigned at birth',
                'Gender identity, if you choose to provide it',
                'Interest in meeting people or dating',
                'TU generation',
                'Faculty',
                'Academic program or department',
                'Interests',
                'Biography',
                'Height, if you choose to provide it',
                'Profile photos',
                'Posts, comments, and comment replies',
                'Likes, swipes, and matching information',
                'Chat messages',
                'Blocking and unmatching activity',
                'Reports concerning accounts, content, or behavior, including reasons and additional details you choose to provide',
                'Record identifiers such as post, comment, message, and match identifiers',
                'Timestamps associated with activity within the service',
                'Information necessary for authentication, session management, troubleshooting, and service security',
              ],
            },

            {
              heading:
                '2. TU account authentication',
              paragraphs: [
                'TalkTU uses Thammasat University account information to authenticate users and verify their eligibility to use the service.',
                'Your TU password is used only during the authentication process. TalkTU does not store your TU account password in the TalkTU application database.',
                'TalkTU connects to the TU REST API to obtain information necessary to provide the service, such as your TU email address, faculty information, and academic program or department information.',
              ],
            },

            {
              heading:
                '3. How we use your information',
              paragraphs: [
                'We use information to provide and operate TalkTU, authenticate eligible users, create and display profiles, support discovery, swipes, Likes and matching, provide chat and Feed features, manage account preferences, support Report, Block and Unmatch features, protect users and the service, prevent misuse, provide support, and comply with applicable requirements.',
              ],
            },

            {
              heading:
                '4. User-generated content',
              paragraphs: [
                'Information or content that you choose to publish or send to other TalkTU users may be visible to those users according to the features of the service. This may include profile information, profile photos, posts, comments, replies, and chat messages.',
                'You should review information before publishing or sending it because recipients may save, copy, or further distribute it.',
              ],
            },

            {
              heading:
                '5. Service providers',
              paragraphs: [
                'TalkTU uses Supabase for certain backend services, including authentication, database services, storage, realtime functionality, and other technical infrastructure necessary to operate TalkTU.',
                'Information processed through these services may include account information, profile information, content, messages, matching information, safety-related information, and files or images uploaded by users, depending on the features used.',
                'Information is provided to or processed by service providers only as necessary to operate the service.',
              ],
            },

            {
              heading:
                '6. Reports, safety, and moderation',
              paragraphs: [
                'When you report a profile, content, or behavior, TalkTU may retain information related to the report in order to investigate safety concerns, enforce the Terms and Community Guidelines, and respond to misuse or abuse.',
              ],
            },

            {
              heading:
                '7. Data storage and security',
              paragraphs: [
                'TalkTU uses reasonable technical and organizational measures to protect information against unauthorized access, disclosure, alteration, loss, or destruction.',
                'However, no storage system or internet transmission can be guaranteed to be completely secure.',
              ],
            },

            {
              heading:
                '8. Data retention',
              paragraphs: [
                'TalkTU retains information only for as long as necessary to provide the service, maintain security and service integrity, resolve disputes, prevent misuse, and comply with applicable legal requirements.',
                'Certain safety, reporting, or moderation information may be retained where reasonably necessary to investigate incidents or comply with applicable requirements.',
              ],
            },

            {
              heading:
                '9. Account and data deletion',
              paragraphs: [
                'You may request permanent deletion of your TalkTU account through Profile → Account Settings → Delete Account.',
                `If you no longer have access to the app, you may submit a deletion request through the TalkTU Account Deletion page or contact ${SUPPORT_EMAIL}.`,
                'When account deletion is completed, TalkTU removes the account and associated personal data from its active systems in accordance with the account-deletion process, except where information must be retained for legitimate safety, fraud-prevention, dispute-resolution, or legal purposes.',
              ],
            },

            {
              heading:
                '10. Age requirement',
              paragraphs: [
                'TalkTU is intended only for eligible Thammasat University students who are at least 18 years old.',
              ],
            },

            {
              heading:
                '11. Changes to this policy',
              paragraphs: [
                'TalkTU may update this Privacy Policy when its features, data practices, or applicable requirements change. The current policy will display its latest update date.',
              ],
            },

            {
              heading:
                '12. Contact us',
              paragraphs: [
                'If you have questions, privacy concerns, or requests relating to your personal data, you can contact the TalkTU team through the following official channels:',
              ],
              bullets: [
                'Contact email: talktu.team@gmail.com',
                'LINE OA: @927qejxh',
                'Instagram: talktu.team',
              ],
            },
          ]
      }
      footer={
        isThai
          ? 'TalkTU · นโยบายความเป็นส่วนตัว'
          : 'TalkTU · Privacy Policy'
      }
    />
  );
}