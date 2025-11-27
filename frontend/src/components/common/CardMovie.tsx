import { Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { IPhimCardProps } from "@/types/movie"
import { phienBan } from "@/constants/version"  

export default function MovieCard({movie, isComingSoon = false, onWatchTrailer }: IPhimCardProps) {
  return (
    <div className="group relative bg-black/40 rounded overflow-hidden shadow-2xl border border-white/20 
      flex flex-col h-full hover:border-yellow-400/60 transition-all duration-300">
      {/* Poster */}
      <div className="relative aspect-[3/3] overflow-hidden bg-black">
        {movie.anhBia ? (
          <img
            src={movie.anhBia}
            alt={movie.tenPhim}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <p className="text-sm font-anton uppercase tracking-wider text-white/60">
              Poster coming soon
            </p>
          </div>
        )}

        {/* version + age */}
        <div className="absolute top-0 flex">
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-yellow-300 text-black shadow-lg text-sm md:text-base font-anton">
            {phienBan[movie.phienBan] || "2D"}
          </div>
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-red-600 text-white shadow-lg text-sm md:text-xl font-anton">
            {movie.tenPhanLoaiDoTuoi || "T18"}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-lg lg:text-xl text-white uppercase font-semibold mb-3 line-clamp-2">
            {movie.tenPhim}
          </h3>

          {/* Genres */}
          {movie.theLoais && movie.theLoais.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {movie.theLoais.slice(0, 3).map((genre) => (
                <span key={genre} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                  {genre}
                </span>
              ))}
              {movie.theLoais.length > 3 && (
                <span className="text-xs text-white/50">+{movie.theLoais.length - 3}</span>
              )}
            </div>
          )}

          {/* Duration */}
          {movie.thoiLuong && (
            <p className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <Clock className="w-4 h-4 text-yellow-400" />
              {movie.thoiLuong} phút
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={(e) => {
              e.preventDefault();  
              e.stopPropagation(); 
              onWatchTrailer();
            }}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition"
          >
            <Play className="w-5 h-5" />
            <span className="hidden sm:inline">Trailer</span>
          </button>
          
          {isComingSoon ? (
            <Button
              variant="yellowToPinkPurple"
              className="flex-1 h-10 font-anton uppercase text-sm cursor-pointer"
            >
              <span>Tìm hiểu thêm</span>
            </Button>
          ) : (
            <Button
              variant="yellowToPinkPurple"
              className="flex-1 h-10 font-anton uppercase text-sm"
            >
              <span>Đặt vé</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}