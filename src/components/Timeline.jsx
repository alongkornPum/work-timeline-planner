import TimelineItem from './TimelineItem'
import { formatThaiDate, dateKey, isWorkToday } from '../utils/dateUtils'

/**
 * จัดกลุ่มงานตามวันที่ แล้วแสดงเป็น timeline เส้นแนวตั้ง
 * (รายการที่ส่งเข้ามาควรถูกเรียงจากใกล้ -> ไกลแล้ว)
 */
export default function Timeline({ works, showOwner = false, onView, onEdit, onDelete }) {
  // group by date (รักษาลำดับเดิมไว้)
  const groups = []
  const indexByKey = {}
  for (const w of works) {
    const key = dateKey(w.work_date)
    if (indexByKey[key] === undefined) {
      indexByKey[key] = groups.length
      groups.push({ key, date: w.work_date, items: [] })
    }
    groups[indexByKey[key]].items.push(w)
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <section key={group.key}>
          {/* หัวกลุ่มวันที่ (sticky) */}
          <div className="sticky top-0 z-10 -mx-1 px-1 py-0.5 bg-[#f4f6f8]/90 backdrop-blur">
            <div className="inline-flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {formatThaiDate(group.date)}
              </span>
              {isWorkToday(group.date) && (
                <span className="text-[11px] font-semibold text-white bg-purple-600 rounded-full px-2 py-0.5">
                  วันนี้
                </span>
              )}
              <span className="text-xs text-slate-400">
                ({group.items.length} งาน)
              </span>
            </div>
          </div>

          <div className="mt-1">
            {group.items.map((work) => (
              <TimelineItem
                key={work.id}
                work={work}
                showOwner={showOwner}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
