import { createClient } from '@supabase/supabase-js'

// อ่านค่าจากไฟล์ .env (ต้องขึ้นต้นด้วย VITE_ ถึงจะถูก expose ใน client)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// แจ้งเตือนชัดเจนเมื่อยังไม่ได้ตั้งค่า env (ช่วยตอน deploy)
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabaseClient] ไม่พบ VITE_SUPABASE_URL หรือ VITE_SUPABASE_ANON_KEY\n' +
      'กรุณาสร้างไฟล์ .env (ดูตัวอย่างใน .env.example) หรือไปตั้งค่า Environment Variables บน Netlify/Vercel'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

// helper เผื่อใช้เช็คใน UI ว่าตั้งค่าครบหรือยัง
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
