import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TimelineIcon from '@mui/icons-material/Timeline'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (mode === 'signup' && !fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล')
      return
    }
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(email.trim(), password, {
          full_name: fullName.trim(),
          department: department.trim(),
        })
        // ถ้าโปรเจกต์เปิด "Confirm email" จะยังไม่มี session ทันที
        if (!data.session) {
          setInfo('สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี ก่อนเข้าสู่ระบบ')
          setMode('signin')
        }
        // ถ้าปิด confirm email จะ login อัตโนมัติผ่าน onAuthStateChange
      } else {
        await signIn(email.trim(), password)
        // เข้าสู่ระบบสำเร็จ -> AuthContext จะอัปเดต session เอง
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-slate-100">
      <Card elevation={0} sx={{ width: '100%', maxWidth: 400, border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 4 }}>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-2">
              <TimelineIcon fontSize="large" />
            </div>
            <span className="text-xs text-slate-400 mb-1">v{__APP_VERSION__}</span>
            <h1 className="text-xl font-bold text-slate-800">Work Timeline Planner</h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'signin' ? 'เข้าสู่ระบบเพื่อจัดการงานของคุณ' : 'สร้างบัญชีใหม่'}
            </p>
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {info && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInfo('')}>
              {info}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <TextField
                  label="ชื่อ-นามสกุล"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  fullWidth
                  autoComplete="name"
                  autoFocus
                />
                <TextField
                  label="หน่วยงาน / ตำแหน่ง"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  fullWidth
                  placeholder="เช่น ฝ่ายไอที / นักวิชาการคอมพิวเตอร์"
                />
              </>
            )}
            <TextField
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              autoComplete="email"
              autoFocus={mode === 'signin'}
            />
            <TextField
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading
                ? 'กำลังดำเนินการ...'
                : mode === 'signin'
                  ? 'เข้าสู่ระบบ'
                  : 'สมัครสมาชิก'}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm text-slate-600">
            {mode === 'signin' ? (
              <>
                ยังไม่มีบัญชี?{' '}
                <button
                  type="button"
                  className="text-blue-600 font-medium hover:underline"
                  onClick={() => {
                    setMode('signup')
                    setError('')
                    setInfo('')
                  }}
                >
                  สมัครสมาชิก
                </button>
              </>
            ) : (
              <>
                มีบัญชีอยู่แล้ว?{' '}
                <button
                  type="button"
                  className="text-blue-600 font-medium hover:underline"
                  onClick={() => {
                    setMode('signin')
                    setError('')
                    setInfo('')
                  }}
                >
                  เข้าสู่ระบบ
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// แปลข้อความ error ของ Supabase เป็นไทย (เท่าที่พบบ่อย)
function translateError(message = '') {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (m.includes('user already registered')) return 'อีเมลนี้ถูกใช้สมัครแล้ว'
  if (m.includes('email not confirmed')) return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
  if (m.includes('password should be at least')) return 'รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัวอักษร)'
  return message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}
