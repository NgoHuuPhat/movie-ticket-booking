import { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import useAuthStore from "@/stores/useAuthStore"
import { useNavigate } from "react-router"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  matKhau: z.string().min(1, "Vui lòng nhập mật khẩu"),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, errorLogin } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })


  const onSubmit = async (data: LoginFormData) => {
    const { email, matKhau } = data
    await signIn(email, matKhau)
    navigate("/") 
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
          Email
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="login-email"
            type="email"
            placeholder="Nhập Email"
            {...register("email")}
            className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
            required
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
          Mật khẩu
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-500" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            {...register("matKhau")}
            className="pl-12 pr-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.matKhau && <p className="text-sm text-red-500">{errors.matKhau.message}</p>}

        <div className="flex justify-end mt-4 font-medium">
          <a
            href="/forgot-password"
            className="text-sm text-purple-500 hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>
      </div>

      { errorLogin && (
        <Alert className="bg-red-100/50 border-red-300/50">
          <AlertDescription className="text-red-700">{errorLogin}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="yellowToPinkPurple"
        className="w-full h-12"
      >
        <span className="flex items-center font-anton justify-center gap-2 text-base">
          {isSubmitting ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
        </span>
      </Button>
    </form>
  )
}

export default LoginForm
