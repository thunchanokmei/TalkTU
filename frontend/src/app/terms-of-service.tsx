import React, { useState } from 'react';

import PolicyPageLayout, {
  type PolicyLanguage,
} from '@/components/policy/PolicyPageLayout';

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
          ? 'วันที่มีผลบังคับใช้: 28 ตุลาคม 2569'
          : 'Effective date: October 28, 2026 (B.E. 2569)'
      }
      sections={
        isThai
          ? [
              {
                heading:
                  '1. การยอมรับข้อกำหนด',
                paragraphs: [
                  'ข้อกำหนดการให้บริการฉบับนี้กำหนดเงื่อนไขในการเข้าถึงและใช้งานแอปพลิเคชัน TalkTU',
                  'การสมัครสมาชิกหรือใช้งาน TalkTU ถือว่าผู้ใช้ยอมรับข้อกำหนดการให้บริการฉบับนี้ นโยบายความเป็นส่วนตัว และแนวทางการอยู่ร่วมกันในชุมชนของ TalkTU หากผู้ใช้ไม่ยอมรับข้อกำหนดดังกล่าว ผู้ใช้ควรหยุดใช้งานแอปพลิเคชัน',
                  'การขอความยินยอมสำหรับการประมวลผลข้อมูลส่วนบุคคลจะดำเนินการแยกต่างหากเมื่อกฎหมายกำหนด',
                ],
              },

              {
                heading:
                  '2. คุณสมบัติและการสมัครสมาชิก',
                paragraphs: [
                  'ผู้ที่ต้องการใช้งาน TalkTU ต้องมีอายุอย่างน้อย 18 ปี และมีคุณสมบัติตามที่แอปพลิเคชันและกฎหมายที่เกี่ยวข้องกำหนด',
                  'ผู้ใช้ต้องปฏิบัติตามเงื่อนไขดังต่อไปนี้',
                ],
                numbered: [
                  'ให้ข้อมูลการสมัครสมาชิกที่ถูกต้องและเป็นปัจจุบัน',
                  'ไม่แอบอ้างตัวเป็นบุคคลอื่น',
                  'ไม่สร้างบัญชีเพื่อหลอกลวงหรือแสวงหาประโยชน์จากผู้ใช้รายอื่นโดยมิชอบ',
                  'เก็บรักษาข้อมูลเข้าสู่ระบบของตนเองอย่างเหมาะสม',
                  'แจ้งทีม TalkTU เมื่อสงสัยว่าบัญชีถูกเข้าถึงโดยไม่ได้รับอนุญาต',
                  'ใช้งานแอปพลิเคชันอย่างสุจริตและไม่ละเมิดกฎหมาย',
                ],
              },

              {
                heading:
                  '2.1 การจัดการบัญชีที่ไม่เป็นไปตามข้อกำหนด',
                paragraphs: [
                  'TalkTU อาจจำกัด ระงับ หรือยุติการใช้งานบัญชีที่ละเมิดข้อกำหนดตามความเหมาะสม โดยคำนึงถึงลักษณะของการละเมิด ความปลอดภัยของผู้ใช้ และกฎหมายที่เกี่ยวข้อง',
                ],
              },

              {
                heading:
                  '3. ลักษณะการให้บริการ',
                paragraphs: [
                  'TalkTU อาจให้บริการฟังก์ชันต่าง ๆ ดังต่อไปนี้',
                ],
              },

              {
                heading:
                  '3.1 การสร้างโปรไฟล์',
                paragraphs: [
                  'ผู้ใช้สามารถสร้างและจัดการข้อมูลโปรไฟล์ เช่น ชื่อที่ใช้แสดง รูปภาพ ข้อมูลแนะนำตัว และข้อมูลอื่นที่ระบบรองรับ',
                ],
              },

              {
                heading:
                  '3.2 การค้นพบผู้ใช้',
                paragraphs: [
                  'ผู้ใช้สามารถดูโปรไฟล์ของผู้ใช้รายอื่นที่ระบบอนุญาตให้แสดง เพื่อค้นพบและทำความรู้จักกับบุคคลใหม่',
                ],
              },

              {
                heading:
                  '3.3 การ Swipe, Like และการจับคู่',
                paragraphs: [
                  'ผู้ใช้สามารถแสดงความสนใจหรือผ่านโปรไฟล์ของผู้ใช้รายอื่นผ่านฟังก์ชันที่ระบบรองรับ การจับคู่และการแสดงผลเป็นไปตามเงื่อนไขการทำงานของแอปพลิเคชัน',
                ],
              },

              {
                heading:
                  '3.4 ระบบแชท',
                paragraphs: [
                  'ผู้ใช้สามารถสนทนากับผู้ใช้ที่มีสิทธิ์สนทนาด้วยผ่านระบบแชทตามเงื่อนไขและสิทธิ์ที่ระบบกำหนด',
                ],
              },

              {
                heading:
                  '3.5 Feed',
                paragraphs: [
                  'ผู้ใช้สามารถเผยแพร่ ดู กด Like แสดงความคิดเห็น ตอบกลับความคิดเห็น และโต้ตอบกับเนื้อหาที่ระบบรองรับ',
                ],
              },

              {
                heading:
                  '3.6 การรายงาน การบล็อก และการยกเลิกการจับคู่',
                paragraphs: [
                  'TalkTU มีฟังก์ชัน Report, Block และ Unmatch เพื่อช่วยให้ผู้ใช้จัดการการโต้ตอบและความปลอดภัยภายในแอปพลิเคชัน',
                  'Report: ผู้ใช้สามารถรายงานบัญชี พฤติกรรม หรือเนื้อหาที่อาจละเมิดข้อกำหนดหรือแนวทางชุมชน',
                  'Block: เมื่อผู้ใช้บล็อกผู้ใช้อื่น ระบบจะป้องกันไม่ให้ผู้ใช้ทั้งสองฝ่ายพบเจอกันอีกภายใน TalkTU ตามการทำงานของระบบ',
                  'Unmatch: การยกเลิกการจับคู่จะยุติความสัมพันธ์ในการจับคู่ แต่ไม่ได้เป็นการบล็อก ดังนั้นผู้ใช้ทั้งสองฝ่ายอาจกลับมาพบเจอกันได้อีกในโหมดอื่น',
                  'หากผู้ใช้ไม่ต้องการพบเจอผู้ใช้อีกรายภายใน TalkTU อีก ควรใช้ฟังก์ชัน Block แทน Unmatch',
                ],
              },

              {
                heading:
                  '3.7 การเปลี่ยนแปลงฟังก์ชัน',
                paragraphs: [
                  'TalkTU อาจเปลี่ยนแปลง ปรับปรุง ระงับ หรือยกเลิกฟังก์ชันบางอย่างตามความจำเป็น โดยคำนึงถึงการทำงานของบริการ ความปลอดภัย และกฎหมายที่เกี่ยวข้อง',
                ],
              },

              {
                heading:
                  '4. หน้าที่และความรับผิดชอบของผู้ใช้',
                paragraphs: [
                  'ผู้ใช้ตกลงที่จะใช้งาน TalkTU อย่างสุจริต เคารพสิทธิของบุคคลอื่น และปฏิบัติตามกฎหมาย',
                  'ผู้ใช้ต้องไม่กระทำการดังต่อไปนี้',
                ],
                bullets: [
                  'คุกคาม ข่มขู่ กลั่นแกล้ง หรือข่มเหงผู้ใช้รายอื่น',
                  'เปิดเผยข้อมูลส่วนบุคคลของผู้อื่นโดยไม่ชอบด้วยกฎหมาย',
                  'แอบอ้างตัวเป็นบุคคลอื่น',
                  'เผยแพร่เนื้อหาที่ผิดกฎหมายหรือสร้างความเสียหายแก่ผู้อื่น',
                  'ใช้แอปพลิเคชันเพื่อหลอกลวง ฉ้อโกง หรือแสวงหาประโยชน์โดยมิชอบ',
                  'ส่งข้อความหรือโฆษณาที่เป็นสแปม',
                  'พยายามเข้าถึงบัญชี ฐานข้อมูล หรือระบบโดยไม่ได้รับอนุญาต',
                  'รบกวนการทำงานหรือพยายามทำลายความปลอดภัยของแอปพลิเคชัน',
                  'พยายามหลีกเลี่ยงหรือข้ามระบบความปลอดภัย การบล็อก หรือมาตรการที่ TalkTU ใช้เพื่อปกป้องผู้ใช้',
                  'ละเมิดทรัพย์สินทางปัญญาหรือสิทธิของบุคคลอื่น',
                ],
              },

              {
                heading:
                  '4.1 แนวทางชุมชน',
                paragraphs: [
                  'ผู้ใช้ต้องปฏิบัติตาม Community Guidelines ของ TalkTU ควบคู่ไปกับข้อกำหนดฉบับนี้',
                ],
              },

              {
                heading:
                  '5. เนื้อหาที่ผู้ใช้สร้างขึ้น',
                paragraphs: [
                  'ผู้ใช้ยังคงเป็นเจ้าของเนื้อหาที่ตนเองสร้างขึ้น ภายใต้สิทธิของบุคคลอื่นและกฎหมายที่เกี่ยวข้อง',
                  'เมื่อผู้ใช้อัปโหลดหรือเผยแพร่เนื้อหาผ่าน TalkTU ผู้ใช้อนุญาตให้ TalkTU ใช้เนื้อหาดังกล่าวโดยไม่ผูกขาด ทั่วโลก และไม่มีค่าลิขสิทธิ์ เพื่อจัดเก็บ ทำซ้ำ แสดงผล และประมวลผลเท่าที่จำเป็นสำหรับการให้บริการ การรักษาความปลอดภัย และการปรับปรุงแอปพลิเคชัน',
                  'การอนุญาตดังกล่าวไม่ถือเป็นการโอนกรรมสิทธิ์ในเนื้อหาให้ TalkTU',
                  'เมื่อผู้ใช้ลบเนื้อหาหรือบัญชี การอนุญาตดังกล่าวจะสิ้นสุดลงตามขอบเขตที่เกี่ยวข้อง เว้นแต่การจัดเก็บหรือใช้งานต่อจะจำเป็นเพื่อปฏิบัติตามกฎหมาย รักษาความปลอดภัย ป้องกันการทุจริต จัดการข้อพิพาท หรือดำเนินการตามวัตถุประสงค์อื่นที่ชอบด้วยกฎหมาย',
                  'ผู้ใช้รับรองว่าตนมีสิทธิในการเผยแพร่เนื้อหาที่ส่งเข้าสู่ระบบ และเนื้อหาดังกล่าวไม่ละเมิดกฎหมายหรือสิทธิของบุคคลอื่น',
                ],
              },

              {
                heading:
                  '6. ความเป็นส่วนตัวและข้อมูลส่วนบุคคล',
                paragraphs: [
                  'การใช้งาน TalkTU อยู่ภายใต้นโยบายความเป็นส่วนตัวของแอปพลิเคชัน',
                  'ผู้ใช้ควรระมัดระวังในการเผยแพร่ข้อมูลส่วนบุคคลผ่านโปรไฟล์ โพสต์ ความคิดเห็น หรือแชท เนื่องจากข้อมูลที่แบ่งปันกับผู้ใช้รายอื่นอาจถูกบันทึก คัดลอก หรือเผยแพร่ต่อได้',
                  'TalkTU จะประมวลผลข้อมูลส่วนบุคคลตามนโยบายความเป็นส่วนตัวและกฎหมายที่เกี่ยวข้อง',
                ],
              },

              {
                heading:
                  '7. ความปลอดภัยในการติดต่อผู้ใช้รายอื่น',
                paragraphs: [
                  'TalkTU เป็นแพลตฟอร์มที่ช่วยให้ผู้ใช้ค้นพบและทำความรู้จักกับบุคคลอื่น แต่ไม่รับประกันว่าข้อมูล ตัวตน เจตนา หรือพฤติกรรมของผู้ใช้ทุกรายจะได้รับการตรวจสอบยืนยันโดยอิสระ',
                  'ผู้ใช้ควรใช้วิจารณญาณในการติดต่อสื่อสารและการนัดพบกับผู้ใช้อื่นนอกแอปพลิเคชัน',
                  'เพื่อความปลอดภัย เราแนะนำให้ผู้ใช้ปฏิบัติดังต่อไปนี้',
                ],
                bullets: [
                  'หลีกเลี่ยงการเปิดเผยข้อมูลส่วนบุคคลที่มีความอ่อนไหว',
                  'ไม่ส่งเงินหรือข้อมูลทางการเงินให้บุคคลที่ไม่ไว้วางใจ',
                  'ระมัดระวังบัญชีที่มีพฤติกรรมน่าสงสัย',
                  'รายงานบัญชีที่มีพฤติกรรมคุกคาม หลอกลวง หรือทำให้รู้สึกไม่ปลอดภัย',
                  'หากนัดพบผู้ใช้อื่น ควรเลือกสถานที่สาธารณะและแจ้งบุคคลที่ไว้ใจให้ทราบ',
                ],
              },

              {
                heading:
                  '8. การตรวจสอบและจัดการการละเมิด',
                paragraphs: [
                  'TalkTU อาจตรวจสอบเหตุการณ์ที่มีเหตุอันควรสงสัยว่าละเมิดข้อกำหนดหรือ Community Guidelines',
                  'มาตรการที่อาจดำเนินการประกอบด้วย',
                ],
                bullets: [
                  'ลบหรือจำกัดการเข้าถึงเนื้อหาที่ไม่เหมาะสม',
                  'แจ้งเตือนผู้ใช้',
                  'จำกัดการเข้าถึงฟังก์ชันบางประเภท',
                  'ระงับบัญชีชั่วคราว',
                  'ยุติบัญชีในกรณีร้ายแรงหรือเกิดการละเมิดซ้ำ',
                  'ดำเนินการเพิ่มเติมตามที่กฎหมายกำหนดหรืออนุญาต',
                ],
              },

              {
                heading:
                  '8.1 การพิจารณามาตรการ',
                paragraphs: [
                  'การดำเนินการจะพิจารณาตามข้อเท็จจริง ลักษณะและความร้ายแรงของเหตุการณ์ ประวัติการละเมิด ความปลอดภัยของผู้ใช้ และกฎหมายที่เกี่ยวข้อง',
                ],
              },

              {
                heading:
                  '9. การระงับ การยุติ และการลบบัญชี',
                paragraphs: [
                  'ผู้ใช้สามารถหยุดใช้งาน TalkTU ได้ทุกเมื่อ',
                  'ผู้ใช้สามารถลบบัญชี TalkTU ผ่าน Profile → Account Settings → Delete Account',
                  'หากผู้ใช้ไม่สามารถเข้าถึงแอปได้ สามารถส่งคำขอลบบัญชีผ่านหน้า Account Deletion ของ TalkTU หรือผ่านช่องทางติดต่ออย่างเป็นทางการของ TalkTU',
                  'TalkTU อาจระงับหรือยุติการใช้งานบัญชีเมื่อมีเหตุอันควรเชื่อว่าบัญชีดังกล่าวละเมิดข้อกำหนด คุกคามความปลอดภัยของผู้ใช้ รบกวนการทำงานของระบบ หรือก่อให้เกิดความเสี่ยงทางกฎหมาย',
                  'การยุติบัญชีไม่ทำให้สิทธิหรือหน้าที่ที่เกิดขึ้นก่อนการยุติสิ้นสุดลงโดยอัตโนมัติ และไม่กระทบต่อการเก็บรักษาข้อมูลที่จำเป็นตามกฎหมายหรือวัตถุประสงค์ที่ชอบด้วยกฎหมายตามที่อธิบายไว้ในนโยบายความเป็นส่วนตัว',
                ],
              },

              {
                heading:
                  '10. ทรัพย์สินทางปัญญา',
                paragraphs: [
                  'ชื่อ TalkTU เครื่องหมายการค้า การออกแบบ ส่วนติดต่อผู้ใช้ ซอฟต์แวร์ และองค์ประกอบอื่นที่เป็นของผู้พัฒนาได้รับความคุ้มครองตามกฎหมายทรัพย์สินทางปัญญาที่เกี่ยวข้อง',
                  'ผู้ใช้ต้องไม่ทำซ้ำ ดัดแปลง เผยแพร่ หรือใช้ประโยชน์เชิงพาณิชย์จากองค์ประกอบที่ได้รับความคุ้มครองโดยไม่ได้รับอนุญาต เว้นแต่กฎหมายอนุญาต',
                  'ข้อกำหนดฉบับนี้ไม่โอนกรรมสิทธิ์ในทรัพย์สินทางปัญญาของ TalkTU ให้แก่ผู้ใช้',
                ],
              },

              {
                heading:
                  '11. ความพร้อมใช้งานและข้อจำกัดการรับประกัน',
                paragraphs: [
                  'TalkTU ให้บริการตามสภาพความพร้อมใช้งานของระบบ',
                  'TalkTU ไม่รับประกันว่าแอปพลิเคชันจะทำงานได้อย่างต่อเนื่อง ปราศจากข้อผิดพลาด หรือมีข้อมูลจากผู้ใช้ทุกรายที่ถูกต้องสมบูรณ์',
                  'ข้อกำหนดนี้ไม่ตัดสิทธิหรือจำกัดความรับผิดใดที่กฎหมายไม่อนุญาตให้ยกเว้นหรือจำกัด',
                ],
              },

              {
                heading:
                  '12. ข้อจำกัดความรับผิด',
                paragraphs: [
                  'ภายในขอบเขตที่กฎหมายอนุญาต TalkTU และผู้ดำเนินการอาจไม่ต้องรับผิดชอบต่อความเสียหายทางอ้อมบางประเภทที่เกิดจากการใช้งานแอปพลิเคชัน',
                  'ไม่มีข้อความใดในข้อกำหนดนี้มีเจตนาตัดสิทธิของผู้บริโภคหรือยกเว้นความรับผิดที่กฎหมายไม่อนุญาตให้ยกเว้น',
                ],
              },

              {
                heading:
                  '13. การแก้ไขข้อกำหนด',
                paragraphs: [
                  'TalkTU อาจแก้ไขข้อกำหนดการให้บริการเมื่อมีการเปลี่ยนแปลงฟังก์ชัน รูปแบบการให้บริการ หรือกฎหมายที่เกี่ยวข้อง',
                  'หากมีการเปลี่ยนแปลงที่สำคัญ TalkTU จะแจ้งให้ผู้ใช้ทราบตามความเหมาะสมและตามที่กฎหมายกำหนด',
                ],
              },

              {
                heading:
                  '14. กฎหมายที่ใช้บังคับ',
                paragraphs: [
                  'ข้อกำหนดฉบับนี้อยู่ภายใต้บังคับและตีความตามกฎหมายแห่งราชอาณาจักรไทย รวมถึงกฎหมายที่เกี่ยวข้องกับการคุ้มครองข้อมูลส่วนบุคคลและธุรกรรมทางอิเล็กทรอนิกส์',
                  'การใช้และการตีความข้อกำหนดต้องไม่ขัดต่อบทบัญญัติของกฎหมายที่ใช้บังคับ',
                  'กฎหมายที่เกี่ยวข้องซึ่งควรพิจารณาสำหรับ TalkTU ได้แก่',
                ],
                bullets: [
                  'พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ซึ่งเกี่ยวข้องกับการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของผู้ใช้งาน',
                  'พระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544 ซึ่งเกี่ยวข้องกับธุรกรรมและข้อมูลในรูปแบบอิเล็กทรอนิกส์',
                ],
              },

              {
                heading:
                  '15. ช่องทางติดต่อ',
                paragraphs: [
                  'หากมีข้อสงสัยเกี่ยวกับข้อกำหนดการให้บริการ สามารถติดต่อทีม TalkTU ผ่านช่องทางอย่างเป็นทางการดังต่อไปนี้',
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
                  '1. Acceptance of Terms',
                paragraphs: [
                  'These Terms of Service set out the conditions for accessing and using the TalkTU application.',
                  'By registering for or using TalkTU, users accept these Terms of Service, the related Privacy Policy, and the TalkTU Community Guidelines. If a user does not accept these terms, the user should stop using the application.',
                  'Consent for the processing of personal data will be requested separately where required by law.',
                ],
              },

              {
                heading:
                  '2. Eligibility and Registration',
                paragraphs: [
                  'Persons wishing to use TalkTU must be at least 18 years old and meet the eligibility requirements set by the application and applicable law.',
                  'Users must comply with the following conditions:',
                ],
                numbered: [
                  'Provide accurate and up-to-date registration information',
                  'Not impersonate another person',
                  'Not create an account to deceive or unlawfully exploit other users',
                  'Keep login credentials secure',
                  'Notify the TalkTU team if unauthorized access is suspected',
                  'Use the application in good faith and comply with applicable law',
                ],
              },

              {
                heading:
                  '2.1 Accounts That Violate These Terms',
                paragraphs: [
                  'TalkTU may restrict, suspend, or terminate accounts that violate these Terms as appropriate, taking into account the nature of the violation, user safety, and applicable law.',
                ],
              },

              {
                heading:
                  '3. Nature of the Service',
                paragraphs: [
                  'TalkTU may provide the following features:',
                ],
              },

              {
                heading:
                  '3.1 Profile Creation',
                paragraphs: [
                  'Users can create and manage profile information such as their display name, photos, introductory information, and other information supported by the application.',
                ],
              },

              {
                heading:
                  '3.2 User Discovery',
                paragraphs: [
                  'Users can view profiles that the system permits to be displayed in order to discover and get to know new people.',
                ],
              },

              {
                heading:
                  '3.3 Swipes, Likes, and Matching',
                paragraphs: [
                  "Users can express interest in or pass on other users through features supported by the application. Matching and display are subject to the application's operating conditions.",
                ],
              },

              {
                heading:
                  '3.4 Chat System',
                paragraphs: [
                  "Users can communicate with users they are permitted to chat with through the chat system, subject to the application's permissions and conditions.",
                ],
              },

              {
                heading:
                  '3.5 Feed',
                paragraphs: [
                  'Users can publish, view, Like, comment on, reply to, and otherwise interact with content supported by the application.',
                ],
              },

              {
                heading:
                  '3.6 Reporting, Blocking, and Unmatching',
                paragraphs: [
                  'TalkTU provides Report, Block, and Unmatch features to help users manage interactions and safety within the application.',
                  'Report: Users may report accounts, behavior, or content that may violate these Terms or the Community Guidelines.',
                  "Block: When a user blocks another user, TalkTU prevents the two users from encountering each other again within TalkTU in accordance with the system's functionality.",
                  'Unmatch: Unmatching ends the matching relationship but does not block the other user. The two users may therefore encounter each other again in other modes.',
                  'If a user does not wish to encounter another user again within TalkTU, the Block function should be used instead of Unmatch.',
                ],
              },

              {
                heading:
                  '3.7 Changes to Features',
                paragraphs: [
                  'TalkTU may change, improve, suspend, or discontinue certain features as necessary, taking into account service operation, safety, and applicable law.',
                ],
              },

              {
                heading:
                  '4. User Duties and Responsibilities',
                paragraphs: [
                  'Users agree to use TalkTU in good faith, respect the rights of others, and comply with the law.',
                  'Users must not:',
                ],
                bullets: [
                  'Harass, threaten, bully, or persecute other users',
                  "Unlawfully disclose another person's personal data",
                  'Impersonate another person',
                  'Publish unlawful content or content that harms others',
                  'Use the application to deceive, defraud, or unlawfully exploit others',
                  'Send spam messages or advertisements',
                  'Attempt to access accounts, databases, or systems without authorization',
                  'Disrupt the operation of or attempt to compromise the security of the application',
                  'Attempt to bypass safety systems, Blocks, or measures used by TalkTU to protect users',
                  'Infringe intellectual-property rights or other rights',
                ],
              },

              {
                heading:
                  '4.1 Community Guidelines',
                paragraphs: [
                  "Users must comply with TalkTU's Community Guidelines together with these Terms.",
                ],
              },

              {
                heading:
                  '5. User-Generated Content',
                paragraphs: [
                  'Users remain the owners of the content they create, subject to the rights of others and applicable law.',
                  'When users upload or publish content through TalkTU, they grant TalkTU a non-exclusive, worldwide, royalty-free license to store, reproduce, display, and process that content to the extent necessary to provide the service, maintain security, and improve the application.',
                  'This license does not transfer ownership of the content to TalkTU.',
                  'When a user deletes content or their account, the license ends to the relevant extent, except where continued storage or use is necessary to comply with law, maintain security, prevent fraud, resolve disputes, or pursue other lawful purposes.',
                  'Users represent that they have the right to publish the content they submit and that the content does not violate law or the rights of others.',
                ],
              },

              {
                heading:
                  '6. Privacy and Personal Data',
                paragraphs: [
                  "Use of TalkTU is subject to the application's Privacy Policy.",
                  'Users should exercise caution when publishing personal data through profiles, posts, comments, or chat because information shared with other users may be saved, copied, or further disseminated.',
                  'TalkTU will process personal data in accordance with the Privacy Policy and applicable law.',
                ],
              },

              {
                heading:
                  '7. Safety When Contacting Other Users',
                paragraphs: [
                  "TalkTU helps users discover and get to know other people but does not guarantee that every user's information, identity, intentions, or behavior has been independently verified.",
                  'Users should use their own judgment when communicating with or meeting other users outside the application.',
                  'For safety, users should:',
                ],
                bullets: [
                  'Avoid disclosing sensitive personal data',
                  'Do not send money or financial information to people you do not trust',
                  'Be cautious of accounts that behave suspiciously',
                  'Report accounts that engage in harassing, deceptive, or unsafe behavior',
                  'If arranging an in-person meeting, choose a public place and tell someone you trust',
                ],
              },

              {
                heading:
                  '8. Monitoring and Handling of Violations',
                paragraphs: [
                  'TalkTU may investigate incidents where there is reasonable suspicion of a violation of these Terms or the Community Guidelines.',
                  'Measures that may be taken include:',
                ],
                bullets: [
                  'Removing or restricting access to inappropriate content',
                  'Warning users',
                  'Restricting access to certain features',
                  'Temporarily suspending accounts',
                  'Terminating accounts in serious or repeated cases',
                  'Taking further action as required or permitted by law',
                ],
              },

              {
                heading:
                  '8.1 Enforcement Decisions',
                paragraphs: [
                  'Enforcement decisions may take into account the facts, nature and severity of the incident, previous violations, user safety, and applicable law.',
                ],
              },

              {
                heading:
                  '9. Suspension, Termination, and Account Deletion',
                paragraphs: [
                  'Users may stop using TalkTU at any time.',
                  'Users may delete their TalkTU account through Profile → Account Settings → Delete Account.',
                  'If users no longer have access to the application, they may submit a deletion request through the TalkTU Account Deletion page or through the official TalkTU contact channels.',
                  'TalkTU may suspend or terminate an account where there is reasonable cause to believe that the account violates these Terms, threatens user safety, disrupts system operation, or creates legal risk.',
                  'Termination does not automatically end rights or obligations that arose before termination and does not affect information that must be retained under applicable law or for other lawful purposes described in the Privacy Policy.',
                ],
              },

              {
                heading:
                  '10. Intellectual Property',
                paragraphs: [
                  'The TalkTU name, trademarks, designs, user interface, software, and other elements owned by the developer are protected under applicable intellectual-property laws.',
                  'Users must not copy, modify, distribute, or commercially exploit protected elements without permission, except where permitted by law.',
                  "These Terms do not transfer ownership of TalkTU's intellectual property to users.",
                ],
              },

              {
                heading:
                  '11. Availability and Disclaimer of Warranties',
                paragraphs: [
                  'TalkTU is provided on an "as available" basis according to system availability.',
                  'TalkTU does not guarantee uninterrupted or error-free operation or that information supplied by every user will be accurate and complete.',
                  'These Terms do not remove or limit liability where applicable law does not permit such exclusion or limitation.',
                ],
              },

              {
                heading:
                  '12. Limitation of Liability',
                paragraphs: [
                  'To the extent permitted by law, TalkTU and its operators may not be liable for certain indirect damages arising from use of the application.',
                  'Nothing in these Terms is intended to remove consumer rights or exclude liability where the law does not permit such exclusion.',
                ],
              },

              {
                heading:
                  '13. Amendments to the Terms',
                paragraphs: [
                  'TalkTU may amend these Terms when there are changes to features, the form of the service, or applicable law.',
                  'If there are material changes, users will be notified as appropriate and as required by law.',
                ],
              },

              {
                heading:
                  '14. Governing Law',
                paragraphs: [
                  'These Terms are governed by and construed in accordance with the laws of the Kingdom of Thailand, including applicable laws relating to personal-data protection and electronic transactions.',
                  'The application and interpretation of these Terms must not conflict with applicable law.',
                  'Laws relevant to TalkTU that should be considered include:',
                ],
                bullets: [
                  "The Personal Data Protection Act B.E. 2562 (2019), which relates to the collection, use, and disclosure of users' personal data",
                  'The Electronic Transactions Act B.E. 2544 (2001), which relates to transactions and data in electronic form',
                ],
              },

              {
                heading:
                  '15. Contact',
                paragraphs: [
                  'If you have questions about these Terms of Service, you can contact the TalkTU team through the following official channels:',
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
          ? 'TalkTU · ข้อกำหนดการให้บริการ'
          : 'TalkTU · Terms of Service'
      }
    />
  );
}