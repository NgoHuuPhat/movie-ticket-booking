import React, { useState } from "react"
import { Search, CircleUser, Menu, X, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import logo from "@/assets/logo.png"
import useAuthStore from "@/stores/useAuthStore"
import { Link, useNavigate } from "react-router-dom"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white backdrop-blur-lg border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 md:px-10 2xl:px-0">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-300/30 rounded-xl blur-md opacity-0 group-hover:opacity-90 transition-all duration-500"></div>
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 relative z-10 transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 ease-out"
              />
            </div>

            <Link to="/" className="group">
              <div className="transition-all duration-500">
                <h1 className="text-2xl font-sans font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-gray-900">
                  LÊ ĐỘ 
                </h1>
                <p className="text-xs font-sans text-white/70 group-hover:text-white/90 transition-colors">
                  Đặt vé xem phim
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="hover:text-yellow-300 font-medium transition-colors">Trang chủ</Link>
            <Link to="/movies/showing" className="hover:text-yellow-300 font-medium transition-colors">Phim đang chiếu</Link>
            <Link to="/movies/upcoming" className="hover:text-yellow-300 font-medium transition-colors">Phim sắp chiếu</Link>
            <Link to="/news" className="hover:text-yellow-300 font-medium transition-colors">Tin tức & Sự kiện</Link>
            <Link to="/about" className="hover:text-yellow-300 font-medium transition-colors">Giới thiệu</Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center relative group">
              <Input
                type="text"
                placeholder="Tìm kiếm phim theo tên..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleSearch(e)
                  }
                }}
                className="pl-4 pr-10 py-2 w-64 bg-white rounded-full placeholder:text-gray-400 text-gray-900"
              />
              <Search className="absolute right-3 w-4 h-4 text-gray-600" />
            </div>

            {/* User Info or Login */}
            {user ? (
              <div className="hidden md:block relative group">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer group transition-all"
                >
                  <CircleUser className="w-6 h-6 group-hover:text-yellow-300 transition-colors" />
                  <div className="text-left">
                    <p className="font-medium text-sm group-hover:text-yellow-300 transition-colors">
                      {user.hoTen || user.email}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 text-white w-56 bg-purple-900 rounded shadow-xl border border-gray-200 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:text-yellow-300 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Thông tin cá nhân</span>
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:text-yellow-300 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Cài đặt</span>
                    </a>
                  </div>

                  <div className="border-t border-gray-100">
                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:text-yellow-300 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <a href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 group">
                <CircleUser className="w-6 h-6 group-hover:text-yellow-300" />
                <span className="font-medium group-hover:text-yellow-300">Đăng nhập</span>
              </a>
            )}


            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 space-y-3 animate-in slide-in-from-top">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
              <Input type="text" placeholder="Tìm phim, rạp..." className="pl-10 pr-4 py-2 w-full bg-white text-black border-gray-200" />
            </div>

            {/* Mobile User Info */}
            {user && (
              <div className="mb-4 p-3 bg-white/10 rounded-lg flex gap-3 items-center">
                <a href="/profile">
                  <CircleUser className="w-6 h-6 group-hover:text-yellow-300 transition-colors" />
                </a>
                <span>{user.hoTen}</span>
              </div>
            )}

            <Link to="/" className="block py-2 active:text-yellow-300 font-medium transition-colors">Trang chủ</Link>
            <Link to="/movies/showing" className="block py-2 active:text-yellow-300 font-medium transition-colors">Phim đang chiếu</Link>
            <Link to="/movies/upcoming" className="block py-2 active:text-yellow-300 font-medium transition-colors">Phim sắp chiếu</Link>
            <Link to="/news" className="block py-2 active:text-yellow-300 font-medium transition-colors">Tin tức & Sự kiện</Link>
            <Link to="/about" className="block py-2 active:text-yellow-300 font-medium transition-colors">Giới thiệu</Link>
            {user ? (
              <Button 
                onClick={signOut}
                variant="yellowToPinkPurple" 
                className="w-full"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Đăng xuất</span>
              </Button>
            ) : (
              <Button variant="yellowToPinkPurple" className="w-full">
                <CircleUser className="w-5 h-5 mr-2" />
                <span>Đăng nhập</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header