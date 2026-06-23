import { supabase } from '../lib/supabaseClient'

const TABLE = 'work_timeline'

// ฟิลด์ที่อนุญาตให้เขียนลง DB (กันค่าที่ไม่เกี่ยวข้องหลุดเข้าไป)
const WRITABLE_FIELDS = [
  'title',
  'work_date',
  'start_time',
  'end_time',
  'location',
  'google_map_url',
  'detail',
  'responsible_person',
  'status',
]

function sanitize(payload) {
  const out = {}
  for (const key of WRITABLE_FIELDS) {
    if (payload[key] !== undefined) {
      // แปลง string ว่างให้เป็น null สำหรับฟิลด์ที่ไม่บังคับ
      const value = payload[key]
      out[key] = value === '' ? null : value
    }
  }
  return out
}

// embed ข้อมูลเจ้าของงาน (owner) มาด้วย เพื่อให้ admin เห็นว่างานเป็นของใคร
const SELECT_WITH_OWNER = '*, owner:profiles(id, email, role)'

/**
 * ดึงรายการงาน เรียงจากงานที่ใกล้ถึงที่สุด -> ไกลที่สุด
 * - ผู้ใช้ทั่วไป: RLS จะคืนเฉพาะงานของตัวเองอยู่แล้ว
 * - admin: คืนทุกงาน หรือถ้าส่ง userId มาจะกรองเฉพาะของคนนั้น
 * - ค่าเริ่มต้นจะ "ไม่รวม" งานที่ถูกลบแบบ soft delete (deleted_at มีค่า)
 *   ส่ง { trashed: true } เพื่อดูเฉพาะงานในถังขยะ
 * @param {{ userId?: string, trashed?: boolean }} [options]
 */
export async function getWorkTimeline(options = {}) {
  const { userId, trashed = false } = options
  let query = supabase.from(TABLE).select(SELECT_WITH_OWNER)

  if (userId) query = query.eq('user_id', userId)

  // soft delete: กรองตามสถานะการลบ
  if (trashed) query = query.not('deleted_at', 'is', null)
  else query = query.is('deleted_at', null)

  query = query
    .order('work_date', { ascending: true })
    .order('start_time', { ascending: true })

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/**
 * สร้างงานใหม่
 * @param {object} payload ข้อมูลงาน
 * @returns {object} แถวที่ถูกสร้าง
 */
export async function createWorkTimeline(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([sanitize(payload)])
    .select(SELECT_WITH_OWNER)
    .single()

  if (error) throw error
  return data
}

/**
 * แก้ไขงานตาม id
 * @param {string} id UUID ของงาน
 * @param {object} payload ข้อมูลที่ต้องการแก้
 * @returns {object} แถวที่ถูกแก้ไข
 */
export async function updateWorkTimeline(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(sanitize(payload))
    .eq('id', id)
    .select(SELECT_WITH_OWNER)
    .single()

  if (error) throw error
  return data
}

/**
 * ลบงานแบบ soft delete (ใส่เวลาใน deleted_at ไม่ได้ลบแถวจริง)
 * ข้อมูลยังอยู่ใน DB และกู้คืนได้ด้วย restoreWorkTimeline
 * @param {string} id UUID ของงาน
 */
export async function deleteWorkTimeline(id) {
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  return true
}

/**
 * กู้คืนงานที่ถูก soft delete (เคลียร์ deleted_at)
 * @param {string} id UUID ของงาน
 */
export async function restoreWorkTimeline(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ deleted_at: null })
    .eq('id', id)
    .select(SELECT_WITH_OWNER)
    .single()
  if (error) throw error
  return data
}

/**
 * ลบถาวรจริง ๆ (hard delete) — ลบแถวออกจาก DB เลย กู้คืนไม่ได้
 * @param {string} id UUID ของงาน
 */
export async function hardDeleteWorkTimeline(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
  return true
}
