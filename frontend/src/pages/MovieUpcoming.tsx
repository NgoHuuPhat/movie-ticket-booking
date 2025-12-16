import UserLayout from "@/components/layout/UserLayout"
import MovieCard from "@/components/common/CardMovie"
import useListMovieUpcoming from "@/hooks/useListMovieUpcoming"
import { Link } from "react-router-dom"
import useTrailerModal from "@/hooks/useTrailerModal"
import TrailerModal from "@/components/common/TrailerModal"
  
export default function MovieUpcomingpage() {
  const { movieUpcoming } = useListMovieUpcoming()
  const { show, trailerId, openModal, closeModal } = useTrailerModal()

  return (
    <UserLayout>
      <div className="mx-auto max-w-7xl mt-10">
        {/* Movie is showing */}
        <section className="mb-20">
          <h2 className="text-center text-4xl font-anton text-white mb-12 uppercase tracking-wider">Phim sắp chiếu</h2>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {movieUpcoming.map((movie) => (
                <Link key={movie.maPhim} to={`/movies/${movie.slug}`}>
                  <MovieCard
                    movie={movie}
                    isComingSoon={true}
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
