import { useSearchParams } from "react-router-dom"
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"
import UserLayout from "@/components/layout/UserLayout"
import useScrollToTop from "@/hooks/useScrollToTop"
import { Card, CardContent } from "@/components/ui/card"

const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "login"

  useScrollToTop(activeTab)

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab })
  }

  return (
    <UserLayout>
      <div className="flex flex-col items-center mb-30 mt-10 px-4">
        <div className="w-full max-w-[500px] flex gap-2 mb-2">
          <button
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-4 font-anton text-sm transition-all bg-white duration-300 rounded-xl ${
              activeTab === "login" ? "text-black" : "text-white/50 bg-white/0 hover:bg-white/20"
            }`}
          >
            ĐĂNG NHẬP
          </button>
          <button
            onClick={() => handleTabChange("register")}
            className={`flex-1 py-4 font-anton text-sm transition-all bg-white duration-300 rounded-xl ${
              activeTab === "register" ? "text-black" : "text-white/50 bg-white/0 hover:bg-white/20"
            }`}
          >
            ĐĂNG KÝ
          </button>
        </div>

        <Card className="w-full max-w-[500px]">
          <CardContent className="p-8">
            {activeTab === "login" ? (
              <LoginForm />
            ) : (
              <RegisterForm />
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  )
}

export default AuthPage