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

export const getMoviesForSelect = async () => {
  const res = await request.get("/admin/movies/select")
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

export const getAllAgeRatingsAdmin = async (search?: string) => {
  const res = await request.get("/admin/age-ratings", { params: { search } })
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

export const getCinemaInfoAdmin = async () => {
  const res = await request.get("/admin/cinema")
  return res.data
}

export const updateCinemaInfoAdmin = async (tenRap: string, diaChi: string, soDienThoai: string, email: string) => {
  const res = await request.patch(`/admin/cinema`, { tenRap, diaChi, soDienThoai, email })
  return res.data
}

export const getRoomsForSelectAdmin = async () => {
  const res = await request.get("/admin/cinema/rooms/select")
  return res.data
}

export const getAllRoomsAdmin = async (params: { page?: number; search?: string; hoatDong?: boolean; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/admin/cinema/rooms", { params })
  return res.data
}

export const createRoomAdmin = async (
  tenPhong: string, 
  maLoaiPhong: string,
  soHang: number,
  soCot: number,
  seatConfig: Array<{
    hangGhe: string
    soGhe: number
    maLoaiGhe: string
    hoatDong: boolean
  }>
) => {
  const res = await request.post("/admin/cinema/rooms", { 
    tenPhong, 
    maLoaiPhong,
    soHang,
    soCot,
    seatConfig 
  })
  return res.data
}

export const getRoomSeatsAdmin = async (roomId: string) => {
  const res = await request.get(`/admin/cinema/rooms/${roomId}/seats`)
  return res.data
}

export const updateRoomSeatsAdmin = async (roomId: string, seatConfig: Array<{
  hangGhe: string
  soGhe: number
  maLoaiGhe: string
  hoatDong: boolean
}>) => {
  const res = await request.patch(`/admin/cinema/rooms/${roomId}/seats`, { seatConfig })
  return res.data
}

export const updateRoomAdmin = async (id: string, maLoaiPhong: string) => {
  const res = await request.patch(`/admin/cinema/rooms/${id}`, { maLoaiPhong })
  return res.data
}

export const deleteRoomAdmin = async (id: string) => {
  const res = await request.delete(`/admin/cinema/rooms/${id}`)
  return res.data
}

export const bulkActionRoomsAdmin = async (roomIds: string[], action: string) => {
  const res = await request.post("/admin/cinema/bulk-action", { roomIds, action })
  return res.data
}

export const toggleCinemaActivationAdmin = async (id: string) => {
  const res = await request.patch(`/admin/cinema/${id}/activate`)
  return res.data
}

export const getAllRoomTypesAdmin = async (search?: string) => {
  const res = await request.get("/admin/room-types", { params: { search } })
  return res.data
}

export const createRoomTypeAdmin = async (tenLoaiPhong: string) => {
  const res = await request.post("/admin/room-types", { tenLoaiPhong })
  return res.data
}

export const deleteRoomTypeAdmin = async (id: string) => {
  const res = await request.delete(`/admin/room-types/${id}`)
  return res.data
}

export const updateRoomTypeAdmin = async (id: string, tenLoaiPhong: string) => {
  const res = await request.patch(`/admin/room-types/${id}`, { tenLoaiPhong })
  return res.data
}

export const getSeatTypesAdmin = async (search?: string) => {
  const res = await request.get("/admin/seats/types", { params: { search } })
  return res.data
}

export const createSeatTypeAdmin = async (tenLoaiGhe: string, moTa?: string) => {
  const res = await request.post("/admin/seats/types", { tenLoaiGhe, moTa })
  return res.data
}

export const updateSeatTypeAdmin = async (id: string, tenLoaiGhe: string, moTa?: string) => {
  const res = await request.patch(`/admin/seats/types/${id}`, { tenLoaiGhe, moTa })
  return res.data
}

export const deleteSeatTypeAdmin = async (id: string) => {
  const res = await request.delete(`/admin/seats/types/${id}`)
  return res.data
}

export const getSeatPricesAdmin = async (search?: string) => {
  const res = await request.get("/admin/seats/prices", { params: { search } })
  return res.data
}

export const createSeatPriceAdmin = async (maLoaiGhe: string, maLoaiPhong: string, giaTien: number) => {
  const res = await request.post("/admin/seats/prices", { maLoaiGhe, maLoaiPhong, giaTien })
  return res.data
}

export const updateSeatPriceAdmin = async (maLoaiPhong: string, maLoaiGhe: string, giaTien: number) => {
  const res = await request.patch(`/admin/seats/prices/${maLoaiPhong}/${maLoaiGhe}`, { giaTien })
  return res.data
}

export const getShowtimesAdmin = async (params: { page?: number; trangThai?: string; date?: string; search?: string; }) => {
  const res = await request.get("/admin/showtimes", { params })
  return res.data
}

export const createShowtimeAdmin = async (maPhim: string, maPhong: string, gioBatDau: string, gioKetThuc: string) => {
  const res = await request.post("/admin/showtimes", { maPhim, maPhong, gioBatDau, gioKetThuc })
  return res.data
}

export const updateShowtimeAdmin = async (id: string, gioBatDau: string, gioKetThuc: string) => {
  const res = await request.patch(`/admin/showtimes/${id}`, { gioBatDau, gioKetThuc })
  return res.data
}

export const deleteShowtimeAdmin = async (id: string) => {
  const res = await request.delete(`/admin/showtimes/${id}`)
  return res.data
}

export const getShowtimeStatsAdmin = async () => {
  const res = await request.get(`/admin/showtimes/stats`)
  return res.data
}

export const bulkActionShowtimesAdmin = async (showtimeIds: string[], action: string) => {
  const res = await request.post("/admin/showtimes/bulk-action", { showtimeIds, action })
  return res.data
}

export const toggleShowtimeActivationAdmin = async (id: string) => {
  const res = await request.patch(`/admin/showtimes/${id}/activate`)
  return res.data
}