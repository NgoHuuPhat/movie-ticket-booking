import UserLayout from "@/components/layout/UserLayout"
import MovieCard from "@/components/common/CardMovie"
import useListMovieShowing from "@/hooks/useListMovieShowing"
import { Link } from "react-router-dom"
import useTrailerModal from "@/hooks/useTrailerModal"
import TrailerModal from "@/components/common/TrailerModal"

export default function MovieShowingpage() {
  const { movieShowing } = useListMovieShowing()
  const { show, trailerId, openModal, closeModal } = useTrailerModal()

  return (
    <UserLayout>
      <div className="mx-auto max-w-7xl mt-10">
        {/* Movie is showing */}
        <section className="mb-20">
          <h2 className="text-center text-4xl font-anton text-white mb-12 uppercase tracking-wider">Phim đang chiếu</h2>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {movieShowing.map((movie) => (
                <Link key={movie.maPhim} to={`/movie/${movie.slug}`}>
                  <MovieCard
                    movie={movie}
                    isComingSoon={false}
                    onWatchTrailer={() => openModal(movie.trailerPhim)}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
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
