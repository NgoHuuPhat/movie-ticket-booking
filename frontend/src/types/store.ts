import type { IUser } from "@/types/user"
import type { IMovie, IMovieShowtime } from "@/types/movie"
import type { ISeatData } from "@/types/seat"
import type { ISelectedFood } from "@/types/product"

export interface AuthState {
  user: IUser | null
  isCheckingAuth: boolean
  errorLogin: string
  errorRegister: string

  signUp: (hoTen: string, email: string, matKhau: string, soDienThoai: string, ngaySinh: string, gioiTinh: string) => Promise<boolean>
  signIn: (email: string, matKhau: string) => Promise<boolean>
  signOut: () => Promise<void>
  fetchMe: () => Promise<void>
}

export interface IBookingState {
  movie: IMovie | null
  showtime: IMovieShowtime | null
  selectedSeats: ISeatData[]
  selectedFoods: ISelectedFood[]
  seatsTotal: number
  foodsTotal: number
  
  setMovie: (movie: IMovie) => void
  setShowtime: (showtime: IMovieShowtime) => void
  setSeats: (seats: ISeatData[]) => void
  setFoods: (foods: ISelectedFood[]) => void
  clearBooking: () => void
  
  getGrandTotal: () => number
}