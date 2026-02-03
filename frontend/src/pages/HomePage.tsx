import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, ChevronLeft } from "lucide-react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Button } from "@/components/ui/button"
import UserLayout from "@/components/layout/UserLayout"
import MovieCard from "@/components/common/CardMovie"
import ChatbotWidget from "@/components/common/ChatbotWidget"
import useListMovieShowing from "@/hooks/useListMovieShowing"
import useListMovieUpcoming from "@/hooks/useListMovieUpcoming"
import TrailerModal from "@/components/common/TrailerModal"
import useTrailerModal from "@/hooks/useTrailerModal"
import { getBanners } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import useListNews from "@/hooks/useListNews"
import type { IBanner } from "@/types/banner"

export default function Homepage() {
  const [currentPageNow, setCurrentPageNow] = useState(0)
  const [currentPageComing, setCurrentPageComing] = useState(0)
  const [currentPageNews, setCurrentPageNews] = useState(0)

  const [banners, setBanners] = useState<IBanner[]>([])

  const { show, trailerId, openModal, closeModal } = useTrailerModal()
  const { movieShowing } = useListMovieShowing()
  const { movieUpcoming } = useListMovieUpcoming()
  const { news } = useListNews()

  // Custom arrow
  function SampleNextArrow({ onClick }: { onClick?: () => void }) {
    return (
      <div
        onClick={onClick}
        className="hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-60px] text-white hover:text-yellow-300 z-10 cursor-pointer"
      >
        <ChevronRight className="w-12 h-12" />
      </div>
    );
  }

  function SamplePrevArrow({ onClick }: { onClick?: () => void }) {
    return (
      <div
        onClick={onClick}
        className="hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-60px] text-white hover:text-yellow-300 z-10 cursor-pointer"
      >
        <ChevronLeft className="w-12 h-12" />
      </div>
    );
  }

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    customPaging: () => (
      <div className="w-3 h-3 md:mt-6 mt-4 rounded-full bg-white/50 hover:bg-yellow-400 transition"/>
    ),
  }

  // Fetch banners
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bannerRes = await getBanners()
        setBanners(bannerRes)
      } catch (error) {
        console.error(handleError(error))
      }
    }
    fetchData()
  }, [])
  
  const moviesPerPage = 4
  const newsPerPage = 4 

  const moviesShowingLimited = movieShowing.slice(0, 8)
  const moviesUpcomingLimited = movieUpcoming.slice(0, 8)
  const newsLimited = news.slice(0, 8) 

  const displayedNow = moviesShowingLimited.slice(currentPageNow * moviesPerPage, (currentPageNow + 1) * moviesPerPage)
  const displayedComing = moviesUpcomingLimited.slice(currentPageComing * moviesPerPage, (currentPageComing + 1) * moviesPerPage)
  const displayedNews = newsLimited.slice(currentPageNews * newsPerPage, (currentPageNews + 1) * newsPerPage)

  const totalPagesNow = Math.ceil(moviesShowingLimited.length / moviesPerPage)
  const totalPagesComing = Math.ceil(moviesUpcomingLimited.length / moviesPerPage)
  const totalPagesNews = Math.ceil(newsLimited.length / newsPerPage)

  const nextPageNow = () => setCurrentPageNow(p => p === totalPagesNow - 1 ? 0 : p + 1)
  const prevPageNow = () => setCurrentPageNow(p => p === 0 ? totalPagesNow - 1 : p - 1)
  const nextPageComing = () => setCurrentPageComing(p => p === totalPagesComing - 1 ? 0 : p + 1)
  const prevPageComing = () => setCurrentPageComing(p => p === 0 ? totalPagesComing - 1 : p - 1)

  const nextPageNews = () => setCurrentPageNews(p => p === totalPagesNews - 1 ? 0 : p + 1)
  const prevPageNews = () => setCurrentPageNews(p => p === 0 ? totalPagesNews - 1 : p - 1)

  return (
    <UserLayout>
      <div className="mx-auto max-w-7xl mt-10">
        {/* Banner */}
        <section className="relative mb-16 md:mb-24">
          <Slider {...bannerSettings}>
            {banners.map((slide: IBanner) => (
              <Link to={`${slide.duongDanLienKet}`} key={slide.maBanner}>
                <img
                  src={slide.anhBanner}
                  alt={"Banner quảng cáo"}
                  className="w-full h-30 md:h-80 object-cover rounded"
                />
              </Link>
            ))}
          </Slider>
        </section>

        {/* Phim đang chiếu */}
        <section className="mb-10 md:mb-20">
          <h2 className="text-center text-2xl md:text-4xl font-anton text-white mb-6 md:mb-12 uppercase tracking-wider">Phim đang chiếu</h2>
          <div className="relative">
            <button onClick={prevPageNow} className="hidden lg:block cursor-pointer absolute top-1/2 -translate-y-1/2 -translate-x-14 text-white hover:text-yellow-300 2xl:left-0 xl:left-10 lg:left-15 z-10">
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button onClick={nextPageNow} className="hidden lg:block cursor-pointer absolute top-1/2 -translate-y-1/2 translate-x-14 text-white hover:text-yellow-300 2xl:right-0 xl:right-10 lg:right-15 z-10">
              <ChevronRight className="w-12 h-12" />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {displayedNow.map((movie) => (
                <Link key={movie.maPhim} to={`/movies/${movie.slug}`}>
                  <MovieCard
                    movie={movie}
                    isComingSoon={false}
                    onWatchTrailer={() => openModal(movie.trailerPhim)}
                  />
                </Link>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 md:mt-8">
            <button onClick={prevPageNow} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="flex gap-3 items-center">
              {Array.from({ length: totalPagesNow }, (_, i) => (
                <button key={i} onClick={() => setCurrentPageNow(i)}
                  className={`w-3 h-3 rounded-full transition ${i === currentPageNow ? "bg-yellow-400" : "bg-white/50"}`}
                />
              ))}
            </div>
            <button onClick={nextPageNow} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
          <div className="text-center mt-4 md:mt-8">
            <Link to="/movies/showing">
              <Button variant="transparentToYellowOrange" className="h-10 px-20">
                <span className="font-anton uppercase text-base">Xem thêm</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Phim sắp chiếu */}
        <section className="mb-10 md:mb-20">
          <h2 className="text-center text-2xl md:text-4xl font-anton text-white mb-6 md:mb-12 uppercase tracking-wider">Phim sắp chiếu</h2>
          <div className="relative">
            <button onClick={prevPageComing} className="hidden lg:block absolute cursor-pointer top-1/2 -translate-y-1/2 -translate-x-14 text-white hover:text-yellow-300 2xl:left-0 xl:left-10 lg:left-15 z-10">
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button onClick={nextPageComing} className="hidden lg:block absolute cursor-pointer top-1/2 -translate-y-1/2 translate-x-14 text-white hover:text-yellow-300 2xl:right-0 xl:right-10 lg:right-15 z-10">
              <ChevronRight className="w-12 h-12" />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {displayedComing.map((movie) => (
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
          {show && trailerId && <TrailerModal show={show} trailerId={trailerId} onClose={closeModal} />}
          <div className="flex justify-center gap-4 mt-4 md:mt-8">
            <button onClick={prevPageComing} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="flex gap-3 items-center">
              {Array.from({ length: totalPagesComing }, (_, i) => (
                <button key={i} onClick={() => setCurrentPageComing(i)}
                  className={`w-3 h-3 rounded-full transition ${i === currentPageComing ? "bg-yellow-400" : "bg-white/50"}`}
                />
              ))}
            </div>
            <button onClick={nextPageComing} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
          <div className="text-center mt-4 md:mt-8">
            <Link to="/movies/upcoming">
              <Button variant="transparentToYellowOrange" className="h-10 px-20">
                <span className="font-anton uppercase text-base">Xem thêm</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Tin tức & sự kiện */}
        <section>
          <h2 className="text-center text-2xl md:text-4xl font-anton text-white mb-8 md:mb-12 uppercase">
            Tin tức & sự kiện
          </h2>

          <div className="relative">
            <button
              onClick={prevPageNews}
              className="hidden lg:block cursor-pointer absolute top-1/2 -translate-y-1/2 -translate-x-14 text-white hover:text-yellow-300 2xl:left-0 xl:left-10 lg:left-15 z-10"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button
              onClick={nextPageNews}
              className="hidden lg:block cursor-pointer absolute top-1/2 -translate-y-1/2 translate-x-14 text-white hover:text-yellow-300 2xl:right-0 xl:right-10 lg:right-15 z-10"
            >
              <ChevronRight className="w-12 h-12" />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {displayedNews.map((item) => (
                <Link key={item.maTinTuc} to={`/news/${item.slug}`} className="overflow-hidden rounded shadow-2xl">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black">
                    <img
                      src={item.anhDaiDien}
                      alt={item.tieuDe}
                      className="w-full h-64 md:h-80 lg:h-full border border-white/20 hover:border-yellow-300 object-cover transition-transform duration-300"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pagination  */}
          <div className="flex justify-center gap-4 mt-4 md:mt-8">
            <button onClick={prevPageNews} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="flex gap-3 items-center">
              {Array.from({ length: totalPagesNews }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPageNews(i)}
                  className={`w-3 h-3 rounded-full transition ${i === currentPageNews ? "bg-yellow-400" : "bg-white/50"}`}
                />
              ))}
            </div>
            <button onClick={nextPageNews} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          <div className="text-center mt-4 md:mt-8">
            <Link to="/news">
              <Button variant="transparentToYellowOrange" className="h-10 px-20">
                <span className="font-anton uppercase text-base">Xem thêm</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <ChatbotWidget />
    </UserLayout>
  )
}