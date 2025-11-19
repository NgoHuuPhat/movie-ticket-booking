import React from "react"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"

const UserLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
        <main className="flex-1 mt-30">
          {children}
        </main>
      <Footer />
    </div>
  )
}

export default UserLayout