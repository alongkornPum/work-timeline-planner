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
    <div className="relative pl-10 pb-6">
      {/* เส้นแนวตั้ง */}
      <span
        className="absolute top-1 bottom-0 w-px bg-slate-200"
        style={{ left: 11 }}
        aria-hidden
      />
      {/* จุด dot */}
      <span
        className="absolute rounded-full border-2 border-white shadow"
        style={{ left: 4, top: 6, width: 16, height: 16, backgroundColor: dotColor }}
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
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          {/* แถวหัว: ชื่อ + badge + สถานะ */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                {today && (
                  <Chip label="วันนี้" size="small" color="secondary" sx={{ height: 22 }} />
                )}
                {soon && (
                  <Chip
                    label="ใกล้ถึงแล้ว"
                    size="small"
                    sx={{ height: 22, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }}
                  />
                )}
              </div>
              <h3
                className={`text-base font-semibold break-words ${
                  isCancelled ? 'line-through text-slate-500' : 'text-slate-800'
                }`}
              >
                {work.title}
              </h3>
            </div>
            <Chip label={status.label} color={status.color} size="small" />
          </div>

          {/* แสดงเจ้าของงาน (เฉพาะ admin ที่ดูรวมทุกคน) */}
          {showOwner && work.owner?.email && (
            <Chip
              icon={<AccountCircleIcon />}
              label={work.owner.email}
              size="small"
              variant="outlined"
              sx={{ mt: 1, maxWidth: '100%' }}
            />
          )}

          {/* รายละเอียดย่อ */}
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              <span>{formatTimeRange(work.start_time, work.end_time)}</span>
              <span className="text-xs text-slate-400">· {getRelativeLabel(work.work_date, work.start_time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PlaceIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              <span className="truncate">{work.location}</span>
            </div>
            {work.responsible_person && (
              <div className="flex items-center gap-1.5">
                <PersonIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                <span className="truncate">{work.responsible_person}</span>
              </div>
            )}
          </div>

          {/* ปุ่มจัดการ */}
          <div className="mt-3 flex items-center justify-end gap-1">
            {work.google_map_url && (
              <Tooltip title="เปิด Google Map">
                <IconButton
                  size="small"
                  component="a"
                  href={work.google_map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <MapIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="ดูรายละเอียด">
              <IconButton size="small" onClick={() => onView(work)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="แก้ไข">
              <IconButton size="small" onClick={() => onEdit(work)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="ลบ">
              <IconButton size="small" color="error" onClick={() => onDelete(work)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
