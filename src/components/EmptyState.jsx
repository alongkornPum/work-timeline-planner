import EventBusyIcon from '@mui/icons-material/EventBusy'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'

export default function EmptyState({ onAdd, filtered = false }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <EventBusyIcon sx={{ fontSize: 72, color: '#cbd5e1' }} />
      <h3 className="mt-4 text-lg font-semibold text-slate-700">
        {filtered ? 'ไม่พบงานที่ตรงกับเงื่อนไข' : 'ยังไม่มีงานใน Timeline'}
      </h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        {filtered
          ? 'ลองปรับคำค้นหา สถานะ หรือช่วงวันที่ใหม่อีกครั้ง'
          : 'เริ่มต้นด้วยการเพิ่มงานแรกของคุณ เพื่อแสดงผลบน Timeline'}
      </p>
      {!filtered && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ mt: 3 }}
        >
          เพิ่มงานใหม่
        </Button>
      )}
    </div>
  )
}
