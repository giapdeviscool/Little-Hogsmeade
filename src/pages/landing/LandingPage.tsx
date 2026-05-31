import { useState } from 'react'
import { LanguageSwitch } from '../../components/ui/LanguageSwitch'
import { cn } from '../../utils/cn'

const signatureItems = [
  {
    category: 'Cà phê đặc sản',
    name: 'Cappuccino Đặc Biệt',
    description: 'Espresso đậm đà phủ lớp foam sữa nguyên kem mịn như nhung.',
    price: '₫65.000',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=85',
  },
  {
    category: 'Món chính Bistro',
    name: 'Mì Ý Sốt Truffle',
    description: 'Mì sợi tươi áo sốt nấm truffle đen, parmesan bào tay.',
    price: '₫185.000',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=85',
  },
  {
    category: 'Món chính Bistro',
    name: 'Steak Bò Úc',
    description: 'Thăn ngoại bò Úc áp chảo, sốt vang đỏ và khoai nướng thảo mộc.',
    price: '₫320.000',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=700&q=85',
  },
  {
    category: 'Rượu & Cocktail',
    name: 'Vang Đỏ Old Vine',
    description: 'Hương trái cây chín, tannin mượt — lý tưởng cho bữa tối ấm cúng.',
    price: '₫220.000',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=700&q=85',
  },
]

const menuFilters = ['Tất cả', 'Cà phê đặc sản', 'Món chính Bistro', 'Rượu & Cocktail']

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function LandingPage({ onClose }: { onClose: () => void }) {
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const menuItems = activeFilter === 'Tất cả' ? signatureItems : signatureItems.filter((item) => item.category === activeFilter)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-coffee">
      <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[80px] max-w-[1440px] items-center gap-7 px-14">
          <button type="button" onClick={() => scrollToSection('landing-hero')} className="mr-auto text-[24px] font-bold tracking-[-0.04em]">Little Hogsmeade</button>
          <nav className="flex items-center gap-7 text-sm font-semibold">
            <button type="button" onClick={() => scrollToSection('landing-story')}>Giới thiệu</button>
            <button type="button" onClick={() => scrollToSection('landing-menu')}>Thực đơn</button>
            <button type="button" onClick={() => scrollToSection('landing-events')}>Sự kiện</button>
            <button type="button">Tin tức</button>
            <button type="button" onClick={() => scrollToSection('landing-stores')}>Hệ thống cửa hàng</button>
          </nav>
          <button type="button" aria-label="Tìm kiếm" className="text-xl">⌕</button>
          <button type="button" aria-label="Thành viên" className="text-xl">♙</button>
          <LanguageSwitch />
          <button type="button" onClick={() => scrollToSection('landing-booking')} className="rounded-[12px] bg-coffee px-5 py-3 text-sm font-bold text-white shadow-soft">Đặt bàn ngay</button>
          <button type="button" onClick={onClose} className="rounded-[12px] border border-line bg-white px-5 py-3 text-sm font-bold text-coffee shadow-soft" aria-label="Đóng preview">×&nbsp; Đóng preview</button>
        </div>
      </header>

      <section id="landing-hero" className="relative flex min-h-[560px] items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1800&q=90')] bg-cover bg-center px-6 text-center">
        <div className="absolute inset-0 bg-white/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-coffee/10" />
        <div className="relative max-w-[1020px]">
          <p className="mx-auto mb-5 inline-flex rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-coffee shadow-soft">●&nbsp; Mùa Xuân 2026 · Thực đơn mới ra mắt</p>
          <h1 className="text-[68px] font-bold leading-[1.03] tracking-[-0.055em] text-coffee">Little Hogsmeade<br />Nơi phép thuật ẩm thực bắt đầu</h1>
          <p className="mx-auto mt-6 max-w-[720px] text-[20px] font-medium leading-8 text-coffee/85">Trải nghiệm không gian ấm cúng kết hợp giữa Nhà hàng, Cà phê và Quầy Bar cổ điển.</p>
          <div className="mt-9 flex justify-center gap-3">
            <button type="button" onClick={() => scrollToSection('landing-menu')} className="rounded-full bg-coffee px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#3f2d20]">Khám phá Thực đơn&nbsp; →</button>
            <button type="button" className="rounded-full border border-coffee bg-white/65 px-7 py-3.5 text-sm font-bold text-coffee backdrop-blur transition hover:bg-white">Xem video giới thiệu</button>
          </div>
        </div>
      </section>

      <StorySection />
      <EventsSection />
      <MenuSection activeFilter={activeFilter} menuItems={menuItems} onFilterChange={setActiveFilter} />
      <BookingSection />
      <StoreMemberSection />

      <footer className="bg-coffee py-16 text-white">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[1.4fr_.8fr_.9fr_1fr] gap-12 px-14">
          <div><h2 className="text-[27px] font-bold">Little Hogsmeade</h2><p className="mt-4 max-w-[320px] text-sm leading-7 text-white/65">Một góc Bistro Cafe hiện đại, nơi hương vị và những cuộc gặp gỡ đáng nhớ bắt đầu.</p><div className="mt-6 flex gap-3 text-lg"><span>◎</span><span>◉</span><span>◌</span></div></div>
          <div><h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Giờ mở cửa</h3><p className="mt-4 text-sm leading-7 text-white/70">Thứ 2 - Chủ nhật<br />07:00 - 23:00</p></div>
          <div><h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Liên hệ</h3><p className="mt-4 text-sm leading-7 text-white/70">Hotline: 1900 6868<br />hello@littlehogsmeade.vn</p></div>
          <div><h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Chi nhánh</h3><p className="mt-4 text-sm leading-7 text-white/70">Quận 1 · TP.HCM<br />Thảo Điền · TP.HCM<br />Hồ Tây · Hà Nội</p></div>
        </div>
      </footer>
    </div>
  )
}

function StorySection() {
  return (
    <section id="landing-story" className="mx-auto grid max-w-[1280px] grid-cols-[1fr_1.14fr] items-center gap-14 px-14 py-28">
      <div className="grid grid-cols-[1.45fr_.95fr] gap-3">
        <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=85" alt="Bistro phong cách châu Âu" className="col-span-1 h-[336px] w-full rounded-[18px] object-cover" />
        <img src="https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=500&q=85" alt="Cà phê thủ công" className="h-[248px] w-full rounded-[18px] object-cover" />
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=85" alt="Món ăn bistro" className="h-[160px] w-full rounded-[18px] object-cover" />
        <div className="grid h-[174px] place-items-center rounded-[18px] bg-cream text-center"><div><span className="text-[30px] text-gold">✦</span><b className="block text-[32px]">12+</b><small className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Năm kinh nghiệm Bistro</small></div></div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Giới thiệu</p>
        <h2 className="mt-4 text-[46px] font-bold leading-[1.02] tracking-[-0.055em]">Một câu chuyện ấm áp,<br />gói trong từng tách cà phê</h2>
        <p className="mt-7 text-[16px] leading-7 text-coffee/85">Lấy cảm hứng từ những quán Bistro nhỏ vùng Provence và các café cổ điển của Vienna, Little Hogsmeade được xây dựng để trở thành nơi bạn chậm lại — thưởng thức một bữa ăn ngon, một ly cà phê được pha kỹ lưỡng, hay một chai vang chia sẻ cùng người thân yêu.</p>
        <p className="mt-5 text-[16px] leading-7 text-coffee/85">Mọi nguyên liệu đều được tuyển chọn từ những nhà cung cấp địa phương tâm huyết — từ hạt cà phê rang thủ công đến bơ Pháp, vang Ý, và bánh mì nướng tươi mỗi ngày.</p>
        <div className="mt-8 grid grid-cols-3 gap-5 border-t border-line pt-7">
          {['12 Chi nhánh', '85K+ Khách hài lòng', '4.9★ Google Review'].map((stat) => {
            const [value, ...label] = stat.split(' ')
            return <div key={stat}><b className="block text-[29px]">{value}</b><span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label.join(' ')}</span></div>
          })}
        </div>
      </div>
    </section>
  )
}

function EventsSection() {
  const items = [
    ['Đêm Nhạc Acoustic', 'THỨ BẢY', '24 / 05', '20:00 — 23:00', 'Đêm acoustic ấm áp cùng ban nhạc khách mời, free champagne welcome.', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=85'],
    ['Wine Tasting Workshop', 'THỨ NĂM', '29 / 05', '18:30 — 21:00', 'Khám phá 6 nhãn vang chọn lọc cùng sommelier Marco Bianchi đến từ Ý.', 'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=1000&q=85'],
  ]

  return (
    <section id="landing-events" className="border-y border-line bg-white py-24">
      <div className="mx-auto max-w-[1280px] px-14">
        <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-gold">Sự kiện sắp tới</p>
        <h2 className="mx-auto mt-4 max-w-[560px] text-center text-[48px] font-bold leading-[1] tracking-[-0.055em]">Những đêm đáng nhớ<br />tại Little Hogsmeade</h2>
        <div className="mt-14 grid grid-cols-2 gap-7">
          {items.map(([title, weekday, date, time, description, image]) => (
            <article key={title} className="relative min-h-[420px] overflow-hidden rounded-[18px] bg-coffee">
              <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-coffee/95 via-coffee/25 to-transparent" />
              <span className="absolute left-6 top-6 rounded-[14px] bg-white px-4 py-3 text-center text-coffee shadow-soft"><small className="block text-[11px] tracking-[0.14em] text-muted">{weekday}</small><b className="mt-1 block text-[22px]">{date}</b></span>
              <div className="absolute bottom-7 left-7 max-w-[520px] text-white"><small className="text-xs font-bold tracking-[0.1em] text-white/75">{time}</small><h3 className="mt-3 text-[29px] font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/80">{description}</p><button type="button" className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-bold text-coffee">Đăng ký tham gia / Đặt bàn trước&nbsp; →</button></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function MenuSection({ activeFilter, menuItems, onFilterChange }: { activeFilter: string; menuItems: typeof signatureItems; onFilterChange: (filter: string) => void }) {
  return (
    <section id="landing-menu" className="bg-cream py-24">
      <div className="mx-auto max-w-[1280px] px-14">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Thực đơn điện tử</p>
        <div className="mt-3 flex items-end justify-between gap-8"><h2 className="text-[48px] font-bold leading-[1.02] tracking-[-0.055em]">Tinh hoa ẩm thực<br />được trình bày tinh tế</h2><button type="button" className="mb-1 text-sm font-bold">Xem toàn bộ thực đơn&nbsp; ›</button></div>
        <div className="mt-10 flex gap-2">{menuFilters.map((filter) => <button key={filter} type="button" onClick={() => onFilterChange(filter)} className={cn('rounded-full border px-5 py-2.5 text-sm font-semibold transition', activeFilter === filter ? 'border-coffee bg-coffee text-white' : 'border-line bg-white text-coffee')}>{filter}</button>)}</div>
        <div className="mt-9 grid min-h-[468px] grid-cols-4 gap-5">
          {menuItems.map((item) => <article key={item.name} className="overflow-hidden rounded-[14px] border border-line bg-white"><img src={item.image} alt={item.name} className="h-[315px] w-full object-cover" /><div className="p-5"><h3 className="text-[17px] font-bold">{item.name}</h3><p className="mt-2 min-h-[44px] text-sm leading-5 text-muted">{item.description}</p><div className="mt-4 flex items-center justify-between border-t border-line pt-4"><b>{item.price}</b><button type="button" className="rounded-full bg-coffee px-3 py-2 text-[11px] font-bold text-white">Order Giao hàng</button></div></div></article>)}
        </div>
      </div>
    </section>
  )
}

function BookingSection() {
  return (
    <section id="landing-booking" className="bg-white py-24">
      <div className="mx-auto grid max-w-[980px] grid-cols-[1fr_425px] items-center gap-24 px-8">
        <div><p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Đặt bàn online</p><h2 className="mt-4 text-[46px] font-bold leading-[1.02] tracking-[-0.055em]">Giữ chỗ cho buổi tối<br />không thể quên của bạn</h2><p className="mt-6 text-[15px] leading-6 text-coffee/85">Đặt bàn trước ít nhất 2 giờ để chúng tôi chuẩn bị chỗ ngồi ưng ý nhất. Khách Gold Member nhận free champagne welcome.</p><p className="mt-7 text-sm font-bold text-gold">★ ★ ★ ★ ★ <span className="ml-3 font-medium text-muted">4.9 / 5 · 1,284 đánh giá</span></p></div>
        <form className="rounded-[18px] border border-line bg-cream p-7 shadow-soft">
          <h3 className="text-xl font-bold">Thông tin đặt bàn</h3>
          <div className="mt-6 flex flex-col gap-4"><LandingInput label="Họ và tên" placeholder="Trần Mai Anh" /><LandingInput label="Số điện thoại" placeholder="0912 345 678" /><div className="grid grid-cols-2 gap-3"><LandingInput label="Chọn ngày" placeholder="24/05/2026" /><LandingInput label="Chọn giờ" placeholder="19:30" /></div><LandingInput label="Số lượng khách" placeholder="4 khách" /></div>
          <button type="button" className="mt-5 h-12 w-full rounded-[12px] bg-coffee text-sm font-bold text-white">Xác nhận đặt bàn&nbsp; →</button>
        </form>
      </div>
    </section>
  )
}

function StoreMemberSection() {
  return (
    <section id="landing-stores" className="bg-cream py-24">
      <div className="mx-auto grid max-w-[1080px] grid-cols-2 gap-8 px-8">
        <div className="rounded-[18px] border border-line bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Hệ thống cửa hàng</p><h2 className="mt-3 text-[24px] font-bold">Tìm cửa hàng gần nhất</h2><input className="mt-5 h-11 w-full rounded-[12px] border border-line bg-cream px-4 text-sm outline-none" placeholder="⌕  Nhập quận / thành phố..." /><div className="relative mt-4 h-[200px] overflow-hidden rounded-[12px] border border-line bg-[#e9e2d7]"><div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#d8d1c8_6px,transparent_6px),linear-gradient(90deg,#d8d1c8_6px,transparent_6px)] [background-size:120px_80px]" />{['left-[20%] top-[34%]', 'left-[51%] top-[22%]', 'left-[68%] top-[55%]', 'left-[36%] top-[68%]'].map((position) => <span key={position} className={cn('absolute grid h-7 w-7 place-items-center rounded-full bg-coffee text-xs text-white', position)}>⌾</span>)}</div><div className="mt-4 space-y-2">{['Chi nhánh Quận 1|12 Đồng Khởi, P. Bến Nghé', 'Chi nhánh Thảo Điền|45 Xuân Thuỷ, P. Thảo Điền', 'Chi nhánh Phú Mỹ Hưng|Lô R, Sky Garden 1, Q.7', 'Chi nhánh Đà Nẵng|188 Bạch Đằng, Hải Châu'].map((store) => { const [name, address] = store.split('|'); return <div key={name} className="flex items-center gap-3 rounded-[10px] bg-cream px-3 py-2.5"><span>⌾</span><div className="flex-1"><b className="block text-sm">{name}</b><small className="text-muted">{address}</small></div><span>›</span></div> })}</div></div>
        <div className="rounded-[18px] border border-line bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Thành viên</p><h2 className="mt-3 text-[24px] font-bold">Tra cứu thẻ thành viên</h2><p className="mt-3 text-sm leading-5 text-coffee/80">Nhập số điện thoại đăng ký để kiểm tra hạng thẻ và điểm thưởng hiện tại. Gold Member nhận giảm 5% và free welcome drink.</p><div className="mt-5 flex rounded-[12px] border border-line bg-cream p-2"><input className="flex-1 bg-transparent px-2 text-sm outline-none" placeholder="⌕  Số điện thoại đăng ký..." /><button type="button" className="rounded-[8px] bg-coffee px-4 py-2 text-xs font-bold text-white">Tra cứu</button></div><div className="mt-5 flex gap-4 rounded-[14px] bg-beige p-4"><span className="grid h-12 w-12 place-items-center rounded-[12px] bg-gold text-white">★</span><div className="flex-1"><b className="text-sm">Gold Member · 248 điểm</b><small className="block text-xs text-muted">Cần thêm 152 điểm để lên Platinum</small><div className="mt-2 h-1.5 rounded-full bg-white"><div className="h-full w-[62%] rounded-full bg-gold" /></div></div></div><div className="mt-5 grid grid-cols-3 gap-3">{['5%|Giảm hoá đơn', '1 ly|Welcome drink', 'Ưu tiên|Đặt bàn'].map((perk) => { const [value, label] = perk.split('|'); return <div key={perk} className="rounded-[10px] bg-cream p-3 text-center"><b className="text-sm">{value}</b><small className="mt-1 block text-xs text-muted">{label}</small></div> })}</div></div>
      </div>
    </section>
  )
}

function LandingInput({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return <label className="flex flex-col gap-2 text-sm font-bold">{label}<input type={type} placeholder={placeholder} className="h-12 rounded-[12px] border border-line bg-cream px-4 text-sm outline-none focus:border-latte" /></label>
}
