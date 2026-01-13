import { MapPin, Phone, Mail, Clock, Film, Sparkles, Armchair, Monitor } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import useInfoCinema from "@/hooks/useInfoCinema"

export default function AboutPage() {
  const { cinemaInfo } = useInfoCinema()
  
  return (
    <UserLayout>
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <section className="relative text-center mb-20 mt-10">
          <h2 className="text-center text-2xl md:text-4xl font-anton text-white mb-6 uppercase">
            Về Chúng Tôi
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-300 to-orange-400 mx-auto mt-8"></div>
        </section>

        {/* Main Story Section */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-anton text-white mb-8 uppercase tracking-wider leading-tight">
                Trải nghiệm điện ảnh<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                  Đẳng cấp quốc tế
                </span>
              </h2>
              <div className="space-y-6 text-white/90 text-lg leading-relaxed">
                <p>
                  Chào mừng bạn đến với Rạp chiếu phim Lê Độ - địa điểm giải trí hàng đầu tại thành phố Đà Nẵng. 
                  Với thiết kế hiện đại, sang trọng và đẳng cấp, chúng tôi tự hào mang đến cho khán giả những 
                  trải nghiệm điện ảnh tuyệt vời nhất.
                </p>
                <p>
                  Từng chi tiết trong rạp đều được chăm chút tỉ mỉ, từ hệ thống âm thanh Dolby Atmos vòm 360 độ 
                  cho đến màn hình chiếu 4K sắc nét. Mỗi thước phim đều trở nên sống động, chân thực như đưa 
                  bạn bước vào chính thế giới của câu chuyện.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative group">
                <div className="aspect-[4/3] rounded overflow-hidden shadow-2xl border-2 border-yellow-400/20">
                  <img 
                    src="http://nld.mediacdn.vn/2020/1/29/6f3645270d0ff551ac1e-158027209388076201787.jpg" 
                    alt="Rạp chiếu phim Lê Độ" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent rounded"></div>
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-gradient-to-br from-yellow-300/30 to-orange-400/30 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <h2 className="text-2xl md:text-4xl font-anton text-white text-center mb-16 uppercase tracking-wider">
            Điểm nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/20 hover:to-blue-600/20 transition duration-300">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-anton text-white mb-3 uppercase">Màn hình 4K</h3>
              <p className="text-white/80 leading-relaxed">
                Công nghệ hiển thị 4K Ultra HD mang đến hình ảnh sắc nét, màu sắc sống động chân thực
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/20 hover:to-blue-600/20 transition duration-300">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-anton text-white mb-3 uppercase">Dolby Atmos</h3>
              <p className="text-white/80 leading-relaxed">
                Hệ thống âm thanh vòm 360 độ đỉnh cao, mang đến trải nghiệm nghe nhìn hoàn hảo
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/20 hover:to-blue-600/20 transition duration-300">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <Armchair className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-anton text-white mb-3 uppercase">Ghế VIP</h3>
              <p className="text-white/80 leading-relaxed">
                Ghế ngồi cao cấp, êm ái với khả năng ngả thoải mái cho trải nghiệm tối ưu
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/20 hover:to-blue-600/20 transition duration-300">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <Film className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-anton text-white mb-3 uppercase">Phim mới</h3>
              <p className="text-white/80 leading-relaxed">
                Cập nhật liên tục các bộ phim bom tấn, blockbuster mới nhất từ khắp thế giới
              </p>
            </div>
          </div>
        </section>

        {/* Story Continue Section */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative group">
                <div className="aspect-[4/3] rounded overflow-hidden shadow-2xl border-2 border-yellow-400/20">
                  <img 
                    src="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=900&h=700&fit=crop" 
                    alt="Không gian rạp chiếu phim" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent rounded"></div>
                <div className="absolute -top-8 -left-8 w-64 h-64 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-anton text-white mb-8 uppercase tracking-wider leading-tight">
                Không gian sang trọng
              </h2>
              <div className="space-y-6 text-white/90 text-lg leading-relaxed">
                <p>
                  Không gian rạp được thiết kế theo phong cách hiện đại, kết hợp giữa sự sang trọng và 
                  thoải mái. Hệ thống chiếu sáng được điều chỉnh tinh tế, tạo nên bầu không khí lý tưởng 
                  để thưởng thức phim.
                </p>
                <p>
                  Khu vực sảnh chờ rộng rãi, thoáng mát với quầy bán đồ ăn nhẹ đa dạng. Từ bắp rang bơ 
                  thơm lừng, nước giải khát mát lạnh đến các món ăn vặt hấp dẫn, đáp ứng mọi nhu cầu 
                  của khán giả.
                </p>
                <p>
                  Đội ngũ nhân viên của chúng tôi được đào tạo chuyên nghiệp, luôn sẵn sàng phục vụ với 
                  thái độ nhiệt tình, chu đáo. Mỗi chi tiết nhỏ đều được chăm sóc để mang đến cho bạn 
                  trải nghiệm hoàn hảo nhất.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="mb-24">
          <h2 className="text-2xl md:text-4xl font-anton text-white text-center mb-16 uppercase tracking-wider">
            Hình ảnh rạp
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded aspect-video border-2 border-white/10 hover:border-yellow-400/50 transition duration-300">
              <img 
                src="https://bqn.1cdn.vn/2025/06/10/baodanang.vn-dataimages-202506-original-_images1780312_phim2.jpg" 
                alt="Gallery 1" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="relative group overflow-hidden rounded aspect-video border-2 border-white/10 hover:border-yellow-400/50 transition duration-300">
              <img 
                src="http://nld.mediacdn.vn/2020/1/29/aa104052087af024a96b-1580271919320763524641.jpg" 
                alt="Gallery 2" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="relative group overflow-hidden rounded aspect-video border-2 border-white/10 hover:border-yellow-400/50 transition duration-300">
              <img 
                src="https://cdn.nhandan.vn/images/85fc3722efdb205e3aa276f0c26aba658e8333725ed875c288215b37216ae12a3a1549f9e5b62620c32bf06aeb98655b916c59155e9d2a01be61f6ea02b8af51/a1-6637.jpg" 
                alt="Gallery 3" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Location & Contact Section */}
        <section className="mb-24">
          <h2 className="text-2xl md:text-4xl font-anton text-white text-center mb-16 uppercase tracking-wider">
            Thông tin liên hệ
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Map */}
            <div className="relative group">
              <div className="rounded overflow-hidden shadow-2xl border-2 border-yellow-400/20 w-full h-full">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9999999999995!2d108.2177778!3d16.0544444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c2b64e51c9%3A0x8c8b3b3b3b3b3b3b!2s46%20Tr%E1%BA%A7n%20Ph%C3%BA%2C%20H%E1%BA%A3i%20Ch%C3%A2u%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  title="Vị trí Rạp chiếu phim Lê Độ"
                ></iframe>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl -z-10"></div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="group bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/30 hover:to-blue-600/30 transition duration-300">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded flex-shrink-0 group-hover:scale-110 transition duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-anton text-white mb-3 uppercase">Địa chỉ</h4>
                    <p className="text-white/90 text-lg leading-relaxed">
                      {cinemaInfo ? cinemaInfo.diaChi : "Đang tải địa chỉ..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/30 hover:to-blue-600/30 transition duration-300">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded flex-shrink-0 group-hover:scale-110 transition duration-300">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-anton text-white mb-3 uppercase">Hotline</h4>
                    <p className="text-white/90 text-lg">{cinemaInfo ? cinemaInfo.soDienThoai : "Đang tải số điện thoại..."}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/30 hover:to-blue-600/30 transition duration-300">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded flex-shrink-0 group-hover:scale-110 transition duration-300">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-anton text-white mb-3 uppercase">Email</h4>
                    <p className="text-white/90 text-lg">{cinemaInfo ? cinemaInfo.email : "Đang tải email..."}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded p-8 border border-white/10 hover:border-yellow-400/50 hover:from-purple-600/30 hover:to-blue-600/30 transition duration-300">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded flex-shrink-0 group-hover:scale-110 transition duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-anton text-white mb-3 uppercase">Giờ mở cửa</h4>
                    <p className="text-white/90 text-lg">8:00 - 23:00</p>
                    <p className="text-white/70 text-sm mt-1">Tất cả các ngày trong tuần</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-20">
          <div className="relative bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-purple-600/30 backdrop-blur-sm rounded p-16 border border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="relative text-center">
              <h2 className="text-2xl md:text-4xl font-anton text-white mb-6 uppercase tracking-wider">
                Sẵn sàng cho trải nghiệm điện ảnh tuyệt vời?
              </h2>
              <p className="text-lg mb-8 text-white/80  mx-auto leading-relaxed">
                Đặt vé ngay hôm nay và khám phá thế giới điện ảnh đầy màu sắc tại Rạp chiếu phim Lê Độ
              </p>
              <Button variant="yellowToPinkPurple" className="font-anton text-xl w-70 h-12">
                <Link to="/movies/showing">
                  Đặt vé ngay
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  )
}