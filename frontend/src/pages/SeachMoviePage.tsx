import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { searchMoviesByName } from "@/services/api"
import MovieCard from "@/components/common/CardMovie"
import UserLayout from "@/components/layout/UserLayout"
import type { IMovie } from "@/types/movie"
import { handleError } from "@/utils/handleError.utils"
import useTrailerModal from "@/hooks/useTrailerModal"
import TrailerModal from "@/components/common/TrailerModal"

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get("search") || "" 

  const [movies, setMovies] = useState<IMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { show, trailerId, openModal, closeModal } = useTrailerModal()

  useEffect(() => {
    if (!keyword.trim()) return

    const fetchMovies = async () => {
      try {
        setLoading(true)
        const data = await searchMoviesByName(keyword)
        setMovies(data)
      } catch (error) {
        setError(handleError(error))
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [keyword])

  return (
    <UserLayout>
      <div className="text-white max-w-7xl mx-auto mt-10 px-4 md:px-0">
        <h1 className="text-3xl font-anton mb-8">Kết quả tìm kiếm: "{keyword}"</h1>

        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <Link key={movie.maPhim} to={`/movies/${movie.slug}`}>
                  <MovieCard 
                    movie={movie} 
                    isComingSoon={false}
                    onWatchTrailer={() => openModal(movie.trailerPhim)}
                  />
                </Link>
              ))}
          </div>
        ) : (
          !loading && <p>Không tìm thấy phim nào.</p>
        )}
      </div>

      {/* Trailer Modal */}
      {show && trailerId && (
        <TrailerModal
          show={show}
          trailerId={trailerId}
          onClose={closeModal}
        />
      )}
    </UserLayout>
  )
}
