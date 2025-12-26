import useAuthStore from "@/stores/useAuthStore"
import { Navigate, Outlet } from "react-router-dom"

const StaffRoute = () => {
  const { user } = useAuthStore()
  
  if (!user || user.maLoaiNguoiDung !== "NV") return <Navigate to="/login" replace />
  return <Outlet />
}

export default StaffRoute