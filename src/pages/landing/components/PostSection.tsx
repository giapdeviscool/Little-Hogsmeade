import { useState } from 'react'
import { ArrowRight, Eye } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { formatVnDate } from '../../../utils/date'
import { PostDetailModal } from '../../../components/customer/DetailModals'
import type { Post } from '../../../types'

export function PostSection({ posts, showSeeMore = false }: { posts: Post[], showSeeMore?: boolean }) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  return (
    <section id="landing-posts" className="bg-cream py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 lg:px-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Tin tức / Blog</p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.02] tracking-[-0.055em] md:text-[48px]">Bài viết mới từ quán</h2>
          </div>
          {showSeeMore && (
            <a href="/blog" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-coffee transition hover:border-coffee">
              Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-soft group cursor-pointer transition hover:border-coffee hover:-translate-y-1" onClick={() => setSelectedPost(post)}>
              <div className="overflow-hidden">
                <img src={post.thumbnailUrl} alt={post.title} className="h-[210px] w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5 flex flex-col h-[calc(100%-210px)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{post.category}</p>
                <h3 className="mt-2 text-[18px] font-bold leading-6 transition group-hover:text-coffee">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted flex-1">{post.content}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                  <span>{formatVnDate(post.publishedAt ?? post.createdAt)}</span>
                  <span className="flex items-center gap-1 font-bold text-coffee"><Eye className="h-3.5 w-3.5" /> Đọc tiếp</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <Card className="mt-8 p-6 text-center">
            <p className="text-sm font-semibold">Chưa có bài viết đã publish.</p>
            <p className="mt-2 text-sm text-muted">Tạo bài viết mới trong CMS để khối Blog hiển thị nội dung thật.</p>
          </Card>
        )}
      </div>
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </section>
  )
}
