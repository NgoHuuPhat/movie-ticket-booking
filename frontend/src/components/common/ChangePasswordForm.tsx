import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const passwordSchema = z.object({
  oldPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(8, "Mật khẩu xác nhận phải có ít nhất 8 ký tự"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})
export type PasswordFormData = z.infer<typeof passwordSchema>

interface ChangePasswordFormProps {
  onSubmit: (data: PasswordFormData, resetForm: () => void) => Promise<void>
  submitting: boolean
}

export const ChangePasswordForm = ({ onSubmit, submitting }: ChangePasswordFormProps) => {
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const handleFormSubmit = async (data: PasswordFormData) => {
    const resetForm = () => {
      reset()
      setShowPassword({ old: false, new: false, confirm: false })
    }
    await onSubmit(data, resetForm)
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-50 rounded p-6 border border-purple-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-anton text-gray-800 flex items-center gap-2">
          Thay đổi mật khẩu
        </h3>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className=" font-semibold text-gray-700">Mật khẩu cũ</label>
          <div className="relative mt-2">
            <input
              {...register("oldPassword")}
              type={showPassword.old ? "text" : "password"}
              className="w-full bg-white px-4 py-3 pr-12 border border-purple-300 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-800"
              placeholder="Nhập mật khẩu cũ"
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.oldPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className=" font-semibold text-gray-700">Mật khẩu mới</label>
          <div className="relative mt-2">
            <input
              {...register("newPassword")}
              type={showPassword.new ? "text" : "password"}
              className="w-full bg-white px-4 py-3 pr-12 border border-purple-300 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-800"
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className=" font-semibold text-gray-700">Xác nhận mật khẩu mới</label>
          <div className="relative mt-2">
            <input
              {...register("confirmPassword")}
              type={showPassword.confirm ? "text" : "password"}
              className="w-full bg-white px-4 py-3 pr-12 border border-purple-300 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-800"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="purpleToYellowOrange" disabled={submitting} className="w-60 h-10 font-anton">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <span>Lưu mật khẩu</span>
            </>
          )}
        </Button>
        </div>
      </form>
    </div>
  )
}
