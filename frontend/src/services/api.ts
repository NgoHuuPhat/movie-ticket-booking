import type { IPaymentRequestBody } from "@/types/payment"
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

export const historyTickets = async () => {
  const res = await request.get("/profile/history")
  return res.data
}

export const updatePassword = async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
  const res = await request.patch("/profile/password", { currentPassword, newPassword, confirmNewPassword })
  return res.data
}

export const getCinemaInfo = async () => {
  const res = await request.get("/cinema")
  return res.data
}

export const getNews = async () => {
  const res = await request.get("/news")
  return res.data
}

export const getNewsBySlug = async (slug: string) => {
  const res = await request.get(`/news/${slug}`)
  return res.data
}

export const getBanners = async () => {
  const res = await request.get("/banners")
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

export const searchMoviesByName = async (tenPhim: string) => {
  const res = await request.get("/movies", { params: { search: tenPhim } })
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

export const checkDiscountCode = async (maCode: string, tongTien: number) => {
  const res = await request.post("/discounts/check", { maCode, tongTien })
  return res.data
}

export const createVNPayPayment = async (paymentData: IPaymentRequestBody) => {
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

export const chatWithAI = async (question: string) => {
  const res = await request.post("/chatbot", { question })
  return res.data
}

export const getProfile = async () => {
  const res = await request.get("/profile")
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

export const getShowtimeDetailsAdmin = async (id: string) => {
  const res = await request.get(`/admin/showtimes/${id}/seats`)
  return res.data
}

export const createShowtimeAdmin = async (maPhim: string, maPhong: string, gioBatDau: string) => {
  const res = await request.post("/admin/showtimes", { maPhim, maPhong, gioBatDau })
  return res.data
}

export const updateShowtimeAdmin = async (id: string, gioBatDau: string) => {
  const res = await request.patch(`/admin/showtimes/${id}`, { gioBatDau })
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

export const getAllTicketsAdmin = async (params: { phim?: string; hinhThuc?: string; search?: string; page?: number;  date?: string; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/admin/tickets", { params })
  return res.data
}

export const getTicketStatsAdmin = async () => {
  const res = await request.get("/admin/tickets/stats")
  return res.data
}

export const getAllProductCategoriesAdmin = async (search?: string) => {
  const res = await request.get("/admin/product-categories", { params: { search } })
  return res.data
}

export const createProductCategoryAdmin = async (tenDanhMucSanPham: string) => {
  const res = await request.post("/admin/product-categories", { tenDanhMucSanPham })
  return res.data
}

export const updateProductCategoryAdmin = async (id: string, tenDanhMucSanPham: string) => {
  const res = await request.patch(`/admin/product-categories/${id}`, { tenDanhMucSanPham })
  return res.data
}

export const deleteProductCategoryAdmin = async (id: string) => {
  const res = await request.delete(`/admin/product-categories/${id}`)
  return res.data
}

export const getAllProductsAdmin = async (params: { page?: number; search?: string; hienThi?: boolean; maDanhMucSanPham?: string; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/admin/products", { params })
  return res.data
}

export const createProductAdmin = async (productData: FormData) => {
  const res = await request.post("/admin/products", productData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const updateProductAdmin = async (id: string, productData: FormData) => {
  const res = await request.patch(`/admin/products/${id}`, productData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const deleteProductAdmin = async (id: string) => {
  const res = await request.delete(`/admin/products/${id}`)
  return res.data
}

export const bulkActionProducts = async (productIds: string[], action: string) => {
  const res = await request.post("/admin/products/bulk-action", { productIds, action })
  return res.data
}

export const toggleShowProductAdmin = async (id: string) => {
  const res = await request.patch(`/admin/products/${id}/show`)
  return res.data
}

export const getProductsForSelectAdmin = async () => {
  const res = await request.get("/admin/products/select")
  return res.data
}

export const getAllCombosAdmin = async (params: { page?: number; search?: string; hienThi?: boolean; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/admin/combos", { params })
  return res.data
}

export const createComboAdmin = async (comboData: FormData) => {
  const res = await request.post("/admin/combos", comboData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const updateComboAdmin = async (id: string, comboData: FormData) => {
  const res = await request.patch(`/admin/combos/${id}`, comboData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const deleteComboAdmin = async (id: string) => {
  const res = await request.delete(`/admin/combos/${id}`)
  return res.data
}

export const bulkActionCombosAdmin = async (comboIds: string[], action: string) => {
  const res = await request.post("/admin/combos/bulk-action", { comboIds, action })
  return res.data
}

export const toggleShowComboAdmin = async (id: string) => {
  const res = await request.patch(`/admin/combos/${id}/show`)
  return res.data
}

export const getAllUserTypesAdmin = async () => {
  const res = await request.get("/admin/usertypes")
  return res.data
}

export const getAllUsersAdmin = async (params: { page?: number; search?: string; hoatDong?: boolean; maLoaiNguoiDung?: string; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/admin/users", { params })
  return res.data
}

export const getUserStatsAdmin = async () => {
  const res = await request.get("/admin/users/stats")
  return res.data
}

export const createUserAdmin = async (hoTen: string, email: string, matKhau: string, soDienThoai: string, ngaySinh: string, gioiTinh: string, maLoaiNguoiDung: string) => {
  const res = await request.post("/admin/users", { hoTen, email, matKhau, soDienThoai, ngaySinh, gioiTinh, maLoaiNguoiDung })
  return res.data
}

export const toggleUserStatusAdmin = async (id: string, hoatDong: boolean) => {
  const res = await request.patch(`/admin/users/${id}/status`, { hoatDong })
  return res.data
}

export const bulkActionUsersAdmin = async (userIds: string[], action: string) => {
  const res = await request.post("/admin/users/bulk-action", { userIds, action })
  return res.data
}

export const deleteUserAdmin = async (id: string) => {
  const res = await request.delete(`/admin/users/${id}`)
  return res.data
}

export const getAllShiftsAdmin = async (search?: string) => {
  const res = await request.get("/admin/shifts", { params: { search } })
  return res.data
}

export const createShiftAdmin = async (tenCaLam: string, gioBatDau: string, gioKetThuc: string) => {
  const res = await request.post("/admin/shifts", { tenCaLam, gioBatDau, gioKetThuc })
  return res.data
}

export const updateShiftAdmin = async (id: string, tenCaLam: string, gioBatDau: string, gioKetThuc: string) => {
  const res = await request.patch(`/admin/shifts/${id}`, { tenCaLam, gioBatDau, gioKetThuc })
  return res.data
}

export const deleteShiftAdmin = async (id: string) => {
  const res = await request.delete(`/admin/shifts/${id}`)
  return res.data
}

export const getAllWorkSchedulesAdmin = async (params: { ngayLam?: string, maCaLam?: string, viTriLam?: string, search?: string, page?: number }) => {
  const res = await request.get("/admin/workschedules", { params })
  return res.data
}

export const createWorkScheduleAdmin = async (maNhanVien: string, maCaLam: string, ngayLam: string, viTriLam: string) => {
  const res = await request.post("/admin/workschedules", { maNhanVien, maCaLam, ngayLam, viTriLam })
  return res.data
}

export const updateWorkScheduleAdmin = async (maNhanVien: string, maCaLam: string, ngayLam: string, viTriLam: string) => {
  const res = await request.patch(`/admin/workschedules/${maNhanVien}/${maCaLam}/${ngayLam}`, { viTriLam })
  return res.data
}

export const deleteWorkScheduleAdmin = async (maNhanVien: string, maCaLam: string, ngayLam: string) => {
  const res = await request.delete(`/admin/workschedules/${maNhanVien}/${maCaLam}/${ngayLam}`)
  return res.data
}

export const getDiscountsForAdmin = async (params: { page?: number; search?: string; hoatDong?: boolean; trangThai?: string; loaiKhuyenMai?: string; doiTuongKhuyenMai?: string; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/admin/discounts", { params })
  return res.data
}

export const getDiscountStatsAdmin = async () => {
  const res = await request.get("/admin/discounts/stats")
  return res.data
}

export const createDiscountAdmin = async (tenKhuyenMai: string, loaiKhuyenMai: string, giaTriGiam: number, ngayBatDau: string, ngayKetThuc: string, donHangToiThieu: number, giamToiDa?: number, maLoaiNguoiDung?: string, soLuong?: number, moTa?: string) => {
  const res = await request.post("/admin/discounts", { tenKhuyenMai, loaiKhuyenMai, giaTriGiam, giamToiDa, donHangToiThieu, maLoaiNguoiDung, soLuong, ngayBatDau, ngayKetThuc, moTa })
  return res.data
}

export const bulkActionDiscountsAdmin = async (discountIds: string[], action: string) => {
  const res = await request.post("/admin/discounts/bulk-action", { discountIds, action })
  return res.data
}

export const updateDiscountAdmin = async (id: string, tenKhuyenMai: string, loaiKhuyenMai: string, giaTriGiam: number, ngayBatDau: string, ngayKetThuc: string, donHangToiThieu: number, giamToiDa?: number, maLoaiNguoiDung?: string, soLuong?: number, moTa?: string) => {
  const res = await request.patch(`/admin/discounts/${id}`, { tenKhuyenMai, loaiKhuyenMai, giaTriGiam, giamToiDa, donHangToiThieu, maLoaiNguoiDung, soLuong, ngayBatDau, ngayKetThuc, moTa })
  return res.data
}

export const toggleDiscountActivationAdmin = async (id: string) => {
  const res = await request.patch(`/admin/discounts/${id}/toggle`)
  return res.data
}

export const deleteDiscountAdmin = async (id: string) => {
  const res = await request.delete(`/admin/discounts/${id}`)
  return res.data
}

export const getNewsAdmin = async (params: { page?: number; search?: string; hienThi?: boolean; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/admin/news", { params })
  return res.data
}

export const createNewsAdmin = async (newsData: FormData) => {
  const res = await request.post("/admin/news", newsData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const updateNewsAdmin = async (id: string, newsData: FormData) => {
  const res = await request.patch(`/admin/news/${id}`, newsData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const bulkActionNewsAdmin = async (newsIds: string[], action: string) => {
  const res = await request.post("/admin/news/bulk-action", { newsIds, action })
  return res.data
}

export const toggleShowNewsAdmin = async (id: string) => {
  const res = await request.patch(`/admin/news/${id}/show`)
  return res.data
}

export const deleteNewsAdmin = async (id: string) => {
  const res = await request.delete(`/admin/news/${id}`)
  return res.data
}

export const getBannersAdmin = async () => {
  const res = await request.get("/admin/banners")
  return res.data
}

export const createBannerAdmin = async (bannerData: FormData) => {
  const res = await request.post("/admin/banners", bannerData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const toggleShowBannerAdmin = async (id: string) => {
  const res = await request.patch(`/admin/banners/${id}/show`)
  return res.data
}

export const deleteBannerAdmin = async (id: string) => {
  const res = await request.delete(`/admin/banners/${id}`)
  return res.data
}

export const bulkActionBannersAdmin = async (bannerIds: string[], action: string) => {
  const res = await request.post("/admin/banners/bulk-action", { bannerIds, action })
  return res.data
}

export const updateBannerAdmin = async (id: string, bannerData: FormData) => {
  const res = await request.patch(`/admin/banners/${id}`, bannerData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data
}

export const getRevenueStatisticsAdmin = async (typeDate: string) => {
  const res = await request.get("/admin/dashboard/revenue", { params: { typeDate } })
  return res.data
}

export const getTicketSalesStatisticsAdmin = async (typeDate: string) => {
  const res = await request.get("/admin/dashboard/revenue/ticket", { params: { typeDate } })
  return res.data
}

export const getProductSalesStatisticsAdmin = async (typeDate: string) => {
  const res = await request.get("/admin/dashboard/revenue/product", { params: { typeDate } })
  return res.data
}

export const getNewUsersStatisticsAdmin = async (typeDate: string) => {
  const res = await request.get("/admin/dashboard/new-users", { params: { typeDate } })
  return res.data
}

export const getTopMoviesAdmin = async () => {
  const res = await request.get("/admin/dashboard/top-movies")
  return res.data
}

export const getPaymentMethodsAdmin = async (year: string) => {
  const res = await request.get("/admin/dashboard/payment", { params: { year } })
  return res.data
}

export const getRevenueTimeSeriesAdmin = async () => {
  const res = await request.get("/admin/dashboard/revenue/time-series")
  return res.data
}

export const getRevenueByTypeAdmin = async (year: string) => {
  const res = await request.get("/admin/dashboard/revenue/type", { params: { year } })
  return res.data
}

export const getYearInvoicesAdmin = async () => {
  const res = await request.get("/admin/dashboard/years")
  return res.data
}

export const exportRevenueReportAdmin = async () => {
  const res = await request.get("/admin/report/revenue", {
    responseType: 'blob'
  })
  return res.data
}

export const revenueAnalysisAIAdmin = async (typeDate: string) => {
  const res = await request.get("/admin/dashboard/ai-revenue-analysis", { params: { typeDate } })
  return res.data
}

export const sendNewsMailAdmin = async (maTinTuc: string, maLoaiNguoiDung: string) => {
  const res = await request.post("/admin/news/send-mail", { maTinTuc, maLoaiNguoiDung })
  return res.data
}

// Staff APIs
export const getAllTicketsStaff = async (params: { phim?: string; hinhThuc?: string; search?: string; page?: number;  date?: string; sortField?: string; sortOrder?: string }) => {
  const res = await request.get("/staff/tickets", { params })
  return res.data
}

export const scanTicketStaff = async (maQR: string) => {
  const res = await request.post("/staff/tickets/scan-ticket", { maQR })
  return res.data
}

export const scanFoodStaff = async (maQR: string) => {
  const res = await request.post("/staff/tickets/scan-food", { maQR })
  return res.data
}

export const checkCustomerExistsStaff = async (soDienThoai: string) => {
  const res = await request.get("/staff/customers/check-phone", { params: { soDienThoai } })
  return res.data
}

export const createVNPayPaymentStaff = async (paymentData: IPaymentRequestBody) => {
  const res = await request.post("/staff/payments/vnpay-create", paymentData)
  return res.data
}

export const cashPaymentStaff = async (paymentData: IPaymentRequestBody) => {
  const res = await request.post("/staff/payments/cash", paymentData)
  return res.data
}

export const dowloadTicketStaff = async (maHoaDon: string) => {
  const res = await request.get(`/staff/payments/ticket/${maHoaDon}`, {
    responseType: 'blob'
  })
  return res.data
}