import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Clock, Star, Play, Share2, Heart, ChevronRight, MapPin, Tags, UserRoundCheck } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { getMovieDetails } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import type { IMovie } from "@/types/movie"
import { phienBan } from "@/constants/version"

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
  const [showTrailer, setShowTrailer] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [movieDetail, setMovieDetail] = useState<IMovie | null>(null)
  const { slug } = useParams<{ slug: string }>()
  const listDienVien = movieDetail?.dienVien.split(",") || []

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
      {/* Hero Section with Backdrop */}
      <section className="relative max-w-7xl mx-auto">
        <div className="flex flex-row gap-10 pb-8 mt-10">
          {/* Poster */}
          <div className="w-40 md:w-120">
            <div className="aspect-[2/3] rounded overflow-hidden border-2 border-yellow-400/30 shadow-2xl bg-gray-800">
              {movieDetail?.anhBia ? (
                <img 
                  src={movieDetail.anhBia}
                  alt={movieDetail.tenPhim || "Movie poster"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="text-5xl mb-2">Film</span>
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-col space-y-5">
            {/* Badges */}
            {(movieDetail?.phienBan || movieDetail?.tenPhanLoaiDoTuoi) && (
              <div className="top-0 flex gap-1">
                <div className="flex items-center justify-center rounded w-8 h-8 md:w-10 md:h-10 bg-yellow-300 text-black shadow-lg text-sm md:text-base font-anton">
                  {phienBan[movieDetail?.phienBan] || "2D"}
                </div>
                <div className="flex items-center justify-center rounded w-8 h-8 md:w-10 md:h-10 bg-red-600 text-white shadow-lg text-sm md:text-xl font-anton">
                  {movieDetail?.tenPhanLoaiDoTuoi || "T18"}
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-5xl font-anton uppercase tracking-wide text-white py-2">
              {movieDetail?.tenPhim}
            </h1>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 items-center">
              <Tags className="text-yellow-300"/>
              {movieDetail?.theLoais.map((genre, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Duration */}
            <div className="flex flex-wrap gap-2 items-center">
              <Clock className="text-yellow-300"/>
              <span className="px-3 text-white">{movieDetail?.thoiLuong} phút</span>
            </div>

            {/* Age classification */}    
            <div className="flex flex-wrap gap-2 items-center">
              <UserRoundCheck className="text-yellow-300"/>
              <span className="px-3 text-black bg-yellow-300 rounded">{movieDetail?.tenPhanLoaiDoTuoi}: {movieDetail?.moTaPhanLoaiDoTuoi}</span>
            </div>
            

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-yellow-400 font-semibold min-w-[100px]">Đạo diễn</span>
                  <span className="text-gray-300">{movieDetail?.daoDien}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-yellow-400">Diễn viên</h3>
                <div className="flex flex-wrap gap-2">
                  {listDienVien.map((actor, index) => (
                    <span 
                      key={index}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-yellow-400/30 transition"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => setShowTrailer(true)}
                disabled={!movieDetail?.trailerPhim}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 
                          text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 
                          transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-current" />
                Xem Trailer
              </button>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  isLiked
                    ? "bg-red-500 border-red-500 hover:bg-red-600 text-white"
                    : "border-white/30 hover:border-white/50 hover:bg-white/10 text-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>

              <button className="p-3 rounded-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all hover:scale-105 text-white">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 md:py-12 space-y-12">
        {/* Overview Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase text-white">Nội dung phim</h2>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            {movieDetail?.moTa}
          </p>
        </section>

        {/* Showtimes Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 uppercase text-white">Lịch chiếu</h2>
          <div className="space-y-6">
            {showtimes.map((cinema) => (
              <div 
                key={cinema.rapId}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/30 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{cinema.tenRap}</h3>
                    <p className="text-gray-400 text-sm">{cinema.diaChi}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {cinema.lichChieu.map((show, index) => (
                    <button
                      key={index}
                      className="bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
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
            <button className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition">
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
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white text-sm">{movie.danhGia}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 text-white group-hover:text-yellow-400 transition mb-1">
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
      {showTrailer && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative w-full max-w-5xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-yellow-400 text-lg font-bold transition flex items-center gap-2"
            >
              <span>Đóng</span>
              <span className="text-2xl">✕</span>
            </button>
            <iframe
              className="w-full h-full rounded-xl shadow-2xl"
              src={movieDetail?.trailerPhim.replace("watch?v=", "embed/") + "?autoplay=1"}
              title="Movie Trailer"
              allow="accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </UserLayout>
  )
}