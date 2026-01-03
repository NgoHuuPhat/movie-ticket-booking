import React, { useState } from "react"
import Header from "@/components/Staff/Header"
import Sidebar from "@/components/Staff/Sidebar"
import AlertModal from "../common/AlertModal"

const StaffLayout = ({children}: {children: React.ReactNode}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:ml-64">
          {children}
        </main>
      </div>
      <AlertModal />
    </div>
  )
}

export default StaffLayout