import React, { useState } from 'react';

import PolicyPageLayout, {
  type PolicyLanguage,
} from '@/components/policy/PolicyPageLayout';

const SUPPORT_EMAIL =
  'talktu.team@gmail.com';

export default function TermsOfServicePage() {
  const [language, setLanguage] =
    useState<PolicyLanguage>('en');

  const isThai = language === 'th';

  return (
    <PolicyPageLayout
      language={language}
      onChangeLanguage={setLanguage}
      title={
        isThai
          ? 'ข้อกำหนดการให้บริการของ TalkTU'
          : 'TalkTU Terms of Service'
      }
      updated={
        isThai
          ? 'อัปเดตล่าสุด: 28 ตุลาคม 2569'
          : 'Last updated: October 28, 2026'
      }
      introduction={
        isThai
          ? [
              'ข้อกำหนดการให้บริการฉบับนี้กำหนดเงื่อนไขในการเข้าถึงและใช้งาน TalkTU การสร้างบัญชีหรือใช้งาน TalkTU ถือว่าผู้ใช้ยอมรับข้อกำหนดฉบับนี้ นโยบายความเป็นส่วนตัว และแนวทางชุมชนของ TalkTU',
            ]
          : [
              'These Terms of Service govern your access to and use of TalkTU. By creating an account or using TalkTU, you agree to these Terms, the TalkTU Privacy Policy, and the TalkTU Community Guidelines.',
            ]
      }
      sections={
        isThai
          ? [
              {
                heading: '1. คุณสมบัติผู้ใช้งาน',
                paragraphs: [
                  'TalkTU มีไว้สำหรับนักศึกษามหาวิทยาลัยธรรมศาสตร์ที่มีสิทธิ์ใช้งานและมีอายุตั้งแต่ 18 ปีบริบูรณ์ขึ้นไป',
                  'ผู้ใช้ต้องให้ข้อมูลที่ถูกต้องและต้องไม่พยายามหลีกเลี่ยงข้อกำหนดด้านสิทธิ์การใช้งานหรืออายุ',
                ],
              },

              {
                heading: '2. บัญชีผู้ใช้',
                paragraphs: [
                  'ผู้ใช้มีหน้าที่รับผิดชอบต่อกิจกรรมที่ดำเนินการผ่านบัญชี TalkTU ของตนและต้องรักษาความปลอดภัยของการเข้าถึงบัญชี',
                  'ห้ามแอบอ้างบุคคลอื่น สร้างบัญชีแทนบุคคลอื่นโดยไม่ได้รับอนุญาต หรือใช้บัญชีของบุคคลอื่น',
                ],
              },

              {
                heading:
                  '3. การยืนยันตัวตนผ่าน TU',
                paragraphs: [
                  'TalkTU อาจใช้ข้อมูลบัญชีมหาวิทยาลัยธรรมศาสตร์เพื่อยืนยันตัวตนและตรวจสอบสิทธิ์ในการใช้บริการ',
                  'การให้บริการบางส่วนอาจขึ้นอยู่กับระบบยืนยันตัวตนหรือบริการภายนอกที่ TalkTU เชื่อมต่ออยู่',
                ],
              },

              {
                heading:
                  '4. การใช้งานที่ยอมรับได้',
                paragraphs: [
                  'ผู้ใช้ตกลงที่จะใช้งาน TalkTU โดยชอบด้วยกฎหมายและเป็นไปตามข้อกำหนดและแนวทางชุมชน',
                  'ห้ามใช้ TalkTU เพื่อคุกคามผู้อื่น เผยแพร่เนื้อหาที่ผิดกฎหมายหรือเป็นอันตราย ฉ้อโกง รบกวนระบบ หลีกเลี่ยงมาตรการด้านความปลอดภัย เข้าถึงระบบหรือบัญชีโดยไม่ได้รับอนุญาต หรือใช้แพลตฟอร์มในทางที่ผิด',
                ],
              },

              {
                heading:
                  '5. ฟังก์ชันของ TalkTU',
                bullets: [
                  'สร้างและจัดการโปรไฟล์',
                  'ค้นพบผู้ใช้รายอื่น',
                  'Swipe, Like และจับคู่กับผู้ใช้อื่นตามฟังก์ชันของระบบ',
                  'สนทนาผ่านระบบแชทตามเงื่อนไขที่ระบบกำหนด',
                  'เผยแพร่ ดู กด Like แสดงความคิดเห็น และตอบกลับเนื้อหาบน Feed',
                  'Report บัญชี เนื้อหา หรือพฤติกรรมที่อาจละเมิดข้อกำหนด',
                  'Block ผู้ใช้เพื่อป้องกันไม่ให้ทั้งสองฝ่ายพบเจอกันอีกตามการทำงานของระบบ',
                  'Unmatch เพื่อยุติความสัมพันธ์ในการจับคู่ โดยไม่ได้เป็นการ Block',
                ],
              },

              {
                heading:
                  '6. เนื้อหาที่ผู้ใช้สร้างขึ้น',
                paragraphs: [
                  'ผู้ใช้มีหน้าที่รับผิดชอบต่อเนื้อหาที่ส่งเข้าสู่ TalkTU และต้องมีสิทธิในการเผยแพร่เนื้อหานั้น',
                  'ผู้ใช้ยังคงเป็นเจ้าของเนื้อหาที่ตนสร้างขึ้น แต่อนุญาตให้ TalkTU จัดเก็บ ประมวลผล แสดงผล และดำเนินการกับเนื้อหาดังกล่าวเท่าที่จำเป็นเพื่อให้บริการ รักษาความปลอดภัย และดำเนินงานของแอปพลิเคชัน',
                ],
              },

              {
                heading:
                  '7. การดูแลและบังคับใช้กฎ',
                paragraphs: [
                  'TalkTU อาจตรวจสอบรายงานและดำเนินมาตรการที่เหมาะสมเพื่อปกป้องผู้ใช้และบริการ รวมถึงลบหรือจำกัดเนื้อหา จำกัดฟังก์ชัน ระงับบัญชีชั่วคราว หรือยุติบัญชีอย่างถาวร',
                  'กรณีที่มีความร้ายแรงหรือมีการละเมิดซ้ำอาจได้รับการดำเนินการทันทีตามความเหมาะสม',
                ],
              },

              {
                heading:
                  '8. Report, Block และ Unmatch',
                paragraphs: [
                  'TalkTU มีฟังก์ชันสำหรับรายงานเนื้อหาหรือพฤติกรรมที่ไม่เหมาะสม บล็อกผู้ใช้ และยกเลิกการจับคู่ การใช้ระบบรายงานหรือระบบความปลอดภัยในทางที่ผิดอาจนำไปสู่การดำเนินการต่อบัญชีผู้ใช้',
                ],
              },

              {
                heading:
                  '9. การลบบัญชี',
                paragraphs: [
                  'ผู้ใช้สามารถขอลบบัญชี TalkTU อย่างถาวรได้ผ่าน Profile → Account Settings → Delete Account',
                  'หากไม่สามารถเข้าถึงแอปได้ สามารถใช้หน้า Account Deletion ของ TalkTU หรือติดต่อทีม TalkTU',
                  'รายละเอียดเกี่ยวกับการลบและการเก็บรักษาข้อมูลเป็นไปตามนโยบายความเป็นส่วนตัวของ TalkTU',
                ],
              },

              {
                heading:
                  '10. ความพร้อมใช้งานของบริการ',
                paragraphs: [
                  'TalkTU อาจเปลี่ยนแปลง ปรับปรุง ระงับ หรือยกเลิกฟังก์ชันบางอย่างเมื่อจำเป็น และไม่รับประกันว่าทุกฟังก์ชันจะพร้อมใช้งานตลอดเวลาหรือทำงานโดยไม่มีข้อผิดพลาด',
                ],
              },

              {
                heading: '11. ความปลอดภัย',
                paragraphs: [
                  'TalkTU ไม่สามารถรับประกันตัวตน เจตนา พฤติกรรม หรือความถูกต้องของข้อมูลที่ผู้ใช้อื่นให้ไว้',
                  'ผู้ใช้ควรใช้วิจารณญาณในการสื่อสารหรือพบปะกับผู้ใช้อื่น รวมถึงการนัดพบกันนอกแอปพลิเคชัน',
                ],
              },

              {
                heading:
                  '12. ความเป็นส่วนตัว',
                paragraphs: [
                  'รายละเอียดเกี่ยวกับวิธีที่ TalkTU เก็บรวบรวม ใช้ จัดเก็บ และลบข้อมูลส่วนบุคคลระบุไว้ในนโยบายความเป็นส่วนตัวของ TalkTU',
                ],
              },

              {
                heading:
                  '13. การเปลี่ยนแปลงข้อกำหนด',
                paragraphs: [
                  'TalkTU อาจปรับปรุงข้อกำหนดนี้เมื่อบริการ ฟังก์ชัน หรือข้อกำหนดที่เกี่ยวข้องเปลี่ยนแปลง โดยจะแสดงวันที่อัปเดตล่าสุดของข้อกำหนด',
                ],
              },

              {
                heading:
                  '14. ช่องทางติดต่อ',
                paragraphs: [
                  `หากมีคำถามเกี่ยวกับข้อกำหนดนี้ สามารถติดต่อทีม TalkTU ได้ที่ ${SUPPORT_EMAIL}`,
                ],
              },
            ]
          : [
              {
                heading: '1. Eligibility',
                paragraphs: [
                  'TalkTU is intended only for eligible Thammasat University students who are at least 18 years old.',
                  'You must provide accurate information and must not attempt to bypass TalkTU eligibility or age requirements.',
                ],
              },

              {
                heading: '2. Your account',
                paragraphs: [
                  'You are responsible for activity performed through your TalkTU account and for keeping access to your account secure.',
                  'You may not impersonate another person, create an account for another person without authorization, or use another person’s account.',
                ],
              },

              {
                heading:
                  '3. TU authentication',
                paragraphs: [
                  'TalkTU may use Thammasat University account information to authenticate users and verify eligibility to use the service.',
                  'Some parts of the service may depend on external authentication or other connected services.',
                ],
              },

              {
                heading:
                  '4. Acceptable use',
                paragraphs: [
                  'You agree to use TalkTU lawfully and in accordance with these Terms and the Community Guidelines.',
                  'You must not use TalkTU to harass others, distribute illegal or harmful content, commit fraud, interfere with the service, bypass safety features, gain unauthorized access to systems or accounts, or otherwise misuse the platform.',
                ],
              },

              {
                heading:
                  '5. TalkTU features',
                bullets: [
                  'Create and manage a profile',
                  'Discover other users',
                  'Swipe, Like, and match with other users through supported features',
                  'Communicate through the chat system where permitted by the service',
                  'Publish, view, Like, comment on, and reply to content on the Feed',
                  'Report accounts, content, or behavior that may violate TalkTU rules',
                  'Block users so that the two users do not encounter each other again in accordance with the system’s functionality',
                  'Unmatch to end a matching relationship without Blocking the other user',
                ],
              },

              {
                heading:
                  '6. User-generated content',
                paragraphs: [
                  'You are responsible for content that you submit through TalkTU and must have the right to submit that content.',
                  'You retain ownership of content that you create. By submitting content to TalkTU, you grant TalkTU permission to host, store, process, display, and otherwise handle that content as necessary to operate the service, maintain security, and provide TalkTU features.',
                ],
              },

              {
                heading:
                  '7. Moderation and enforcement',
                paragraphs: [
                  'TalkTU may review reports and take reasonable action to protect users and the service. This may include removing or restricting content, restricting features, temporarily suspending accounts, or permanently terminating accounts.',
                  'Serious or repeated violations may result in immediate action where appropriate.',
                ],
              },

              {
                heading:
                  '8. Reporting, blocking, and unmatching',
                paragraphs: [
                  'TalkTU provides features for reporting inappropriate content or behavior, Blocking users, and Unmatching. Misuse of reporting or safety systems may itself result in enforcement action.',
                ],
              },

              {
                heading:
                  '9. Account deletion',
                paragraphs: [
                  'You may request permanent deletion of your TalkTU account through Profile → Account Settings → Delete Account.',
                  'If you no longer have access to the app, you may use the TalkTU Account Deletion page or contact the TalkTU team.',
                  'The deletion and retention of associated information are described in the TalkTU Privacy Policy.',
                ],
              },

              {
                heading:
                  '10. Service availability',
                paragraphs: [
                  'TalkTU may change, update, suspend, or discontinue features when necessary. TalkTU does not guarantee that every feature will always be available or operate without interruption.',
                ],
              },

              {
                heading: '11. Safety',
                paragraphs: [
                  'TalkTU cannot guarantee the identity, intentions, conduct, or accuracy of information provided by other users.',
                  'You are responsible for exercising appropriate judgment when communicating with or meeting other users, including when arranging in-person meetings.',
                ],
              },

              {
                heading: '12. Privacy',
                paragraphs: [
                  'Information about how TalkTU collects, uses, stores, and deletes personal information is described in the TalkTU Privacy Policy.',
                ],
              },

              {
                heading:
                  '13. Changes to these Terms',
                paragraphs: [
                  'TalkTU may update these Terms when the service, features, or applicable requirements change. The current version will display its latest update date.',
                ],
              },

              {
                heading: '14. Contact',
                paragraphs: [
                  `For questions about these Terms, contact the TalkTU team at ${SUPPORT_EMAIL}.`,
                ],
              },
            ]
      }
      footer={
        isThai
          ? 'TalkTU · ข้อกำหนดการให้บริการ'
          : 'TalkTU · Terms of Service'
      }
    />
  );
}