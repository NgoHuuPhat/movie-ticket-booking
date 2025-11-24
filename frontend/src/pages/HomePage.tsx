import { useEffect, useState } from 'react'
import { Calendar, Tag, ChevronRight, ChevronLeft, Phone, Mail, MapPin, Clock, User, Play, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserLayout from '@/components/layout/UserLayout'
import { listPhim } from '@/services/api'
import type { IPhim } from '@/types/phim'

export default function Homepage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [currentPageNow, setCurrentPageNow] = useState(0)
  const [currentPageComing, setCurrentPageComing] = useState(0)
  const [phimDangChieu, setPhimDangChieu] = useState<IPhim[]>([])
  const [phimSapChieu, setPhimSapChieu] = useState<IPhim[]>([])

  const bannerSlides = [
    { id: 1, title: 'KHÁM PHÁ TRẢI NGHIỆM ĐỈNH CAO', subtitle: 'Hệ thống âm thanh Dolby Atmos & màn hình 4K', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=800&fit=crop', cta: 'Đặt vé ngay' },
    { id: 2, title: 'GIẢM 50% MỌI SUẤT CHIẾU THỨ 3', subtitle: 'Áp dụng cho tất cả các phim đang chiếu', image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=1920&h=800&fit=crop', cta: 'Xem chi tiết' },
    { id: 3, title: 'COMBO BẮP NƯỚC ƯU ĐÃI', subtitle: 'Mua 1 tặng 1 - Chỉ hôm nay', image: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=1920&h=800&fit=crop', cta: 'Khám phá ngay' },
  ]

  const promotions = [
    { id: 1, title: 'Thứ 3 Vui Vẻ', description: 'Giảm 50% cho tất cả suất chiếu vào Thứ 3', code: 'TUE50', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { id: 2, title: 'Combo Bắp Nước', description: 'Mua 1 tặng 1 combo bắp nước size L', code: 'COMBO11', icon: Tag, color: 'from-orange-500 to-red-500' },
    { id: 3, title: 'Học Sinh - Sinh Viên', description: 'Giảm 30% khi xuất trình thẻ học sinh/sinh viên', code: 'STUDENT30', icon: User, color: 'from-blue-500 to-cyan-500' }
  ]

  useEffect(() => {
    const fetchPhim = async () => {
      try {
        const data = await listPhim()
        setPhimDangChieu(data.phimDangChieu || [])
        setPhimSapChieu(data.phimSapChieu || [])
      } catch (err: unknown) {
        console.error('Error fetching movies:', err)
      }
    }
    fetchPhim()
  }, [])
  const moviesPerPage = 4

  const displayedNow = phimDangChieu.slice(currentPageNow * moviesPerPage, (currentPageNow + 1) * moviesPerPage)
  const displayedComing = phimSapChieu.slice(currentPageComing * moviesPerPage, (currentPageComing + 1) * moviesPerPage)

  const totalPagesNow = Math.ceil(phimDangChieu.length / moviesPerPage)
  const totalPagesComing = Math.ceil(phimSapChieu.length / moviesPerPage)

  const nextPageNow = () => setCurrentPageNow(p => p === totalPagesNow - 1 ? 0 : p + 1)
  const prevPageNow = () => setCurrentPageNow(p => p === 0 ? totalPagesNow - 1 : p - 1)
  const nextPageComing = () => setCurrentPageComing(p => p === totalPagesComing - 1 ? 0 : p + 1)
  const prevPageComing = () => setCurrentPageComing(p => p === 0 ? totalPagesComing - 1 : p - 1)

  const nextSlide = () => setActiveSlide(p => (p + 1) % bannerSlides.length)
  const prevSlide = () => setActiveSlide(p => p === 0 ? bannerSlides.length - 1 : p - 1)

  // Auto slide
  useEffect(() => {
    const id = setInterval(() => setActiveSlide(prev => (prev + 1) % bannerSlides.length), 5000)
    return () => clearInterval(id)
  }, [])

  console.log({ phimDangChieu, phimSapChieu })

  return (
    <UserLayout>
      <div className="mx-auto px-4 max-w-7xl">
        {/* Banner slideshow */}
        <section className="relative mb-25">
          <button
            onClick={prevSlide}
            className="hidden lg:block absolute top-1/2 -translate-y-1/2 -translate-x-14 text-white hover:text-yellow-300 2xl:left-0 xl:left-10 lg:left-15 z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden lg:block absolute top-1/2 -translate-y-1/2 translate-x-14 text-white hover:text-yellow-300 2xl:right-0 xl:right-10 lg:right-15 z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div className="relative h-96 sm:h-80 lg:h-96 rounded overflow-hidden shadow-2xl ">
            {bannerSlides.map((slide, i) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  i === activeSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-anton text-white uppercase mb-4 tracking-tight drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl text-yellow-300 font-semibold mb-8 drop-shadow-lg">
                    {slide.subtitle}
                  </p>
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-anton py-4 px-10 rounded-full text-lg uppercase transition-all hover:scale-110 shadow-2xl flex items-center gap-3">
                    <Ticket className="w-7 h-7" />
                    {slide.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Movie is showing */}
        <section className="mb-20">
          <h2 className="text-center text-4xl font-anton text-white mb-12 uppercase tracking-wider">Phim đang chiếu</h2>

          <div className="relative">
            <button onClick={prevPageNow} className="hidden lg:block cursor-pointer absolute top-1/2 -translate-y-1/2 -translate-x-14 text-white hover:text-yellow-300 2xl:left-0 xl:left-10 lg:left-15 z-10">
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button onClick={nextPageNow} className="hidden lg:block cursor-pointer absolute top-1/2 -translate-y-1/2 translate-x-14 text-white hover:text-yellow-300 2xl:right-0 xl:right-10 lg:right-15 z-10">
              <ChevronRight className="w-12 h-12" />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {displayedNow.map((movie) => (
                <div className="group relative bg-black/40 rounded-xl overflow-hidden shadow-2xl border border-white/20 
                 flex flex-col h-full hover:border-yellow-400/60 transition-all duration-300">
                  <div className="relative aspect-[3/3] overflow-hidden bg-black">
                    {movie.anhBia ? (
                      <img
                        src={movie.anhBia}
                        alt={movie.tenPhim}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-104"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <p className="text-sm font-anton uppercase tracking-wider text-white/60">Poster coming soon</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-bold px-3 py-1.5 rounded text-xs shadow-lg">
                      {movie.doTuoiChoPhep || 'T18'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-xs lg:text-xl text-white uppercase mb-4">
                        {movie.tenPhim}
                      </h3>
                      {movie.theLoais && movie.theLoais.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {movie.theLoais.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded whitespace-nowrap"
                            >
                              {genre}
                            </span>
                          ))}
                          {movie.theLoais.length > 3 && (
                            <span className="text-xs text-white/50">+{movie.theLoais.length - 3}</span>
                          )}
                        </div>
                      )}
                      {movie.thoiLuong && (
                        <p className="flex items-center gap-2 text-white/70 text-sm mb-4">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          {movie.thoiLuong} phút
                        </p>
                      )}
                    </div>

                    <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                      <button className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition">
                        <Play className="w-5 h-5" />
                        <span className="hidden sm:inline">Trailer</span>
                      </button>

                      <Button
                        variant="yellowToPinkPurple"
                        className="flex-1 h-10 font-anton uppercase text-sm"
                      >
                        <span>Đặt vé</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination movie is showing mobile*/}
          <div className="flex justify-center gap-4 mt-12">
            <button onClick={prevPageNow} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="flex gap-3 items-center">
              {Array.from({ length: totalPagesNow }, (_, i) => (
                <button key={i} onClick={() => setCurrentPageNow(i)}
                  className={`w-3 h-3 rounded-full transition ${i === currentPageNow ? 'bg-yellow-400' : 'bg-white/50'}`}
                />
              ))}
            </div>
            <button onClick={nextPageNow} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          <div className="text-center mt-8">
            <Button variant="transparentToYellowOrange" className="h-10 px-20">
              <span className="font-anton uppercase text-base">Xem thêm</span>
            </Button>
          </div>
        </section>

        {/* Movie upcoming */}
        <section className="mb-20">
          <h2 className="text-center text-4xl font-anton text-white mb-12 uppercase tracking-wider">Phim sắp chiếu</h2>
          <div className="relative">
            <button onClick={prevPageComing} className="hidden lg:block absolute cursor-pointer top-1/2 -translate-y-1/2 -translate-x-14 text-white hover:text-yellow-300 2xl:left-0 xl:left-10 lg:left-15 z-10">
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button onClick={nextPageComing} className="hidden lg:block absolute cursor-pointer top-1/2 -translate-y-1/2 translate-x-14 text-white hover:text-yellow-300 2xl:right-0 xl:right-10 lg:right-15 z-10">
              <ChevronRight className="w-12 h-12" />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {displayedComing.map((movie) => (
                <div className="group relative bg-black/40 rounded-xl overflow-hidden shadow-2xl border border-white/20 
                 flex flex-col h-full hover:border-yellow-400/60 transition-all duration-300">
                  <div className="relative aspect-[3/3] overflow-hidden bg-black">
                    {movie.anhBia ? (
                      <img
                        src={movie.anhBia}
                        alt={movie.tenPhim}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-104"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <p className="text-sm font-anton uppercase tracking-wider text-white/60">Poster coming soon</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-bold px-3 py-1.5 rounded text-xs shadow-lg">
                      {movie.doTuoiChoPhep || 'T18'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-xs lg:text-xl text-white uppercase mb-4">
                        {movie.tenPhim}
                      </h3>
                      {movie.theLoais && movie.theLoais.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {movie.theLoais.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded whitespace-nowrap"
                            >
                              {genre}
                            </span>
                          ))}
                          {movie.theLoais.length > 3 && (
                            <span className="text-xs text-white/50">+{movie.theLoais.length - 3}</span>
                          )}
                        </div>
                      )}
                      {movie.thoiLuong && (
                        <p className="flex items-center gap-2 text-white/70 text-sm mb-4">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          {movie.thoiLuong} phút
                        </p>
                      )}
                    </div>

                    <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                      <button className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition">
                        <Play className="w-5 h-5" />
                        <span className="hidden sm:inline">Trailer</span>
                      </button>

                      <Button
                        variant="yellowToPinkPurple"
                        className="flex-1 h-10 font-anton uppercase text-sm"
                      >
                        <span>Đặt vé</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination movie coming is mobile*/}
          <div className="flex justify-center gap-4 mt-12">
            <button onClick={prevPageComing} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="flex gap-3 items-center">
              {Array.from({ length: totalPagesComing }, (_, i) => (
                <button key={i} onClick={() => setCurrentPageComing(i)}
                  className={`w-3 h-3 rounded-full transition ${i === currentPageComing ? 'bg-yellow-400' : 'bg-white/50'}`}
                />
              ))}
            </div>
            <button onClick={nextPageComing} className="md:hidden hover:bg-yellow-500 text-white p-3 rounded-full">
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
          <div className="text-center mt-8">
            <Button variant="transparentToYellowOrange" className="h-10 px-20">
              <span className="font-anton uppercase text-base">Xem thêm</span>
            </Button>
          </div>
        </section>

        {/* Promotions */}
        <section className="mt-25">
          <h2 className="text-center text-4xl sm:text-4xl font-anton text-white mb-12 uppercase">
            Khuyến mãi đặc biệt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promotions.map(promo => {
              const Icon = promo.icon
              return (
                <div key={promo.id} className={`bg-gradient-to-br ${promo.color} rounded p-8 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white/20 p-4 rounded-2xl"><Icon className="w-10 h-10 text-white" /></div>
                    <h3 className="text-2xl font-anton text-white uppercase">{promo.title}</h3>
                  </div>
                  <p className="text-white/90 text-lg mb-6">{promo.description}</p>
                  <div className="bg-black/40 rounded px-5 py-3 inline-block">
                    <span className="text-yellow-300 font-mono text-xl font-anton">Mã: {promo.code}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-40 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-4xl font-anton text-center text-white uppercase">Liên hệ với chúng tôi</h2>
              <a href="#" className="flex items-center gap-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded p-8 transition shadow-xl">
                <div className="bg-white/20 p-5 rounded-2xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <span className="text-2xl font-anton text-white uppercase">Facebook</span>
              </a>
              <a href="#" className="flex items-center gap-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded p-8 transition shadow-xl">
                <div className="bg-white/20 p-5 rounded-2xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                </div>
                <span className="text-2xl font-anton text-white uppercase">Zalo Chat</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-blue-600/90 to-purple-700/90 rounded p-8 shadow-2xl backdrop-blur">
              <h3 className="text-3xl font-anton text-white mb-8 uppercase">Gửi phản ánh cho chúng tôi</h3>
              <div className="space-y-4 text-white mb-8">
                <div className="flex items-center gap-3"><Mail className="w-5 h-5" /> cskh@cinestar.com.vn</div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5" /> 1900 0085</div>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5" /> 135 Hai Bà Trưng, Q.1, TP.HCM</div>
              </div>
              <form className="space-y-5">
                <input type="text" placeholder="Họ và tên" className="w-full px-5 py-4 rounded bg-white text-black focus:ring-4 focus:ring-yellow-400 outline-none" />
                <input type="email" placeholder="Email" className="w-full px-5 py-4 rounded bg-white text-black focus:ring-4 focus:ring-yellow-400 outline-none" />
                <textarea rows={4} placeholder="Nội dung phản ánh" className="w-full px-5 py-4 rounded bg-white text-black focus:ring-4 focus:ring-yellow-400 outline-none resize-none"></textarea>
                <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-anton py-4 rounded uppercase transition flex items-center justify-center gap-3">
                  <Mail className="w-6 h-6" /> Gửi ngay
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  )
}
