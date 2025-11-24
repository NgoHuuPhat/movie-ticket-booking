import type { User } from "@/types/user"

export interface AuthState {
  user: User | null
  isCheckingAuth: boolean
  errorLogin: string
  errorRegister: string

  signUp: (hoTen: string, email: string, matKhau: string, soDienThoai: string, ngaySinh: string, gioiTinh: string) => Promise<void>
  signIn: (email: string, matKhau: string) => Promise<void>
  signOut: () => Promise<void>
  fetchMe: () => Promise<void>
}