# 🗓️ Work Timeline Planner

เว็บแอปสำหรับ **บันทึกและแสดง Timeline งานที่กำลังจะมาถึง** เรียงงานจากใกล้ที่สุดไปไกลที่สุด
ใช้งานได้จริงผ่าน URL เว็บไซต์ทั่วไป โดย **ไม่ต้องเช่า Server และไม่มีค่าใช้จ่ายรายเดือนในช่วงเริ่มต้น**
(Database ฟรีจาก Supabase + Hosting ฟรีจาก Netlify / Vercel)

---

## ✨ ฟีเจอร์

- 🔐 **ระบบ Login / สมัครสมาชิก** ด้วย Supabase Auth (Email + Password)
- ➕ เพิ่ม / ✏️ แก้ไข / 🗑️ ลบ / 👁️ ดูรายละเอียดงาน
- 📜 แสดงผลเป็น **Timeline เส้นแนวตั้ง** จัดกลุ่มตามวันที่
- ⏱️ เรียงงานที่กำลังจะมาถึงจาก **ใกล้ที่สุด → ไกลที่สุด**
- 🔍 ค้นหางาน (ชื่อ / สถานที่ / ผู้รับผิดชอบ / รายละเอียด)
- 🏷️ กรองตามสถานะ และ 📅 กรองตามช่วงวันที่
- 🗺️ เปิดลิงก์ Google Map ได้
- 📊 Dashboard Summary Card (งานทั้งหมด / วันนี้ / แยกตามสถานะ)
- 🔔 Snackbar แจ้งเตือนเมื่อเพิ่ม / แก้ไข / ลบสำเร็จ
- ⚠️ Confirm Dialog ก่อนลบ
- 🟣 Badge **"วันนี้"** และ 🟠 Badge **"ใกล้ถึงแล้ว"** (ภายใน 24 ชม.)
- 🟢 งานเสร็จสิ้นสีเขียว / 🔴 งานยกเลิกสีเทา-แดง
- 📱 รองรับมือถือ (Responsive) + Empty State เมื่อไม่มีข้อมูล

## 🧰 เทคโนโลยี

React • Vite • Tailwind CSS • Material UI (MUI) • Supabase (PostgreSQL + Auth) • Day.js

---

## 🚀 เริ่มต้นใช้งาน (Local)

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Supabase

1. สมัคร / เข้าสู่ระบบที่ [supabase.com](https://supabase.com) แล้วสร้าง **New Project** (เลือก Free Plan)
2. ไปที่เมนู **SQL Editor → New query** แล้ววางเนื้อหาจากไฟล์ [`supabase_schema.sql`](./supabase_schema.sql) ทั้งหมด กด **Run**
   - สคริปต์จะสร้างตาราง `work_timeline`, index, trigger `updated_at` และ **เปิด Row Level Security (RLS) แบบ authenticated** (ต้อง Login ถึงเข้าถึงข้อมูลได้)
3. **(แนะนำ) ใส่ข้อมูลตัวอย่าง:** เปิด **SQL Editor → New query** อีกครั้ง วางเนื้อหาจาก [`supabase_seed.sql`](./supabase_seed.sql) แล้วกด **Run** เพื่อให้มีงานตัวอย่างใน Timeline
4. **เปิดระบบ Auth:** ไปที่ **Authentication → Providers → Email** ให้แน่ใจว่า Email เปิดอยู่
   - ช่วงทดสอบ แนะนำปิด **"Confirm email"** (Authentication → Providers → Email) เพื่อให้สมัครแล้วเข้าใช้งานได้ทันทีโดยไม่ต้องยืนยันอีเมล
   - หรือสร้างผู้ใช้เองที่ **Authentication → Users → Add user**
5. ไปที่ **Project Settings → API** แล้วคัดลอกค่า 2 ตัวนี้:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 3. สร้างไฟล์ `.env`

คัดลอกจากตัวอย่าง แล้วใส่ค่าจริง:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> ⚠️ ตัวแปรต้องขึ้นต้นด้วย `VITE_` เท่านั้น Vite จึงจะอ่านค่าได้ และอย่า commit ไฟล์ `.env` ขึ้น git (มีใน `.gitignore` แล้ว)

### 4. รันโปรเจกต์

```bash
npm run dev
```

เปิด http://localhost:5173

---

## 🗄️ โครงสร้างตาราง `work_timeline`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---|---|---|
| `id` | UUID (PK) | `gen_random_uuid()` |
| `title` | TEXT | **บังคับ** ชื่องาน |
| `work_date` | DATE | **บังคับ** วันที่ |
| `start_time` | TIME | **บังคับ** เวลาเริ่ม |
| `end_time` | TIME | เวลาสิ้นสุด (ไม่บังคับ) |
| `location` | TEXT | **บังคับ** สถานที่ |
| `google_map_url` | TEXT | ลิงก์แผนที่ |
| `detail` | TEXT | รายละเอียด |
| `responsible_person` | TEXT | ผู้รับผิดชอบ |
| `status` | TEXT | `pending` / `in_progress` / `completed` / `cancelled` |
| `created_at` | TIMESTAMP | `NOW()` |
| `updated_at` | TIMESTAMP | อัปเดตอัตโนมัติด้วย trigger |

**สถานะงาน:** `pending` = รอดำเนินการ · `in_progress` = กำลังดำเนินการ · `completed` = เสร็จสิ้น · `cancelled` = ยกเลิก

---

## 🌐 Deploy ฟรี

ทั้งสองแพลตฟอร์มใช้ค่า build เดียวกัน:

- **Build command:** `npm run build`
- **Publish / Output directory:** `dist`
- **Environment Variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

> สำคัญ: ต้องตั้ง Environment Variables บนแพลตฟอร์มด้วย ไม่เช่นนั้นเว็บที่ deploy แล้วจะเชื่อม Supabase ไม่ได้

### ตัวเลือก A — Netlify (Free)

1. push โค้ดขึ้น GitHub
2. เข้า [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → เลือก repo
3. ตั้งค่า build:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. ไปที่ **Site settings → Environment variables → Add a variable** แล้วเพิ่ม:
   - `VITE_SUPABASE_URL` = (Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (anon public key)
5. กด **Deploy** — จะได้ URL เช่น `https://your-site.netlify.app`

> ไฟล์ [`netlify.toml`](./netlify.toml) ในโปรเจกต์ตั้งค่า build และ SPA redirect ให้แล้ว

### ตัวเลือก B — Vercel (Hobby Plan)

1. push โค้ดขึ้น GitHub
2. เข้า [vercel.com](https://vercel.com) → **Add New… → Project** → เลือก repo
3. Vercel จะตรวจพบ Vite อัตโนมัติ (Build: `npm run build`, Output: `dist`)
4. ในขั้นตอน import กดเปิด **Environment Variables** แล้วเพิ่ม:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (หรือเพิ่มภายหลังที่ **Project Settings → Environment Variables** แล้ว **Redeploy**)
5. กด **Deploy** — จะได้ URL เช่น `https://your-app.vercel.app`

> หลังแก้ Environment Variables ต้อง **Redeploy** ใหม่เสมอ เพราะค่า `VITE_*` ถูกฝังตอน build

---

## 🔐 ความปลอดภัย + สิทธิ์การเข้าถึง (Multi-tenant + Admin)

โปรเจกต์นี้มี **ระบบ Login จริงด้วย Supabase Auth** และแยกสิทธิ์ตาม **บทบาท (role)** ด้วย RLS:

| บทบาท | เห็นงาน | แก้ไข/ลบ |
|---|---|---|
| **user** (ผู้ใช้ทั่วไป) | เฉพาะงานของตัวเอง | เฉพาะงานของตัวเอง |
| **admin** (ผู้ดูแลระบบ) | งานของทุกคน | งานของทุกคน |

- ทุกงานผูกกับเจ้าของผ่านคอลัมน์ `user_id` (เติมอัตโนมัติด้วย `auth.uid()` ตอนสร้าง)
- ตาราง `profiles` เก็บ `role` ของผู้ใช้ และถูกสร้างอัตโนมัติเมื่อมีการสมัคร (trigger `on_auth_user_created`)
- ฟังก์ชัน `is_admin()` (SECURITY DEFINER) ใช้ตรวจสิทธิ์ใน RLS policy
- **admin** จะเห็นแถบ "โหมดผู้ดูแลระบบ" ด้านบน เลือกได้ว่าจะดู **งานของฉัน / ดูของทุกคน (รวม) / เจาะจงรายบุคคล** — เมื่อดูรวมจะมีป้ายอีเมลเจ้าของงานบนการ์ดแต่ละใบ

### 👑 วิธีตั้งให้ผู้ใช้เป็น admin

1. ให้ผู้ใช้คนนั้น **สมัครสมาชิก** ในแอปก่อน (เพื่อให้มีแถวใน `profiles`)
2. ไปที่ Supabase → **SQL Editor** แล้วรัน (แก้อีเมลเป็นของคุณ):

   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
   ```

3. ออกจากระบบแล้วเข้าใหม่ในแอป — จะเห็นแถบโหมดผู้ดูแลระบบ

> ตรวจ role ปัจจุบันได้ด้วย `SELECT email, role FROM profiles;`

### โหมดทดสอบแบบไม่ต้อง Login (ทางเลือก)

ถ้าต้องการเดโมเร็ว ๆ โดยไม่มีระบบ Login ในไฟล์ [`supabase_schema.sql`](./supabase_schema.sql)
มี policy `anon_full_access` (comment ไว้) ให้เปิดใช้แทน — แต่:

> ⚠️ **เหมาะสำหรับทดสอบเท่านั้น** เพราะใครก็ตามที่มี `anon key` (ซึ่งฝังในหน้าเว็บ)
> จะอ่าน/เขียน/ลบข้อมูลได้ทั้งหมด **อย่าใช้กับข้อมูลที่เป็นความลับ**

### ต่อยอด: Login ด้วย Google / OAuth

ระบบ Auth ทั้งหมดรวมศูนย์ที่ [`src/context/AuthContext.jsx`](./src/context/AuthContext.jsx):
เปิด provider ที่ Supabase → Authentication → Providers แล้วเรียก `supabase.auth.signInWithOAuth({ provider: 'google' })`

---

## 📁 โครงสร้างโปรเจกต์

```
.
├── index.html
├── supabase_schema.sql        # SQL สร้างตาราง + RLS (authenticated)
├── supabase_seed.sql          # ข้อมูลตัวอย่าง
├── netlify.toml               # config สำหรับ Netlify
├── vercel.json                # config สำหรับ Vercel
├── .env.example
└── src/
    ├── main.jsx               # entry + MUI ThemeProvider + AuthProvider
    ├── App.jsx                # หน้าหลัก + auth gate + state management
    ├── index.css              # Tailwind directives
    ├── lib/
    │   └── supabaseClient.js  # เชื่อมต่อ Supabase (อ่านจาก .env)
    ├── context/
    │   └── AuthContext.jsx    # จัดการ session / signIn / signUp / signOut
    ├── services/
    │   └── workTimelineService.js  # get/create/update/delete
    ├── utils/
    │   ├── dateUtils.js       # จัดการวัน/เวลา + badge logic
    │   └── statusUtils.js     # สถานะ + สี
    └── components/
        ├── LoginPage.jsx      # หน้า Login / สมัครสมาชิก
        ├── UserMenu.jsx       # เมนูผู้ใช้ + ออกจากระบบ
        ├── Dashboard.jsx
        ├── FilterBar.jsx
        ├── Timeline.jsx
        ├── TimelineItem.jsx
        ├── WorkFormDialog.jsx
        ├── WorkDetailDialog.jsx
        ├── ConfirmDialog.jsx
        └── EmptyState.jsx
```

## 📜 สคริปต์

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รัน dev server |
| `npm run build` | build ไปที่โฟลเดอร์ `dist` |
| `npm run preview` | preview ผล build แบบ local |
