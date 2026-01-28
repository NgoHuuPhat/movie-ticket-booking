import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const profileSchema = z.object({
  hoTen: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.email("Email không hợp lệ"),
  soDienThoai: z.string().regex(/^0[3|5|7|8|9]\d{8}$/, "Số điện thoại không hợp lệ"),
  diaChi: z.string().optional(),
  ngaySinh: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface IUserProfile {
  hoTen: string
  email: string
  soDienThoai: string
  diaChi?: string
  ngaySinh?: string
}

interface ProfileInfoFormProps {
  user: IUserProfile
}

const ProfileInfoForm = ({ user }: ProfileInfoFormProps) => {

  const {
    register,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      hoTen: user.hoTen || "",
      email: user.email || "",
      soDienThoai: user.soDienThoai || "",
      diaChi: user.diaChi || "",
      ngaySinh: user.ngaySinh ? user.ngaySinh.split("T")[0] : "",
    },
  })

  return (
    <div className="bg-purple-50 rounded md:p-6 p-4 border border-purple-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="md:text-2xl text-lg font-anton text-gray-800">Thông tin cá nhân</h3>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className=" font-semibold text-gray-700 flex items-center gap-2">
            Họ và tên
          </label>
          <input
            {...register("hoTen")}
            type="text"
            className="w-full bg-white px-4 py-3 border border-purple-300 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-800"
          />
          {errors.hoTen && (
            <p className="text-red-500 text-sm mt-1">{errors.hoTen.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className=" font-semibold text-gray-700 flex items-center gap-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full bg-white px-4 py-3 border border-purple-300 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-800"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className=" font-semibold text-gray-700 flex items-center gap-2">
            Số điện thoại
          </label>
          <input
            {...register("soDienThoai")}
            type="text"
            className="w-full bg-white px-4 py-3 border border-purple-300 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-800"
          />
          {errors.soDienThoai && (
            <p className="text-red-500 text-sm mt-1">{errors.soDienThoai.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className=" font-semibold text-gray-700 flex items-center gap-2">
            Ngày sinh
          </label>
          <input
            {...register("ngaySinh")}
            type="date"
            className="w-full bg-white px-4 py-3 border border-purple-300 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-800"
          />
        </div>
      </form>
    </div>
  )
}

export default ProfileInfoForm