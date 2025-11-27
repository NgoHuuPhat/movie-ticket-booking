import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Clock, Star, Play, ChevronRight, MapPin, Tags, UserRoundCheck } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { getMovieDetails } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import type { IMovie } from "@/types/movie"
import { phienBan } from "@/constants/version"
import { Button } from "@/components/ui/button"
import useScrollToTop from "@/hooks/useScrollToTop"
import TrailerModal from "@/components/common/TrailerModal"
import useTrailerModal from "@/hooks/useTrailerModal"
import { formatDate } from "@/utils/formatDate"

const showtimes = [
  {
    rapId: 1,
    tenRap: "CGV Vincom Center",
    diaChi: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
    lichChieu: [
      { gio: "09:00", phongChieu: "Rạp 1", giaVe: 80000, ghe: 45 },
      { gio: "11:30", phongChieu: "Rạp 2", giaVe: 90000, ghe: 32 },
      { gio: "14:00", phongChieu: "Rạp 1", giaVe: 100000, ghe: 18 },
      { gio: "16:30", phongChieu: "Rạp 3", giaVe: 100000, ghe: 28 },
      { gio: "19:00", phongChieu: "Rạp 2", giaVe: 120000, ghe: 12 },
      { gio: "21:30", phongChieu: "Rạp 1", giaVe: 100000, ghe: 25 },
    ]
  },
  {
    rapId: 2,
    tenRap: "Lotte Cinema Liễu Giai",
    diaChi: "54 Liễu Giai, Ba Đình, Hà Nội",
    lichChieu: [
      { gio: "10:00", phongChieu: "Rạp 5", giaVe: 85000, ghe: 38 },
      { gio: "13:00", phongChieu: "Rạp 3", giaVe: 95000, ghe: 22 },
      { gio: "15:30", phongChieu: "Rạp 5", giaVe: 105000, ghe: 15 },
      { gio: "18:00", phongChieu: "Rạp 3", giaVe: 115000, ghe: 8 },
      { gio: "20:30", phongChieu: "Rạp 5", giaVe: 105000, ghe: 20 },
    ]
  },
]

const relatedMovies = [
  { 
    maPhim: 2, 
    tenPhim: "GUARDIANS OF THE GALAXY VOL. 3",
    anhBia: "https://image.tmdb.org/t/p/original/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    theLoais: ["Hành động", "Phiêu lưu"],
    danhGia: 8.2
  },
  { 
    maPhim: 3, 
    tenPhim: "THE SUPER MARIO BROS. MOVIE",
    anhBia: "https://image.tmdb.org/t/p/original/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
    theLoais: ["Hoạt hình", "Phiêu lưu"],
    danhGia: 7.8
  },
  { 
    maPhim: 4, 
    tenPhim: "SPIDER-MAN: ACROSS THE SPIDER-VERSE",
    anhBia: "https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    theLoais: ["Hoạt hình", "Hành động"],
    danhGia: 9.0
  },
  { 
    maPhim: 5, 
    tenPhim: "OPPENHEIMER",
    anhBia: "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    theLoais: ["Tiểu sử", "Lịch sử"],
    danhGia: 8.9
  },
]

export default function MovieDetailPage() {
  const [movieDetail, setMovieDetail] = useState<IMovie | null>(null)
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
      <div className="max-w-7xl mx-auto py-8 md:py-12 space-y-12">
        {/* Showtimes Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 uppercase text-white">Lịch chiếu</h2>
          <div className="space-y-6">
            {showtimes.map((cinema) => (
              <div 
                key={cinema.rapId}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-300/30 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{cinema.tenRap}</h3>
                    <p className="text-gray-400 text-sm">{cinema.diaChi}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {cinema.lichChieu.map((show, index) => (
                    <button
                      key={index}
                      className="bg-gradient-to-r from-yellow-300 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      <div className="text-lg font-bold">{show.gio}</div>
                      <div className="text-xs opacity-80 mt-1">{show.ghe} ghế trống</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Movies */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase text-white">Phim liên quan</h2>
            <button className="flex items-center gap-2 text-yellow-300 hover:text-yellow-300 transition">
              <span className="hidden sm:inline font-semibold">Xem tất cả</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedMovies.map((movie) => (
              <div 
                key={movie.maPhim}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                  <img 
                    src={movie.anhBia}
                    alt={movie.tenPhim}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    <span className="font-bold text-white text-sm">{movie.danhGia}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 text-white group-hover:text-yellow-300 transition mb-1">
                  {movie.tenPhim}
                </h3>
                <div className="flex gap-1 flex-wrap">
                  {movie.theLoais.slice(0, 2).map((genre, index) => (
                    <span key={index} className="text-xs text-gray-400">
                      {genre}{index < movie.theLoais.slice(0, 2).length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

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