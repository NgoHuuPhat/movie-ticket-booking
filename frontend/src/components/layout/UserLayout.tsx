import React from "react"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import AlertModal from "@/components/common/AlertModal"

const UserLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
        <main className="flex-1 mt-20">
          <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute top-1/4 -right-40 w-96 h-96 bg-pink-500 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-blue-500/40 rounded-full opacity-30 blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-10 2xl:px-0">
            {children}
          </div>
        </main>
      <Footer />
      <AlertModal />
    </div>
  )
}

export default UserLayout