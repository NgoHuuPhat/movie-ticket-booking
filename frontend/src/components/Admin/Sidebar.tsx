import { NavLink, useLocation } from 'react-router-dom'
import { Home, Settings, Users, X, Popcorn, Ticket, Film, ChevronDown, MapPin, Armchair, Calendar } from 'lucide-react'
import logo from "@/assets/logo.png"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const sidebarItems = [
    { icon: Home, label: 'Tổng quan', path: '/admin/dashboard' },
    
    { 
      icon: Film, label: 'Quản lý phim', 
      children: [
        { label: 'Thể loại phim', path: '/admin/movies/genres' },
        { label: 'Phân loại độ tuổi', path: '/admin/movies/age-ratings' },
        { label: 'Danh sách phim', path: '/admin/movies' },
      ]
    },
    
    { 
      icon: MapPin, label: 'Hệ thống rạp', 
      children: [
        { label: 'Thông tin rạp chiếu', path: '/admin/cinema' },
        { label: 'Loại phòng chiếu', path: '/admin/cinema/room-types' },
        { label: 'Danh sách phòng chiếu', path: '/admin/cinema/rooms' },
      ]
    },
    
    {
      icon: Armchair, 
      label: 'Quản lý ghế',
      children: [
        { label: 'Loại ghế', path: '/admin/seats/types' },
        { label: 'Giá ghế theo loại phòng', path: '/admin/seats/prices' },
      ]
    },
    { icon: Calendar, label: 'Quản lý suất chiếu', path: '/admin/showtimes' },
    { icon: Ticket, label: 'Đơn đặt vé', path: '/admin/orders' },
    { icon: Users, label: 'Khách hàng', path: '/admin/customers' },
    { icon: Popcorn, label: 'Combo đồ ăn', path: '/admin/foods-combos' },
    { icon: Settings, label: 'Cài đặt hệ thống', path: '/admin/settings' },
  ]

  useEffect(() => {
    const currentDropdown = sidebarItems.find(item => 
      item.children?.some(child => child.path === location.pathname)
    )
    if (currentDropdown) {
      setOpenDropdown(currentDropdown.label)
    }
  }, [location.pathname])

  const handleToggle = (label: string) => {
    setOpenDropdown(prev => prev === label ? null : label)
  }

  return (
    <>
      <div 
        className={`fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <aside className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-16 items-center justify-between lg:justify-center px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-10 h-10 relative z-10 transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 ease-out"/>
            <span className="font-bold text-xl text-gray-800">Cinema Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden hover:bg-gray-100 transition-colors" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            if (item.children) {
              const isOpenDropdown = openDropdown === item.label
              return (
                <div key={index}>
                  <button onClick={() => handleToggle(item.label)} className="flex items-center cursor-pointer w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm">
                    <item.icon className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                    <span className="flex-1 font-medium text-left">{item.label}</span>
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isOpenDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpenDropdown && (
                    <div className="ml-6 space-y-1 mt-1">
                      {item.children.map((child, childIndex) => (
                        <NavLink 
                          key={childIndex} 
                          to={child.path} 
                          end
                          className={({ isActive }) => `flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group ${
                            isActive 
                              ? 'bg-gradient-to-r from-purple-50 to-purple-50/50 text-purple-600 shadow-sm border border-purple-200/80' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                          }`}
                          onClick={onClose}
                        >
                          <span className="flex-1">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink 
                key={index} 
                to={item.path}
                className={({ isActive }) => `flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-50 to-purple-50/50 text-purple-400 shadow-sm border border-purple-100/80' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    <span className="flex-1 font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Card className="rounded-xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 border border-blue-100/50 shadow-none gap-1">
            <div className="flex items-center">
              <h4 className="font-semibold text-sm text-gray-800">Need help?</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Check our documentation for guides and tutorials
            </p>
            <Button size="sm" className="w-full">View Docs</Button>
          </Card>
        </div>
      </aside>
    </>
  )
}

export default Sidebar