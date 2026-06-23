import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PlaceIcon from '@mui/icons-material/Place'
import PersonIcon from '@mui/icons-material/Person'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NotesIcon from '@mui/icons-material/Notes'
import MapIcon from '@mui/icons-material/Map'
import { getStatusMeta } from '../utils/statusUtils'
import { formatThaiDate, formatTimeRange } from '../utils/dateUtils'

function Row({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm text-slate-800 break-words whitespace-pre-wrap">
          {children || <span className="text-slate-400">-</span>}
        </div>
      </div>
    </div>
  )
}

export default function WorkDetailDialog({ open, work, showOwner = false, onClose, onEdit, onDelete }) {
  if (!work) return null
  const status = getStatusMeta(work.status)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold break-words">{work.title}</div>
          <Chip label={status.label} color={status.color} size="small" sx={{ mt: 1 }} />
        </div>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {showOwner && work.owner?.email && (
          <>
            <Row icon={<AccountCircleIcon fontSize="small" />} label="เจ้าของงาน">
              {work.owner.email}
              {work.owner.role === 'admin' ? ' (admin)' : ''}
            </Row>
            <Divider />
          </>
        )}
        <Row icon={<CalendarMonthIcon fontSize="small" />} label="วันที่">
          {formatThaiDate(work.work_date)}
        </Row>
        <Row icon={<AccessTimeIcon fontSize="small" />} label="เวลา">
          {formatTimeRange(work.start_time, work.end_time)}
        </Row>
        <Divider />
        <Row icon={<PlaceIcon fontSize="small" />} label="สถานที่">
          {work.location}
        </Row>
        {work.google_map_url && (
          <div className="pl-8 pb-2">
            <Button
              size="small"
              variant="outlined"
              startIcon={<MapIcon />}
              component="a"
              href={work.google_map_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              เปิด Google Map
            </Button>
          </div>
        )}
        <Divider />
        <Row icon={<PersonIcon fontSize="small" />} label="ผู้รับผิดชอบ">
          {work.responsible_person}
        </Row>
        <Row icon={<NotesIcon fontSize="small" />} label="รายละเอียด">
          {work.detail}
        </Row>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(work)}>
          ลบ
        </Button>
        <div>
          <Button color="inherit" onClick={onClose}>
            ปิด
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEdit(work)} sx={{ ml: 1 }}>
            แก้ไข
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}
