import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "@/pages/AuthPage"
import HomePage from "@/pages/HomePage"
import { Toaster } from "sonner"
import useAuthStore from "@/stores/useAuthStore"
import { BeatLoader } from "react-spinners"

function App(){
  const { fetchMe, isCheckingAuth, user } = useAuthStore()

  useEffect(() => {
    fetchMe()
  }, [])

  if (isCheckingAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-gray-900 via-purple-500 to-gray-900">
      <BeatLoader />
      <p className="mt-4 text-white text-lg animate-pulse">Đang tải dữ liệu...</p>
    </div>
  )

  return (
    <>
      <Toaster position="top-center" richColors/>
      <Routes>
        <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/register" element={<AuthPage />} />

        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />

      </Routes>
    </>
  )
}

export default App
