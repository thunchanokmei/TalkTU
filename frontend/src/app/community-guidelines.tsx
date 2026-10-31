import React, { useState } from 'react';

import PolicyPageLayout, {
  type PolicyLanguage,
} from '@/components/policy/PolicyPageLayout';

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
          ? 'วันที่มีผลบังคับใช้: 28 ตุลาคม 2569'
          : 'Effective date: October 28, 2026 (B.E. 2569)'
      }
      sections={
        isThai
          ? [
              {
                heading:
                  '1. ชุมชน TalkTU',
                paragraphs: [
                  'TalkTU เป็นพื้นที่สำหรับการค้นพบผู้คนใหม่ ๆ การสร้างความสัมพันธ์ การสื่อสาร และการแบ่งปันประสบการณ์ เราต้องการให้ผู้ใช้ทุกคนสามารถใช้งานแอปได้อย่างเคารพซึ่งกันและกันและรู้สึกปลอดภัย',
                  'แนวทางฉบับนี้ครอบคลุมการใช้งานทุกส่วนของ TalkTU รวมถึงโปรไฟล์ รูปภาพ การ Swipe การกด Like การจับคู่ ข้อความแชท โพสต์ ความคิดเห็น การตอบกลับ และเนื้อหาอื่นที่ผู้ใช้สร้างขึ้น',
                  'ผู้ใช้ทุกคนต้องปฏิบัติตามแนวทางนี้เมื่อใช้งาน TalkTU',
                ],
              },

              {
                heading:
                  '2. เคารพซึ่งกันและกัน',
                paragraphs: [
                  'ผู้ใช้ควรปฏิบัติต่อผู้อื่นด้วยความสุภาพและให้เกียรติ',
                  'พฤติกรรมที่ไม่อนุญาต ได้แก่',
                ],
                bullets: [
                  'การกลั่นแกล้งหรือคุกคามผู้อื่น',
                  'การข่มขู่หรือข่มเหง',
                  'การใช้ถ้อยคำแสดงความเกลียดชังหรือดูหมิ่นบุคคลตามอัตลักษณ์หรือลักษณะส่วนบุคคล',
                  'การติดต่อซ้ำ ๆ โดยไม่เคารพความต้องการของอีกฝ่าย',
                  'การจงใจทำให้อีกฝ่ายอับอายหรือเสียชื่อเสียง',
                  'การชักชวนให้ผู้อื่นร่วมกันคุกคามบุคคลใดบุคคลหนึ่ง',
                ],
              },

              {
                heading:
                  '2.1 เคารพความแตกต่าง',
                paragraphs: [
                  'ผู้ใช้ควรเคารพความคิดเห็น ภูมิหลัง อัตลักษณ์ ความชอบ และขอบเขตส่วนบุคคลที่แตกต่างกัน',
                  'ความไม่เห็นด้วยไม่ใช่เหตุผลในการคุกคาม ดูหมิ่น ข่มขู่ หรือทำให้บุคคลอื่นรู้สึกไม่ปลอดภัย',
                ],
              },

              {
                heading:
                  '3. ใช้ตัวตนอย่างสุจริต',
                paragraphs: [
                  'TalkTU สนับสนุนให้ผู้ใช้สร้างความสัมพันธ์อย่างจริงใจ ผู้ใช้ควรแสดงข้อมูลโปรไฟล์อย่างตรงไปตรงมาและต้องไม่ละเมิดสิทธิของบุคคลอื่น',
                ],
                bullets: [
                  'ห้ามแอบอ้างตัวเป็นบุคคลอื่น',
                  'ห้ามใช้รูปภาพของผู้อื่นเพื่อทำให้เข้าใจผิดเกี่ยวกับตัวตนของตนเอง',
                  'ห้ามสร้างบัญชีปลอมเพื่อหลอกลวงหรือแสวงหาประโยชน์จากผู้อื่น',
                  'ห้ามให้ข้อมูลอันเป็นเท็จเพื่อฉ้อโกงหรือสร้างความเสียหาย',
                  'ห้ามใช้การแอบอ้างหรือหลอกลวงเพื่อควบคุมพฤติกรรมของผู้ใช้รายอื่น',
                ],
              },

              {
                heading:
                  '4. เคารพความเป็นส่วนตัวและความยินยอม',
                paragraphs: [
                  'ผู้ใช้ต้องเคารพข้อมูลส่วนบุคคล ความเป็นส่วนตัว และขอบเขตของผู้อื่น',
                  'การ Swipe การกด Like การจับคู่ หรือการเคยสนทนากันมาก่อน ไม่ได้หมายความว่าอีกฝ่ายยินยอมต่อการกระทำทุกประเภทในอนาคต',
                ],
                bullets: [
                  'ห้ามเปิดเผยข้อมูลส่วนบุคคลหรือข้อความส่วนตัวของผู้อื่นโดยไม่ชอบด้วยกฎหมาย',
                  'ห้ามเผยแพร่ข้อมูลติดต่อ เอกสารระบุตัวตน รหัสผ่าน หรือข้อมูลอ่อนไหวของผู้อื่นเพื่อคุกคามหรือทำให้เกิดอันตราย',
                  'ห้ามเผยแพร่ภาพส่วนตัวหรือเนื้อหาที่มีลักษณะใกล้ชิดโดยไม่ได้รับความยินยอม',
                  'ห้ามบันทึก เผยแพร่ หรือใช้เนื้อหาของผู้อื่นในลักษณะที่ละเมิดสิทธิของบุคคลนั้น',
                  'ห้ามติดต่อผู้อื่นต่อไปในลักษณะคุกคามหลังจากอีกฝ่ายแสดงเจตนาอย่างชัดเจนว่าไม่ต้องการติดต่อ',
                ],
              },

              {
                heading:
                  '5. เผยแพร่เนื้อหาอย่างเหมาะสม',
                paragraphs: [
                  'เนื้อหาที่เผยแพร่บน TalkTU ต้องไม่ละเมิดกฎหมาย สิทธิของบุคคลอื่น หรือแนวทางชุมชนฉบับนี้',
                  'TalkTU อาจลบหรือจำกัดการเข้าถึงเนื้อหาที่ละเมิดแนวทางนี้ตามความเหมาะสม',
                ],
                bullets: [
                  'เนื้อหาที่ผิดกฎหมายหรือส่งเสริมการกระทำผิดกฎหมาย',
                  'การแสวงหาประโยชน์ทางเพศจากผู้เยาว์ หรือเนื้อหาทางเพศที่เกี่ยวข้องกับผู้เยาว์',
                  'ภาพหรือเนื้อหาส่วนตัวที่เผยแพร่โดยไม่ได้รับความยินยอม',
                  'การข่มขู่อย่างน่าเชื่อถือ หรือเนื้อหาความรุนแรงที่ใช้คุกคามผู้อื่น',
                  'เนื้อหาที่ส่งเสริมความเกลียดชังหรือการเลือกปฏิบัติ',
                  'การหลอกลวง การฉ้อโกง ลิงก์ Phishing หรือลิงก์ที่เป็นอันตราย',
                  'เนื้อหาที่ละเมิดลิขสิทธิ์หรือสิทธิของบุคคลอื่น',
                  'Spam หรือโฆษณาหลอกลวงที่ฝ่าฝืนกฎของแพลตฟอร์ม',
                ],
              },

              {
                heading:
                  '6. ใช้ระบบแชทอย่างรับผิดชอบ',
                paragraphs: [
                  'ระบบแชทมีไว้เพื่อช่วยให้ผู้ใช้สื่อสารและสร้างความสัมพันธ์ที่ดีต่อกัน',
                  'ผู้ใช้ควรเคารพขอบเขตของอีกฝ่ายและหยุดพฤติกรรมที่ทำให้อีกฝ่ายไม่สบายใจ',
                ],
                bullets: [
                  'ห้ามใช้ระบบแชทเพื่อข่มขู่หรือคุกคามผู้อื่น',
                  'ห้ามส่งข้อความที่มีเนื้อหาล่วงละเมิดหรือไม่เหมาะสมโดยไม่ได้รับความยินยอม',
                  'ห้ามส่งข้อความซ้ำ ๆ โดยไม่เคารพความต้องการของอีกฝ่าย',
                  'ห้ามฉ้อโกง รีดไถ หรือหลอกลวงผู้ใช้รายอื่น',
                  'ห้ามเผยแพร่ลิงก์อันตรายหรือข้อเสนอที่เป็นการหลอกลวง',
                  'ห้ามเปิดเผยข้อมูลส่วนตัวของผู้อื่นโดยไม่ชอบด้วยกฎหมาย',
                ],
              },

              {
                heading:
                  '7. ใช้ Feed อย่างสร้างสรรค์',
                paragraphs: [
                  'โพสต์ ความคิดเห็น และการตอบกลับควรเป็นส่วนหนึ่งของการแบ่งปันประสบการณ์และการสร้างชุมชนที่ดี',
                  'ผู้ใช้ต้องเคารพลิขสิทธิ์และสิทธิในการใช้รูปภาพ ข้อความ และสื่ออื่นที่นำมาเผยแพร่',
                ],
                bullets: [
                  'ห้ามเผยแพร่โพสต์ ความคิดเห็น หรือการตอบกลับที่ใช้คุกคามหรือเลือกปฏิบัติ',
                  'ห้ามเผยแพร่เนื้อหาที่มุ่งทำให้อีกฝ่ายอับอายหรือเสียหาย',
                  'ห้ามเปิดเผยข้อมูลส่วนบุคคลของผู้อื่นโดยไม่ชอบด้วยกฎหมาย',
                  'ห้ามเผยแพร่เนื้อหาหลอกลวงที่มุ่งสร้างความเสียหายหรือแสวงหาประโยชน์',
                  'ห้ามเผยแพร่ Spam หรือเนื้อหาโฆษณาที่ละเมิดกฎของแพลตฟอร์ม',
                  'ห้ามเผยแพร่เนื้อหาที่ละเมิดกฎหมายหรือสิทธิของบุคคลอื่น',
                ],
              },

              {
                heading:
                  '8. ห้ามฉ้อโกงและแสวงหาประโยชน์จากผู้อื่น',
                paragraphs: [
                  'TalkTU ไม่อนุญาตให้ใช้แพลตฟอร์มเพื่อหลอกลวง ฉ้อโกง รีดไถ หรือแสวงหาประโยชน์จากผู้ใช้รายอื่นโดยมิชอบ',
                  'ตัวอย่างพฤติกรรมที่ไม่อนุญาต ได้แก่',
                ],
                bullets: [
                  'ขอเงินจากผู้ใช้โดยใช้เรื่องราวหลอกลวง',
                  'แอบอ้างบุคคลหรือองค์กรเพื่อให้ผู้อื่นส่งเงินหรือข้อมูลส่วนตัว',
                  'หลอกขอรหัสผ่านหรือรหัสยืนยันตัวตน',
                  'เผยแพร่ข้อเสนอการลงทุนหรือข้อเสนอทางการเงินที่เป็นการฉ้อโกง',
                  'ข่มขู่ว่าจะเผยแพร่ข้อมูลหรือเนื้อหาส่วนตัวหากอีกฝ่ายไม่จ่ายเงินหรือไม่ปฏิบัติตามคำขอ',
                ],
              },

              {
                heading:
                  '8.1 เมื่อพบพฤติกรรมที่น่าสงสัย',
                paragraphs: [
                  'หากพบพฤติกรรมที่น่าสงสัย ผู้ใช้ควรหยุดการติดต่อ หลีกเลี่ยงการส่งเงินหรือข้อมูลสำคัญ และใช้ฟังก์ชัน Report หรือ Block ตามความเหมาะสม',
                ],
              },

              {
                heading:
                  '9. การรายงาน การบล็อก และการยกเลิกการจับคู่',
                paragraphs: [
                  'หากพบผู้ใช้ที่มีพฤติกรรมไม่เหมาะสม ละเมิดแนวทาง หรือทำให้รู้สึกไม่ปลอดภัย ผู้ใช้สามารถใช้เครื่องมือด้านความปลอดภัยของ TalkTU ได้',
                ],
              },

              {
                heading:
                  '9.1 Report',
                paragraphs: [
                  'Report ใช้แจ้งให้ TalkTU ทราบถึงบัญชี พฤติกรรม หรือเนื้อหาที่อาจละเมิดข้อกำหนดหรือ Community Guidelines',
                  'เมื่อรายงานเหตุการณ์ ผู้ใช้ควรให้ข้อมูลที่ถูกต้องและอธิบายสถานการณ์ตามข้อเท็จจริง',
                  'การจงใจส่งรายงานเท็จเพื่อคุกคาม กลั่นแกล้ง หรือทำให้ผู้ใช้อื่นได้รับความเสียหาย อาจถือเป็นการละเมิด Community Guidelines เช่นกัน',
                ],
              },

              {
                heading:
                  '9.2 Block',
                paragraphs: [
                  'Block ใช้เมื่อผู้ใช้ไม่ต้องการพบเจอผู้ใช้อีกรายภายใน TalkTU อีก',
                  'เมื่อมีการ Block ระบบจะจำกัดหรือป้องกันไม่ให้ผู้ใช้ทั้งสองฝ่ายพบเจอกันอีกตามการทำงานของ TalkTU',
                  'ผู้ใช้ไม่ควรใช้บัญชีอื่นเพื่อหลีกเลี่ยงหรือข้ามการ Block ของผู้ใช้อื่น',
                ],
              },

              {
                heading:
                  '9.3 Unmatch',
                paragraphs: [
                  'Unmatch ใช้เพื่อยุติความสัมพันธ์ในการจับคู่ระหว่างผู้ใช้ทั้งสองฝ่าย',
                  'Unmatch ไม่เหมือนกับ Block ดังนั้นผู้ใช้ทั้งสองฝ่ายอาจกลับมาพบเจอกันได้อีกในโหมดอื่นภายใน TalkTU',
                  'หากไม่ต้องการพบเจอผู้ใช้อีกฝ่ายอีก ควรใช้ Block แทน Unmatch',
                ],
              },

              {
                heading:
                  '9.4 การดำเนินการต่อรายงาน',
                paragraphs: [
                  'TalkTU อาจตรวจสอบรายงานและดำเนินการตามความเหมาะสม เช่น ลบหรือจำกัดเนื้อหา แจ้งเตือน จำกัดการใช้งาน ระงับบัญชี หรือยุติบัญชีในกรณีที่เหมาะสม',
                ],
              },

              {
                heading:
                  '10. มาตรการเมื่อมีการละเมิด',
                paragraphs: [
                  'เมื่อพบการละเมิด Community Guidelines TalkTU อาจดำเนินมาตรการตามลักษณะและความร้ายแรงของเหตุการณ์ ได้แก่',
                ],
                numbered: [
                  'ลบหรือจำกัดการเข้าถึงเนื้อหาที่ไม่เหมาะสม',
                  'แจ้งเตือนผู้ใช้',
                  'จำกัดการเข้าถึงฟังก์ชันบางประเภท',
                  'ระงับบัญชีชั่วคราว',
                  'ยุติบัญชีอย่างถาวรในกรณีร้ายแรงหรือเกิดการละเมิดซ้ำ',
                  'ดำเนินการเพิ่มเติมตามที่กฎหมายกำหนดหรืออนุญาต',
                ],
              },

              {
                heading:
                  '10.1 การละเมิดที่ร้ายแรง',
                paragraphs: [
                  'กรณีที่มีความร้ายแรง เช่น การแสวงหาประโยชน์ การข่มขู่ที่น่าเชื่อถือ การฉ้อโกงร้ายแรง หรือการเผยแพร่ภาพหรือเนื้อหาส่วนตัวโดยไม่ได้รับความยินยอม อาจจำเป็นต้องดำเนินการอย่างเร่งด่วนและอาจไม่มีการเตือนล่วงหน้า',
                ],
              },

              {
                heading:
                  '10.2 การพิจารณามาตรการ',
                paragraphs: [
                  'การพิจารณามาตรการจะคำนึงถึงข้อเท็จจริง ลักษณะและความร้ายแรงของเหตุการณ์ ประวัติการละเมิด ความปลอดภัยของผู้ใช้ และกฎหมายที่เกี่ยวข้อง',
                ],
              },

              {
                heading:
                  '11. คำแนะนำเพื่อความปลอดภัย',
                paragraphs: [
                  'เพื่อปกป้องตนเองและผู้ใช้รายอื่น เราแนะนำให้ผู้ใช้ปฏิบัติดังต่อไปนี้',
                ],
                bullets: [
                  'ไม่เปิดเผยรหัสผ่านหรือรหัสยืนยันตัวตนแก่ผู้อื่น',
                  'ระมัดระวังการเปิดเผยข้อมูลทางการเงิน ข้อมูลติดต่อส่วนตัว หรือข้อมูลส่วนบุคคลที่สำคัญ',
                  'ไม่ส่งเงินให้บุคคลที่เพิ่งรู้จักผ่าน TalkTU โดยไม่ตรวจสอบให้แน่ใจ',
                  'ตรวจสอบข้อมูลเมื่อสงสัยว่ามีการแอบอ้างตัวตน',
                  'หากนัดพบผู้ใช้รายอื่น ควรเลือกสถานที่สาธารณะและแจ้งบุคคลที่ไว้ใจให้ทราบ',
                  'ใช้ Block และ Report เมื่อมีผู้ใช้หรือพฤติกรรมที่ทำให้รู้สึกไม่ปลอดภัย',
                ],
              },

              {
                heading:
                  '11.1 กรณีมีอันตรายเร่งด่วน',
                paragraphs: [
                  'หากผู้ใช้อยู่ในสถานการณ์ที่มีอันตรายเร่งด่วน ควรติดต่อหน่วยงานฉุกเฉินหรือหน่วยงานที่เกี่ยวข้องโดยตรง เนื่องจาก TalkTU ไม่ใช่บริการฉุกเฉิน',
                ],
              },

              {
                heading:
                  '12. การปรับปรุงแนวทางชุมชน',
                paragraphs: [
                  'TalkTU อาจปรับปรุง Community Guidelines เมื่อมีการเปลี่ยนแปลงของแอปพลิเคชัน ฟังก์ชันการใช้งาน หรือเกิดประเด็นด้านความปลอดภัยใหม่ ๆ',
                  'หากมีการเปลี่ยนแปลงที่สำคัญ TalkTU อาจแจ้งให้ผู้ใช้ทราบตามความเหมาะสม',
                  'ผู้ใช้ควรตรวจสอบ Community Guidelines ฉบับล่าสุดเพื่อให้ทราบถึงกฎและมาตรฐานการใช้งานที่เกี่ยวข้อง',
                ],
              },

              {
                heading:
                  '13. ช่องทางติดต่อ',
                paragraphs: [
                  'หากมีข้อสงสัยเกี่ยวกับ Community Guidelines หรือต้องการแจ้งปัญหาด้านความปลอดภัย สามารถติดต่อทีม TalkTU ผ่านช่องทางอย่างเป็นทางการดังต่อไปนี้',
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
                  '1. The TalkTU Community',
                paragraphs: [
                  'TalkTU is a space for meeting new people, building relationships, communicating, and sharing experiences. We want every user to be able to use the application respectfully and feel safe.',
                  'These Guidelines apply to every part of TalkTU, including profiles, photos, swipes, Likes, matches, chat messages, posts, comments, replies, and other user-generated content.',
                  'All users must follow these Guidelines when using TalkTU.',
                ],
              },

              {
                heading:
                  '2. Respect One Another',
                paragraphs: [
                  'Users should treat others with courtesy and respect.',
                  'Behavior that is not allowed includes:',
                ],
                bullets: [
                  'Bullying or harassing other users',
                  'Threatening or persecuting others',
                  'Using hateful or demeaning language directed at people based on identity or personal characteristics',
                  "Repeatedly contacting someone without respecting the other person's wishes",
                  'Deliberately humiliating another person or damaging their reputation',
                  'Encouraging others to participate in harassment',
                ],
              },

              {
                heading:
                  '2.1 Respect Differences',
                paragraphs: [
                  'Users should respect differing opinions, backgrounds, identities, preferences, and personal boundaries.',
                  'Disagreement does not justify harassment, humiliation, threats, or behavior that makes another person feel unsafe.',
                ],
              },

              {
                heading:
                  '3. Use Your Identity in Good Faith',
                paragraphs: [
                  'TalkTU encourages users to build genuine relationships. Users should present profile information honestly and respect the rights of others.',
                ],
                bullets: [
                  'Do not impersonate another person',
                  "Do not use another person's photos to mislead others about your identity",
                  'Do not create fake accounts to deceive or exploit other users',
                  'Do not provide false information to defraud or harm others',
                  "Do not use impersonation or deception to control another user's behavior",
                ],
              },

              {
                heading:
                  '4. Respect Privacy and Consent',
                paragraphs: [
                  'Users must respect the personal data, privacy, and boundaries of others.',
                  'Swiping, Liking, matching, or having chatted with another person before does not mean that the other person consents to every type of future interaction.',
                ],
                bullets: [
                  "Do not unlawfully disclose another person's personal data or private messages",
                  "Do not publish another person's contact information, identification documents, passwords, or sensitive information in order to harass or harm them",
                  'Do not publish private or intimate images without consent',
                  "Do not record, publish, or use another person's content in a way that violates their rights",
                  'Do not continue harassing contact after another person has clearly indicated that they do not want further contact',
                ],
              },

              {
                heading:
                  '5. Publish Content Appropriately',
                paragraphs: [
                  'Content published on TalkTU must not violate applicable law, the rights of others, or these Community Guidelines.',
                  'TalkTU may remove or restrict access to content that violates these Guidelines where appropriate.',
                ],
                bullets: [
                  'Illegal content or content that promotes illegal acts',
                  'Sexual exploitation of minors or sexual content involving minors',
                  'Private or intimate content published without consent',
                  'Credible threats or violent content used to threaten others',
                  'Content that promotes hatred or discrimination',
                  'Deception, fraud, phishing links, or dangerous links',
                  'Content that infringes copyright or other rights',
                  'Spam or deceptive advertising that violates platform rules',
                ],
              },

              {
                heading:
                  '6. Use the Chat System Responsibly',
                paragraphs: [
                  'The chat system is intended to help users communicate and build positive relationships.',
                  "Users should respect the other person's boundaries and stop behavior that makes the other person uncomfortable.",
                ],
                bullets: [
                  'Do not use the chat system to threaten or harass others',
                  'Do not send abusive or inappropriate messages without consent',
                  "Do not repeatedly send messages without respecting the other person's wishes",
                  'Do not defraud, extort, or deceive other users',
                  'Do not distribute dangerous links or deceptive offers',
                  "Do not unlawfully disclose another person's private information",
                ],
              },

              {
                heading:
                  '7. Use the Feed Constructively',
                paragraphs: [
                  'Posts, comments, and replies should contribute to sharing experiences and building a constructive community.',
                  'Users must respect copyright and rights to use images, text, and other media that they publish.',
                ],
                bullets: [
                  'Do not publish posts, comments, or replies used to harass or discriminate',
                  'Do not publish content intended to humiliate or harm another person',
                  "Do not unlawfully disclose another person's personal information",
                  'Do not publish deceptive content intended to harm or exploit others',
                  'Do not publish Spam or advertising content that violates platform rules',
                  'Do not publish content that violates law or the rights of others',
                ],
              },

              {
                heading:
                  '8. No Fraud or Exploitation',
                paragraphs: [
                  'TalkTU does not allow the platform to be used to deceive, defraud, extort, or unlawfully exploit other users.',
                  'Examples of prohibited behavior include:',
                ],
                bullets: [
                  'Requesting money from users through deceptive stories',
                  'Impersonating a person or organization in order to obtain money or personal information',
                  'Tricking users into providing passwords or verification codes',
                  'Publishing fraudulent investment or financial offers',
                  'Threatening to disclose private information or content unless another person pays money or complies with a demand',
                ],
              },

              {
                heading:
                  '8.1 Suspicious Behavior',
                paragraphs: [
                  'If you encounter suspicious behavior, stop contact, avoid sending money or sensitive information, and use the Report or Block features where appropriate.',
                ],
              },

              {
                heading:
                  '9. Reporting, Blocking, and Unmatching',
                paragraphs: [
                  'If a user behaves inappropriately, violates these Guidelines, or makes you feel unsafe, you may use the safety tools provided by TalkTU.',
                ],
              },

              {
                heading:
                  '9.1 Report',
                paragraphs: [
                  'Use Report to notify TalkTU of an account, behavior, or content that may violate these Terms or the Community Guidelines.',
                  'Reports should contain accurate information and describe the situation truthfully.',
                  'Intentionally submitting a false report to harass, bully, or harm another user may itself violate these Community Guidelines.',
                ],
              },

              {
                heading:
                  '9.2 Block',
                paragraphs: [
                  'Use Block when you do not want to encounter another user again within TalkTU.',
                  "When a Block is applied, the system restricts or prevents the two users from encountering each other again in accordance with TalkTU's functionality.",
                  "Users must not use another account to bypass another user's Block.",
                ],
              },

              {
                heading:
                  '9.3 Unmatch',
                paragraphs: [
                  'Use Unmatch to end the matching relationship between two users.',
                  'Unmatching is not the same as Blocking. Therefore, the two users may encounter each other again in other modes within TalkTU.',
                  'If you do not want to encounter the other user again, use Block instead of Unmatch.',
                ],
              },

              {
                heading:
                  '9.4 Review of Reports',
                paragraphs: [
                  'TalkTU may review reports and take appropriate action, including removing or restricting content, issuing warnings, restricting use, suspending accounts, or terminating accounts where appropriate.',
                ],
              },

              {
                heading:
                  '10. Enforcement Measures',
                paragraphs: [
                  'When a violation of the Community Guidelines is identified, TalkTU may take action according to the nature and severity of the incident, including:',
                ],
                numbered: [
                  'Remove or restrict access to inappropriate content',
                  'Issue a warning',
                  'Restrict access to certain features',
                  'Temporarily suspend an account',
                  'Permanently terminate an account in serious or repeated cases',
                  'Take further action as required or permitted by law',
                ],
              },

              {
                heading:
                  '10.1 Serious Violations',
                paragraphs: [
                  'Urgent action may be necessary in serious cases such as exploitation, credible threats, serious fraud, or publication of private or intimate content without consent. Such cases may result in immediate action without prior warning.',
                ],
              },

              {
                heading:
                  '10.2 Enforcement Decisions',
                paragraphs: [
                  'Enforcement decisions may take into account the facts, the nature and severity of the incident, previous violations, user safety, and applicable law.',
                ],
              },

              {
                heading:
                  '11. Safety Tips',
                paragraphs: [
                  'To help protect yourself and other users, we recommend the following:',
                ],
                bullets: [
                  'Do not share passwords or verification codes with anyone',
                  'Be careful when sharing financial information, private contact information, or other important personal data',
                  'Do not send money to people you have only recently met through TalkTU without first verifying the situation',
                  'Verify information if you suspect impersonation',
                  'If you arrange to meet another user, choose a public place and tell someone you trust',
                  'Use Block and Report when another user or behavior makes you feel unsafe',
                ],
              },

              {
                heading:
                  '11.1 Immediate Danger',
                paragraphs: [
                  'If you are in immediate danger, contact the relevant emergency services or authorities directly. TalkTU is not an emergency service.',
                ],
              },

              {
                heading:
                  '12. Updates to the Community Guidelines',
                paragraphs: [
                  'TalkTU may update these Community Guidelines when the application or its features change or when new safety issues arise.',
                  'If there are material changes, TalkTU may notify users as appropriate.',
                  'Users should review the latest version of the Community Guidelines to remain aware of the applicable rules and standards.',
                ],
              },

              {
                heading:
                  '13. Contact',
                paragraphs: [
                  'For questions about the Community Guidelines or to report a safety concern, you can contact the TalkTU team through the following official channels:',
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