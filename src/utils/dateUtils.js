import dayjs from 'dayjs'
import 'dayjs/locale/th'
import isToday from 'dayjs/plugin/isToday'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.locale('th')
dayjs.extend(isToday)
dayjs.extend(isBetween)

/**
 * รวม work_date (YYYY-MM-DD) กับ start_time (HH:mm:ss) เป็น dayjs object
 */
export function toDateTime(workDate, startTime) {
  const time = startTime || '00:00:00'
  return dayjs(`${workDate}T${time}`)
}

// ฟอร์แมตวันที่แบบไทย เช่น "23 มิ.ย. 2569"
export function formatThaiDate(workDate) {
  const d = dayjs(workDate)
  if (!d.isValid()) return '-'
  const buddhistYear = d.year() + 543
  return d.format('D MMM ') + buddhistYear
}

// ฟอร์แมตเวลา HH:mm จาก "HH:mm:ss"
export function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

// ช่วงเวลาแบบอ่านง่าย เช่น "09:00 - 12:00 น." หรือ "09:00 น."
export function formatTimeRange(startTime, endTime) {
  const start = formatTime(startTime)
  const end = formatTime(endTime)
  if (start && end) return `${start} - ${end} น.`
  if (start) return `${start} น.`
  return ''
}

// เป็นงานของวันนี้หรือไม่
export function isWorkToday(workDate) {
  return dayjs(workDate).isToday()
}

/**
 * ใกล้ถึงภายใน 24 ชม. หรือไม่ (นับจากเวลาปัจจุบัน ไปข้างหน้าไม่เกิน 24 ชม.)
 * เฉพาะงานที่ยังไม่ถึงเวลา (อยู่ในอนาคต)
 */
export function isWithin24Hours(workDate, startTime) {
  const target = toDateTime(workDate, startTime)
  const now = dayjs()
  const diffHours = target.diff(now, 'hour', true)
  return diffHours >= 0 && diffHours <= 24
}

// งานเลยเวลามาแล้วหรือยัง (past)
export function isPast(workDate, startTime) {
  return toDateTime(workDate, startTime).isBefore(dayjs())
}

// ข้อความบอกระยะเวลา เช่น "อีก 3 วัน", "อีก 2 ชม.", "ผ่านมาแล้ว"
export function getRelativeLabel(workDate, startTime) {
  const target = toDateTime(workDate, startTime)
  const now = dayjs()
  const diffMin = target.diff(now, 'minute')

  if (diffMin < 0) return 'ผ่านมาแล้ว'
  if (diffMin < 60) return `อีก ${diffMin} นาที`
  const diffHours = target.diff(now, 'hour')
  if (diffHours < 24) return `อีก ${diffHours} ชม.`
  const diffDays = target.diff(now, 'day')
  return `อีก ${diffDays} วัน`
}

// คีย์ของวัน (YYYY-MM-DD) ใช้จัดกลุ่ม timeline
export function dateKey(workDate) {
  return dayjs(workDate).format('YYYY-MM-DD')
}

// วันนี้ในรูปแบบ YYYY-MM-DD (ใช้เป็น default ของฟอร์ม)
export function todayStr() {
  return dayjs().format('YYYY-MM-DD')
}
