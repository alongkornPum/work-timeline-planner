import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PlaceIcon from '@mui/icons-material/Place'
import PersonIcon from '@mui/icons-material/Person'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import MapIcon from '@mui/icons-material/Map'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { getStatusMeta, getStatusDotColor } from '../utils/statusUtils'
import {
  formatTimeRange,
  isWorkToday,
  isWithin24Hours,
  getRelativeLabel,
} from '../utils/dateUtils'

export default function TimelineItem({ work, showOwner = false, onView, onEdit, onDelete }) {
  const status = getStatusMeta(work.status)
  const dotColor = getStatusDotColor(work.status)
  const today = isWorkToday(work.work_date)
  const soon = isWithin24Hours(work.work_date, work.start_time)
  const isCancelled = work.status === 'cancelled'
  const isCompleted = work.status === 'completed'

  return (
    <div className="relative pl-9 pb-2.5">
      {/* เส้นแนวตั้ง */}
      <span
        className="absolute top-1 bottom-0 w-px bg-slate-200"
        style={{ left: 11 }}
        aria-hidden
      />
      {/* จุด dot */}
      <span
        className="absolute rounded-full border-2 border-white shadow"
        style={{ left: 6, top: 9, width: 12, height: 12, backgroundColor: dotColor }}
        aria-hidden
      />

      <Card
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderLeft: `4px solid ${dotColor}`,
          opacity: isCancelled ? 0.7 : 1,
          backgroundColor: isCompleted ? '#f6fcf7' : isCancelled ? '#fafafa' : '#fff',
          transition: 'box-shadow .2s',
          '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
        }}
      >
        <CardContent sx={{ py: 0.75, px: 1.5, '&:last-child': { pb: 0.75 } }}>
          <div className="flex items-center gap-2">
            {/* ฝั่งซ้าย: ชื่อ + ข้อมูลย่อบรรทัดเดียว */}
            <div className="flex-1 min-w-0">
              {/* แถวชื่อ + badge */}
              <div className="flex items-center gap-1 min-w-0">
                {today && (
                  <Chip label="วันนี้" size="small" color="secondary" sx={{ height: 18, fontSize: 11, flexShrink: 0, '& .MuiChip-label': { px: 0.75 } }} />
                )}
                {soon && (
                  <Chip
                    label="ใกล้ถึงแล้ว"
                    size="small"
                    sx={{ height: 18, fontSize: 11, flexShrink: 0, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, '& .MuiChip-label': { px: 0.75 } }}
                  />
                )}
                <h3
                  className={`text-[13px] font-semibold truncate ${
                    isCancelled ? 'line-through text-slate-500' : 'text-slate-800'
                  }`}
                >
                  {work.title}
                </h3>
              </div>

              {/* ข้อมูลย่อ: เวลา · สถานที่ · ผู้รับผิดชอบ (บรรทัดเดียว) */}
              <div className="flex items-center gap-x-2.5 mt-0.5 text-[12px] text-slate-500 min-w-0 overflow-hidden">
                <span className="flex items-center gap-0.5 flex-shrink-0">
                  <AccessTimeIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                  {formatTimeRange(work.start_time, work.end_time)}
                  <span className="text-slate-400">· {getRelativeLabel(work.work_date, work.start_time)}</span>
                </span>
                <span className="flex items-center gap-0.5 min-w-0">
                  <PlaceIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
                  <span className="truncate">{work.location}</span>
                </span>
                {work.responsible_person && (
                  <span className="hidden sm:flex items-center gap-0.5 min-w-0">
                    <PersonIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
                    <span className="truncate">{work.responsible_person}</span>
                  </span>
                )}
                {showOwner && work.owner?.email && (
                  <span className="hidden md:flex items-center gap-0.5 min-w-0 text-indigo-500">
                    <AccountCircleIcon sx={{ fontSize: 13, flexShrink: 0 }} />
                    <span className="truncate">{work.owner.email}</span>
                  </span>
                )}
              </div>
            </div>

            {/* ฝั่งขวา: สถานะ + ปุ่มจัดการ */}
            <div className="flex items-center flex-shrink-0">
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                sx={{ mr: 0.5, height: 20, fontSize: 11, '& .MuiChip-label': { px: 1 } }}
              />
              {work.google_map_url && (
                <Tooltip title="เปิด Google Map">
                  <IconButton
                    size="small"
                    sx={{ p: 0.5 }}
                    component="a"
                    href={work.google_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <MapIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="ดูรายละเอียด">
                <IconButton size="small" sx={{ p: 0.5 }} onClick={() => onView(work)}>
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="แก้ไข">
                <IconButton size="small" sx={{ p: 0.5 }} onClick={() => onEdit(work)}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบ">
                <IconButton size="small" sx={{ p: 0.5 }} color="error" onClick={() => onDelete(work)}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
