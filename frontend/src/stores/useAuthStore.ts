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
      set({ errorRegister: "" })
      try {
        await signUp(hoTen, email, matKhau, soDienThoai, ngaySinh, gioiTinh)
        toast.success("Đăng ký thành công! Bạn được chuyển sang trang đăng nhập.")
        return true
      } catch (error) {
        console.error("Registration error:", error)
        toast.error("Đăng ký thất bại. Vui lòng thử lại.")
        set({ errorRegister: handleError(error) })
        return false
      } 
    },

    signIn: async (email, matKhau) => {
      set({ errorLogin: "" })
      try {
        await signIn(email, matKhau)
        await get().fetchMe()
        return true
      } catch (error) {
        console.error("Sign-in error:", error)
        set({ isCheckingAuth: false, errorLogin: handleError(error) })
        return false
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
      set({ isCheckingAuth: true })
      try {
        const user = await fetchMe()
        set({ user })
      } catch (error) {
        console.error("Fetch user error:", error)
        set({ user: null })
      } finally {
        setTimeout(() => {
          set({ isCheckingAuth: false })
        }, 150) 
      }
    }

  }))

  export default useAuthStore