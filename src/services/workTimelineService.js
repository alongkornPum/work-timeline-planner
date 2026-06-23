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
 * @param {{ userId?: string }} [options]
 */
export async function getWorkTimeline(options = {}) {
  const { userId } = options
  let query = supabase.from(TABLE).select(SELECT_WITH_OWNER)

  if (userId) query = query.eq('user_id', userId)

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
 * ลบงานตาม id
 * @param {string} id UUID ของงาน
 */
export async function deleteWorkTimeline(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
  return true
}
