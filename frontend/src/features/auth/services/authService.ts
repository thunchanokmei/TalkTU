export type TuLoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function loginWithTu(
  username: string,
  password: string
): Promise<TuLoginResult> {
  const cleanUsername = username.trim();

  if (!cleanUsername || !password) {
    return {
      success: false,
      message: 'Please enter your TU account and password.',
    };
  }

  // ========================================================
  // TEMPORARY MOCK LOGIN
  //
  // ตอนนี้ teammate กำลังทำ Supabase Edge Function: tu-login
  //
  // เมื่อ backend เสร็จ เราจะเปลี่ยนเฉพาะ function นี้
  // หน้า login.tsx ไม่ต้องรื้อ
  // ========================================================

  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
  };
}