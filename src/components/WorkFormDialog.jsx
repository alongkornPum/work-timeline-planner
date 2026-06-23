import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { STATUS_OPTIONS } from '../utils/statusUtils'
import { todayStr } from '../utils/dateUtils'

const EMPTY_FORM = {
  title: '',
  work_date: todayStr(),
  start_time: '09:00',
  end_time: '',
  location: '',
  google_map_url: '',
  detail: '',
  responsible_person: '',
  status: 'pending',
}

// แปลง "HH:mm:ss" จาก DB ให้เป็น "HH:mm" สำหรับ input type=time
function trimTime(t) {
  return t ? t.slice(0, 5) : ''
}

export default function WorkFormDialog({ open, mode = 'create', initialData, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setForm({
          title: initialData.title ?? '',
          work_date: initialData.work_date ?? todayStr(),
          start_time: trimTime(initialData.start_time) || '09:00',
          end_time: trimTime(initialData.end_time),
          location: initialData.location ?? '',
          google_map_url: initialData.google_map_url ?? '',
          detail: initialData.detail ?? '',
          responsible_person: initialData.responsible_person ?? '',
          status: initialData.status ?? 'pending',
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  }, [open, mode, initialData])

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'กรุณากรอกชื่องาน'
    if (!form.work_date) next.work_date = 'กรุณาเลือกวันที่'
    if (!form.start_time) next.start_time = 'กรุณาเลือกเวลาเริ่ม'
    if (!form.location.trim()) next.location = 'กรุณากรอกสถานที่'
    if (form.end_time && form.end_time < form.start_time)
      next.end_time = 'เวลาสิ้นสุดต้องไม่น้อยกว่าเวลาเริ่ม'
    if (form.google_map_url && !/^https?:\/\//i.test(form.google_map_url))
      next.google_map_url = 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span>{mode === 'edit' ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</span>
        <IconButton onClick={onClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <TextField
                label="ชื่องาน *"
                value={form.title}
                onChange={handleChange('title')}
                error={!!errors.title}
                helperText={errors.title}
                fullWidth
                autoFocus
              />
            </div>

            <TextField
              label="วันที่ *"
              type="date"
              value={form.work_date}
              onChange={handleChange('work_date')}
              error={!!errors.work_date}
              helperText={errors.work_date}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              select
              label="สถานะ"
              value={form.status}
              onChange={handleChange('status')}
              fullWidth
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="เวลาเริ่ม *"
              type="time"
              value={form.start_time}
              onChange={handleChange('start_time')}
              error={!!errors.start_time}
              helperText={errors.start_time}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="เวลาสิ้นสุด"
              type="time"
              value={form.end_time}
              onChange={handleChange('end_time')}
              error={!!errors.end_time}
              helperText={errors.end_time}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <div className="sm:col-span-2">
              <TextField
                label="สถานที่ *"
                value={form.location}
                onChange={handleChange('location')}
                error={!!errors.location}
                helperText={errors.location}
                fullWidth
              />
            </div>

            <div className="sm:col-span-2">
              <TextField
                label="ลิงก์ Google Map"
                placeholder="https://maps.google.com/..."
                value={form.google_map_url}
                onChange={handleChange('google_map_url')}
                error={!!errors.google_map_url}
                helperText={errors.google_map_url}
                fullWidth
              />
            </div>

            <TextField
              label="ผู้รับผิดชอบ"
              value={form.responsible_person}
              onChange={handleChange('responsible_person')}
              fullWidth
            />

            <div className="sm:col-span-2">
              <TextField
                label="รายละเอียด"
                value={form.detail}
                onChange={handleChange('detail')}
                fullWidth
                multiline
                minRows={3}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มงาน'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
