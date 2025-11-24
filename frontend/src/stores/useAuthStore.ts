  import { create } from "zustand"
  import { toast } from "sonner"
  import { fetchMe, signIn, signOut, signUp } from "@/services/api"
  import type { AuthState } from "@/types/store"
  import { handleError } from "@/utils/handleError.utils"

  const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isCheckingAuth: true,
    errorLogin: "",
    errorRegister: "",

    signUp: async (hoTen, email, matKhau, soDienThoai, ngaySinh, gioiTinh) => {
      try {
        await signUp(hoTen, email, matKhau, soDienThoai, ngaySinh, gioiTinh)
        toast.success("Đăng ký thành công! Bạn được chuyển sang trang đăng nhập.")
      } catch (error) {
        console.error("Registration error:", error)
        toast.error("Đăng ký thất bại. Vui lòng thử lại.")
        set({ errorRegister: handleError(error) })
      } 
    },

    signIn: async (email, matKhau) => {
      set({ isCheckingAuth: true })
      try {
        await signIn(email, matKhau)
        await get().fetchMe()
      } catch (error) {
        console.error("Sign-in error:", error)
        set({ isCheckingAuth: false, errorLogin: handleError(error) })
      }
    },

    signOut: async () => {
      try {
        await signOut()
        set({ user: null })
      } catch (error) {
        console.error("Sign-out error:", error)
        toast.error("Đăng xuất thất bại. Vui lòng thử lại.")
      }
    },

    fetchMe: async () => {
      try {
        const user = await fetchMe()
        set({ user })
      } catch (error) {
        console.error("Fetch user error:", error)
        set({ user: null })
      } finally {
        setTimeout(() => {
          set({ isCheckingAuth: false })
        }, 300) 
      }
    }

  }))

  export default useAuthStore