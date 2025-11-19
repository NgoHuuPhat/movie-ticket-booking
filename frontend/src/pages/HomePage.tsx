import { useEffect, useState } from 'react';
import { Calendar, Tag, ChevronRight, ChevronLeft, Phone, Mail, MapPin, Clock, Star, User, Play, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserLayout from '@/components/layout/UserLayout';

export default function MovieBookingHomepage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const bannerSlides = [
    { id: 1, title: 'KHÁM PHÁ TRẢI NGHIỆM ĐỈNH CAO', subtitle: 'Hệ thống âm thanh Dolby Atmos & màn hình 4K', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=800&fit=crop', cta: 'Đặt vé ngay' },
    { id: 2, title: 'GIẢM 50% MỌI SUẤT CHIẾU THỨ 3', subtitle: 'Áp dụng cho tất cả các phim đang chiếu', image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=1920&h=800&fit=crop', cta: 'Xem chi tiết' },
    { id: 3, title: 'COMBO BẮP NƯỚC ƯU ĐÃI', subtitle: 'Mua 1 tặng 1 - Chỉ hôm nay', image: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=1920&h=800&fit=crop', cta: 'Khám phá ngay' },
  ];

  const nowShowingMovies = [
    { id: 1, title: 'Núi Tế Vong', age: 'T18', rating: 8.7, duration: '128 phút', image: 'https://i.imgur.com/5z3mXKp.jpeg' },
    { id: 2, title: 'Truy Tìm Long Điền Hương', age: 'T16', rating: 8.9, duration: '135 phút', image: 'https://i.imgur.com/9kL2mNp.jpeg' },
    { id: 3, title: 'Không Bóng Tuyết Nào Trong Sạch', age: 'T16', rating: 8.5, duration: '132 phút', image: 'https://i.imgur.com/fG7kPqL.jpeg' },
    { id: 4, title: 'Tình Người Duyên Ma 2025', age: 'T13', rating: 9.1, duration: '125 phút', image: 'https://i.imgur.com/rT9vY8d.jpeg' },
    { id: 5, title: 'Lật Mặt 8', age: 'T18', rating: 8.8, duration: '138 phút', image: 'https://i.imgur.com/xY3vLmK.jpeg' },
    { id: 6, title: 'Gái Già Lắm Drama', age: 'T16', rating: 8.4, duration: '115 phút', image: 'https://i.imgur.com/mN7pQvR.jpeg' },
    { id: 7, title: 'Deadpool & Wolverine', age: 'T18', rating: 9.3, duration: '127 phút', image: 'https://i.imgur.com/Zp8kL9s.jpeg' },
    { id: 8, title: 'Venom: The Last Dance', age: 'T16', rating: 8.6, duration: '130 phút', image: 'https://i.imgur.com/kL9mXvP.jpeg' },
    { id: 9, title: 'Mufasa: The Lion King', age: 'T13', rating: 9.0, duration: '119 phút', image: 'https://i.imgur.com/wQ2xLmN.jpeg' },
    { id: 10, title: 'Gladiator II', age: 'T18', rating: 9.2, duration: '148 phút', image: 'https://i.imgur.com/pR5vY7t.jpeg' },
    { id: 11, title: 'Wicked', age: 'T13', rating: 8.8, duration: '140 phút', image: 'https://i.imgur.com/nF6gH9j.jpeg' },
    { id: 12, title: 'Inside Out 2', age: 'K', rating: 8.9, duration: '96 phút', image: 'https://i.imgur.com/qW3xZmL.jpeg' },
  ];

  const promotions = [
    { id: 1, title: 'Thứ 3 Vui Vẻ', description: 'Giảm 50% cho tất cả suất chiếu vào Thứ 3', code: 'TUE50', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { id: 2, title: 'Combo Bắp Nước', description: 'Mua 1 tặng 1 combo bắp nước size L', code: 'COMBO11', icon: Tag, color: 'from-orange-500 to-red-500' },
    { id: 3, title: 'Học Sinh - Sinh Viên', description: 'Giảm 30% khi xuất trình thẻ học sinh/sinh viên', code: 'STUDENT30', icon: User, color: 'from-blue-500 to-cyan-500' }
  ];

  // Auto slide
  useEffect(() => {
    const id = setInterval(() => setActiveSlide(prev => (prev + 1) % bannerSlides.length), 5000);
    return () => clearInterval(id);
  }, []);

  // Pagination for now showing movies
  const moviesPerPage = 4;
  const totalPages = Math.ceil(nowShowingMovies.length / moviesPerPage);
  const displayedMovies = nowShowingMovies.slice(currentPage * moviesPerPage, (currentPage + 1) * moviesPerPage);

  const nextPage = () => setCurrentPage(p => p === totalPages - 1 ? 0 : p + 1);
  const prevPage = () => setCurrentPage(p => p === 0 ? totalPages - 1 : p - 1);

  const nextSlide = () => setActiveSlide(p => (p + 1) % bannerSlides.length);
  const prevSlide = () => setActiveSlide(p => p === 0 ? bannerSlides.length - 1 : p - 1);

  return (
    <UserLayout>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-pink-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-blue-500/40 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      </div>

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
        <section className="mb-25">
          <h2 className="text-center text-4xl sm:text-4xl font-anton text-white mb-12 uppercase tracking-wider">
            Phim đang chiếu
          </h2>
          
          <div className="relative">
            <button onClick={prevPage} className="hidden lg:block absolute top-1/2 -translate-y-1/2 -translate-x-14 text-white hover:text-yellow-300 2xl:left-0 xl:left-10 lg:left-15 z-10">
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button onClick={nextPage} className="hidden lg:block absolute top-1/2 -translate-y-1/2 translate-x-14 text-white hover:text-yellow-300 2xl:right-0 xl:right-10 lg:right-15 z-10">
              <ChevronRight className="w-12 h-12" />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {displayedMovies.map(movie => (
                <div key={movie.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded shadow-2xl border border-white/20">
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-anton px-3 py-1 rounded text-sm z-10">{movie.age}</div>
                    <div className="absolute top-3 right-3 bg-black/80 text-yellow-400 font-anton px-3 py-1 rounded flex items-center gap-1 text-sm z-10">
                      <Star className="w-4 h-4 fill-current" /> {movie.rating}
                    </div>
                    <img src={movie.image} alt={movie.title} className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                      <h3 className="text-lg font-anton text-white uppercase line-clamp-2">{movie.title}</h3>
                      <p className="flex items-center gap-2 text-white/80 text-sm mt-1"><Clock className="w-4 h-4" /> {movie.duration}</p>
                      <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                        <button className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                          <Play className="w-5 h-5" /> Trailer
                        </button>
                        <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-anton py-2.5 px-4 rounded-lg text-sm uppercase">
                          Đặt vé
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination mobile */}
          <div className="flex flex-col items-center gap-8 mt-10">
            <div className="flex items-center gap-4">
              <button onClick={prevPage} className="lg:hidden bg-black/70 hover:bg-yellow-500 text-white p-3 rounded-full shadow-lg transition">
                <ChevronLeft className="w-7 h-7" />
              </button>
              <div className="flex gap-3">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)}
                    className={`transition-all ${i === currentPage ? 'bg-yellow-400 w-3 h-3 rounded-full' : 'bg-white/50 hover:bg-white/80 w-3 h-3 rounded-full'}`}
                  />
                ))}
              </div>
              <button onClick={nextPage} className="lg:hidden bg-black/70 hover:bg-yellow-500 text-white p-3 rounded-full shadow-lg transition">
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            <Button variant="transparentToYellowOrange" className="w-66 h-12">
              <span className="font-anton uppercase">Xem thêm</span> 
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
              const Icon = promo.icon;
              return (
                <div key={promo.id} className={`bg-gradient-to-br ${promo.color} rounded p-8 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white/20 p-4 rounded-2xl"><Icon className="w-10 h-10 text-white" /></div>
                    <h3 className="text-2xl font-anton text-white uppercase">{promo.title}</h3>
                  </div>
                  <p className="text-white/90 text-lg mb-6">{promo.description}</p>
                  <div className="bg-black/40 rounded-xl px-5 py-3 inline-block">
                    <span className="text-yellow-300 font-mono text-xl font-anton">Mã: {promo.code}</span>
                  </div>
                </div>
              );
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
                <input type="text" placeholder="Họ và tên" className="w-full px-5 py-4 rounded-xl bg-white text-black focus:ring-4 focus:ring-yellow-400 outline-none" />
                <input type="email" placeholder="Email" className="w-full px-5 py-4 rounded-xl bg-white text-black focus:ring-4 focus:ring-yellow-400 outline-none" />
                <textarea rows={4} placeholder="Nội dung phản ánh" className="w-full px-5 py-4 rounded-xl bg-white text-black focus:ring-4 focus:ring-yellow-400 outline-none resize-none"></textarea>
                <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-anton py-4 rounded-xl uppercase transition flex items-center justify-center gap-3">
                  <Mail className="w-6 h-6" /> Gửi ngay
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}