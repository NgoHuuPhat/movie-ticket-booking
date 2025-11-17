import React, { useState } from "react"
import { Search, CircleUser, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import logo from "@/assets/logo.png"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white backdrop-blur-lg border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl blur-md opacity-0 group-hover:opacity-90 transition-all duration-500"></div>
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 relative z-10 transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 ease-out"
              />
            </div>

            <div className="transition-all duration-500">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-gray-900">
                LÊ ĐỘ
              </h1>
              <p className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
                Đặt vé xem phim
              </p>
            </div>
          </div>


          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="hover:text-yellow-300 font-medium transition-colors">Trang chủ</a>
            <a href="#" className="hover:text-yellow-300 font-medium transition-colors">Phim đang chiếu</a>
            <a href="#" className="hover:text-yellow-300 font-medium transition-colors">Phim sắp chiếu</a>
            <a href="#" className="hover:text-yellow-300 font-medium transition-colors">Khuyến mãi</a>
            <a href="#" className="hover:text-yellow-300 font-medium transition-colors">Giới thiệu</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center relative group">
              <Search className="absolute left-3 w-5 h-5 text-gray-600" />
              <Input
                type="text"
                placeholder="Tìm phim, rạp..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white text-gray-900"
              />
            </div>

            <a href="#" className="hidden md:flex items-center gap-2 px-4 py-2 group">
              <CircleUser className="w-6 h-6 group-hover:text-yellow-300" />
              <span className="font-medium group-hover:text-yellow-300">Đăng nhập</span>
            </a>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 space-y-3 animate-in slide-in-from-top">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Tìm phim, rạp..." className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-lg" />
            </div>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">Trang chủ</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">Phim đang chiếu</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">Phim sắp chiếu</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">Rạp chiếu</a>
            <a href="#" className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">Khuyến mãi</a>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              <CircleUser className="w-5 h-5 mr-2" />
              Đăng nhập
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
