// ค่าสถานะงานทั้งหมด พร้อม label ภาษาไทย และสีสำหรับ Chip ของ Material UI
export const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ', color: 'warning' },
  { value: 'in_progress', label: 'กำลังดำเนินการ', color: 'info' },
  { value: 'completed', label: 'เสร็จสิ้น', color: 'success' },
  { value: 'cancelled', label: 'ยกเลิก', color: 'error' },
]

const STATUS_MAP = STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s
  return acc
}, {})

export function getStatusMeta(status) {
  return STATUS_MAP[status] ?? { value: status, label: status, color: 'default' }
}

// สีของจุดบน timeline (dot) ตามสถานะ — ใช้เป็น hex เพื่อความคุมง่าย
export const STATUS_DOT_COLOR = {
  pending: '#ed6c02', // ส้ม
  in_progress: '#0288d1', // ฟ้า
  completed: '#2e7d32', // เขียว
  cancelled: '#9e9e9e', // เทา
}

export function getStatusDotColor(status) {
  return STATUS_DOT_COLOR[status] ?? '#9e9e9e'
}
