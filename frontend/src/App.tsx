import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import useAuthStore from "@/stores/useAuthStore"
import { BeatLoader } from "react-spinners"
import { Toaster } from "@/components/ui/sonner"

import ProtectedRoute from "@/components/auth/ProtectedRoute"
import PublicOnlyRoute from "@/components/auth/PublicOnlyRoute"
import AdminRoute from "@/components/auth/AdminRoute"
import StaffRoute from "@/components/auth/StaffRoute"

import AuthPage from "@/pages/AuthPage"
import HomePage from "@/pages/HomePage"
import MovieShowing from "@/pages/MovieShowing"
import MovieUpcoming from "@/pages/MovieUpcoming"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import VerifyOTPPage from "@/pages/VerifyOTPPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import CheckoutPage from "@/pages/CheckoutPage"
import MovieDetailPage from "@/pages/MovieDetailPage"
import CheckoutResultPage from "@/pages/CheckoutResultPage"

import DashboardPage from "@/pages/Admin/DashboardPage"
import ManageMoviePage from "@/pages/Admin/ManageMoviePage"
import ManageGenresMoviePage from "@/pages/Admin/ManageGenresMoviePage"
import ManageAgeRatingsPage from "@/pages/Admin/ManageAgeRatingsPage"
import CinemaInfoPage from "@/pages/Admin/CinemaInfoPage"
import ManageRoomsPage from "@/pages/Admin/ManageRoomsPage" 
import ManageRoomTypePage from "@/pages/Admin/ManageRoomTypePage"
import ManageSeatTypesPage from "@/pages/Admin/ManageSeatTypesPage"
import ManageSeatPricesPage from "@/pages/Admin/ManageSeatPricesPage"
import ManageShowtimePage from "@/pages/Admin/ManageShowtimePage"
import ManageTicketPage from "@/pages/Admin/ManageTicketPage"
import ManageProductCategoriesPage from "@/pages/Admin/ManageProductCategoriesPage"
import ManageCombosPage from "@/pages/Admin/ManageCombosPage"
import ManageProductsPage from "@/pages/Admin/ManageProductsPage"
import ManageUsersPage from "@/pages/Admin/ManageUsersPage"

import DashboardStaffPage from "@/pages/Staff/DashboardPage"
import ManageTicketStaffPage from "@/pages/Staff/ManageTicketPage"

function App(){
  const { user, fetchMe, isCheckingAuth } = useAuthStore()
  useEffect(() => {
    if (!user) {
      fetchMe()
    }
  }, [user, fetchMe])
  
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

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Route>

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/showing" element={<MovieShowing />} />
          <Route path="/movies/upcoming" element={<MovieUpcoming />} />
          <Route path="/movies/:slug" element={<MovieDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout-result" element={<CheckoutResultPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/movies" element={<ManageMoviePage />} />
          <Route path="/admin/movies/genres" element={<ManageGenresMoviePage />} />
          <Route path="/admin/movies/age-ratings" element={<ManageAgeRatingsPage />} />
            
          <Route path="/admin/cinema" element={<CinemaInfoPage />} />
          <Route path="/admin/cinema/rooms" element={<ManageRoomsPage />} />
          <Route path="/admin/cinema/room-types" element={<ManageRoomTypePage />} />

          <Route path="/admin/seats/types" element={<ManageSeatTypesPage />} />
          <Route path="/admin/seats/prices" element={<ManageSeatPricesPage />} />
          
          <Route path="/admin/showtimes" element={<ManageShowtimePage />} />
          <Route path="/admin/orders" element={<ManageTicketPage />} />
          
          <Route path="/admin/food-categories" element={<ManageProductCategoriesPage />} />
          <Route path="/admin/foods" element={<ManageProductsPage />} />
          <Route path="/admin/combos" element={<ManageCombosPage />} />
          <Route path="/admin/discount-codes" element={<div>Manage Discount Codes Page</div>} />

          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route element={<StaffRoute />}>
          <Route path="/staff/dashboard" element={<DashboardStaffPage />} />
          <Route path="/staff/orders" element={<ManageTicketStaffPage />} />
            <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App


