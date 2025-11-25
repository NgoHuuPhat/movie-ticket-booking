import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import AuthPage from "@/pages/AuthPage"
import HomePage from "@/pages/HomePage"
import MovieShowing from "@/pages/MovieShowing"
import MovieUpcoming from "@/pages/MovieUpcoming"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import VerifyOTPPage from "@/pages/VerifyOTPPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import PublicOnlyRoute from "@/components/auth/PublicOnlyRoute"
import useAuthStore from "@/stores/useAuthStore"
import { BeatLoader } from "react-spinners"
import { Toaster } from "sonner"

function App(){
  const { user, fetchMe, isCheckingAuth } = useAuthStore()
  
  useEffect(() => {
    if(!user){
      fetchMe()
    }
  }, [user, fetchMe])
  
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
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/showing" element={<MovieShowing />} />
          <Route path="/movie/upcoming" element={<MovieUpcoming />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </>
  )
}

export default App
