# AGENTS.md

Quy tắc làm việc cho AI/coding agent trong dự án Bistro Cafe Management System.

## Mục tiêu dự án

Dự án là giao diện React/Vite được xuất từ Figma Make cho hệ thống quản lý chuỗi Bistro/Cafe/Wine Bar "Little Hogsmeade". Khi chỉnh sửa hoặc sinh thêm màn hình, ưu tiên giữ đúng tinh thần hiện tại: ấm, cao cấp, vận hành rõ ràng, màu coffee/cream/gold, nhiều khoảng thở nhưng vẫn đủ mật độ thông tin cho dashboard/POS.

## Stack và lệnh cơ bản

- Dùng React 18, TypeScript, Vite, Tailwind CSS v4.
- Component nền tảng nằm trong `src/app/components/ui` theo phong cách shadcn/Radix.
- Icon ưu tiên `lucide-react`; chỉ dùng MUI icons khi thật cần và đã có pattern tương ứng.
- Chạy local dev server bằng `npm run dev`.
- Build kiểm tra bằng `npm run build`.

## Quy tắc code

- Giữ component nhỏ, rõ trách nhiệm. Tách helper/component con khi một file bắt đầu khó đọc.
- Ưu tiên data array + map cho các nhóm UI lặp lại như menu item, KPI, card, table row, filter chip.
- Không thêm thư viện mới nếu có thể giải quyết bằng React, Tailwind, Radix/shadcn, lucide hoặc dependency đã có.
- Dùng TypeScript type cho props, row data, trạng thái nghiệp vụ và callback.
- Không viết logic nghiệp vụ lớn trực tiếp trong JSX; đặt helper gần component nếu chỉ dùng nội bộ file.
- Không đổi cấu trúc routing/app shell nếu yêu cầu chỉ là chỉnh giao diện một màn hình.
- Không sửa các file `src/app/components/ui/*` trừ khi cần thay đổi shared UI thật sự.

## Quy tắc style khi code UI

- Bám theo token màu trong design hiện tại:
  - Coffee: `#4A3525`
  - Latte: `#C2A68C`
  - Gold: `#D4AF37`
  - Cream: `#FAF8F5`
  - Beige: `#F5F0E6`
  - Muted text: `#8a7560`
- Nếu cần thêm màu trạng thái, giữ tông trầm như hiện tại: green `#5fa876`, orange `#d99a4b`, red `#c25a5a`.
- Font chính là `Manrope, sans-serif`.
- Dùng border mảnh `rgba(74,53,37,0.08)` hoặc `rgba(74,53,37,0.12)`.
- Shadow phải nhẹ, thường dưới dạng `0 1px 2px rgba(74,53,37,0.04)` hoặc shadow button trầm.
- Radius phổ biến:
  - Small controls: `rounded-lg`, `rounded-xl`
  - Cards/panels: `rounded-2xl`
  - Marketing/hero image blocks: `rounded-3xl`
  - Pills/chips: `rounded-full`

## Quy tắc nội dung

- Text UI chính nên dùng tiếng Việt tự nhiên, ngắn, phù hợp ngành cafe/nhà hàng.
- Lưu file mới bằng UTF-8. Không copy lại các chuỗi tiếng Việt đang bị mojibake trong bundle nếu đang tạo nội dung mới.
- Format tiền Việt Nam theo dạng `₫65.000` hoặc dùng `toLocaleString("vi-VN")` khi format động.
- Ngày/giờ nên rõ ràng, ví dụ `18 Tháng 5, 2026`, `19:30`, `20:00 - 23:00`.

## Khi thay đổi giao diện

- Đọc component hiện có trước khi chỉnh để giữ pattern.
- Sau khi chỉnh UI đáng kể, chạy `npm run build` nếu dependency đã cài.
- Nếu mở dev server, dùng `npm run dev` và kiểm tra trang chính trên localhost.
- Tránh refactor ngoài phạm vi yêu cầu.

## Không nên làm

- Không đổi palette sang xanh/tím/gradient hiện đại nếu không có yêu cầu rõ ràng.
- Không tạo landing page kiểu SaaS generic; dự án cần cảm giác bistro/cafe thật.
- Không lạm dụng absolute positioning; ưu tiên flex/grid và responsive constraints.
- Không để text chồng lên nhau hoặc tràn khỏi button/card ở viewport nhỏ.
- Không thêm card lồng card nếu chỉ để trang trí.
