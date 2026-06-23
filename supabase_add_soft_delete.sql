-- ============================================================
-- Migration: เพิ่ม Soft Delete ให้ตาราง work_timeline
-- รันใน Supabase Dashboard > SQL Editor > New query (รันครั้งเดียว)
--
-- แนวคิด: แทนที่จะลบแถวจริง จะใส่เวลาในคอลัมน์ deleted_at
--   - deleted_at IS NULL   = งานที่ยังใช้งานอยู่ (แสดงในแอป)
--   - deleted_at มีค่า      = งานที่ถูกลบแล้ว (ซ่อนจากแอป แต่ยังอยู่ใน DB กู้คืนได้)
-- ============================================================

-- 1) เพิ่มคอลัมน์ deleted_at (ถ้ายังไม่มี)
ALTER TABLE work_timeline
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- 2) index เฉพาะแถวที่ยังไม่ถูกลบ (ช่วยให้ query รายการปกติเร็วขึ้น)
CREATE INDEX IF NOT EXISTS idx_work_timeline_not_deleted
  ON work_timeline (deleted_at) WHERE deleted_at IS NULL;

-- ============================================================
-- หมายเหตุเรื่องสิทธิ์ (RLS):
-- การ soft delete คือการ "UPDATE" คอลัมน์ deleted_at
-- จึงใช้ policy wt_update_own_or_admin ที่มีอยู่แล้ว (เจ้าของหรือ admin)
-- ไม่ต้องเพิ่ม policy ใหม่
-- ============================================================

-- ----- คำสั่งที่อาจได้ใช้ภายหลัง (ไว้ดู/จัดการเอง) -----
-- ดูงานที่ถูกลบไปแล้ว:
--   SELECT id, title, deleted_at FROM work_timeline WHERE deleted_at IS NOT NULL;
--
-- กู้คืนงาน (เอา deleted_at ออก):
--   UPDATE work_timeline SET deleted_at = NULL WHERE id = '<UUID>';
--
-- ลบถาวรจริง ๆ (hard delete) งานที่อยู่ในถังขยะเกิน 30 วัน:
--   DELETE FROM work_timeline
--   WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
