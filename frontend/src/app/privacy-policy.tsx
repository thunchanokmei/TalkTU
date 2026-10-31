import React, { useState } from 'react';

import PolicyPageLayout, {
  type PolicyLanguage,
} from '@/components/policy/PolicyPageLayout';

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
          ? 'วันที่มีผลบังคับใช้: 28 ตุลาคม 2569'
          : 'Effective date: October 28, 2026 (B.E. 2569)'
      }
      sections={
        isThai
          ? [
              {
                heading: '1. บทนำ',
                paragraphs: [
                  'TalkTU ให้ความสำคัญกับความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้งาน',
                  'TalkTU เป็นแอปพลิเคชันที่ช่วยให้ผู้ใช้สามารถสร้างโปรไฟล์ ค้นพบผู้ใช้รายอื่น แสดงความสนใจ สื่อสารผ่านระบบแชท และแบ่งปันเนื้อหาผ่านหน้า Feed',
                  'นโยบายความเป็นส่วนตัวฉบับนี้จัดทำขึ้นเพื่ออธิบายว่า TalkTU เก็บรวบรวม ใช้ เปิดเผย จัดเก็บ และปกป้องข้อมูลส่วนบุคคลของผู้ใช้อย่างไร รวมถึงอธิบายสิทธิของผู้ใช้เกี่ยวกับข้อมูลส่วนบุคคลของตนเอง',
                  'การใช้งาน TalkTU หมายถึงผู้ใช้ได้รับทราบนโยบายฉบับนี้แล้ว ทั้งนี้ การดำเนินการใดที่กฎหมายกำหนดให้ต้องได้รับความยินยอม จะดำเนินการขอความยินยอมแยกต่างหากตามความเหมาะสม',
                ],
              },

              {
                heading:
                  '2. ข้อมูลที่เราเก็บรวบรวม',
                paragraphs: [
                  'TalkTU อาจเก็บรวบรวมข้อมูลส่วนบุคคลตามประเภทและฟังก์ชันที่ผู้ใช้เลือกใช้งาน ดังต่อไปนี้',
                ],
              },

              {
                heading:
                  '2.1 ข้อมูลบัญชีผู้ใช้',
                paragraphs: [
                  'TalkTU ใช้ข้อมูลบัญชีมหาวิทยาลัยธรรมศาสตร์ (TU) เพื่อยืนยันตัวตนและตรวจสอบสิทธิ์ในการเข้าใช้งานแอปพลิเคชัน โดยผู้ใช้ต้องกรอกรหัสนักศึกษาและรหัสผ่านบัญชี TU ในขั้นตอนการเข้าสู่ระบบ',
                  'TalkTU ใช้ข้อมูลดังกล่าวเท่าที่จำเป็นเพื่อยืนยันตัวตน จัดการบัญชีผู้ใช้ รักษาสถานะการเข้าสู่ระบบ และรักษาความปลอดภัยของระบบ',
                ],
                bullets: [
                  'รหัสนักศึกษา ใช้เพื่อระบุตัวผู้ใช้และประกอบกระบวนการยืนยันตัวตนกับระบบของมหาวิทยาลัย',
                  'รหัสผ่านบัญชี TU ใช้เฉพาะในกระบวนการยืนยันตัวตน โดย TalkTU ไม่จัดเก็บรหัสผ่านบัญชี TU ไว้ในฐานข้อมูลของแอปพลิเคชัน',
                  'รหัสประจำตัวผู้ใช้ที่ระบบสร้างขึ้น เช่น รหัสผู้ใช้เฉพาะของแต่ละบัญชี ซึ่งใช้เชื่อมโยงบัญชีผู้ใช้กับข้อมูลโปรไฟล์ ข้อความ การจับคู่ โพสต์ และกิจกรรมอื่นภายในแอปพลิเคชัน',
                ],
              },

              {
                heading:
                  '2.2 ข้อมูลโปรไฟล์',
                bullets: [
                  'ชื่อที่ใช้แสดงในแอปพลิเคชัน',
                  'วันเกิด',
                  'เพศกำเนิด',
                  'อัตลักษณ์ทางเพศ หากผู้ใช้ระบุ',
                  'ความสนใจในการทำความรู้จักหรือการเดต',
                  'รุ่นหรือชั้นปีของมหาวิทยาลัย (TU generation)',
                  'คณะ',
                  'สาขาหรือหลักสูตรการศึกษา',
                  'ความสนใจ (Interests)',
                  'ข้อมูลแนะนำตัว (Bio)',
                  'ส่วนสูง หากผู้ใช้ระบุ',
                  'รูปภาพโปรไฟล์',
                  'ข้อมูลหรือความชอบอื่นที่ผู้ใช้เลือกให้ไว้เป็นส่วนหนึ่งของโปรไฟล์ผ่านฟังก์ชันที่ TalkTU รองรับ',
                ],
              },

              {
                heading:
                  '2.3 ข้อมูลเนื้อหาและกิจกรรมภายในแอป',
                bullets: [
                  'โพสต์ ความคิดเห็น และการตอบกลับความคิดเห็นที่ผู้ใช้สร้างขึ้น',
                  'ข้อความที่ส่งผ่านระบบแชท',
                  'การกด Like การ Swipe และข้อมูลการจับคู่ระหว่างผู้ใช้',
                  'ข้อมูลการโต้ตอบระหว่างผู้ใช้เท่าที่จำเป็นต่อการทำงานของระบบ',
                  'ข้อมูลการยกเลิกการจับคู่ (Unmatch)',
                  'ข้อมูลการบล็อกผู้ใช้ (Block)',
                  'รายงานเกี่ยวกับบัญชี เนื้อหา หรือพฤติกรรม รวมถึงเหตุผลและรายละเอียดเพิ่มเติมที่ผู้ใช้เลือกส่ง',
                  'ข้อมูลอื่นที่จำเป็นต่อการดำเนินการด้านความปลอดภัย การป้องกันการใช้งานในทางที่ผิด และการบังคับใช้ข้อกำหนดของ TalkTU',
                ],
              },

              {
                heading:
                  '2.4 ข้อมูลทางเทคนิคและข้อมูลระบบ',
                paragraphs: [
                  'TalkTU อาจเก็บรวบรวมและจัดเก็บข้อมูลทางเทคนิคและข้อมูลระบบที่จำเป็นต่อการทำงาน ความปลอดภัย การตรวจสอบข้อผิดพลาด และการรักษาความต่อเนื่องของบริการ เช่น',
                ],
                bullets: [
                  'รหัสประจำตัวผู้ใช้หรือบัญชีที่ระบบสร้างขึ้น',
                  'ตัวระบุของข้อมูลภายในระบบ เช่น ตัวระบุโพสต์ ความคิดเห็น ข้อความ การจับคู่ หรือรายการกิจกรรมต่าง ๆ',
                  'วันที่และเวลาที่เกี่ยวข้องกับการสร้าง แก้ไข หรือดำเนินกิจกรรมภายในระบบ',
                  'ข้อมูลที่จำเป็นต่อการยืนยันตัวตน การรักษาสถานะการเข้าสู่ระบบ และการจัดการเซสชัน',
                  'บันทึกข้อผิดพลาดและข้อมูลการวินิจฉัยปัญหา',
                  'ข้อมูลคำขอและข้อมูลทางเทคนิคอื่นเท่าที่จำเป็นต่อการรักษาความปลอดภัยและการทำงานของแอปพลิเคชัน',
                ],
              },

              {
                heading:
                  '2.5 การยืนยันตัวตนผ่านบัญชี TU (TU Account Authentication)',
                paragraphs: [
                  'TalkTU เชื่อมต่อกับระบบ TU REST API เพื่อรับข้อมูลที่เกี่ยวข้องกับผู้ใช้และจำเป็นต่อการให้บริการภายในแอปพลิเคชัน โดยข้อมูลที่ TalkTU อาจนำมาใช้และจัดเก็บประกอบด้วย',
                  'TalkTU ใช้ข้อมูลดังกล่าวเพื่อสนับสนุนการยืนยันตัวตน จัดทำข้อมูลโปรไฟล์ที่เกี่ยวข้อง และให้บริการภายในแอปพลิเคชัน โดยจัดเก็บเฉพาะข้อมูลที่จำเป็นต่อการทำงานของ TalkTU ตามที่อธิบายไว้ในนโยบายฉบับนี้',
                ],
                bullets: [
                  'อีเมลมหาวิทยาลัยธรรมศาสตร์ (TU email)',
                  'ข้อมูลคณะ',
                  'ข้อมูลสาขาหรือหลักสูตรการศึกษา',
                ],
              },

              {
                heading:
                  '3. วัตถุประสงค์ในการใช้ข้อมูล',
                paragraphs: [
                  'TalkTU อาจใช้ข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ดังต่อไปนี้',
                ],
                numbered: [
                  'เพื่อสร้างและจัดการบัญชีผู้ใช้',
                  'เพื่อยืนยันตัวตนและรักษาความปลอดภัยของบัญชี',
                  'เพื่อแสดงโปรไฟล์และรูปภาพของผู้ใช้',
                  'เพื่อค้นหาและแนะนำโปรไฟล์ผู้ใช้รายอื่น',
                  'เพื่อรองรับการ Swipe การกด Like และการจับคู่ระหว่างผู้ใช้',
                  'เพื่อให้บริการระบบแชทและการสื่อสาร',
                  'เพื่อแสดงโพสต์ ความคิดเห็น และการตอบกลับบนหน้า Feed',
                  'เพื่อจัดเก็บและแสดงข้อมูลโปรไฟล์ที่ผู้ใช้เลือกหรือให้ไว้',
                  'เพื่อรับรายงาน ข้อร้องเรียน และจัดการปัญหาการใช้งาน',
                  'เพื่อรองรับฟังก์ชัน Block และ Unmatch',
                  'เพื่อป้องกันการฉ้อโกง การคุกคาม และการใช้งานที่ผิดวัตถุประสงค์',
                  'เพื่อปรับปรุงประสิทธิภาพและความปลอดภัยของแอปพลิเคชัน',
                  'เพื่อปฏิบัติตามกฎหมายและข้อกำหนดที่เกี่ยวข้อง',
                ],
              },

              {
                heading: '3.1 ฐานและขอบเขตการใช้ข้อมูล',
                paragraphs: [
                  'TalkTU จะใช้ข้อมูลตามวัตถุประสงค์ที่เหมาะสมและมีฐานทางกฎหมายรองรับ โดยจะดำเนินการขอความยินยอมเมื่อจำเป็นต้องได้รับความยินยอมตามกฎหมาย',
                ],
              },

              {
                heading:
                  '4. การเปิดเผยข้อมูลแก่บุคคลอื่น',
                paragraphs: [
                  'TalkTU อาจเปิดเผยข้อมูลบางประเภทแก่บุคคลหรือหน่วยงานที่เกี่ยวข้องกับการให้บริการตามความจำเป็น',
                ],
              },

              {
                heading:
                  '4.1 การแสดงข้อมูลแก่ผู้ใช้รายอื่น',
                paragraphs: [
                  'ข้อมูลที่ผู้ใช้เลือกแสดงในโปรไฟล์หรือเผยแพร่ภายในแอปอาจปรากฏแก่ผู้ใช้รายอื่น เช่น',
                ],
                bullets: [
                  'ชื่อที่ใช้แสดง',
                  'รูปภาพโปรไฟล์',
                  'ข้อมูลแนะนำตัว',
                  'ข้อมูลโปรไฟล์อื่นที่ระบบกำหนดให้แสดง',
                  'โพสต์ ความคิดเห็น และการตอบกลับที่เผยแพร่บน Feed',
                ],
              },

              {
                heading:
                  '4.1 การใช้ข้อมูลที่เผยแพร่โดยผู้ใช้อื่น',
                paragraphs: [
                  'ผู้ใช้ควรตรวจสอบข้อมูลที่ตนเองเผยแพร่ก่อนโพสต์หรือส่งให้ผู้อื่น เนื่องจากผู้รับข้อมูลอาจบันทึก คัดลอก หรือเผยแพร่ข้อมูลต่อได้',
                ],
              },

              {
                heading:
                  '4.2 ผู้ให้บริการระบบ',
                paragraphs: [
                  'TalkTU อาจเปิดเผยหรือส่งข้อมูลให้ผู้ให้บริการภายนอกที่จำเป็นต่อการทำงานของบริการ เช่น ผู้ให้บริการระบบยืนยันตัวตน ฐานข้อมูล และพื้นที่จัดเก็บไฟล์หรือรูปภาพ เท่าที่จำเป็นต่อการให้บริการและภายใต้เงื่อนไขที่เกี่ยวข้อง',
                ],
              },

              {
                heading:
                  '4.3 การเปิดเผยตามกฎหมาย',
                paragraphs: [
                  'TalkTU อาจเปิดเผยข้อมูลเมื่อมีหน้าที่ต้องดำเนินการตามกฎหมาย คำสั่งของหน่วยงานที่มีอำนาจ หรือเมื่อมีเหตุอันชอบด้วยกฎหมายที่เกี่ยวข้องกับความปลอดภัยและการคุ้มครองสิทธิของบุคคล',
                ],
              },

              {
                heading:
                  '5. การใช้บริการจากบุคคลภายนอก',
                paragraphs: [
                  'TalkTU ใช้ Supabase สำหรับบริการระบบหลังบ้านบางส่วน เช่น ระบบยืนยันตัวตน การจัดการฐานข้อมูล การจัดเก็บไฟล์และรูปภาพ Realtime และบริการทางเทคนิคอื่นที่จำเป็นต่อการทำงานของแอปพลิเคชัน',
                  'ข้อมูลที่ประมวลผลผ่าน Supabase อาจรวมถึงข้อมูลบัญชี ข้อมูลโปรไฟล์ เนื้อหาและกิจกรรมภายในแอป ข้อความ การจับคู่ ข้อมูลด้านความปลอดภัย และไฟล์หรือรูปภาพที่ผู้ใช้อัปโหลด ทั้งนี้ขึ้นอยู่กับฟังก์ชันที่ผู้ใช้ใช้งาน',
                  'การประมวลผลข้อมูลผ่านผู้ให้บริการภายนอกจะดำเนินการเท่าที่จำเป็นต่อการให้บริการ และเป็นไปตามการตั้งค่าระบบ เงื่อนไขของผู้ให้บริการ และกฎหมายที่เกี่ยวข้อง',
                  'หาก TalkTU เพิ่มผู้ให้บริการภายนอกรายอื่นซึ่งส่งผลอย่างมีนัยสำคัญต่อวิธีการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล เราจะปรับปรุงนโยบายฉบับนี้ตามความเหมาะสม',
                ],
              },

              {
                heading:
                  '6. ระยะเวลาการจัดเก็บและการลบบัญชี',
                paragraphs: [
                  'TalkTU จะเก็บรักษาข้อมูลส่วนบุคคลเท่าที่จำเป็นต่อวัตถุประสงค์ในการให้บริการ การรักษาความปลอดภัย การจัดการข้อพิพาท และการปฏิบัติตามกฎหมาย',
                  'เมื่อผู้ใช้ดำเนินการลบบัญชี TalkTU จะดำเนินการลบข้อมูลที่เชื่อมโยงกับบัญชีออกจากระบบที่ใช้งานอยู่ตามกระบวนการลบบัญชีของระบบ ซึ่งอาจรวมถึงข้อมูลโปรไฟล์ รูปภาพ เนื้อหา กิจกรรมภายในแอป ข้อมูลการจับคู่ ข้อความ และข้อมูลบัญชีที่เกี่ยวข้อง',
                  'อย่างไรก็ตาม ข้อมูลบางประเภทอาจได้รับการเก็บรักษาไว้เท่าที่จำเป็นเมื่อมีกฎหมายกำหนด หรือเมื่อจำเป็นต่อการรักษาความปลอดภัย การป้องกันการทุจริต การจัดการข้อพิพาท หรือการใช้สิทธิเรียกร้องตามกฎหมาย',
                  'ข้อมูลที่อยู่ในระบบสำรองของผู้ให้บริการอาจถูกเก็บรักษาไว้ตามรอบระยะเวลาและกระบวนการของผู้ให้บริการที่เกี่ยวข้อง ก่อนที่จะถูกลบออกตามวงจรการทำงานปกติของระบบดังกล่าว',
                ],
              },

              {
                heading:
                  '7. สิทธิของเจ้าของข้อมูลส่วนบุคคล',
                paragraphs: [
                  'ผู้ใช้อาจมีสิทธิเกี่ยวกับข้อมูลส่วนบุคคลของตนเองตามกฎหมายที่เกี่ยวข้อง รวมถึงพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ดังนี้',
                ],
                bullets: [
                  'สิทธิในการเข้าถึงข้อมูล: ขอเข้าถึงข้อมูลส่วนบุคคลของตนเองตามเงื่อนไขของกฎหมาย',
                  'สิทธิในการขอรับสำเนาข้อมูล: ขอรับสำเนาข้อมูลส่วนบุคคลตามสิทธิที่กฎหมายกำหนด',
                  'สิทธิในการแก้ไขข้อมูล: ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์',
                  'สิทธิในการลบข้อมูล: ขอให้ลบหรือทำลายข้อมูลเมื่อเข้าเงื่อนไขตามกฎหมาย',
                  'สิทธิในการจำกัดการประมวลผล: ขอให้จำกัดการใช้ข้อมูลในกรณีที่กฎหมายกำหนด',
                  'สิทธิในการคัดค้าน: คัดค้านการประมวลผลข้อมูลบางประเภทตามเงื่อนไขของกฎหมาย',
                  'สิทธิในการถอนความยินยอม: ถอนความยินยอมสำหรับการประมวลผลที่อาศัยความยินยอมเป็นฐานทางกฎหมาย',
                  'สิทธิในการร้องเรียน: ร้องเรียนต่อหน่วยงานที่มีอำนาจเมื่อเห็นว่าการประมวลผลข้อมูลไม่เป็นไปตามกฎหมาย',
                ],
              },

              {
                heading:
                  '7.1 การใช้สิทธิ',
                paragraphs: [
                  'ผู้ใช้สามารถติดต่อ TalkTU เพื่อใช้สิทธิดังกล่าวได้ โดย TalkTU อาจขอตรวจสอบตัวตนก่อนดำเนินการ และอาจมีข้อยกเว้นตามที่กฎหมายกำหนด',
                ],
              },

              {
                heading:
                  '8. การรักษาความปลอดภัยของข้อมูล',
                paragraphs: [
                  'TalkTU ใช้มาตรการทางเทคนิคและมาตรการบริหารจัดการที่เหมาะสมเพื่อป้องกันข้อมูลส่วนบุคคลจากการเข้าถึง การเปิดเผย การเปลี่ยนแปลง การสูญหาย หรือการทำลายโดยไม่ได้รับอนุญาต',
                  'อย่างไรก็ตาม ไม่มีระบบจัดเก็บข้อมูลหรือการส่งข้อมูลผ่านอินเทอร์เน็ตใดที่สามารถรับประกันความปลอดภัยได้อย่างสมบูรณ์ ผู้ใช้ควรเก็บรักษาข้อมูลเข้าสู่ระบบของตนเองเป็นความลับ และแจ้งให้ TalkTU ทราบเมื่อสงสัยว่าบัญชีถูกเข้าถึงโดยไม่ได้รับอนุญาต',
                ],
              },

              {
                heading:
                  '9. ข้อกำหนดเกี่ยวกับอายุของผู้ใช้',
                paragraphs: [
                  'TalkTU กำหนดให้ผู้ใช้งานต้องมีอายุตั้งแต่ 18 ปีบริบูรณ์ขึ้นไปจึงจะสามารถสมัครสมาชิกและใช้งานแอปพลิเคชันได้ ผู้ใช้งานต้องให้ข้อมูลวันเกิดและอายุที่ถูกต้องตามความเป็นจริง และต้องไม่ให้ข้อมูลเท็จเพื่อหลีกเลี่ยงข้อกำหนดดังกล่าว',
                  'หาก TalkTU ตรวจพบว่าผู้ใช้งานมีอายุต่ำกว่าเกณฑ์หรือให้ข้อมูลอายุอันเป็นเท็จ TalkTU อาจระงับหรือยุติการให้บริการบัญชีดังกล่าวตามความเหมาะสม โดยคำนึงถึงกฎหมายและข้อกำหนดของแพลตฟอร์มที่เกี่ยวข้อง',
                  'ผู้ใช้มีหน้าที่ตรวจสอบให้แน่ใจว่าตนมีคุณสมบัติตามข้อกำหนดด้านอายุก่อนสมัครและใช้งาน TalkTU',
                ],
              },

              {
                heading:
                  '10. การโอนข้อมูลไปต่างประเทศ',
                paragraphs: [
                  'ข้อมูลส่วนบุคคลอาจได้รับการจัดเก็บหรือประมวลผลในประเทศอื่น ขึ้นอยู่กับที่ตั้งของระบบและผู้ให้บริการที่ TalkTU ใช้งาน',
                  'หากมีการโอนข้อมูลส่วนบุคคลไปต่างประเทศ TalkTU จะดำเนินการตามหลักเกณฑ์และมาตรการคุ้มครองข้อมูลที่กฎหมายกำหนด',
                ],
              },

              {
                heading:
                  '11. การเปลี่ยนแปลงนโยบาย',
                paragraphs: [
                  'TalkTU อาจปรับปรุงนโยบายความเป็นส่วนตัวฉบับนี้เมื่อมีการเปลี่ยนแปลงฟังก์ชันของแอป วิธีการประมวลผลข้อมูล หรือข้อกำหนดทางกฎหมาย',
                  'หากมีการเปลี่ยนแปลงที่สำคัญ TalkTU จะแจ้งให้ผู้ใช้ทราบตามความเหมาะสมและตามที่กฎหมายกำหนด',
                ],
              },

              {
                heading:
                  '12. ช่องทางติดต่อ',
                paragraphs: [
                  'หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว หรือประสงค์จะใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อทีม TalkTU ผ่านช่องทางอย่างเป็นทางการดังต่อไปนี้',
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
                heading: '1. Introduction',
                paragraphs: [
                  'TalkTU values the privacy of its users and the protection of their personal data.',
                  'TalkTU is an application that allows users to create profiles, discover other users, express interest, communicate through a chat system, and share content through a Feed.',
                  "This Privacy Policy explains how TalkTU collects, uses, discloses, stores, and protects users' personal data, and describes users' rights regarding their personal data.",
                  'By using TalkTU, users acknowledge this Policy. Where applicable law requires consent for a particular activity, TalkTU will request consent separately as appropriate.',
                ],
              },

              {
                heading: '2. Data We Collect',
                paragraphs: [
                  'TalkTU may collect personal data according to the type of data and the features the user chooses to use, as follows.',
                ],
              },

              {
                heading: '2.1 User Account Data',
                paragraphs: [
                  'TalkTU uses Thammasat University (TU) account credentials to authenticate users and verify their eligibility to access the application. Users are required to enter their student ID and TU account password during the login process.',
                  'TalkTU uses this information only as necessary to authenticate users, manage user accounts, maintain login sessions, and protect the security of the service.',
                ],
                bullets: [
                  "Student ID, used to identify the user and support authentication with the University's systems.",
                  "TU account password, used only during the authentication process. TalkTU does not store users' TU account passwords in the application's database.",
                  "System-generated user identifiers, such as the unique user ID assigned to an account, used to link the user's account with profile information, messages, matches, posts, and other activities within the application.",
                ],
              },

              {
                heading: '2.2 Profile Data',
                bullets: [
                  'Display name shown in the application',
                  'Date of birth',
                  'Sex assigned at birth',
                  'Gender identity, if specified by the user',
                  'Interest in getting to know people or dating',
                  'TU generation',
                  'Faculty',
                  'Academic program or department',
                  'Interests',
                  'Introductory information (Bio)',
                  'Height, if specified by the user',
                  'Profile photos',
                  'Other profile information or preferences that the user chooses to provide through features supported by TalkTU',
                ],
              },

              {
                heading:
                  '2.3 In-App Content and Activity Data',
                bullets: [
                  'Posts, comments, and comment replies created by users',
                  'Messages sent through the chat system',
                  'Likes, swipes, and matching information',
                  'Information about interactions between users where necessary for the operation of the service',
                  'Unmatching activity',
                  'Blocking activity',
                  'Reports concerning accounts, content, or behavior, including the reason and any additional details voluntarily submitted by the reporting user',
                  "Other information necessary to support safety functions, prevent misuse, and enforce TalkTU's Terms and Community Guidelines",
                ],
              },

              {
                heading:
                  '2.4 Technical and System Data',
                paragraphs: [
                  'TalkTU may collect and store technical and system data necessary for the operation, security, troubleshooting, and continuity of the service, including:',
                ],
                bullets: [
                  'System-generated user or account identifiers',
                  'Identifiers associated with records within the application, such as posts, comments, messages, matches, or activity records',
                  'Timestamps associated with the creation, modification, or processing of information and activities',
                  'Information necessary for authentication, session management, and maintaining login status',
                  'Error logs and diagnostic information',
                  'System request information and other technical data necessary to maintain the security and operation of the application',
                ],
              },

              {
                heading:
                  '2.5 TU Account Authentication',
                paragraphs: [
                  'TalkTU connects to the TU REST API to obtain user-related information necessary to provide its services. Information that TalkTU may use and store includes:',
                ],
                bullets: [
                  'Thammasat University email address (TU email)',
                  'Faculty information',
                  'Academic program or department information',
                ],
              },

              {
                heading:
                  '2.5 Use of TU Information',
                paragraphs: [
                  'TalkTU uses this information to support user verification, maintain relevant profile information, and provide application services. TalkTU stores only information that is necessary for the operation of TalkTU and that is described in this Privacy Policy.',
                ],
              },

              {
                heading:
                  '3. Purposes of Data Use',
                paragraphs: [
                  'TalkTU may use personal data for the following purposes:',
                ],
                numbered: [
                  'To create and manage user accounts',
                  'To verify identity and maintain account security',
                  "To display users' profiles and photos",
                  "To search for and recommend other users' profiles",
                  'To support swipes, Likes, and matching between users',
                  'To provide the chat and communication system',
                  'To display posts, comments, and replies on the Feed',
                  'To store and display profile information selected or provided by users',
                  'To receive reports and complaints and handle usage problems',
                  'To support Block and Unmatch functions',
                  'To prevent fraud, harassment, and misuse',
                  'To improve the performance and security of the application',
                  'To comply with applicable laws and requirements',
                ],
              },

              {
                heading:
                  '3.1 Lawful Use of Personal Data',
                paragraphs: [
                  'TalkTU will use personal data for appropriate purposes supported by a lawful basis and will request consent where consent is required by law.',
                ],
              },

              {
                heading:
                  '4. Disclosure of Data to Others',
                paragraphs: [
                  'TalkTU may disclose certain types of data to persons or organizations involved in providing the service, as necessary.',
                ],
              },

              {
                heading:
                  '4.1 Display of Data to Other Users',
                paragraphs: [
                  'Information that users choose to display on their profiles or publish within the application may be visible to other users, such as:',
                ],
                bullets: [
                  'Display name',
                  'Profile photos',
                  'Introductory information',
                  'Other profile data configured to be displayed',
                  'Posts, comments, and replies published on the Feed',
                ],
              },

              {
                heading:
                  '4.1 Information Shared with Other Users',
                paragraphs: [
                  'Users should review information before publishing or sending it to others because recipients may save, copy, or further disseminate that information.',
                ],
              },

              {
                heading: '4.2 Service Providers',
                paragraphs: [
                  'TalkTU may disclose or transmit data to external service providers necessary for the service to operate, such as authentication, database, and file or image storage providers, to the extent necessary to provide the service and subject to applicable conditions.',
                ],
              },

              {
                heading:
                  '4.3 Disclosure Required by Law',
                paragraphs: [
                  "TalkTU may disclose data when legally required to do so, when ordered by a competent authority, or where there are lawful grounds relating to safety or the protection of individuals' rights.",
                ],
              },

              {
                heading:
                  '5. Use of Third-Party Services',
                paragraphs: [
                  'TalkTU uses Supabase for certain backend services, including authentication, database management, file and image storage, realtime functionality, and other technical services necessary for the operation of the application.',
                  'Information processed through Supabase may include account information, profile information, in-app content and activity, messages, matching information, safety-related information, and files or images uploaded by users, depending on the features used.',
                  'Data processed through external service providers will be limited to what is necessary to provide the service and will be handled in accordance with applicable system configurations, provider terms, and applicable laws.',
                  'If TalkTU adds other external service providers that materially change how personal data is collected, used, or disclosed, this Privacy Policy will be updated as appropriate.',
                ],
              },

              {
                heading:
                  '6. Data Retention and Account Deletion',
                paragraphs: [
                  'TalkTU retains personal data only for as long as necessary to provide the service, maintain security, resolve disputes, and comply with applicable laws.',
                  "When a user deletes their account, TalkTU will remove data associated with the account from its active application systems in accordance with the application's account-deletion process. This may include profile information, photos, content, in-app activity, matching information, messages, and related account information.",
                  'Certain information may be retained where required by law or where retention is necessary for security, fraud prevention, dispute resolution, or the establishment, exercise, or defense of legal claims.',
                  "Information contained in service-provider backup systems may remain for the period required by the provider's backup and deletion processes before being removed through the normal lifecycle of those systems.",
                ],
              },

              {
                heading:
                  '7. Rights of Data Subjects',
                paragraphs: [
                  'Users may have rights regarding their personal data under applicable laws, including the Personal Data Protection Act B.E. 2562 (2019) (PDPA), including:',
                ],
                bullets: [
                  "Right of access: to request access to one's personal data, subject to legal conditions.",
                  "Right to obtain a copy: to request a copy of one's personal data, as provided by law.",
                  'Right to rectification: to request correction of inaccurate or incomplete data.',
                  'Right to erasure: to request deletion or destruction of data when legal conditions are met.',
                  'Right to restrict processing: to request restriction of the use of data in cases provided by law.',
                  'Right to object: to object to certain types of data processing, subject to legal conditions.',
                  'Right to withdraw consent: to withdraw consent for processing that relies on consent as its legal basis.',
                  'Right to lodge a complaint: to complain to a competent authority when the user believes the processing of data does not comply with the law.',
                ],
              },

              {
                heading:
                  '7.1 Exercising Your Rights',
                paragraphs: [
                  'Users may contact TalkTU to exercise these rights. TalkTU may request identity verification before processing a request and may apply exceptions provided by law.',
                ],
              },

              {
                heading: '8. Data Security',
                paragraphs: [
                  'TalkTU uses appropriate technical and administrative measures to protect personal data from unauthorized access, disclosure, alteration, loss, or destruction.',
                  'However, no data storage system or transmission over the internet can be guaranteed to be completely secure. Users should keep their login credentials confidential and notify TalkTU if they suspect that their account has been accessed without authorization.',
                ],
              },

              {
                heading: '9. Age Requirement',
                paragraphs: [
                  'TalkTU requires users to be at least 18 years of age to register and use the application. Users must provide their true date of birth and age and must not provide false information in order to circumvent this requirement.',
                  'If TalkTU detects that a user is under the required age or has provided false age information, TalkTU may suspend or terminate that account as appropriate, taking into account applicable law and platform requirements.',
                  'Users are responsible for ensuring that they meet the minimum age requirement before registering and using TalkTU.',
                ],
              },

              {
                heading:
                  '10. International Data Transfers',
                paragraphs: [
                  'Personal data may be stored or processed in other countries depending on the location of the systems and service providers used by TalkTU.',
                  'Where personal data is transferred abroad, TalkTU will proceed in accordance with the criteria and data protection measures required by applicable law.',
                ],
              },

              {
                heading:
                  '11. Changes to This Policy',
                paragraphs: [
                  "TalkTU may update this Privacy Policy when there are changes to the application's features, data-processing methods, or legal requirements.",
                  'If there are material changes, users will be notified as appropriate and as required by law.',
                ],
              },

              {
                heading: '12. Contact',
                paragraphs: [
                  'If you have questions about this Privacy Policy or wish to exercise your rights regarding personal data, you can contact the TalkTU team through the following official channels:',
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