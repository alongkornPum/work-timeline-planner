import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import EventNoteIcon from '@mui/icons-material/EventNote'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TodayIcon from '@mui/icons-material/Today'

function SummaryCard({ icon, label, value, color }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e5e7eb', height: '100%' }}>
      <CardContent className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 48, height: 48, backgroundColor: `${color}1A`, color }}
        >
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold leading-none text-slate-800">{value}</div>
          <div className="text-xs text-slate-500 mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard({ stats }) {
  const cards = [
    {
      label: 'งานทั้งหมด',
      value: stats.total,
      color: '#2563eb',
      icon: <EventNoteIcon />,
    },
    {
      label: 'งานวันนี้',
      value: stats.today,
      color: '#7c3aed',
      icon: <TodayIcon />,
    },
    {
      label: 'รอดำเนินการ',
      value: stats.pending,
      color: '#ed6c02',
      icon: <HourglassEmptyIcon />,
    },
    {
      label: 'กำลังดำเนินการ',
      value: stats.in_progress,
      color: '#0288d1',
      icon: <AutorenewIcon />,
    },
    {
      label: 'เสร็จสิ้น',
      value: stats.completed,
      color: '#2e7d32',
      icon: <CheckCircleIcon />,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c) => (
        <SummaryCard key={c.label} {...c} />
      ))}
    </div>
  )
}
