Dưới đây là toàn bộ nội dung file Markdown hoàn chỉnh (`FRONTEND_RULES.md` hoặc `README.md`) đã được tối ưu hóa, sửa đổi các phần cũ và tích hợp đồng bộ kiến trúc **Smart & Dumb Components** từ trên xuống dưới. Bạn chỉ cần copy toàn bộ nội dung trong block code dưới đây và dán thẳng vào file của mình.

```markdown
# Little Hogsmeade — Frontend Development Instructions

## 📁 Frontend Structure


```

Little-Hogsmeade/
├── src/
│   ├── api/                    # API client layer
│   │   ├── httpClient.ts       # HTTP wrapper với fetch
│   │   └── *.api.ts            # API modules (auth, user, etc.)
│   ├── assets/                 # Static assets (images, icons)
│   ├── components/             # Reusable components (Tất cả là Dumb Components dùng chung)
│   │   ├── charts/             # Chart components
│   │   ├── icons/              # Icon components
│   │   └── ui/                 # UI components (Button, Input, Card, etc.)
│   ├── config/                 # App configuration
│   │   └── env.ts              # Environment variables
│   ├── constants/              # Constants (routes, navigation, etc.)
│   ├── hooks/                  # Custom React hooks
│   ├── layouts/                # Layout components (Sidebar, TopHeader, etc.)
│   ├── locales/                # i18n translations (en, vi)
│   │   ├── en.json
│   │   ├── vi.json
│   │   ├── index.ts
│   │   ├── locale-context.ts
│   │   └── LocaleProvider.tsx
│   ├── pages/                  # Page components (Smart Containers điều hướng chính)
│   │   ├── auth/               # Authentication module
│   │   │   ├── components/     # Các Dumb components đặc thù dành riêng cho auth (LoginForm,...)
│   │   │   ├── LoginPage.tsx   # Smart component cho trang Login
│   │   │   └── RegisterPage.tsx# Smart component cho trang Register
│   │   ├── dashboard/          # Dashboard page
│   │   ├── pos/                # Point of Sale page
│   │   ├── operations/         # Operations management
│   │   ├── cms/                # Content Management System
│   │   ├── owner/              # Owner/Chain management
│   │   ├── settings/           # Settings page
│   │   ├── internal/           # Internal tools
│   │   └── landing/            # Landing page
│   ├── router/                 # React Router configuration
│   ├── store/                  # State management (localStorage-based)
│   ├── theme/                  # Design tokens và theme config
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles + Tailwind
├── public/                     # Public assets
├── .env.development            # Dev environment variables
├── .env.production             # Prod environment variables
├── eslint.config.js            # ESLint configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies

```

---

## 🎨 Technology Stack

- **Framework**: React 19 với React Compiler (Babel plugin)
- **Language**: TypeScript 6.0
- **Build Tool**: Vite 8
- **Styling**: TailwindCSS 4 (native CSS imports)
- **Routing**: React Router DOM 7
- **State Management**: Local state + localStorage (không dùng Redux/Zustand)
- **HTTP Client**: Native fetch API với wrapper
- **Icons**: Lucide React
- **i18n**: Custom implementation

---

## 📝 Code Style & Conventions

### File Naming


```

✅ ĐÚNG:

* Components: PascalCase → `LoginPage.tsx`, `AuthInput.tsx`, `Card.tsx`
* Hooks: camelCase với prefix 'use' → `useLocale.ts`, `useAdminTab.ts`
* Utils/APIs: camelCase → `auth.api.ts`, `httpClient.ts`
* Types: camelCase → `auth.types.ts`, `dashboard.types.ts`
* Constants: camelCase → `routes.ts`, `navigation.ts`

❌ SAI:

* Kebab-case cho components → `login-page.tsx`
* Snake_case → `auth_api.ts`
* Mixed case → `LoginPage.ts` (thiếu .tsx)

```

### Component Structure

```tsx
// ✅ Functional components với named export
type CardProps = {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="bg-pure-white rounded-lg p-6">
      <h3 className="text-coffee-brown font-semibold">{title}</h3>
      {children}
    </div>
  )
}

// ✅ Default export chỉ dùng cho App.tsx và main entry
function App() {
  return <AppRouter/>
}

export default App

// ❌ KHÔNG dùng React.FC (deprecated pattern)
// ❌ KHÔNG mix default + named exports trong 1 file

```

### 🧠 Smart & Dumb Components Pattern

Dự án áp dụng nghiêm ngặt kiến trúc Phân tách mối bận tâm (Separation of Concerns) thông qua mô hình **Smart Components (Container)** và **Dumb Components (Presentational)**. AI bắt buộc phải phân rã component theo các quy tắc sau:

#### 1. Định nghĩa & Trách nhiệm

| Đặc tính | Smart Components (Containers) | Dumb Components (Presentational) |
| --- | --- | --- |
| **Vị trí thư mục** | Thường là file chính nằm trực tiếp trong `src/pages/*` đóng vai trò điều phối trang lớn. | Nằm trong `src/components/*` (dùng chung) hoặc thư mục con `components/` của từng module page (dùng riêng). |
| **Trách nhiệm** | - Quản lý State, gọi API, tương tác với Store/LocalStorage.<br>

<br>- Xử lý Side-effects (`useEffect`), điều hướng (`useNavigate`).<br>

<br>- Không chứa style, markup HTML phức tạp, đóng vai trò "nhạc trưởng". | - Nhận dữ liệu qua `props` và render giao diện UI.<br>

<br>- Nhận các hàm callback (ví dụ: `onSave`, `onChange`) từ cha truyền xuống.<br>

<br>- Không chứa logic nghiệp vụ, không gọi API, không dùng hooks chứa side-effect. |
| **Sự phụ thuộc** | Phụ thuộc vào API layers, Hooks kết nối, Stores, Services. | Chỉ phụ thuộc vào cấu trúc `props` nhận được và các UI thư viện dùng chung. |

#### 2. Quy tắc code chi tiết

* **Tuyệt đối KHÔNG** viết logic `fetch/httpClient` hay handle `try/catch` xử lý dữ liệu API trực tiếp bên trong một component hiển thị dữ liệu thô (Dumb).
* **Quy tắc đặt tên Callback:** Dumb component nhận các event handlers từ Smart component thông qua props bắt buộc phải có prefix là `on` (Ví dụ: `onLoginSubmit`, `onFilterChange`, `onCloseModal`).
* **State nội bộ của Dumb component:** Chỉ cho phép chứa UI state cục bộ (ví dụ: `isOpen` hiển thị modal, `isActive` toggle tab). Không chứa data state đồng bộ từ server.

#### 3. Ví dụ mẫu chuẩn (Tách biệt Smart & Dumb)

**Bước 1: Tạo Dumb Component hiển thị UI (`src/pages/auth/components/LoginForm.tsx`)**

```tsx
import type { LoginPayload } from '@/types'

type LoginFormProps = {
  onSubmit: (payload: LoginPayload) => void
  isLoading: boolean
  errorMessage: string | null
  t: (key: string) => string
}

export function LoginForm({ onSubmit, isLoading, errorMessage, t }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      {errorMessage && <div className="text-error bg-error-bg p-3 rounded-lg text-sm">{errorMessage}</div>}
      
      <div>
        <label className="block text-sm text-coffee-brown font-medium mb-1">{t('auth.email')}</label>
        <input name="email" type="email" required className="border border-cream-foam p-2 w-full rounded-lg bg-milk-cream" />
      </div>

      <div>
        <label className="block text-sm text-coffee-brown font-medium mb-1">{t('auth.password')}</label>
        <input name="password" type="password" required className="border border-cream-foam p-2 w-full rounded-lg bg-milk-cream" />
      </div>

      <button disabled={isLoading} className="bg-coffee-brown text-pure-white px-4 py-2 rounded-lg w-full font-semibold hover:bg-espresso transition-colors disabled:opacity-50">
        {isLoading ? t('common.loading') : t('auth.login')}
      </button>
    </form>
  )
}

```

**Bước 2: Tạo Smart Component quản lý Logic dữ liệu (`src/pages/auth/LoginPage.tsx`)**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '@/hooks/useLocale'
import * as authApi from '@/api/auth.api'
import { LoginForm } from './components/LoginForm'
import type { LoginPayload } from '@/types'

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoginSubmit = async (payload: LoginPayload) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.login(payload)
      localStorage.setItem('little-hogsmeade-auth', JSON.stringify(response.data))
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-milk-cream">
      <div className="bg-pure-white p-8 rounded-lg shadow-sm border border-cream-foam">
        <h1 className="text-2xl font-bold text-coffee-brown mb-6 text-center">{t('auth.loginTitle')}</h1>
        
        <LoginForm errorMessage="{error}" isLoading="{loading}" onSubmit="{handleLoginSubmit}" t="{t}"/>
      </div>
    </div>
  )
}

```

### TypeScript Rules

```typescript
// ✅ Dùng type cho object shapes
export type AuthUser = {
  id: string
  name: string
  role: string
  email?: string  // Optional với ?
}

// ✅ Dùng interface cho API responses có thể extend
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface AuthResponse extends ApiResponse<AuthUser> {
  token: string
}

// ✅ Explicit return types cho functions
export function getAuthSession(): AuthResponse | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

// ✅ Type assertions khi cần thiết
const user = getAuthSession() as AuthResponse

// ❌ KHÔNG dùng any
function processData(data: any) { }  // ❌

// ❌ KHÔNG dùng as unknown as Type (trừ edge cases thực sự cần)
const value = rawData as unknown as ComplexType  // ❌

// ✅ Dùng proper type guards
function isAuthResponse(data: unknown): data is AuthResponse {
  return typeof data === 'object' && data !== null && 'token' in data
}

```

### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

// 2. Internal modules (absolute imports nếu có alias)
import { httpClient } from '@/api/httpClient'
import { AuthUser } from '@/types'

// 3. Relative imports
import { Card } from '../ui/Card'
import { Icon } from '../icons/Icon'

// 4. Types (có thể separate import hoặc inline)
import type { LoginPayload, RegisterPayload } from '@/types'

// 5. Styles (nếu có CSS modules)
import styles from './LoginPage.module.css'

```

---

## 🎨 Styling Guidelines

### TailwindCSS Usage

```tsx
// ✅ ĐÚNG: Dùng design tokens từ index.css
<button className="bg-coffee-brown text-pure-white rounded-lg px-4 py-2 hover:bg-espresso transition-colors">
  Đăng nhập
</button>

// ✅ Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key="{item.id}" {...item}/>)}
</div>

// ✅ Conditional classes
<div className={`p-4 rounded-lg ${isActive ? 'bg-soft-latte' : 'bg-soft-beige'}`}>
  Content
</div>

// ✅ Complex conditional với clsx/classnames (nếu cài)
import clsx from 'clsx'

<button 
  className={clsx(
    'px-4 py-2 rounded-lg transition-colors',
    isActive && 'bg-coffee-brown text-pure-white',
    !isActive && 'bg-pure-white text-coffee-brown border border-cream-foam',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Button
</button>

// ❌ SAI: Hardcode màu không nằm trong palette
<div className="bg-[#FF5733] text-[#123456]">Wrong colors</div>

// ❌ SAI: Inline styles (trừ khi giá trị động từ props/state)
<div style={{ backgroundColor: 'red', padding: '16px' }}>Avoid this</div>

// ✅ OK: Inline styles cho dynamic values
<div style={{ width: `${progress}%`, height: `${height}px` }}>
  Progress bar
</div>

```

### CSS Custom Properties (Design Tokens)

**Định nghĩa trong `src/index.css`:**

```css
/* Primary Colors */
--color-pure-white: #FFFFFF;
--color-milk-cream: #FAF8F5;
--color-soft-beige: #F5F0E6;
--color-coffee-brown: #4A3525;
--color-soft-latte: #C2A68C;

/* Extended Palette */
--color-espresso: #2D1F13;
--color-mocha: #7A5C44;
--color-cappuccino: #D4B896;
--color-cream-foam: #EDE8DF;
--color-oat-milk: #F0EBE1;

/* Semantic Colors */
--color-success: #2D7A4F;
--color-success-bg: #E8F5EE;
--color-warning: #A0622A;
--color-warning-bg: #FDF3E7;
--color-error: #C0392B;
--color-error-bg: #FDECEA;
--color-info: #2563EB;
--color-info-bg: #EFF6FF;

```

**Quy tắc sử dụng màu sắc:**

| Use Case | Tailwind Class | Hex Value |
| --- | --- | --- |
| Text chính | `text-coffee-brown` | #4A3525 |
| Text phụ | `text-mocha` | #7A5C44 |
| Placeholder | `text-soft-latte` | #C2A68C |
| Background chính | `bg-pure-white` | #FFFFFF |
| Background page | `bg-milk-cream` | #FAF8F5 |
| Background sidebar | `bg-soft-beige` | #F5F0E6 |
| Primary button | `bg-coffee-brown text-pure-white` | — |
| Secondary button | `bg-pure-white text-coffee-brown border-soft-latte` | — |
| Success status | `text-success bg-success-bg` | — |
| Error status | `text-error bg-error-bg` | — |

**Chi tiết đầy đủ xem `DESIGN_RULES.md**`

---

## 🔌 API Integration Pattern

### httpClient Setup

```typescript
// src/api/httpClient.ts
import { env } from '@/config/env'

export async function httpClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${env.apiBaseUrl}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

```

### API Module Pattern

```typescript
// src/api/auth.api.ts
import { httpClient } from './httpClient'
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from '../types'

export function login(payload: LoginPayload) {
  return httpClient<ApiResponse<AuthResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterPayload) {
  return httpClient<ApiResponse<AuthResponse>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getProfile() {
  return httpClient<ApiResponse<AuthUser>>('/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

// Helper
function getAuthToken(): string {
  const session = localStorage.getItem('little-hogsmeade-auth')
  if (!session) throw new Error('Not authenticated')
  return JSON.parse(session).token
}

```

### Component Usage

Tất cả các logic liên quan đến tích hợp API và điều phối state kết quả bắt buộc phải được đặt trong các **Smart Components (Container)**. Chi tiết cấu trúc tổ chức và luồng luân chuyển dữ liệu từ API xuống UI hiển thị, xem chi tiết tại mục **`🧠 Smart & Dumb Components Pattern`**.

**Quy tắc API:**

* ✅ Tất cả API calls phải qua `httpClient` wrapper.
* ✅ Định nghĩa kiểu dữ liệu (Type response) nghiêm ngặt thông qua generics `ApiResponse<T>`.
* ✅ Handle xử lý errors tập trung hoặc ở cấp Smart Component qua khối lệnh `try/catch`.
* ✅ Đảm bảo luôn cập nhật và cung cấp các trạng thái loading states để Dumb components hiển thị đúng UX.
* ❌ KHÔNG dùng axios (trừ khi có lý do đặc biệt).
* ❌ KHÔNG ignore errors.

---

## 💾 State Management Pattern

### localStorage-based Store

```typescript
// src/store/auth.store.ts
import type { AuthResponse, AuthUser } from '../types'

const AUTH_STORAGE_KEY = 'little-hogsmeade-auth'

export function saveAuthSession(session: AuthResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getAuthSession(): AuthResponse | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAuthToken(): string | null {
  const session = getAuthSession()
  return session?.token || null
}

export function getAuthUser(): AuthUser | null {
  const session = getAuthSession()
  return session?.data.user || null
}

```

### Custom Hook Pattern

```typescript
// src/hooks/useAuth.ts
import { useState } from 'react'
import * as authApi from '@/api/auth.api'
import * as authStore from '@/store/auth.store'
import type { LoginPayload, AuthUser } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<AuthUser null |>(() => 
    authStore.getAuthUser()
  )
  const [loading, setLoading] = useState(false)

  const login = async (payload: LoginPayload) => {
    setLoading(true)
    try {
      const response = await authApi.login(payload)
      authStore.saveAuthSession(response.data)
      setUser(response.data.user)
      return response.data
    } Fancy {
      setLoading(false)
    }
  }

  const logout = () => {
    authStore.clearAuthSession()
    setUser(null)
  }

  return {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  }
}

```

**Quy tắc State Management:**

* ✅ Dùng localStorage cho persistent data (auth, settings)
* ✅ Local state với `useState` cho UI state
* ✅ Custom hooks cho reusable logic
* ✅ Context API cho global state (nếu cần)
* ❌ KHÔNG cần Redux/Zustand cho project này
* ❌ KHÔNG overuse Context (chỉ cho truly global state)

---

## 📖 Code Comments & Documentation

```typescript
// ❌ KHÔNG cần comments cho code đơn giản
export function DummyPage() {
  // ❌ KHÔNG: "This is a simple template component"
  return <div>Simple Content</div>
}

// ✅ Comments cho logic phức tạp
export function calculateMembershipPoints(
  amount: number, 
  tier: string,
  config: LoyaltyConfig
): number {
  // Calculate base points: 1 point per 10,000 VND spent
  const basePoints = Math.floor(amount / config.spendPerPoint)
  
  // Apply tier multiplier: Bronze 1x, Silver 1.2x, Gold 1.5x, Platinum 2x
  const multiplier = getTierMultiplier(tier)
  
  // Double points on weekends for Gold+ members
  const isWeekend = [0, 6].includes(new Date().getDay())
  const weekendBonus = tier !== 'bronze' && tier !== 'silver' && isWeekend ? 2 : 1
  
  return Math.floor(basePoints * multiplier * weekendBonus)
}

// ✅ JSDoc cho public APIs/utilities
/**
 * Format currency amount to Vietnamese Dong
 * @param amount - Amount in VND
 * @param options - Formatting options
 * @returns Formatted string (e.g., "120,000 ₫")
 * @example
 * formatCurrency(120000) // "120,000 ₫"
 * formatCurrency(1500000, { compact: true }) // "1.5M ₫"
 */
export function formatCurrency(
  amount: number, 
  options?: { compact?: boolean }
): string {
  if (options?.compact && amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ₫`
  }
  return `${amount.toLocaleString('vi-VN')} ₫`
}

// ✅ TODO comments cho planned work
export function OrderSummary() {
  // TODO: Add voucher discount calculation
  // TODO: Implement loyalty points redemption
  
  return <div>Order details</div>
}

```

**Quy tắc Comments:**

* ✅ Self-documenting code (tên biến/hàm rõ ràng)
* ✅ Comments cho business logic phức tạp
* ✅ JSDoc cho public APIs, utilities, libraries
* ✅ TODO cho planned features
* ❌ KHÔNG over-comment code đơn giản
* ❌ KHÔNG dùng quá nhiều hyphens (-----)
* ❌ KHÔNG comment-out code (dùng git history)

---

## 🌐 Internationalization (i18n)

### Translation Files

```json
// src/locales/vi.json
{
  "auth": {
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "email": "Địa chỉ email",
    "password": "Mật khẩu",
    "forgotPassword": "Quên mật khẩu?"
  },
  "dashboard": {
    "title": "Bảng điều khiển",
    "revenue": "Doanh thu",
    "orders": "Đơn hàng"
  }
}

// src/locales/en.json
{
  "auth": {
    "login": "Login",
    "register": "Register",
    "email": "Email address",
    "password": "Password",
    "forgotPassword": "Forgot password?"
  },
  "dashboard": {
    "title": "Dashboard",
    "revenue": "Revenue",
    "orders": "Orders"
  }
}

```

### Hook Usage

```typescript
// src/hooks/useLocale.ts
import { useContext } from 'react'
import { LocaleContext } from '@/locales/locale-context'

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}

```

* ✅ Tất cả UI text phải có translation keys
* ✅ Nested keys với dot notation (`auth.login`, `dashboard.revenue`)
* ✅ Default language: Vietnamese (vi)
* ✅ Fallback to key name nếu translation missing
* ❌ KHÔNG hardcode text trong components
* ❌ KHÔNG dùng tiếng Anh trong Vietnamese translations

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix lint issues
npm run lint --fix

```

---

## ✅ Development Checklist

### Before Creating Component

* [ ] Xác định rõ vai trò cấu trúc: Component này là **Smart (Container)** hay **Dumb (Presentational)**?
* [ ] Component name là PascalCase và File name khớp chính xác với tên component (.tsx extension).
* [ ] Định nghĩa đầy đủ kiểu dữ liệu cấu trúc Props bằng TypeScript.
* [ ] Check xem có reusable component tương tự không.

### Component Development

* [ ] **Nếu là Dumb:** Đảm bảo component không import `httpClient`, không gọi API trực tiếp, không gọi custom hooks chứa side-effects phức tạp. Nhận toàn bộ data và callback handler (có tiền tố `on`) qua props.
* [ ] **Nếu là Smart:** Chỉ tập trung quản lý logic nghiệp vụ, điều phối hooks, trigger API và phân bổ dữ liệu. Không lạm dụng việc viết chi tiết layout css phức tạp trực tiếp trong file này.
* [ ] Toàn bộ UI text tĩnh đều đã được ánh xạ bằng mã i18n keys thông qua hàm `t()`.
* [ ] Đã cấu hình và xử lý các kịch bản trạng thái Error states và Loading states.
* [ ] Responsive design (mobile-first approach).

### API Integration

* [ ] API calls qua httpClient wrapper.
* [ ] Response typed với ApiResponse.
* [ ] Error handling với try/catch.
* [ ] Loading state cho UX.
* [ ] Success feedback cho users.

### Code Quality

* [ ] No TypeScript errors.
* [ ] No ESLint warnings.
* [ ] Self-documenting code (clear names).
* [ ] Comments chỉ cho logic phức tạp.
* [ ] No console.logs trong production code.
* [ ] No commented-out code.

---

## 🚫 Common Mistakes to Avoid

### ❌ KHÔNG làm:

```typescript
// ❌ SAI: Trộn lẫn logic xử lý API và UI thô vào cùng 1 file
export function ProductList() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/api/products').then(res => res.json()).then(setData) }, [])
  return <div>{data.map(p => <span key={p.id}>{p.name}</span>)}</div>
}

// ❌ SAI: Hardcode màu
<div className="bg-[#FF5733] text-[#FFFFFF]">

// ❌ SAI: Inline styles cho static values
<div style={{ color: 'red', padding: '16px' }}>

// ❌ SAI: Any types
function getData(id: any): any { }

// ❌ SAI: Hardcode text
<button>Login</button>
<p>Welcome back!</p>

// ❌ SAI: Ignore errors
async function login() {
  await authApi.login(payload)  // No error handling
}

// ❌ SAI: React.FC (deprecated)
const Button: React.FC<ButtonProps> = ({ children }) => { }

```

### ✅ NÊN làm:

```typescript
// ✅ ĐÚNG: Chia nhỏ thành Smart Component xử lý nghiệp vụ/API
export function ProductListContainer() {
  const { products, loading } = useProducts() // Hook quản lý fetch data qua API
  return <ProductGrid isLoading="{loading}" items="{products}"/> // Dumb UI render nhận dữ liệu qua props
}

// ✅ Dùng design tokens
<div className="bg-error text-pure-white rounded-lg p-4">

// ✅ Proper types
function getData(id: string): Promise<User[]> { }

// ✅ i18n keys
<button>{t('auth.login')}</button>

// ✅ Error handling gọn gàng ở Smart Component
async function login() {
  try {
    await authApi.login(payload)
    navigate('/dashboard')
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Login failed')
  }
}

```

---

## 📚 Key Files Reference

| File | Purpose |
| --- | --- |
| `src/api/httpClient.ts` | Fetch wrapper cho tất cả API calls |
| `src/config/env.ts` | Environment configuration |
| `src/constants/routes.ts` | Route paths constants |
| `src/constants/navigation.ts` | Navigation menu items |
| `src/router/index.tsx` | React Router configuration |
| `src/store/auth.store.ts` | Auth state management với localStorage |
| `src/theme/tokens.ts` | Design tokens (colors, spacing, typography) |
| `src/index.css` | Global styles + Tailwind directives + CSS variables |
| `src/types/index.ts` | Central type exports |
| `docs/DESIGN_RULES.md` | **Complete UI/UX design system** |

---

## 🎯 Design Philosophy

**Warm Professionalism** — Giao diện mang hơi thở cafe ấm áp nhưng vẫn giữ sự chuyên nghiệp.

### Core Principles:

* **Clarity over decoration** — Thông tin luôn đọc được trước khi đẹp
* **Warmth through restraint** — Màu nâu cafe chỉ dùng có chủ đích
* **Consistency above all** — Cùng element, cùng treatment ở mọi nơi

### Code Principles:

* **Consistency over convention** — Follow existing patterns
* **Simplicity over complexity** — Avoid over-engineering
* **Readability over cleverness** — Code cho người đọc
* **Explicit over implicit** — Clear names, explicit types
* **Type safety** — TypeScript everywhere
* **Architecture Compliance** — Tuyệt đối tuân thủ mô hình phân rã Smart/Dumb component để mã nguồn mở rộng dễ dàng.

---

## 📞 Additional Resources

* **Complete Design System**: `docs/DESIGN_RULES.md` — Xem file này cho:
* Color palette đầy đủ với hex codes
* Typography scale
* Component specifications (buttons, inputs, cards, tables, etc.)
* Spacing system
* Shadow & elevation levels
* Border radius guidelines
* Motion & transitions
* Responsive breakpoints
* Accessibility guidelines


* **ESLint Config**: `eslint.config.js`
* **TypeScript Config**: `tsconfig.json`, `tsconfig.app.json`
* **Vite Config**: `vite.config.ts`

---

*Tài liệu này là source of truth cho Frontend development trong Little Hogsmeade project.*
