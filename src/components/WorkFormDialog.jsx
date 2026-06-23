import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'
import CloseIcon from '@mui/icons-material/Close'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs from 'dayjs'
import { STATUS_OPTIONS } from '../utils/statusUtils'
import { todayStr } from '../utils/dateUtils'

// สร้างลิงก์ Google Maps จากชื่อสถานที่ (รูปแบบ URL ค้นหาทางการ ไม่ต้องใช้ API key)
function buildMapsUrl(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`
}

// แปลงระหว่าง string ที่เก็บใน form กับ dayjs object ที่ picker ใช้
const toDateObj = (s) => (s ? dayjs(s) : null) // 'YYYY-MM-DD' -> dayjs
const toTimeObj = (s) => (s ? dayjs(`2000-01-01T${s}`) : null) // 'HH:mm' -> dayjs

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

  // ใช้กับ DatePicker / TimePicker ที่ส่งค่ามาเป็น value ตรง ๆ (ไม่ใช่ event)
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // สร้างลิงก์ Google Map จากชื่อสถานที่ในช่อง "สถานที่" แล้วใส่ในช่องลิงก์ให้อัตโนมัติ
  function handleGenerateMapUrl() {
    const place = form.location.trim()
    if (!place) {
      setErrors((prev) => ({ ...prev, location: 'กรุณากรอกชื่อสถานที่ก่อนสร้างลิงก์' }))
      return
    }
    setField('google_map_url', buildMapsUrl(place))
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

            <DatePicker
              label="วันที่ *"
              value={toDateObj(form.work_date)}
              onChange={(v) =>
                setField('work_date', v && v.isValid() ? v.format('YYYY-MM-DD') : '')
              }
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.work_date,
                  helperText: errors.work_date,
                },
              }}
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

            <TimePicker
              label="เวลาเริ่ม *"
              value={toTimeObj(form.start_time)}
              onChange={(v) =>
                setField('start_time', v && v.isValid() ? v.format('HH:mm') : '')
              }
              ampm={false}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.start_time,
                  helperText: errors.start_time,
                },
              }}
            />

            <TimePicker
              label="เวลาสิ้นสุด"
              value={toTimeObj(form.end_time)}
              onChange={(v) =>
                setField('end_time', v && v.isValid() ? v.format('HH:mm') : '')
              }
              ampm={false}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.end_time,
                  helperText: errors.end_time,
                },
              }}
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

            <div className="sm:col-span-2 space-y-2">
              <TextField
                label="ลิงก์ Google Map"
                placeholder="กรอกสถานที่ด้านบน แล้วกด 'สร้างลิงก์' หรือวาง URL เอง"
                value={form.google_map_url}
                onChange={handleChange('google_map_url')}
                error={!!errors.google_map_url}
                helperText={
                  errors.google_map_url ||
                  'สร้างอัตโนมัติจากชื่อสถานที่ หรือวางลิงก์ Google Map เองก็ได้'
                }
                fullWidth
                InputProps={{
                  endAdornment: form.google_map_url ? (
                    <InputAdornment position="end">
                      <Tooltip title="เปิดดูใน Google Map">
                        <IconButton
                          size="small"
                          component="a"
                          href={form.google_map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<TravelExploreIcon />}
                onClick={handleGenerateMapUrl}
                disabled={!form.location.trim()}
              >
                สร้างลิงก์จากชื่อสถานที่
              </Button>
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
