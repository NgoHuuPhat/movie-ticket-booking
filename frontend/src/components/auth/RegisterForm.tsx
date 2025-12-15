import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, Phone, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import useAuthStore from "@/stores/useAuthStore"
import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription } from "../ui/alert"

const signUpSchema = z.object({
  hoTen: z.string().min(1, "Họ tên không được để trống"),
  email: z.email("Email không hợp lệ"),
  soDienThoai: z.string().regex(/^0[3|5|7|8|9]\d{8}$/, "Số điện thoại không hợp lệ"),
  gioiTinh: z.enum(["Nam", "Nu"], { message: "Vui lòng chọn giới tính" }),
  ngaySinh: z.date({error: issue => issue.input === undefined ? "Vui lòng chọn ngày sinh" : ""}).max(new Date(), "Ngày sinh không hợp lệ"),
  matKhau: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  xacNhanMatKhau: z.string(),
}).refine((data) => data.matKhau === data.xacNhanMatKhau, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["xacNhanMatKhau"],
})
type SignUpFormData = z.infer<typeof signUpSchema>

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [checked, setChecked] = useState(false)
  const { signUp, errorRegister } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      gioiTinh: "Nam",
    },
    mode: "onTouched",
  })

  const onSubmit = async (data: SignUpFormData) => {
    const { hoTen, email, matKhau, soDienThoai, ngaySinh, gioiTinh } = data
    const success = await signUp(hoTen, email, matKhau, soDienThoai, format(ngaySinh, "yyyy-MM-dd"), gioiTinh)
    if (success) {
      navigate("/login")
    }    
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="hoTen">Họ và tên <span className="text-red-500">*</span></Label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="hoTen"
            placeholder="Nhập Họ và tên"
            {...register("hoTen")}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        {errors.hoTen && <p className="text-sm text-red-500">{errors.hoTen.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Nhập Email"
            {...register("email")}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      {/* Phone number */}
      <div className="space-y-2">
        <Label htmlFor="soDienThoai">Số điện thoại <span className="text-red-500">*</span></Label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="soDienThoai"
            placeholder="Nhập số điện thoại"
            {...register("soDienThoai")}
            className="pl-12 h-12 rounded-xl"
          />
        </div>
        {errors.soDienThoai && <p className="text-sm text-red-500">{errors.soDienThoai.message}</p>}
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <Label>Giới tính <span className="text-red-500">*</span></Label>
        <RadioGroup
          defaultValue="Nam"
        >
          <div className="flex gap-8">
            {["Nam", "Nu"].map((gt) => (
              <div key={gt} className="flex items-center space-x-2 my-2">
                <RadioGroupItem value={gt} id={gt} />
                <Label htmlFor={gt} className="cursor-pointer mb-0">
                  {gt === "Nam" ? "Nam" : "Nữ"}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
        <input type="hidden" {...register("gioiTinh")} />
        {errors.gioiTinh && <p className="text-sm text-red-500">{errors.gioiTinh.message}</p>}
      </div>

      {/* Birthdate */}
      <div className="space-y-2">
        <Label>
          Ngày sinh <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="ngaySinh"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal rounded-xl border-gray-300 hover:border-purple-500"
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                  <span className={field.value ? "text-gray-900" : "text-gray-500"}>
                    {field.value 
                      ? format(field.value, "dd/MM/yyyy")
                      : "Chọn ngày sinh"
                    }
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.ngaySinh && (
          <p className="text-sm text-red-500">{errors.ngaySinh.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="matKhau">Mật khẩu <span className="text-red-500">*</span></Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="matKhau"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            {...register("matKhau")}
            className="pl-12 pr-12 h-12 rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.matKhau && <p className="text-sm text-red-500">{errors.matKhau.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="xacNhanMatKhau">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="xacNhanMatKhau"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            {...register("xacNhanMatKhau")}
            className="pl-12 pr-12 h-12 rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.xacNhanMatKhau && <p className="text-sm text-red-500">{errors.xacNhanMatKhau.message}</p>}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="acceptTerms"
          checked={checked}
          onCheckedChange={(checked) => setChecked(checked ? true : false)}
        />
        <Label htmlFor="acceptTerms" className="text-sm cursor-pointer mb-0">
          Tôi đồng ý với <span className="text-purple-600 font-medium">Điều khoản sử dụng</span> và{" "}
          <span className="text-purple-600 font-medium">Chính sách bảo mật</span>
        </Label>
      </div>

      { errorRegister && (
        <Alert className="bg-red-100/50 border-red-300/50 mt-4">
          <AlertDescription className="text-red-700">{errorRegister}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !checked}
        variant="yellowToPinkPurple"
        className="w-full h-12 text-base font-anton"
      >
        <span>{isSubmitting ? "Đang tạo tài khoản..." : "TẠO TÀI KHOẢN"}</span>
      </Button>
    </form>
  )
}

export default RegisterForm