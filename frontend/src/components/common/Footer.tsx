import { useEffect, useState } from "react"
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail } from "lucide-react"
import logo from "@/assets/logo.png"
import { handleError } from "@/utils/handleError.utils"
import { getCinemaInfo } from "@/services/api"

interface CinemaInfo {
  tenRap: string
  diaChi: string
  soDienThoai: string
  email: string
}

const Footer = () => {
  const [ cinemaInfo, setCinemaInfo ] = useState<CinemaInfo | null>(null)

  useEffect(() => {
    try {
      const fetchCinemaInfo = async () => {
        const cinemaInfo = await getCinemaInfo()
        setCinemaInfo(cinemaInfo)
      }
      fetchCinemaInfo()
    } catch (error) {
      console.error(handleError(error))
    }
  }, [])

  return (
    <div>
      <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-10 2xl:px-0 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="relative">
                  <div className="absolute group-hover:opacity-90 transition-all duration-500"></div>
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-10 h-10 relative z-10 transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </div>
                <h3 className="text-2xl font-sans font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-gray-800">
                  LÊ ĐỘ
                </h3>
              </div>
              <p className="text-gray-300 text-base leading-loose">
                Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam. Trải nghiệm giải trí đỉnh cao với công nghệ hiện đại.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Liên kết nhanh</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Điều khoản sử dụng
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Câu hỏi thường gặp
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Tin tức
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Hướng dẫn đặt vé
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Phương thức thanh toán
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Quy định đổi/trả vé
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Chương trình thành viên
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Thông tin liên hệ</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{cinemaInfo?.diaChi}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <a href={`tel:${cinemaInfo?.soDienThoai}`} className="text-sm hover:text-yellow-300 transition-colors">
                    {cinemaInfo?.soDienThoai}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <a href={`mailto:${cinemaInfo?.email}`} className="text-sm hover:text-yellow-300 transition-colors">
                    {cinemaInfo?.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-8 border-t border-white/10">
            <p className="text-sm text-center text-gray-400">
              © 2025 LEDO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer