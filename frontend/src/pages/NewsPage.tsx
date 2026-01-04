import { Clock } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { Link } from "react-router-dom"
import useListNews from "@/hooks/useListNews"
import { formatDate } from "@/utils/formatDate"
import { Button } from "@/components/ui/button" 

export default function NewsPage() {
  const { news } = useListNews()

  // Lấy đoạn trích (excerpt) từ nội dung HTML
  const getExcerpt = (htmlContent: string, maxLength: number = 120): string => {
    if (!htmlContent) return ""

    const plainText = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .body?.textContent?.replace(/\s+/g, " ").trim() || ""

    return plainText.length > maxLength 
      ? plainText.slice(0, maxLength) + "..." 
      : plainText
  }

  return (
    <UserLayout>
      <div className="mx-auto max-w-8xl mt-10">
        <section className="mb-20">
          <h2 className="text-center text-4xl md:text-4xl font-anton text-white mb-12 uppercase">
            Tin Tức & Sự Kiện
          </h2>

          {news.length === 0 ? (
            <div className="text-center text-white/80 text-xl py-20">
              Chưa có tin tức nào được cập nhật...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {news.map((newsItem) => (
                <Link
                  key={newsItem.maTinTuc}
                  to={`/news/${newsItem.slug}`}
                  className="block h-full"
                >
                  <div
                    className="group relative bg-black/40 rounded shadow-2xl 
                      border border-white/20 h-full flex flex-col
                      hover:border-yellow-400/70 
                      transition-all duration-400"
                  >
                    {/* Image + Overlay */}
                    <div className="relative aspect-[3/3] overflow-hidden bg-black">
                      {newsItem.anhDaiDien ? (
                        <img
                          src={newsItem.anhDaiDien}
                          alt={newsItem.tieuDe}
                          className="w-full h-full object-cover transition-transform duration-700 
                            group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                          <p className="text-sm font-anton uppercase tracking-wider text-white/50">
                            Hình ảnh sắp có
                          </p>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Date badge */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full 
                          text-xs text-yellow-300 border border-yellow-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(newsItem.ngayDang)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <h3
                          className="text-lg md:text-xl font-bold uppercase text-white font-semibold mb-3 
                            line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300"
                        >
                          {newsItem.tieuDe}
                        </h3>

                        <p className="text-gray-300/90 text-sm line-clamp-3 mb-5 leading-relaxed">
                          {getExcerpt(newsItem.noiDung)}
                        </p>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="yellowToPinkPurple" 
                        className="w-full h-11 font-anton uppercase text-sm  
                          flex items-center justify-center gap-2
                          group-hover:scale-[1.02] transition-transform"
                      >
                        <span>Đọc thêm</span>
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </UserLayout>
  )
}