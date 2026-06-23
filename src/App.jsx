import { useState, useEffect, useMemo, useCallback } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import TimelineIcon from '@mui/icons-material/Timeline'

import Dashboard from './components/Dashboard'
import FilterBar from './components/FilterBar'
import Timeline from './components/Timeline'
import EmptyState from './components/EmptyState'
import WorkFormDialog from './components/WorkFormDialog'
import WorkDetailDialog from './components/WorkDetailDialog'
import ConfirmDialog from './components/ConfirmDialog'
import LoginPage from './components/LoginPage'
import UserMenu from './components/UserMenu'
import AdminViewBar from './components/AdminViewBar'

import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabaseClient'
import {
  getWorkTimeline,
  createWorkTimeline,
  updateWorkTimeline,
  deleteWorkTimeline,
} from './services/workTimelineService'
import { getAllProfiles } from './services/profileService'
import { isWorkToday, toDateTime } from './utils/dateUtils'

const INITIAL_FILTERS = { search: '', status: 'all', dateFrom: '', dateTo: '' }

export default function App() {
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  // admin: เลือกดูงานของใคร ('self' | 'all' | <user_id>) และรายชื่อผู้ใช้
  const [adminView, setAdminView] = useState('self')
  const [profiles, setProfiles] = useState([])

  // dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editingWork, setEditingWork] = useState(null)
  const [saving, setSaving] = useState(false)

  const [detailWork, setDetailWork] = useState(null)

  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  // แปลงตัวเลือกของ admin -> userId ที่จะส่งให้ service
  // 'self' = เฉพาะของตัวเอง, 'all' = ทุกคน (ไม่กรอง), อื่น ๆ = user_id ที่เลือก
  const resolveViewUserId = useCallback(() => {
    if (!isAdmin) return undefined // ผู้ใช้ทั่วไป: RLS จัดการให้เอง
    if (adminView === 'self') return user?.id
    if (adminView === 'all') return undefined
    return adminView
  }, [isAdmin, adminView, user?.id])

  // ---- โหลดข้อมูล ----
  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await getWorkTimeline({ userId: resolveViewUserId() })
      setWorks(data)
    } catch (err) {
      console.error(err)
      setLoadError(err.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }, [resolveViewUserId])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    if (user) {
      loadData()
    } else {
      // ออกจากระบบแล้ว: ล้างข้อมูลทิ้ง
      setWorks([])
      setProfiles([])
      setAdminView('self')
      setLoading(false)
    }
  }, [loadData, user])

  // admin: โหลดรายชื่อผู้ใช้ทั้งหมดสำหรับตัวเลือก "ดูงานของใคร"
  useEffect(() => {
    if (!isAdmin) {
      setProfiles([])
      return
    }
    getAllProfiles()
      .then(setProfiles)
      .catch((err) => console.error('โหลดรายชื่อผู้ใช้ไม่สำเร็จ:', err.message))
  }, [isAdmin])

  // ---- กรอง + เรียง (ใกล้ -> ไกล) ----
  const filteredWorks = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return works
      .filter((w) => {
        if (filters.status !== 'all' && w.status !== filters.status) return false
        if (filters.dateFrom && w.work_date < filters.dateFrom) return false
        if (filters.dateTo && w.work_date > filters.dateTo) return false
        if (search) {
          const haystack = [w.title, w.location, w.responsible_person, w.detail]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(search)) return false
        }
        return true
      })
      .sort(
        (a, b) =>
          toDateTime(a.work_date, a.start_time).valueOf() -
          toDateTime(b.work_date, b.start_time).valueOf()
      )
  }, [works, filters])

  // ---- สถิติ Dashboard ----
  const stats = useMemo(() => {
    const base = {
      total: works.length,
      today: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    }
    for (const w of works) {
      if (isWorkToday(w.work_date)) base.today += 1
      if (base[w.status] !== undefined) base[w.status] += 1
    }
    return base
  }, [works])

  const hasActiveFilter =
    filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo

  // ---- handlers ----
  const openCreate = () => {
    setFormMode('create')
    setEditingWork(null)
    setFormOpen(true)
  }

  const openEdit = (work) => {
    setDetailWork(null)
    setFormMode('edit')
    setEditingWork(work)
    setFormOpen(true)
  }

  const handleSubmit = async (form) => {
    setSaving(true)
    try {
      if (formMode === 'edit' && editingWork) {
        const updated = await updateWorkTimeline(editingWork.id, form)
        setWorks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
        notify('แก้ไขงานสำเร็จ')
      } else {
        const created = await createWorkTimeline(form)
        setWorks((prev) => [...prev, created])
        notify('เพิ่มงานสำเร็จ')
      }
      setFormOpen(false)
      setEditingWork(null)
    } catch (err) {
      console.error(err)
      notify(err.message || 'บันทึกไม่สำเร็จ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      await deleteWorkTimeline(confirmTarget.id)
      setWorks((prev) => prev.filter((w) => w.id !== confirmTarget.id))
      notify('ลบงานสำเร็จ')
      setConfirmTarget(null)
      setDetailWork(null)
    } catch (err) {
      console.error(err)
      notify(err.message || 'ลบไม่สำเร็จ', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ---- render: gate ด้วยสถานะ auth ----

  // ยังไม่ได้ตั้งค่า Supabase -> แสดงคำเตือนเต็มจอ
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Alert severity="warning" sx={{ maxWidth: 520 }}>
          ยังไม่ได้ตั้งค่า Supabase — กรุณาสร้างไฟล์ <code>.env</code> แล้วใส่{' '}
          <code>VITE_SUPABASE_URL</code> และ <code>VITE_SUPABASE_ANON_KEY</code> (ดูรายละเอียดใน README)
        </Alert>
      </div>
    )
  }

  // กำลังตรวจสอบ session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    )
  }

  // ยังไม่ได้ login -> แสดงหน้า Login
  if (!user) {
    return <LoginPage />
  }

  // ---- render: แอปหลัก (login แล้ว) ----
  return (
    <div className="min-h-full pb-24">
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>
        <Toolbar>
          <TimelineIcon sx={{ mr: 1, color: '#2563eb' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Work Timeline Planner
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            เพิ่มงาน
          </Button>
          <UserMenu />
        </Toolbar>
      </AppBar>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {isAdmin && (
          <AdminViewBar
            value={adminView}
            onChange={setAdminView}
            profiles={profiles}
            currentUserId={user.id}
          />
        )}

        <Dashboard stats={stats} />

        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(INITIAL_FILTERS)}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <CircularProgress />
            <span className="mt-3 text-sm">กำลังโหลดข้อมูล...</span>
          </div>
        ) : loadError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadData}>
                ลองใหม่
              </Button>
            }
          >
            {loadError}
          </Alert>
        ) : filteredWorks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl">
            <EmptyState onAdd={openCreate} filtered={hasActiveFilter} />
          </div>
        ) : (
          <Timeline
            works={filteredWorks}
            showOwner={isAdmin && adminView === 'all'}
            onView={setDetailWork}
            onEdit={openEdit}
            onDelete={setConfirmTarget}
          />
        )}
      </main>

      {/* FAB สำหรับมือถือ */}
      <Fab
        color="primary"
        onClick={openCreate}
        sx={{ position: 'fixed', bottom: 24, right: 24, display: { sm: 'none' } }}
        aria-label="เพิ่มงาน"
      >
        <AddIcon />
      </Fab>

      {/* Dialogs */}
      <WorkFormDialog
        open={formOpen}
        mode={formMode}
        initialData={editingWork}
        loading={saving}
        onClose={() => {
          if (!saving) {
            setFormOpen(false)
            setEditingWork(null)
          }
        }}
        onSubmit={handleSubmit}
      />

      <WorkDetailDialog
        open={!!detailWork}
        work={detailWork}
        showOwner={isAdmin}
        onClose={() => setDetailWork(null)}
        onEdit={openEdit}
        onDelete={(work) => setConfirmTarget(work)}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        loading={deleting}
        message={
          confirmTarget
            ? `ต้องการลบงาน "${confirmTarget.title}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`
            : ''
        }
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setConfirmTarget(null)
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
