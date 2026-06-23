import { supabase } from '../lib/supabaseClient'

const TABLE = 'profiles'

/**
 * ดึง profile ของผู้ใช้ที่ระบุ (ปกติคือผู้ใช้ปัจจุบัน)
 * ใช้ดูบทบาท (role) เพื่อรู้ว่าเป็น admin หรือไม่
 */
export async function getMyProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, email, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมด (RLS อนุญาตเฉพาะ admin ให้เห็นทุกคน)
 * ใช้สร้างตัวเลือก "ดูงานของใคร" ในหน้า admin
 */
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, email, role')
    .order('email', { ascending: true })

  if (error) throw error
  return data ?? []
}
