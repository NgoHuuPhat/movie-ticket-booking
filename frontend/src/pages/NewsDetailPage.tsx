import { useEffect, useState } from "react"
import UserLayout from "@/components/layout/UserLayout"
import { useParams } from "react-router-dom"
import { getNewsBySlug } from "@/services/api" 
import { formatDate } from "@/utils/formatDate"
import type { INews } from "@/types/news"

export default function NewsDetailPage() {
  const { slug } = useParams()
  const [newsItem, setNewsItem] = useState<INews | null>(null)

  useEffect(() => {
    async function fetchNewsItem() {
      if (slug) {
        const data = await getNewsBySlug(slug)
        setNewsItem(data)
      }
    }
    fetchNewsItem()
  }, [slug])

  if (!newsItem) {
    return (
      <UserLayout>
        <div className="mx-auto max-w-4xl mt-20 px-4 md:px-6 text-center text-white/70 text-xl py-20">
          Tin tức không tồn tại hoặc đã bị xóa.
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="mx-auto max-w-7xl mt-10 pb-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-18 items-start">
          {/* Left: Image */}
          {newsItem.anhDaiDien && (
            <div className="rounded overflow-hidden">
              <img
                src={newsItem.anhDaiDien}
                alt={newsItem.tieuDe}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Right: Content */}
          <div className="lg:col-span-2">
            <div className="flex flex-col items-start pb-6 mb-6 border-b border-white/30 text-white">
              <h1 className="text-3xl md:text-4xl lg:text-4xl font-anton text-white mb-4 uppercase">
                {newsItem.tieuDe}
              </h1>
              {formatDate(newsItem.ngayDang)}
            </div>

            {/* Content */}
            <div 
              className="prose prose-invert leading-relaxed text-lg text-white
                prose-ul:text-white prose-ul:marker:text-white"
              dangerouslySetInnerHTML={{ __html: newsItem.noiDung }}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  )
}