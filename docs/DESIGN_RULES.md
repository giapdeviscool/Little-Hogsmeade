# Little Hogsmeade — UI/UX Design Rules

## 1. Design Philosophy

**Warm Professionalism** — Giao diện mang hơi thở cafe ấm áp nhưng vẫn giữ sự sạch sẽ, rõ ràng của một công cụ quản trị chuyên nghiệp. Không lòe loẹt, không lạnh lẽo — giống như không gian của chính quán: tinh tế, thân thiện, đáng tin cậy.

**Nguyên tắc cốt lõi:**
- Clarity over decoration — thông tin luôn đọc được trước khi đẹp
- Warmth through restraint — màu nâu cafe chỉ dùng có chủ đích, không tràn lan
- Consistency above all — cùng một loại element, cùng một cách xử lý ở mọi nơi

---

## 2. Color Palette

### 2.1 Primary Colors

| Token | Hex | Tên | Dùng cho |
|-------|-----|-----|----------|
| `--color-pure-white` | `#FFFFFF` | Pure White | Main content background, cards, modals |
| `--color-milk-cream` | `#FAF8F5` | Milk Cream | Page background, subtle section fills |
| `--color-soft-beige` | `#F5F0E6` | Soft Warm Beige | Sidebar background, secondary surfaces |
| `--color-coffee-brown` | `#4A3525` | Coffee Brown | Primary text, headings, active states |
| `--color-soft-latte` | `#C2A68C` | Soft Latte | Accent, highlight, brand elements |

### 2.2 Extended Palette

| Token | Hex | Tên | Dùng cho |
|-------|-----|-----|----------|
| `--color-espresso` | `#2D1F13` | Espresso | Heavy heading, strong emphasis |
| `--color-mocha` | `#7A5C44` | Mocha | Secondary text, placeholder |
| `--color-cappuccino` | `#D4B896` | Cappuccino | Hover states trên Latte elements |
| `--color-cream-foam` | `#EDE8DF` | Cream Foam | Borders, dividers, subtle separators |
| `--color-oat-milk` | `#F0EBE1` | Oat Milk | Hover background, table row highlight |

### 2.3 Semantic / Status Colors

| Token | Hex | Vai trò | Ví dụ dùng |
|-------|-----|---------|------------|
| `--color-success` | `#2D7A4F` | Thành công | Order completed, payment received |
| `--color-success-bg` | `#E8F5EE` | Success background | Badge, toast background |
| `--color-warning` | `#A0622A` | Cảnh báo | Low stock, late order |
| `--color-warning-bg` | `#FDF3E7` | Warning background | Badge, alert background |
| `--color-error` | `#C0392B` | Lỗi / Hủy | Failed payment, void order |
| `--color-error-bg` | `#FDECEA` | Error background | Badge, destructive actions |
| `--color-info` | `#2563EB` | Thông tin | Notes, tips, help text |
| `--color-info-bg` | `#EFF6FF` | Info background | Banner, callout |

### 2.4 Quy tắc sử dụng màu

```
ĐÚNG:
✅ Coffee Brown (#4A3525) làm màu text chính — không dùng black thuần
✅ Soft Latte (#C2A68C) cho CTA secondary, active nav item highlight
✅ Soft Beige (#F5F0E6) làm nền sidebar — không dùng màu khác
✅ Status colors chỉ dùng trong badge, toast, alert — không dùng cho layout

SAI:
❌ Dùng hex màu mới ngoài bảng palette trên (trừ chart colors)
❌ Đặt text Coffee Brown lên nền Soft Latte (contrast thấp)
❌ Dùng màu đỏ/xanh thuần (#FF0000, #0000FF) — phải dùng semantic tokens
❌ Gradient phức tạp — chỉ dùng solid colors hoặc gradient đơn 2 màu cùng tone
```

---

## 3. Typography

### 3.1 Font Family

```css
font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Chỉ dùng **Manrope** — không dùng serif, không dùng display fonts khác trong admin portal.  
Landing page có thể thêm `'Playfair Display'` cho heading hero nếu cần feel premium.

### 3.2 Type Scale

| Role | Size | Weight | Line Height | Dùng cho |
|------|------|--------|-------------|----------|
| `display-xl` | 32px | 700 | 1.2 | Landing page hero H1 |
| `display-lg` | 24px | 700 | 1.3 | Page title trong admin |
| `heading-md` | 20px | 600 | 1.4 | Section heading, modal title |
| `heading-sm` | 16px | 600 | 1.4 | Card title, tab heading |
| `body-lg` | 15px | 400 | 1.6 | Main body content |
| `body-md` | 14px | 400 | 1.5 | Default UI text, labels |
| `body-sm` | 13px | 400 | 1.5 | Secondary info, metadata |
| `caption` | 12px | 400 | 1.4 | Timestamps, footnotes |
| `label` | 12px | 500 | 1.3 | Form labels, table headers |
| `code` | 13px | 400 | 1.5 | Order codes, SKU, IDs |

### 3.3 Text Colors

```
Primary text:   #4A3525 (Coffee Brown) — headings, body, important data
Secondary text: #7A5C44 (Mocha) — descriptions, helper text, metadata  
Placeholder:    #C2A68C (Soft Latte) — input placeholder, empty states
Disabled:       #D4B896 (Cappuccino) — disabled labels, inactive nav
Link:           #4A3525 với underline — không dùng blue
```

### 3.4 Quy tắc Typography

```
✅ Heading trong admin dùng font-weight 600, không dùng 700 (quá nặng)
✅ Body text tối thiểu 14px để dễ đọc khi làm việc lâu
✅ Số trong bảng/POS dùng font-variant-numeric: tabular-nums để align
✅ Tên menu item / sản phẩm — title case ("Cà Phê Sữa Đá")
✅ Label form — sentence case ("Tên sản phẩm") không all-caps

❌ Không dùng italic trong admin UI (trừ empty state hint text)
❌ Không dùng text-transform: uppercase cho heading
❌ Không mix nhiều font-size trong cùng một card/row
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (8px base)

```
2px  — micro gap (icon + text trong badge)
4px  — tiny (gap giữa label và input)
8px  — small (padding bên trong badge, gap icon)
12px — compact (padding card nhỏ, gap list item)
16px — base (padding section, margin giữa rows)
24px — medium (card padding, section gap)
32px — large (page padding, gap giữa sections)
48px — xl (hero sections trong landing page)
64px — 2xl (section separator trong landing page)
```

### 4.2 Layout Chính (Admin Portal)

```
┌──────────────────────────────────────────────────────┐
│  Sidebar (240px, fixed)  │  Main Content (flex-grow)  │
│  bg: #F5F0E6             │  bg: #FFFFFF               │
│                          │                            │
│  [Logo area 64px]        │  [Top bar / breadcrumb]    │
│                          │                            │
│  [Nav items]             │  [Page content]            │
│                          │                            │
└──────────────────────────────────────────────────────────┘
```

| Vùng | Width | Background | Notes |
|------|-------|------------|-------|
| Sidebar | 240px cố định | `#F5F0E6` | Không collapse trên desktop |
| Main content | `calc(100% - 240px)` | `#FFFFFF` | Scroll dọc |
| Top bar | full main width, 56px | `#FFFFFF` | Border bottom `#EDE8DF` |
| Content area | padding: `24px 32px` | — | Tối đa content width: 1200px |

### 4.3 Grid System

- **Admin tables/lists:** 1 cột full-width
- **Dashboard cards:** 2–4 cột (responsive grid, gap 16px)
- **Form layout:** 1–2 cột (single col cho mobile, 2 col cho desktop)
- **POS layout:** chia đôi — menu list trái (60%) + order summary phải (40%)

---

## 5. Components

### 5.1 Buttons

```
PRIMARY BUTTON
  bg: #4A3525  |  text: #FFFFFF  |  border: none
  hover: #2D1F13  |  active: #2D1F13 + shadow inset
  height: 36px  |  padding: 0 16px  |  border-radius: 8px

SECONDARY BUTTON
  bg: #FFFFFF  |  text: #4A3525  |  border: 1.5px solid #C2A68C
  hover: bg #F5F0E6  |  active: border-color #4A3525
  height: 36px  |  padding: 0 16px  |  border-radius: 8px

GHOST BUTTON
  bg: transparent  |  text: #7A5C44  |  border: none
  hover: bg #F5F0E6  |  — dùng cho actions phụ trong table row

DESTRUCTIVE BUTTON
  bg: #C0392B  |  text: #FFFFFF  |  border: none
  hover: bg #A93226  |  — chỉ dùng cho Delete/Void/Cancel
  
DISABLED STATE (tất cả loại)
  opacity: 0.45  |  cursor: not-allowed  |  không hover effect
```

**Sizing:**
```
sm:  height 28px, padding 0 10px, font 12px  — table actions, inline
md:  height 36px, padding 0 16px, font 14px  — default
lg:  height 44px, padding 0 24px, font 15px  — CTA chính, landing page
```

### 5.2 Input Fields

```
DEFAULT
  bg: #FFFFFF  |  border: 1.5px solid #EDE8DF  |  border-radius: 8px
  height: 36px  |  padding: 0 12px
  text: #4A3525  |  placeholder: #C2A68C

FOCUSED
  border-color: #C2A68C  |  outline: 2px solid rgba(194,166,140,0.2)

ERROR
  border-color: #C0392B  |  outline: 2px solid rgba(192,57,43,0.15)
  — kèm error message bên dưới, màu #C0392B, font 12px

DISABLED
  bg: #F5F0E6  |  border-color: #EDE8DF  |  text: #D4B896

TEXTAREA
  min-height: 80px  |  resize: vertical  |  padding: 10px 12px
```

### 5.3 Cards

```
DEFAULT CARD
  bg: #FFFFFF
  border: 1px solid #EDE8DF
  border-radius: 12px
  padding: 20px 24px
  box-shadow: 0 1px 3px rgba(74,53,37,0.06)

HOVER CARD (clickable)
  box-shadow: 0 4px 12px rgba(74,53,37,0.10)
  border-color: #C2A68C
  transition: all 0.15s ease

METRIC CARD (dashboard KPIs)
  — như Default Card nhưng thêm left-border 3px solid #C2A68C
  — số liệu dùng font-size 24px, weight 700, color #4A3525

ALERT/HIGHLIGHT CARD
  bg: #FAF8F5  |  border-left: 3px solid [semantic color]
```

### 5.4 Tables

```
Header row:
  bg: #F5F0E6  |  text: #7A5C44  |  font: 12px, weight 500, uppercase tracking
  height: 40px  |  border-bottom: 2px solid #EDE8DF

Body row:
  bg: #FFFFFF  |  height: 48px
  border-bottom: 1px solid #EDE8DF
  text: #4A3525, 14px

Hover row:
  bg: #FAF8F5

Selected row:
  bg: #F5F0E6  |  border-left: 3px solid #C2A68C

Action cell (rightmost):
  text-align: right  |  gap: 8px giữa action buttons
  — dùng Ghost Button sm hoặc icon button
```

### 5.5 Badges / Status Pills

```
Kích thước: height 20px, padding 0 8px, font 11px weight 500, border-radius 999px

COMPLETED / ACTIVE:    bg #E8F5EE, text #2D7A4F
PENDING / IN-PROGRESS: bg #FDF3E7, text #A0622A  
CANCELLED / ERROR:     bg #FDECEA, text #C0392B
DRAFT / INACTIVE:      bg #F5F0E6, text #7A5C44
INFO / NOTE:           bg #EFF6FF, text #2563EB

Quy tắc: Badge text dùng tiếng Việt viết hoa đầu ("Đã thanh toán", "Chờ xử lý")
```

### 5.6 Navigation (Sidebar)

```
Nav item DEFAULT:
  height: 40px  |  padding: 0 16px  |  border-radius: 8px
  text: #7A5C44  |  font: 14px weight 400
  icon: 18px, màu #7A5C44
  gap icon-text: 10px

Nav item HOVER:
  bg: rgba(194,166,140,0.2)  |  text: #4A3525

Nav item ACTIVE:
  bg: #FFFFFF  |  text: #4A3525  |  font-weight: 600
  icon: #4A3525
  box-shadow: 0 1px 4px rgba(74,53,37,0.12)

Section label trong sidebar:
  font: 10px, weight 600, uppercase, letter-spacing 0.08em
  color: #C2A68C  |  padding: 16px 16px 4px
```

### 5.7 Modals & Drawers

```
MODAL
  backdrop: rgba(45,31,19,0.4) blur(2px)
  bg: #FFFFFF  |  border-radius: 16px
  padding: 24px  |  max-width: 480px (sm), 640px (md), 800px (lg)
  box-shadow: 0 20px 60px rgba(45,31,19,0.2)

DRAWER (slide từ phải)
  width: 400px (sm), 520px (md)  |  height: 100vh
  bg: #FFFFFF  |  box-shadow: -8px 0 32px rgba(45,31,19,0.15)
  padding: 24px

Header trong modal/drawer:
  border-bottom: 1px solid #EDE8DF  |  padding-bottom: 16px  |  margin-bottom: 20px
  title: 18px weight 600 color #4A3525
  close button: top-right, Ghost icon button
```

### 5.8 Toast Notifications

```
Vị trí: top-right, margin 16px từ cạnh
Width: 320px  |  border-radius: 10px
box-shadow: 0 4px 16px rgba(45,31,19,0.15)

SUCCESS: bg #E8F5EE, border-left 4px solid #2D7A4F, icon CheckCircle
WARNING: bg #FDF3E7, border-left 4px solid #A0622A, icon AlertTriangle  
ERROR:   bg #FDECEA, border-left 4px solid #C0392B, icon XCircle
INFO:    bg #EFF6FF, border-left 4px solid #2563EB, icon Info

Auto-dismiss: 4s (success/info), 6s (warning), không auto-dismiss (error)
```

---

## 6. Iconography

- **Library:** Lucide React (chỉ dùng 1 library duy nhất)
- **Default size:** 18px trong UI, 16px trong table/badge, 20px trong headings
- **Stroke width:** 1.5px (mặc định Lucide) — không thay đổi
- **Color:** luôn inherit từ text color của context (không hardcode hex vào icon)

**Icon mapping chuẩn:**
```
Dashboard:    LayoutDashboard
POS/Sales:    ShoppingCart hoặc Receipt
TableMap:     Map hoặc Grid3x3
Inventory:    Package
Owner/Chain:  Building2 hoặc BarChart3
CMS/Events:   CalendarDays
Settings:     Settings2
User/Staff:   UserCircle
Branch:       Store
Add/New:      Plus hoặc PlusCircle
Edit:         Pencil
Delete:       Trash2
Close:        X
Search:       Search
Filter:       SlidersHorizontal
Export:       Download
Print:        Printer
Alert/Warn:   AlertTriangle
Success:      CheckCircle2
Info:         Info
```

---

## 7. Shadows & Elevation

```
Level 0 (flat):     box-shadow: none                              — disabled, inactive
Level 1 (subtle):   0 1px 3px rgba(74,53,37,0.06)               — default card
Level 2 (raised):   0 4px 12px rgba(74,53,37,0.10)              — hover card, dropdown
Level 3 (floating): 0 8px 24px rgba(74,53,37,0.12)              — sticky toolbar, fab
Level 4 (modal):    0 20px 60px rgba(74,53,37,0.20)             — modal, drawer
Level 5 (overlay):  0 32px 80px rgba(45,31,19,0.25)             — full-screen overlay
```

**Quy tắc:**
- Shadow color luôn dùng tone nâu (`#4A3525` hoặc `#2D1F13`) — không dùng black
- Không stack nhiều shadow lên cùng 1 element
- Sidebar không có shadow — dùng border-right để tách

---

## 8. Border & Radius

```
Border colors (theo độ đậm nhạt):
  Subtle:  #EDE8DF (Cream Foam)   — card, table row, divider
  Default: #D4B896 (Cappuccino)   — input default, section separator  
  Focus:   #C2A68C (Soft Latte)   — input focus, active indicator
  Strong:  #7A5C44 (Mocha)        — chỉ dùng khi cần nhấn mạnh rõ

Border radius:
  2px  — tag nhỏ, status dot
  4px  — badge, inline code
  6px  — chip, small input
  8px  — button, input mặc định, nav item
  10px — toast, small card
  12px — card, dropdown menu
  16px — modal, drawer header
  24px — large card hero, landing page card
  999px — pill badge, avatar, toggle
```

---

## 9. Motion & Transitions

```
Micro (interaction):  150ms ease-out  — button hover, badge color change
Default (component):  200ms ease-out  — dropdown open, modal fade-in
Deliberate (layout):  300ms ease-in-out — drawer slide, tab switch
Slow (page):          400ms ease-in-out — full page transitions, skeleton load

Easing functions:
  ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1)  — elements entering/expanding
  ease-in:      cubic-bezier(0.4, 0.0, 1, 1)    — elements leaving/collapsing
  ease-in-out:  cubic-bezier(0.4, 0.0, 0.2, 1)  — continuous motion
```

**Quy tắc:**
```
✅ Luôn transition: background-color, border-color, box-shadow, color, opacity
✅ Drawer dùng translateX(100%) → translateX(0) — không dùng width animation
✅ Modal dùng opacity 0 + scale(0.96) → opacity 1 + scale(1)
❌ Không animate layout properties (width, height, padding) — gây reflow
❌ Không dùng animation cho critical data updates (số liệu real-time)
```

---

## 10. Responsive Breakpoints

```
sm:  640px   — Mobile landscape (landing page chủ yếu)
md:  768px   — Tablet portrait
lg:  1024px  — Tablet landscape / small laptop (admin portal minimum)
xl:  1280px  — Desktop (admin portal target)
2xl: 1536px  — Large desktop (owner dashboard)
```

**Admin Portal:**
- Minimum supported: 1024px width
- Sidebar vẫn hiển thị từ lg trở lên
- Dưới 1024px: show warning "Vui lòng dùng màn hình lớn hơn" hoặc hamburger menu

**Landing Page:**
- Fully responsive từ 320px
- Mobile-first approach

---

## 11. Data Visualization (Charts)

Áp dụng cho Dashboard, OwnerView, báo cáo doanh thu.

**Chart Color Sequence (dùng theo thứ tự):**
```
1. #C2A68C  (Soft Latte)      — primary series
2. #4A3525  (Coffee Brown)    — secondary series  
3. #D4B896  (Cappuccino)      — tertiary series
4. #7A5C44  (Mocha)           — quaternary series
5. #EDE8DF  (Cream Foam)      — background/baseline series
6. #2D7A4F  (Success Green)   — positive delta
7. #C0392B  (Error Red)       — negative delta
```

**Quy tắc chart:**
```
✅ Axis labels: 12px, color #7A5C44
✅ Grid lines: 1px solid #EDE8DF (rất nhẹ)
✅ Tooltip: bg #4A3525, text white, border-radius 8px
✅ Legend: đặt bên dưới chart, không che data
❌ Không dùng 3D charts — luôn flat
❌ Không quá 5 series trong 1 chart
```

---

## 12. Empty States

Khi danh sách/table không có data:

```
Container: text-align center, padding 48px 24px
Icon: 48px, color #D4B896, Lucide icon phù hợp context
Title: 16px weight 600, color #4A3525, margin-top 16px
Description: 14px, color #7A5C44, margin-top 8px, max-width 280px
CTA button: Secondary button, margin-top 20px (nếu có action)
```

---

## 13. Loading States

```
SKELETON LOADER
  bg: linear-gradient(90deg, #EDE8DF 25%, #FAF8F5 50%, #EDE8DF 75%)
  background-size: 200% 100%
  animation: shimmer 1.5s infinite
  border-radius: tương ứng với element thật

SPINNER
  Lucide Loader2 với animation spin
  Size: 16px (inline), 24px (overlay), 40px (full page)
  Color: #C2A68C

PAGE LOADING
  Full-screen overlay bg #FAF8F5, opacity 0.8
  Centered spinner + text "Đang tải..."
```

---

## 14. Form Patterns

### Layout
- Label luôn ở trên input (không floating label)
- Required field: dấu `*` màu `#C0392B` sau label
- Helper text: 12px màu `#7A5C44`, margin-top 4px
- Error text: 12px màu `#C0392B`, margin-top 4px, icon AlertCircle 12px

### Spacing trong form
- Gap giữa các field group: 20px
- Gap label — input: 6px
- Gap giữa 2 cột (form 2 cột): 16px

### Submit area
- Luôn sticky bottom hoặc ở cuối form
- Nút Submit: Primary Button md
- Nút Cancel/Hủy: Ghost Button md, đặt bên trái nút Submit
- Gap giữa 2 nút: 8px

---

## 15. POS-Specific Patterns

POS (Point of Sale) có UX đặc thù vì nhân viên cần thao tác nhanh:

```
ORDER ITEM CARD
  Touch-friendly: min height 56px, tap area full width
  Quantity control: − [số] + với button 32x32px
  Swipe-to-delete hoặc nút X rõ ràng

PRODUCT GRID
  Grid 3–4 cột  |  card: 80px–100px  |  image + tên + giá
  Active/selected: border 2px solid #4A3525

NUMBER KEYPAD
  Button size: tối thiểu 56x56px  |  font 20px weight 600
  bg: #FFFFFF border #EDE8DF  |  hover: #F5F0E6

TOTAL AREA
  bg: #F5F0E6  |  font size lớn (20–24px) cho tổng tiền
  Nút thanh toán: full-width, height 52px, Primary Button lg
```

---

## 16. Landing Page Specific

Landing page dùng cùng color system nhưng **được phép:**
- Font size lớn hơn (hero H1 tới 48px)
- Gradient backgrounds trong sections (nhẹ, cùng tone kem-nâu)
- Playfair Display cho hero heading (nếu muốn feel premium)
- Full-bleed images với overlay text
- Section spacing rộng hơn (64–96px giữa sections)

**Section backgrounds xen kẽ:**
```
Section 1: bg #FFFFFF
Section 2: bg #FAF8F5  (Milk Cream)
Section 3: bg #FFFFFF
Section 4: bg #F5F0E6  (Soft Beige)
... lặp pattern
```

---

## 17. Writing Style (UI Copy)

```
TIÊU ĐỀ: Viết hoa đầu từ — "Quản lý Sự kiện", "Thêm Nhân viên"
NÚT: Động từ ngắn gọn — "Thêm", "Lưu", "Hủy", "Xóa", "Xuất file"
PLACEHOLDER: Gợi ý rõ — "Nhập tên sản phẩm...", "Tìm kiếm đơn hàng..."
LABEL: Ngắn, không dùng dấu hai chấm — "Tên sản phẩm", "Giá bán"
TOAST:
  ✅ "Đã lưu thay đổi."
  ✅ "Xóa thành công."
  ✅ "Không thể kết nối. Vui lòng thử lại."
  ❌ "Your changes have been saved successfully!" (không dùng tiếng Anh)
EMPTY STATE: "Chưa có [entity].", "Tạo [entity] đầu tiên để bắt đầu."
CONFIRM DELETE: "Bạn có chắc muốn xóa [tên]? Hành động này không thể hoàn tác."
```

---

## 18. Accessibility Baseline

```
Color contrast:
  Text #4A3525 trên #FFFFFF: ratio 10.5:1 ✅ (WCAG AAA)
  Text #4A3525 trên #F5F0E6: ratio 8.2:1  ✅ (WCAG AA)
  Text #7A5C44 trên #FFFFFF: ratio 5.4:1  ✅ (WCAG AA)
  Text #FFFFFF trên #4A3525: ratio 10.5:1 ✅

Focus states:
  Tất cả interactive elements phải có outline khi focus
  outline: 2px solid #C2A68C, offset: 2px

Minimum tap target: 36x36px (admin), 44x44px (mobile/POS)

ARIA labels:
  Icon-only buttons phải có aria-label
  Form fields phải có htmlFor / aria-describedby cho errors
```

---

## 19. DO / DON'T Summary

| DO ✅ | DON'T ❌ |
|-------|---------|
| Dùng Coffee Brown cho primary text | Dùng pure black (#000000) |
| Soft Beige cho sidebar | Màu khác cho sidebar |
| Manrope cho tất cả font | Mix nhiều font trong admin |
| 8px border-radius cho inputs/buttons | Border-radius < 6px hoặc > 16px cho buttons |
| Lucide React cho icons | Mix nhiều icon library |
| Semantic status colors | Hardcode màu status tùy ý |
| Transition 150–300ms | Animation > 500ms cho UI interaction |
| Toast top-right | Toast bottom-center (reserve cho mobile) |
| Tất cả copy tiếng Việt | Tiếng Anh trong UI copy |
| Brown-toned shadows | Black shadows |
| Consistent spacing 8px grid | Pixel bất kỳ (5px, 7px, 11px...) |

---

*Tài liệu này là source of truth cho mọi quyết định design trong hệ thống Little Hogsmeade. Mọi deviation cần được ghi chú lý do và review trước khi implement.*
