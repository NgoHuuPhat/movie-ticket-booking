import axios from "axios"

const request = axios.create({
  baseURL: import.meta.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api",
  withCredentials: true
})

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

export const listMovies = async () => {
  const res = await request.get("/movie")
  return res.data
}

export const listMoviesShowing = async () => {
  const res = await request.get("/movie/showing")
  return res.data
}

export const listMoviesUpcoming = async () => {
  const res = await request.get("/movie/upcoming")
  return res.data
}

export const getMovieDetails = async (slug: string) => {
  const res = await request.get(`/movie/${slug}`)
  return res.data
}

export const getMovieShowtimes = async (maPhim: string) => {
  const res = await request.get(`/movie/${maPhim}/showtimes`)
  return res.data
}

export const getSeatsByShowTimeId = async (showTimeId: string) => {
  const res = await request.get(`/showtime/${showTimeId}/seats`)
  return res.data
}

export const getCategoriesWithProducts = async () => {
  const res = await request.get("/product/categories-with-products")
  return res.data
}

export const getAllCombos = async () => {
  const res = await request.get("/combo")
  return res.data
}