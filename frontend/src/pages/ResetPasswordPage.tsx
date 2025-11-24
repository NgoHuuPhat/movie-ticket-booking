import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import UserLayout from "@/components/layout/UserLayout"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { resetPassword } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import { toast } from "sonner"

const resetPasswordSchema = z.object({
  matKhau: z
    .string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  xacNhanMatKhau: z.string().min(1, "Vui lòng xác nhận mật khẩu")
}).refine((data) => data.matKhau === data.xacNhanMatKhau, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["xacNhanMatKhau"]
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }} = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("email")
    if (!savedEmail) {
      navigate("/forgot-matKhau")
    }
  }, [navigate])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError("")
    setLoading(true)

    try {
      const { matKhau, xacNhanMatKhau } = data
      await resetPassword(matKhau, xacNhanMatKhau)
      sessionStorage.removeItem("email")
      toast.success("Đặt lại mật khẩu thành công!")
      navigate("/login")
    } catch (error) {
      setError(handleError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col items-center p-4 lg:p-0 mt-20">
        <div className="relative w-full max-w-lg px-4">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl pt-8 lg:py-8 lg:px-4 gap-4">
            <CardHeader className="text-center mb-2">
              <CardTitle className="text-3xl font-anton uppercase">Nhập mật khẩu mới</CardTitle>
              <p className="text-gray-600 text-sm mt-1">Vui lòng nhập mật khẩu mới của bạn</p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      {...register("matKhau")}
                      type={showPassword ? "text" : "matKhau"}
                      className="pl-6 h-12"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                  {errors.matKhau && (
                    <p className="text-red-500 text-sm mt-1">{errors.matKhau.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700 font-semibold">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input
                      {...register("xacNhanMatKhau")}
                      type={showConfirmPassword ? "text" : "matKhau"}
                      className="pl-6 h-12"
                      placeholder="Xác nhận mật khẩu mới"
                    />
                    <div
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                  {errors.xacNhanMatKhau && (
                    <p className="text-red-500 text-sm mt-1">{errors.xacNhanMatKhau.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  variant="yellowToPinkPurple"
                  className="w-full h-12" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                      <span>Đang cập nhật...</span>
                    </div>
                  ) : <span className=" uppercase text-base font-anton">Cập nhật mật khẩu</span>}
                </Button>
              </form>
              
              {error && (
                <Alert className="bg-red-100/50 border-red-300/50 mt-4">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex justify-center space-x-4">
              {error === "Forgot password token không tồn tại. Vui lòng yêu cầu OTP mới." && (
                <>
                  <Link
                    to="/forgot-matKhau"
                    className="text-gray-600 hover:text-blue-400 font-semibold cursor-pointer text-sm"
                  >
                    Yêu cầu OTP mới
                  </Link>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </UserLayout>
  )
}

export default ResetPasswordPage