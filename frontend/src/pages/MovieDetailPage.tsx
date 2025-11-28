import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Clock, Play, Tags, UserRoundCheck } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { getMovieDetails, getMovieShowtimes } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import type { IGroupedShowtime, IMovie, IMovieShowtime } from "@/types/movie"
import { phienBan } from "@/constants/version"
import { Button } from "@/components/ui/button"
import useScrollToTop from "@/hooks/useScrollToTop"
import TrailerModal from "@/components/common/TrailerModal"
import useTrailerModal from "@/hooks/useTrailerModal"
import { formatDate, formatTime } from "@/utils/formatDate"

export default function MovieDetailPage() {
  const [movieDetail, setMovieDetail] = useState<IMovie | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [showtimesData, setShowtimesData] = useState<IGroupedShowtime>({})
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [loadingShowtimes, setLoadingShowtimes] = useState(true)
  const { slug } = useParams<{ slug: string }>()
  
  const { show, trailerId, openModal, closeModal } = useTrailerModal()
  useScrollToTop()

  useEffect(() => {
    if(!slug) return
    try {
      const fetchMovieDetails = async () => {
        const data = await getMovieDetails(slug)
        setMovieDetail(data)
      }
      fetchMovieDetails()
    } catch (error) {
      console.error("Failed to fetch movie details:", handleError(error))
    }
  }, [slug])

  useEffect(() => {
    if(!movieDetail?.maPhim) return

    const fetchShowtimes = async () => {
      try {
        setLoadingShowtimes(true)
        const data = await getMovieShowtimes(movieDetail.maPhim)

        const grouped = data.reduce((acc: IGroupedShowtime, show: IMovieShowtime) => {
          const dateKey = formatDate(show.ngayChieu,"dd/MM")
          if(!acc[dateKey]) {
            acc[dateKey] = {}
          }
          if(!acc[dateKey][show.tenLoaiPhong]) {
            acc[dateKey][show.tenLoaiPhong] = []
          }
          acc[dateKey][show.tenLoaiPhong].push(show)
          return acc
        }, {})

        setAvailableDates(Object.keys(grouped))
        setSelectedDate(Object.keys(grouped)[0] || "")
        setShowtimesData(grouped)
      } catch (error) {
        console.error("Failed to fetch showtimes:", handleError(error))
      } finally {
        setLoadingShowtimes(false)
      }
    }
    fetchShowtimes()
  }, [movieDetail?.maPhim])

  return (
    <UserLayout>
      <section className="relative max-w-7xl mx-auto mt-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 py-8">
          {/* Poster Column */}
          <div className="w-full md:w-64 lg:w-120 flex-shrink-0">
            <div className="aspect-[2/3] rounded overflow-hidden border-2 border-yellow-300/30 shadow-2xl bg-gray-800">
              {movieDetail?.anhBia ? (
                <img 
                  src={movieDetail.anhBia}
                  alt={movieDetail.tenPhim || "Movie poster"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="text-5xl mb-2">🎬</span>
                  <span className="text-sm">No image</span>
                </div>
              )}

              {/* Badges */}
              {(movieDetail?.phienBan || movieDetail?.tenPhanLoaiDoTuoi) && (
                <div className="flex">
                  <div className="flex items-center justify-center w-14 h-14 bg-yellow-300 text-black text-lg font-anton">
                    {phienBan[movieDetail?.phienBan] || "2D"}
                  </div>
                  <div className="flex items-center justify-center w-14 h-14 bg-red-600 text-white text-2xl font-anton">
                    {movieDetail?.tenPhanLoaiDoTuoi || "T18"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-anton uppercase text-white">
              {movieDetail?.tenPhim}
            </h1>
            
            <div className="flex flex-wrap gap-2 items-center">
              <Tags className="text-yellow-300 w-5 h-5" />
              {movieDetail?.theLoais.map((genre, i) => (
                <span key={i} className="text-gray-300">
                  {genre}{i < movieDetail.theLoais.length - 1 && ", "}
                </span>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <Clock className="text-yellow-300 w-5 h-5" />
              <span className="text-gray-300">{movieDetail?.thoiLuong} phút</span>
            </div>

            <div className="flex gap-2 items-center">
              <UserRoundCheck className="text-yellow-300 w-5 h-5" />
              <span className="px-3 py-1 text-black bg-yellow-300 rounded font-semibold text-sm">
                {movieDetail?.tenPhanLoaiDoTuoi}: {movieDetail?.moTaPhanLoaiDoTuoi}
              </span>
            </div>
            
            {/* Movie Details */}
            <div className="space-y-3 mt-4">
              <h2 className="font-anton text-white text-xl uppercase">Mô tả</h2>
              
              <div className="flex gap-3">
                <span className="text-yellow-300 font-semibold min-w-24">Đạo diễn:</span>
                <span className="text-gray-300">{movieDetail?.daoDien}</span>
              </div>
              
              <div className="flex gap-3">
                <span className="text-yellow-300 font-semibold min-w-24">Khởi chiếu:</span>
                <span className="text-gray-300">{formatDate(movieDetail?.ngayKhoiChieu)}</span>
              </div>
              
              <div className="flex gap-3">
                <span className="text-yellow-300 font-semibold min-w-24">Diễn viên:</span>
                <span className="text-gray-300">{movieDetail?.dienVien}</span>
              </div>
            </div>

            {/* Movie Content */}
            <div className="space-y-3 mt-4">
              <h2 className="font-anton text-white text-xl uppercase">Nội dung phim</h2>
              <p className="text-gray-300 text-base leading-relaxed">
                {movieDetail?.moTa}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() => openModal(movieDetail?.trailerPhim || "")}
                disabled={!movieDetail?.trailerPhim}
                variant="yellowToPinkPurple"
                className="font-bold"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Xem Trailer</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto pt-8">
        <h2 className="text-4xl font-anton uppercase text-white text-center">Lịch chiếu</h2>

        {availableDates.length > 0 ? (
          <div className="overflow-x-auto mb-10">
            <div className="flex gap-4 min-w-max justify-center my-10">
              {availableDates.map((date) => {
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    disabled={loadingShowtimes}
                    className={`w-24 cursor-pointer flex flex-col aspect-square items-center justify-center rounded border transition-all ${
                      selectedDate === date
                        ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-yellow-300 text-purple-900 font-bold shadow-lg'
                        : 'bg-white/10 border-yellow-300 text-yellow-300 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl font-anton">{date}</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-6">
              {loadingShowtimes ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-300 border-t-transparent"></div>
                  <p className="mt-4">Đang tải lịch chiếu...</p>
                </div>
              ) : showtimesData[selectedDate] ? (
                Object.entries(showtimesData[selectedDate]).map(([roomType, shows]) => (
                  <div
                    key={roomType}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-yellow-300/50 hover:bg-white/10 transition-all"
                  >
                    <h4 className="font-semibold text-yellow-300 text-lg mb-4 pl-3 border-l-3 border-yellow-300">
                      {roomType}
                    </h4>
                    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-3">
                      {shows.map((show) => (
                        <button
                          key={show.maSuatChieu}
                          className="bg-gradient-to-r cursor-pointer border border-yellow-300 from-yellow-300 to-pink-500 hover:from-yellow-400 hover:to-pink-500 text-black font-bold p-2 rounded transition-all shadow-lg"
                          onClick={() => {
                            console.log("Chọn suất:", show.maSuatChieu)
                          }}
                        >
                          {formatTime(show.gioChieu)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-400 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xl">Không có suất chiếu trong ngày này</p>
                  <p className="text-sm mt-2">Vui lòng chọn ngày khác</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 my-10 text-gray-400 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xl">Chưa có lịch chiếu cho phim này</p>
            <p className="text-sm mt-2">Vui lòng quay lại sau</p>
          </div>
        )}
      </section>

      {/* Trailer Modal */}
      {movieDetail?.trailerPhim && trailerId && (
        <TrailerModal
          show={show}
          trailerId={trailerId}
          onClose={closeModal}
        />
      )}
    </UserLayout>
  )
}