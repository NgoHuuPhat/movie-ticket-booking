import { Navigate, Outlet } from "react-router-dom"
import useAuthStore from "@/stores/useAuthStore"

const PublicOnlyRoute = () => {
  const { user } = useAuthStore()

  if (user) {
    const redirectTo = user.maLoaiNguoiDung === "ADMIN" ? "/admin" : "/"
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute