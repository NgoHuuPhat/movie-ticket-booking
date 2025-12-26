import useAuthStore from "@/stores/useAuthStore"
import { Navigate, Outlet } from "react-router-dom"

const AdminRoute = () => {
  const { user } = useAuthStore()

  if (!user || user.maLoaiNguoiDung !== "ADMIN") return <Navigate to="/login" replace />
  return <Outlet />
}

export default AdminRoute