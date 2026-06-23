-- ============================================================
-- Migration: เพิ่มฟิลด์ ชื่อ-นามสกุล / หน่วยงาน-ตำแหน่ง ใน profiles
-- รันใน Supabase Dashboard > SQL Editor > New query (รันครั้งเดียว)
-- ============================================================

-- 1) เพิ่มคอลัมน์ (ถ้ายังไม่มี)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- 2) อัปเดต trigger ให้ดึงค่าจาก metadata ตอนสมัครมาเก็บใน profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, department)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'department'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- (trigger on_auth_user_created เดิมใช้ฟังก์ชันนี้อยู่แล้ว ไม่ต้องสร้างใหม่)

-- 3) (ทางเลือก) เติมชื่อให้ผู้ใช้เดิมที่สมัครไว้ก่อนหน้า จาก metadata ที่อาจมี
UPDATE profiles p
SET full_name = COALESCE(p.full_name, u.raw_user_meta_data ->> 'full_name'),
    department = COALESCE(p.department, u.raw_user_meta_data ->> 'department')
FROM auth.users u
WHERE u.id = p.id;
