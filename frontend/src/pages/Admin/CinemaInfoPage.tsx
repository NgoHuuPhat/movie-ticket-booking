import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { z } from "zod"

import AdminLayout from "@/components/layout/AdminLayout"
import { getCinemaInfoAdmin, updateCinemaInfoAdmin } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"

const cinemaSchema = z.object({
  tenRap: z.string().min(1, "Tên rạp không được để trống").max(100, "Tên rạp quá dài"),
  diaChi: z.string().min(1, "Địa chỉ không được để trống").max(200, "Địa chỉ quá dài"),
  soDienThoai: z.string().min(1, "Số điện thoại không được để trống").regex(/^\d+$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
})

type CinemaFormData = z.infer<typeof cinemaSchema>

interface CinemaInfo {
  maRap: string
  tenRap: string
  diaChi: string
  soDienThoai: string
  email: string
}

export default function CinemaInfoPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CinemaFormData>({
    resolver: zodResolver(cinemaSchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const fetchCinemaInfo = async () => {
      try {
        setLoading(true)
        const data: CinemaInfo = await getCinemaInfoAdmin()

        reset({
          tenRap: data.tenRap || "",
          diaChi: data.diaChi || "",
          soDienThoai: data.soDienThoai || "",
          email: data.email || "",
        })
      } catch (error) {
        toast.error(handleError(error))
      } finally {
        setLoading(false)
      }
    }

    fetchCinemaInfo()
  }, [reset])

  const onSubmit = async (data: CinemaFormData) => {
    try {
      setSaving(true)
      const res = await updateCinemaInfoAdmin(
        data.tenRap.trim(),
        data.diaChi.trim(),
        data.soDienThoai.trim(),
        data.email.trim()
      )
      reset({
        tenRap: data.tenRap.trim(),
        diaChi: data.diaChi.trim(),
        soDienThoai: data.soDienThoai.trim(),
        email: data.email.trim(),
      })
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            Thông tin rạp chiếu
          </h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cơ bản của hệ thống rạp phim</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa thông tin rạp</CardTitle>
            <CardDescription>
              Cập nhật tên rạp, địa chỉ, số điện thoại và email liên hệ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tenRap">Tên rạp <span className="text-red-500">*</span></Label>
                  <Input id="tenRap" placeholder="Galaxy Cinema Nguyễn Du" {...register("tenRap")} />
                  {errors.tenRap && <p className="text-sm text-red-600">{errors.tenRap.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soDienThoai">Số điện thoại <span className="text-red-500">*</span></Label>
                  <Input id="soDienThoai" type="tel" {...register("soDienThoai")} />
                  {errors.soDienThoai && <p className="text-sm text-red-600">{errors.soDienThoai.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diaChi">Địa chỉ <span className="text-red-500">*</span></Label>
                <Input
                  id="diaChi"
                  placeholder="116 Nguyễn Du, Quận 1, TP. Hồ Chí Minh"
                  {...register("diaChi")}
                />
                {errors.diaChi && <p className="text-sm text-red-600">{errors.diaChi.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email liên hệ <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@galaxycinema.vn"
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={saving} size="lg">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}