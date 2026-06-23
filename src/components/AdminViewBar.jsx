import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

/**
 * แถบสำหรับ admin เลือกดูงานของใคร
 * value: 'self' | 'all' | <user_id>
 */
export default function AdminViewBar({ value, onChange, profiles, currentUserId }) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-indigo-800">
          <AdminPanelSettingsIcon fontSize="small" />
          <span className="text-sm font-semibold">โหมดผู้ดูแลระบบ</span>
          <Chip label="admin" size="small" color="primary" sx={{ height: 20 }} />
        </div>

        <TextField
          select
          size="small"
          label="ดูงานของ"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ minWidth: 260, bgcolor: '#fff', borderRadius: 1 }}
        >
          <MenuItem value="self">👤 งานของฉัน</MenuItem>
          <MenuItem value="all">🌐 ดูของทุกคน (รวม)</MenuItem>
          {profiles.length > 0 && (
            <MenuItem disabled sx={{ opacity: 0.6, fontSize: 12 }}>
              — เลือกรายบุคคล —
            </MenuItem>
          )}
          {profiles.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.full_name || p.email || p.id.slice(0, 8)}
              {p.department ? ` · ${p.department}` : ''}
              {p.id === currentUserId ? ' (ฉัน)' : ''}
              {p.role === 'admin' ? ' · admin' : ''}
            </MenuItem>
          ))}
        </TextField>
      </div>
    </div>
  )
}
