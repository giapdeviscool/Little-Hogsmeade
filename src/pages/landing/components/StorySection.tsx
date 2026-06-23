import type { CmsPage } from '../../../types'

export function StorySection({ landingPage }: { landingPage?: CmsPage | null }) {
  const title = landingPage?.aboutTitle || 'Một câu chuyện ấm áp,\ngói trong từng tách cà phê'
  const years = landingPage?.yearsOfExperience || 12
  const content = landingPage?.aboutContent || 'Little Hogsmeade được tạo ra để trở thành nơi bạn chậm lại, thưởng thức một bữa ăn ngon, một ly cà phê được pha kỹ lưỡng hoặc một chai vang chia sẻ cùng người thân.\nNguyên liệu được tuyển chọn từ nhà cung cấp địa phương và nhập khẩu, giữ tinh thần bistro ấm cúng nhưng vẫn đủ tinh tế cho những cuộc hẹn quan trọng.'
  const contentParagraphs = content.split('\\n').filter(Boolean)

  return (
    <section id="landing-story" className="mx-auto grid max-w-[1280px] gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1fr_1.14fr] lg:items-center lg:gap-14 lg:px-14 lg:py-28">
      <div className="grid grid-cols-2 gap-3">
        <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=85" alt="Bistro phong cách châu Âu" className="h-[240px] w-full rounded-[18px] object-cover md:h-[336px]" />
        <img src="https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=500&q=85" alt="Cà phê thủ công" className="h-[240px] w-full rounded-[18px] object-cover md:h-[248px]" />
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=85" alt="Món ăn bistro" className="h-[160px] w-full rounded-[18px] object-cover" />
        <div className="grid h-[160px] place-items-center rounded-[18px] bg-cream text-center md:h-[174px]">
          <div>
            <span className="text-[30px] text-gold">✦</span>
            <b className="block text-[32px]">{years}+</b>
            <small className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Năm kinh nghiệm Bistro</small>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Giới thiệu</p>
        <h2 className="mt-4 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] whitespace-pre-line md:text-[46px]">
          {title}
        </h2>
        {contentParagraphs.map((para, index) => (
          <p key={index} className="mt-7 text-[16px] leading-7 text-coffee/85">
            {para}
          </p>
        ))}
      </div>
    </section>
  )
}
