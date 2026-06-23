import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getMyProfile } from '../services/profileService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // โหลด profile (เพื่อรู้ role/admin) ของ user ที่ระบุ
  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    try {
      const p = await getMyProfile(userId)
      setProfile(p)
    } catch (err) {
      // ถ้ายังไม่ได้รัน schema ใหม่ (ไม่มีตาราง profiles) ก็ถือว่าเป็น user ธรรมดา
      console.error('[Auth] โหลด profile ไม่สำเร็จ:', err.message)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // ดึง session ปัจจุบัน (ถ้าเคย login ไว้ จะถูก restore จาก localStorage)
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await loadProfile(data.session?.user?.id)
      if (mounted) setLoading(false)
    })

    // ฟังการเปลี่ยนแปลงสถานะ login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      loadProfile(newSession?.user?.id)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email, password, meta = {}) => {
    // meta เช่น { full_name, department } จะถูกเก็บใน user metadata
    // แล้ว trigger handle_new_user จะนำไปบันทึกในตาราง profiles
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth ต้องอยู่ภายใน <AuthProvider>')
  return ctx
}
