-- ============================================================
-- Work Timeline Planner - Supabase Schema (Multi-tenant + Admin)
-- รันสคริปต์นี้ใน Supabase Dashboard > SQL Editor > New query
--
-- สรุปสิทธิ์:
--   * ผู้ใช้ทั่วไป (role = 'user')  -> เห็น/แก้/ลบ เฉพาะงานของตัวเอง
--   * ผู้ดูแลระบบ (role = 'admin') -> เห็น/แก้/ลบ งานของทุกคน
-- ============================================================

-- ============================================================
-- 1) ตาราง profiles (ข้อมูลผู้ใช้ + บทบาท) ผูกกับ auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMP DEFAULT NOW()
);

-- สร้าง profile อัตโนมัติเมื่อมีผู้สมัครใหม่ใน auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill: สร้าง profile ให้ผู้ใช้ที่สมัครไว้ก่อนหน้านี้ (ถ้ามี)
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ฟังก์ชันเช็คว่าผู้ใช้ปัจจุบันเป็น admin หรือไม่
-- SECURITY DEFINER เพื่อ bypass RLS ของ profiles (กัน recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- 2) ตารางหลัก work_timeline (เพิ่ม user_id เพื่อแยกเจ้าของงาน)
-- ============================================================
CREATE TABLE IF NOT EXISTS work_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  work_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  google_map_url TEXT,
  detail TEXT,
  responsible_person TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP DEFAULT NULL -- soft delete: NULL = ยังอยู่, มีค่า = ถูกลบแล้ว
);

-- เผื่อกรณีตารางถูกสร้างไว้ก่อนแล้ว ให้เพิ่มคอลัมน์ที่ขาด
ALTER TABLE work_timeline
  ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES profiles (id) ON DELETE CASCADE;
ALTER TABLE work_timeline
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Index ช่วยการเรียง/กรอง
CREATE INDEX IF NOT EXISTS idx_work_timeline_date_time
  ON work_timeline (work_date, start_time);
CREATE INDEX IF NOT EXISTS idx_work_timeline_status
  ON work_timeline (status);
CREATE INDEX IF NOT EXISTS idx_work_timeline_user
  ON work_timeline (user_id);
-- index เฉพาะแถวที่ยังไม่ถูกลบ (ช่วยให้ query รายการปกติเร็วขึ้น)
CREATE INDEX IF NOT EXISTS idx_work_timeline_not_deleted
  ON work_timeline (deleted_at) WHERE deleted_at IS NULL;

-- Trigger อัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_work_timeline_updated_at ON work_timeline;
CREATE TRIGGER trg_work_timeline_updated_at
  BEFORE UPDATE ON work_timeline
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 3) เปิด RLS + Policies
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_timeline ENABLE ROW LEVEL SECURITY;

-- ---- Policies ของ profiles ----
DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON profiles;
CREATE POLICY "profiles_select_self_or_admin"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- (ทางเลือก) ให้ผู้ใช้แก้ profile ของตัวเองได้ แต่ห้ามแก้ role เอง
DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
CREATE POLICY "profiles_update_self"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- ---- Policies ของ work_timeline ----
DROP POLICY IF EXISTS "anon_full_access" ON work_timeline;
DROP POLICY IF EXISTS "authenticated_read" ON work_timeline;
DROP POLICY IF EXISTS "authenticated_insert" ON work_timeline;
DROP POLICY IF EXISTS "authenticated_update" ON work_timeline;
DROP POLICY IF EXISTS "authenticated_delete" ON work_timeline;
DROP POLICY IF EXISTS "wt_select_own_or_admin" ON work_timeline;
DROP POLICY IF EXISTS "wt_insert_own" ON work_timeline;
DROP POLICY IF EXISTS "wt_update_own_or_admin" ON work_timeline;
DROP POLICY IF EXISTS "wt_delete_own_or_admin" ON work_timeline;

-- อ่าน: งานของตัวเอง หรือถ้าเป็น admin เห็นทั้งหมด
CREATE POLICY "wt_select_own_or_admin"
  ON work_timeline FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- เพิ่ม: ต้องเป็นงานของตัวเองเท่านั้น (user_id ถูกเติมโดย default auth.uid())
CREATE POLICY "wt_insert_own"
  ON work_timeline FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- แก้ไข: งานของตัวเอง หรือ admin
CREATE POLICY "wt_update_own_or_admin"
  ON work_timeline FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ลบ: งานของตัวเอง หรือ admin
CREATE POLICY "wt_delete_own_or_admin"
  ON work_timeline FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- 4) วิธีตั้งให้ผู้ใช้คนหนึ่งเป็น admin
--    (รันบรรทัดล่างนี้ โดยแก้อีเมลเป็นของคุณ หลังจากผู้ใช้คนนั้นสมัครแล้ว)
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
