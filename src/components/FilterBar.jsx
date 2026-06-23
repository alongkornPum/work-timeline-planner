import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { STATUS_OPTIONS } from '../utils/statusUtils'

export default function FilterBar({ filters, onChange, onClear }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  const hasActiveFilter =
    filters.search ||
    filters.status !== 'all' ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* ค้นหา */}
        <TextField
          label="ค้นหางาน"
          placeholder="ชื่องาน, สถานที่, ผู้รับผิดชอบ..."
          value={filters.search}
          onChange={update('search')}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* กรองตามสถานะ */}
        <TextField
          select
          label="สถานะ"
          value={filters.status}
          onChange={update('status')}
          size="small"
          fullWidth
        >
          <MenuItem value="all">ทุกสถานะ</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>

        {/* ช่วงวันที่ */}
        <TextField
          label="ตั้งแต่วันที่"
          type="date"
          value={filters.dateFrom}
          onChange={update('dateFrom')}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="ถึงวันที่"
          type="date"
          value={filters.dateTo}
          onChange={update('dateTo')}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </div>

      {hasActiveFilter && (
        <div className="mt-3 flex justify-end">
          <Button
            size="small"
            color="inherit"
            startIcon={<ClearIcon />}
            onClick={onClear}
          >
            ล้างตัวกรอง
          </Button>
        </div>
      )}
    </div>
  )
}
