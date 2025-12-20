import type { IVNPayRequestBody } from "@/types/payment"
import axios from "axios"

const request = axios.create({
  baseURL: import.meta.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api",
  withCredentials: true
})

// Public APIs
export const signUp = async (hoTen: string, email: string, matKhau: string, soDienThoai: string, ngaySinh: string, gioiTinh: string) => {
  const res = await request.post("/auth/register", { hoTen,email, matKhau, soDienThoai, ngaySinh, gioiTinh })
  return res.data
}

export const signIn = async (email: string, matKhau: string) => {
  const res = await request.post("/auth/login", { email, matKhau })
  return res.data
}

export const signOut = async () => {
  const res = await request.post("/auth/logout")
  return res.data
}

export const fetchMe = async () => {
  const res = await request.get("/auth/me")
  return res.data
}

export const forgotPassword = async (email: string) => {
  const res = await request.post("/auth/forgot-password", { email })
  return res.data
}

export const verifyOTP = async (email: string, otp: string) => {
  const res = await request.post("/auth/verify-otp", { email, otp })
  return res.data
}

export const resetPassword = async (matKhau: string, xacNhanMatKhau: string) => {
  const res = await request.post("/auth/reset-password", { matKhau, xacNhanMatKhau })
  return res.data
}

export const listMoviesShowing = async () => {
  const res = await request.get("/movies/showing")
  return res.data
}

export const listMoviesUpcoming = async () => {
  const res = await request.get("/movies/upcoming")
  return res.data
}

export const getMovieDetails = async (slug: string) => {
  const res = await request.get(`/movies/${slug}`)
  return res.data
}

export const getMovieShowtimes = async (maPhim: string) => {
  const res = await request.get(`/movies/${maPhim}/showtimes`)
  return res.data
}

export const getSeatsByShowTimeId = async (showTimeId: string) => {
  const res = await request.get(`/showtimes/${showTimeId}/seats`)
  return res.data
}

export const getCategoriesWithProducts = async () => {
  const res = await request.get("/products/categories-with-products")
  return res.data
}

export const getAllCombos = async () => {
  const res = await request.get("/combos")
  return res.data
}

export const getDiscountsForUser = async () => {
  const res = await request.get("/discounts")
  return res.data
}

export const createVNPayPayment = async (paymentData: IVNPayRequestBody) => {
  const res = await request.post("/payments/vnpay-create", paymentData)
  return res.data
}

export const holdSeats = async (showtimeId: string, seatIds: string[]) => {
  const res = await request.post("/seats/hold", { showtimeId, seatIds })
  return res.data
}

export const getHoldSeatTTL = async (showtimeId: string, seatId: string) => {
  const res = await request.get("/seats/hold/ttl", { params: { showtimeId, seatId }})
  return res.data
}

// Admin APIs
export const getAllMoviesAdmin = async (params: { page?: number; search?: string; hienThi?: boolean; trangThai?: string }) => {
  const res = await request.get("/admin/movies", { params })
  return res.data
}

export const getStatsMoviesAdmin = async () => {
  const res = await request.get("/admin/movies/stats")
  return res.data
}

export const createMovieAdmin = async (movieData: FormData) => {
  const res = await request.post("/admin/movies", movieData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const updateMovieAdmin = async (id: string, movieData: FormData) => {
  const res = await request.patch(`/admin/movies/${id}`, movieData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const deleteMovieAdmin = async (id: string) => {
  const res = await request.delete(`/admin/movies/${id}`)
  return res.data
}

export const bulkAction = async (movieIds: string[], action: string) => {
  const res = await request.post("/admin/movies/bulk-action", { movieIds, action })
  return res.data
}

export const toggleShowMovieAdmin = async (id: string) => {
  const res = await request.patch(`/admin/movies/${id}/show`)
  return res.data
}

export const getAllCategoriesAdmin = async (search?: string) => {
  const res = await request.get("/admin/categories", { params: { search } })
  return res.data
}

export const createCategoryAdmin = async (tenTheLoai: string) => {
  const res = await request.post("/admin/categories", { tenTheLoai })
  return res.data
}

export const deleteCategoryAdmin = async (id: string) => {
  const res = await request.delete(`/admin/categories/${id}`)
  return res.data
}

export const updateCategoryAdmin = async (id: string, tenTheLoai: string) => {
  const res = await request.patch(`/admin/categories/${id}`, { tenTheLoai })
  return res.data
}

export const getAllAgeRatingsAdmin = async (psearch?: string) => {
  const res = await request.get("/admin/age-ratings", { params: { search: psearch } })
  return res.data
}

export const createAgeRatingAdmin = async (tenPhanLoaiDoTuoi: string, moTa: string) => {
  const res = await request.post("/admin/age-ratings", { tenPhanLoaiDoTuoi, moTa })
  return res.data
}

export const deleteAgeRatingAdmin = async (id: string) => {
  const res = await request.delete(`/admin/age-ratings/${id}`)
  return res.data
}

export const updateAgeRatingAdmin = async (id: string, tenPhanLoaiDoTuoi: string, moTa: string) => {
  const res = await request.patch(`/admin/age-ratings/${id}`, { tenPhanLoaiDoTuoi, moTa })
  return res.data
}