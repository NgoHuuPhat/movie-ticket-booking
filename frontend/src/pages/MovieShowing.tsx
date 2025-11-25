import UserLayout from "@/components/layout/UserLayout"
import MovieCard from "@/components/common/CardMovie"
import useListMovieShowing from "@/hooks/useListMovieShowing"

export default function MovieShowingpage() {
  const { movieShowing } = useListMovieShowing()

  return (
    <UserLayout>
      <div className="mx-auto px-4 max-w-7xl">
        {/* Movie is showing */}
        <section className="mb-20">
          <h2 className="text-center text-4xl font-anton text-white mb-12 uppercase tracking-wider">Phim đang chiếu</h2>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {movieShowing.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isComingSoon={false}
                  onWatchTrailer={() => console.log("Xem trailer:", movie.tenPhim)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  )
}
