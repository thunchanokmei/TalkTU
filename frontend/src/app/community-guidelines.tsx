
import React, { useState } from 'react';

import PolicyPageLayout, {
  type PolicyLanguage,
} from '@/components/policy/PolicyPageLayout';

const SUPPORT_EMAIL =
  'talktu.team@gmail.com';

export default function CommunityGuidelinesPage() {
  const [language, setLanguage] =
    useState<PolicyLanguage>('en');

  const isThai = language === 'th';

  return (
    <PolicyPageLayout
      language={language}
      onChangeLanguage={setLanguage}
      title={
        isThai
          ? 'แนวทางการอยู่ร่วมกันในชุมชน TalkTU'
          : 'TalkTU Community Guidelines'
      }
      updated={
        isThai
          ? 'อัปเดตล่าสุด: 28 ตุลาคม 2569'
          : 'Last updated: October 28, 2026'
      }
      introduction={
        isThai
          ? [
            'TalkTU เป็นชุมชนสำหรับนักศึกษามหาวิทยาลัยธรรมศาสตร์ที่มีสิทธิ์ใช้งานและมีอายุตั้งแต่ 18 ปีขึ้นไป แนวทางนี้ครอบคลุมโปรไฟล์ รูปภาพ การ Swipe การ Like การจับคู่ ข้อความแชท โพสต์ ความคิดเห็น การตอบกลับ และกิจกรรมอื่นภายใน TalkTU',
          ]
          : [
            'TalkTU is a community for eligible Thammasat University students aged 18 or older. These Guidelines apply to profiles, photos, swipes, Likes, matches, chat messages, posts, comments, replies, and other activity on TalkTU.',
          ]
      }
      sections={
        isThai
          ? [
            {
              heading:
                '1. เคารพผู้ใช้อื่น',
              paragraphs: [
                'ห้ามคุกคาม กลั่นแกล้ง ข่มขู่ ทำให้อับอาย จงใจมุ่งโจมตี หรือกระทำพฤติกรรมที่เป็นการติดต่อซ้ำโดยไม่เป็นที่ต้องการ',
              ],
            },

            {
              heading:
                '2. ห้ามสร้างความเกลียดชังหรือเลือกปฏิบัติ',
              paragraphs: [
                'ห้ามเผยแพร่เนื้อหาที่โจมตี ดูหมิ่น ข่มขู่ หรือส่งเสริมความเกลียดชังต่อบุคคลหรือกลุ่มบุคคลจากอัตลักษณ์หรือลักษณะส่วนบุคคล',
              ],
            },

            {
              heading:
                '3. ห้ามเนื้อหาทางเพศที่เป็นการแสวงหาประโยชน์',
              paragraphs: [
                'ห้ามเผยแพร่หรือส่งเนื้อหาลามก เนื้อหาที่เป็นการแสวงหาประโยชน์ทางเพศ ภาพส่วนตัวที่เผยแพร่โดยไม่ได้รับความยินยอม การคุกคามทางเพศ หรือเนื้อหาที่เกี่ยวข้องกับการแสวงหาประโยชน์ทางเพศ',
              ],
            },

            {
              heading:
                '4. ห้ามการข่มขู่และพฤติกรรมอันตราย',
              paragraphs: [
                'ห้ามข่มขู่อย่างน่าเชื่อถือ ส่งเสริมความรุนแรง สนับสนุนการกระทำอันตราย หรือใช้ TalkTU เพื่อจัดกิจกรรมที่ผิดกฎหมายหรือก่อให้เกิดอันตราย',
              ],
            },

            {
              heading:
                '5. เคารพความเป็นส่วนตัว',
              paragraphs: [
                'ห้ามเปิดเผยข้อมูลส่วนตัวของบุคคลอื่นโดยไม่ได้รับอนุญาต เช่น ข้อมูลติดต่อส่วนตัว ที่อยู่ รหัสผ่าน เอกสารระบุตัวตน ข้อความส่วนตัว หรือข้อมูลอ่อนไหวอื่น',
              ],
            },

            {
              heading:
                '6. ใช้ตัวตนอย่างสุจริต',
              paragraphs: [
                'ห้ามแอบอ้างบุคคลอื่น สร้างตัวตนที่ทำให้เข้าใจผิด อ้างความเกี่ยวข้องกับบุคคลหรือองค์กรโดยไม่เป็นความจริง หรือจงใจหลอกลวงผู้ใช้อื่นเกี่ยวกับตัวตนของตน',
              ],
            },

            {
              heading:
                '7. ห้าม Spam การฉ้อโกง และการหลอกลวง',
              paragraphs: [
                'ห้ามใช้ TalkTU เพื่อ Scam, Phishing, Spam, ฉ้อโกง โฆษณาหลอกลวง ใช้งานระบบแบบอัตโนมัติในทางที่ผิด หรือหลอกให้ผู้ใช้อื่นส่งเงิน ข้อมูลส่วนตัว รหัสผ่าน หรือรหัสยืนยัน',
              ],
            },

            {
              heading:
                '8. เคารพความยินยอมและขอบเขตของผู้อื่น',
              paragraphs: [
                'เคารพการตัดสินใจและขอบเขตส่วนบุคคลของผู้ใช้อื่น หากอีกฝ่ายขอให้หยุดติดต่อ ต้องหยุดติดต่อ',
                'ห้ามใช้บัญชีอื่นเพื่อหลีกเลี่ยงการ Block หรือมาตรการด้านความปลอดภัยที่ผู้ใช้อื่นเลือกใช้',
              ],
            },

            {
              heading:
                '9. ใช้ TalkTU โดยชอบด้วยกฎหมาย',
              paragraphs: [
                'ห้ามใช้ TalkTU เพื่อขาย ขอ แจกจ่าย หรืออำนวยความสะดวกเกี่ยวกับสินค้า บริการ สาร หรือกิจกรรมที่ผิดกฎหมาย',
              ],
            },

            {
              heading:
                '10. คุณสมบัติผู้ใช้งาน',
              paragraphs: [
                'TalkTU มีไว้สำหรับนักศึกษามหาวิทยาลัยธรรมศาสตร์ที่มีสิทธิ์ใช้งานและมีอายุตั้งแต่ 18 ปีขึ้นไป การพยายามหลีกเลี่ยงข้อกำหนดด้านสิทธิ์หรืออายุอาจนำไปสู่การยุติบัญชี',
              ],
            },

            {
              heading: '11. การรายงาน',
              paragraphs: [
                'หากพบโปรไฟล์ โพสต์ ความคิดเห็น ข้อความ หรือพฤติกรรมที่ละเมิดแนวทางนี้ สามารถใช้ฟังก์ชัน Report ภายในแอปได้',
                'รายงานควรให้ข้อมูลตามความเป็นจริง การจงใจส่งรายงานเท็จเพื่อคุกคามหรือกลั่นแกล้งผู้อื่นอาจถือเป็นการละเมิดแนวทางชุมชน',
              ],
            },

            {
              heading:
                '12. การ Block และ Unmatch',
              paragraphs: [
                'ผู้ใช้สามารถ Block ผู้ใช้อื่นเพื่อความปลอดภัยหรือความสบายใจ โดยระบบจะจำกัดไม่ให้บัญชีทั้งสองพบเจอกันอีกตามการทำงานของระบบ',
                'ผู้ใช้สามารถ Unmatch เพื่อยุติความสัมพันธ์ในการจับคู่ได้ แต่ Unmatch ไม่เหมือนกับ Block และทั้งสองฝ่ายอาจพบเจอกันอีกในโหมดอื่น',
              ],
            },

            {
              heading:
                '13. การบังคับใช้',
              paragraphs: [
                'TalkTU อาจลบหรือจำกัดเนื้อหา จำกัดฟังก์ชัน ระงับบัญชี หรือยุติบัญชีอย่างถาวรเมื่อพบการละเมิดแนวทาง การคุกคามความปลอดภัยของผู้ใช้ หรือการใช้งานระบบในทางที่ผิด',
                'กรณีร้ายแรงอาจได้รับการดำเนินการทันทีโดยไม่ต้องมีการเตือนล่วงหน้า',
              ],
            },

            {
              heading:
                '14. ช่องทางติดต่อ',
              paragraphs: [
                'หากมีข้อกังวลด้านความปลอดภัย คำถามเกี่ยวกับการดูแลชุมชน หรือปัญหาอื่น สามารถติดต่อทีม TalkTU ผ่านช่องทางอย่างเป็นทางการดังต่อไปนี้',
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
                '1. Treat others with respect',
              paragraphs: [
                'Do not harass, bully, threaten, intimidate, shame, deliberately target, or repeatedly contact another person in an unwanted or abusive manner.',
              ],
            },

            {
              heading:
                '2. No hate or discrimination',
              paragraphs: [
                'Content that attacks, degrades, threatens, or promotes hatred toward people based on identity or personal characteristics is not allowed.',
              ],
            },

            {
              heading:
                '3. No sexual exploitation or explicit abusive content',
              paragraphs: [
                'Do not post or send pornographic material, sexually exploitative content, non-consensual intimate content, sexual harassment, or content that facilitates sexual exploitation.',
              ],
            },

            {
              heading:
                '4. No threats or dangerous behavior',
              paragraphs: [
                'Do not make credible threats, encourage violence, promote dangerous acts, or use TalkTU to organize illegal or harmful activity.',
              ],
            },

            {
              heading:
                '5. Protect privacy',
              paragraphs: [
                'Do not share another person’s private information without permission. This includes private contact information, addresses, passwords, identification documents, private conversations, or other sensitive information.',
              ],
            },

            {
              heading:
                '6. Be authentic',
              paragraphs: [
                'Do not impersonate another person, create a misleading identity, falsely claim affiliation with another person or organization, or deliberately deceive users about who you are.',
              ],
            },

            {
              heading:
                '7. No spam, scams, or manipulation',
              paragraphs: [
                'Do not use TalkTU for scams, phishing, spam, fraudulent activity, deceptive promotions, automated abuse, or attempts to trick users into providing money, personal information, passwords, or verification codes.',
              ],
            },

            {
              heading:
                '8. Respect consent and boundaries',
              paragraphs: [
                'Respect other users’ decisions and personal boundaries. If someone asks you to stop contacting them, stop.',
                'Do not use another account to bypass a Block or another safety measure chosen by another user.',
              ],
            },

            {
              heading:
                '9. Keep activity lawful',
              paragraphs: [
                'Do not use TalkTU to sell, request, distribute, or facilitate illegal goods, services, substances, or activities.',
              ],
            },

            {
              heading:
                '10. Eligibility',
              paragraphs: [
                'TalkTU is intended only for eligible Thammasat University students who are at least 18 years old. Attempts to bypass eligibility or age requirements may result in account termination.',
              ],
            },

            {
              heading: '11. Reporting',
              paragraphs: [
                'If you see a profile, post, comment, message, or behavior that violates these Guidelines, use the in-app Report feature.',
                'Reports should be truthful. Intentionally submitting false reports to harass or bully another person may itself violate these Guidelines.',
              ],
            },

            {
              heading:
                '12. Blocking and unmatching',
              paragraphs: [
                'You may Block users where necessary for your safety or comfort. Blocking prevents the accounts from encountering each other again in accordance with the system’s functionality.',
                'You may also Unmatch another user to end a matching relationship. Unmatching is not the same as Blocking, so the users may encounter each other again in another mode.',
              ],
            },

            {
              heading:
                '13. Enforcement',
              paragraphs: [
                'TalkTU may remove or restrict content, restrict features, suspend accounts, or permanently terminate accounts that violate these Guidelines, threaten user safety, or abuse the service.',
                'Serious violations may result in immediate action without prior warning.',
              ],
            },

            {
              heading: '14. Contact',
              paragraphs: [
                'For safety concerns, moderation questions, or other community issues, you can contact the TalkTU team through the following official channels:',
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
          ? 'TalkTU · แนวทางชุมชน'
          : 'TalkTU · Community Guidelines'
      }
    />
  );
}
