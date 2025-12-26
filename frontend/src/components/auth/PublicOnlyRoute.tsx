import { Navigate, Outlet } from "react-router-dom"
import useAuthStore from "@/stores/useAuthStore"

const PublicOnlyRoute = () => {
  const { user } = useAuthStore()

  if (user) {
    if (user.maLoaiNguoiDung === "ADMIN") {
      return <Navigate to="/admin" replace />
    } else if (user.maLoaiNguoiDung === "NV") {
      return <Navigate to="/staff" replace />
    } else {
      return <Navigate to="/" replace /> 
    }
  }

  return <Outlet />
}

export default PublicOnlyRoute