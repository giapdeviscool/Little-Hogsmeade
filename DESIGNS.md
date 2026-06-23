# DESIGNS.md

Design rules cơ bản cho Little Hogsmeade - Bistro Cafe Management System.

## Design Direction

Little Hogsmeade là một Bistro/Cafe/Wine Bar cao cấp, ấm và cổ điển. Giao diện cần kết hợp hai lớp trải nghiệm:

- Landing/CMS: giàu hình ảnh, editorial, gợi cảm giác cafe châu Âu, đặt bàn và khám phá menu.
- Back-office/POS/Dashboard: gọn, rõ, có nhịp vận hành, dễ scan số liệu và thao tác nhanh.

Không dùng cảm giác corporate SaaS lạnh, neon, gradient tím/xanh hoặc dashboard quá kỹ thuật.

## Palette

Primary palette:

- Coffee `#4A3525`: màu chữ chính, nút chính, sidebar text, line chart chính.
- Latte `#C2A68C`: active state, chart phụ, hover background.
- Gold `#D4AF37`: accent cao cấp, rating, badge membership, dot notification, highlight nhỏ.
- Cream `#FAF8F5`: nền section/panel nhẹ.
- Beige `#F5F0E6`: nền sidebar, placeholder media, chip, inactive surfaces.
- White `#FFFFFF`: nền app và card chính.

Text palette:

- Primary text: `#4A3525`
- Secondary text: `#5e4a3b`
- Muted text: `#8a7560`
- On dark coffee background: `#f5ebdf`, white hoặc white với opacity.

Status palette:

- Success: `#5fa876`
- Warning: `#d99a4b`
- Danger: `#c25a5a`

## Typography

- Font: `Manrope, sans-serif`.
- Không dùng nhiều font family trong cùng màn hình.
- Heading landing page có thể lớn và editorial:
  - Hero H1 khoảng `text-[68px]`, line-height `1.05`, tracking tight.
  - Section H2 khoảng `text-[44px]`, line-height `1.1`.
- Heading app/dashboard nên gọn hơn:
  - Page title khoảng `text-[28px]` đến `text-[34px]`.
  - Panel title khoảng `text-xl`.
  - Table/chip/badge dùng `text-xs` hoặc `text-sm`.
- Eyebrow label dùng uppercase, tracking rộng, màu Gold hoặc Muted.

## Layout

- App shell:
  - Sidebar rộng khoảng `w-72`, sticky full height.
  - Top header cao khoảng `h-20`, sticky top.
  - Main content dùng padding `px-8/px-10` và `py-7/py-8`.
- Landing page:
  - Container chính `max-w-[1280px]`, padding ngang `px-10`.
  - Section spacing lớn `py-24` đến `py-28`.
  - Hero dùng ảnh thật/full width, overlay nhẹ, text nằm trực tiếp trên ảnh.
- Dashboard/POS:
  - Dùng grid rõ ràng: KPI 4 cột, POS `grid-cols-[1fr_440px]`, bảng full width.
  - Sidebar hóa đơn/POS có thể sticky với `top-24`.
- Responsive:
  - Không để grid cố định gây vỡ layout trên màn hình nhỏ.
  - Các nhóm button/filter cần `flex-wrap`.
  - Input/search phải có `min-w-0` hoặc width giới hạn để tránh tràn.

## Components

### Buttons

- Primary: nền Coffee, chữ trắng, shadow nhẹ.
- Secondary: nền trắng hoặc translucent, border Coffee/rgba, chữ Coffee.
- Icon button: vuông hoặc tròn, icon lucide, strokeWidth khoảng `1.6`.
- CTA landing có thể dùng `rounded-full`; dashboard/POS dùng `rounded-xl` hoặc `rounded-lg`.

### Cards và Panels

- Card vận hành: `rounded-2xl`, border `rgba(74,53,37,0.08)`, nền trắng hoặc Cream.
- Card ảnh/menu: ảnh aspect ratio ổn định, `overflow-hidden`, hover scale nhẹ.
- Không lồng card trang trí bên trong card; chỉ dùng nested surface khi có chức năng thật như invoice summary, QR box, membership status.

### Forms và Inputs

- Input nền Cream hoặc white, border `rgba(74,53,37,0.12)`, radius `rounded-xl`.
- Search field có icon Search bên trái.
- Label form nhỏ, uppercase, tracking rộng, màu Muted.
- Placeholder tiếng Việt ngắn và đúng ngữ cảnh.

### Tables

- Header text uppercase, `text-xs`, màu Muted.
- Row xen kẽ white/Cream nhẹ.
- Status dùng pill + progress bar khi cần scan nhanh.
- Action trong table dùng icon button nhỏ `w-8 h-8`.

### Charts

- Chart chính dùng Coffee; chart phụ dùng Latte.
- Gridline rất nhẹ `rgba(74,53,37,0.06)`.
- Tooltip nền white, border Beige, radius 12px.
- Không dùng palette chart nhiều màu rực nếu chỉ so sánh 1-2 series.

## Imagery

- Landing và menu cần ảnh thật về cafe, bistro, món ăn, rượu, sự kiện.
- Ảnh phải rõ món/không gian, không quá tối hoặc chỉ mang tính stock background.
- Dùng `ImageWithFallback` cho ảnh remote.
- Placeholder media dùng Beige/Cream, không dùng skeleton xám lạnh.

## Motion và Interaction

- Hover nhẹ: opacity, background Latte alpha, translate icon nhỏ hoặc scale ảnh.
- Transition nên ngắn và kín đáo.
- Modal/overlay dùng coffee transparent + blur nhẹ như QR popup.
- Active state phải rõ bằng Coffee hoặc Latte, không chỉ đổi opacity.

## Accessibility và Usability

- Button phải có kích thước click đủ lớn, thường từ `h-9` trở lên.
- Text trên nền Coffee phải đủ tương phản.
- Không đặt chữ quan trọng trực tiếp trên ảnh nếu overlay không đủ sáng/tối.
- Dữ liệu tiền, số lượng, trạng thái kho và đơn hàng phải căn chỉnh dễ scan.

## Content Tone

- Giọng văn ấm, lịch sự, cao cấp nhưng không dài.
- Landing page có thể dùng câu gợi cảm xúc về trải nghiệm.
- Dashboard/POS ưu tiên nhãn ngắn, trực tiếp: `Doanh thu`, `Tổng đơn hàng`, `Thanh toán`, `Sắp hết hàng`.
- Tránh tiếng Anh không cần thiết trong UI chính, ngoại trừ thuật ngữ đã quen như POS, CMS, Gold Member.
