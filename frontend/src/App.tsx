import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import AuthPage from "@/pages/AuthPage"
import HomePage from "@/pages/HomePage"
import MovieShowing from "@/pages/MovieShowing"
import MovieUpcoming from "@/pages/MovieUpcoming"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import VerifyOTPPage from "@/pages/VerifyOTPPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import useAuthStore from "@/stores/useAuthStore"
import { BeatLoader } from "react-spinners"
import { Toaster } from "@/components/ui/sonner"
import MovieDetailPage from "./pages/MovieDetailPage"

function App(){
  const { user, fetchMe, isCheckingAuth } = useAuthStore()
  
  useEffect(() => {
    fetchMe()
  }, [fetchMe])
  
  if (isCheckingAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-gray-900 via-purple-500 to-gray-900">
      <BeatLoader />
      <p className="mt-4 text-white text-lg">Chờ xíu nhe...</p>
    </div>
  )

  return (
    <>
      <Toaster position="top-center" richColors/>
      <Routes>
          <Route path="/login" element={ user ? <HomePage /> : <AuthPage />} />
          <Route path="/register" element={ user ? <HomePage /> : <AuthPage />} />
          <Route path="/" element={ !user ? <AuthPage /> : <HomePage />} />
          <Route path="/movies/showing" element={ user ? <MovieShowing /> : <AuthPage />} />
          <Route path="/movies/upcoming" element={ user ? <MovieUpcoming /> : <AuthPage />} />
          <Route path="/movies/:slug" element={ user ? <MovieDetailPage /> : <AuthPage />} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
    </>
  )
}

export default App
