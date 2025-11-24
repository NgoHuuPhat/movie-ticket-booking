import { Navigate, Outlet } from "react-router-dom"
import useAuthStore from "@/stores/useAuthStore"

const PublicOnlyRoute = () => {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login"/>
  }

  return <Outlet />
}

export default PublicOnlyRoute
