import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// คำนวณเวอร์ชันตอน build:
//   base (major.minor) มาจาก package.json เช่น "1.0"
//   patch = จำนวน commit ทั้งหมด -> เพิ่มขึ้น +1 ทุกครั้งที่ commit แล้ว deploy
function getAppVersion() {
  let base = '1.0'
  try {
    const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
    if (pkg.version) base = pkg.version.split('.').slice(0, 2).join('.')
  } catch {
    /* ใช้ค่า default */
  }

  let patch = '0'
  try {
    patch = execSync('git rev-list --count HEAD').toString().trim()
  } catch {
    /* ไม่มี git (เช่นบาง CI) -> ใช้ 0 */
  }

  return `${base}.${patch}`
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
  server: {
    port: 5173,
    open: true,
  },
})
