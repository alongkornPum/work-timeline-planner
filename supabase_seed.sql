-- ============================================================
-- Work Timeline Planner - ข้อมูลตัวอย่าง (Seed Data)
--
-- ⚠️ ต้องมีผู้ใช้สมัครเข้ามาแล้วอย่างน้อย 1 คน (มีแถวใน profiles)
--    ก่อนรันไฟล์นี้ มิฉะนั้นจะไม่มีข้อมูลถูกเพิ่ม (เพราะต้องผูก user_id)
--
-- ค่าเริ่มต้น: ผูกงานตัวอย่างทั้งหมดให้กับผู้ใช้คนแรกในระบบ
-- ถ้าต้องการเจาะจงคน ให้แก้ CTE "target" ด้านล่างเป็นอีเมลที่ต้องการ
-- ============================================================

WITH target AS (
  -- ผูกให้ผู้ใช้คนแรกที่สมัคร (เปลี่ยนเป็นเจาะจงอีเมลได้ เช่น:
  --   SELECT id FROM profiles WHERE email = 'you@example.com'
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO work_timeline
  (title, work_date, start_time, end_time, location, google_map_url, detail, responsible_person, status, user_id)
SELECT
  v.title, v.work_date, v.start_time, v.end_time, v.location,
  v.google_map_url, v.detail, v.responsible_person, v.status, t.id
FROM target t
CROSS JOIN (
  VALUES
    ('ประชุมทีมพัฒนาประจำสัปดาห์', CURRENT_DATE, TIME '10:00', TIME '11:30',
     'ห้องประชุม A ชั้น 3', 'https://maps.google.com/?q=13.7563,100.5018',
     'สรุปความคืบหน้า Sprint และวางแผนงานสัปดาห์หน้า', 'คุณสมชาย', 'in_progress'),

    ('ส่งมอบงานลูกค้า ABC', CURRENT_DATE, TIME '15:00', TIME '16:00',
     'บริษัท ABC จำกัด อาคารสีลม', 'https://maps.google.com/?q=13.7280,100.5340',
     'นำเสนอระบบเวอร์ชันใหม่และเก็บ feedback', 'คุณสมหญิง', 'pending'),

    ('อบรม React และ Supabase', CURRENT_DATE + 1, TIME '09:00', TIME '12:00',
     'DPU IT Training Room', 'https://maps.google.com/?q=13.8500,100.5800',
     'เวิร์กชอปสร้างเว็บแอปด้วย React + Supabase สำหรับทีมงาน', 'คุณวิชัย', 'pending'),

    ('ตรวจรับงานติดตั้งระบบ', CURRENT_DATE + 3, TIME '13:30', TIME '15:00',
     'โรงงานนวนคร ปทุมธานี', 'https://maps.google.com/?q=14.1000,100.6200',
     'ตรวจรับและทดสอบระบบที่ติดตั้งหน้างาน', 'คุณอนุชา', 'pending'),

    ('สัมมนาประจำปีของบริษัท', CURRENT_DATE + 7, TIME '08:30', TIME '17:00',
     'โรงแรมเซ็นทาราแกรนด์', 'https://maps.google.com/?q=13.7460,100.5390',
     'กิจกรรมสัมมนาและ workshop ประจำปี', 'ฝ่ายบุคคล', 'pending'),

    ('เตรียมเอกสารนำเสนอ', CURRENT_DATE - 2, TIME '14:00', TIME '16:00',
     'ออฟฟิศ', NULL,
     'จัดทำสไลด์และเอกสารประกอบการนำเสนอลูกค้า', 'คุณสมหญิง', 'completed'),

    ('นัดพบ Supplier รายเก่า', CURRENT_DATE - 1, TIME '11:00', TIME '12:00',
     'ร้านกาแฟใกล้ออฟฟิศ', NULL,
     'ยกเลิกเนื่องจาก supplier ติดภารกิจ', 'คุณสมชาย', 'cancelled')
) AS v(title, work_date, start_time, end_time, location, google_map_url, detail, responsible_person, status);
