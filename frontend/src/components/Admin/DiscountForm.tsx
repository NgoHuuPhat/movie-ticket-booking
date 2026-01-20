import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"

const discountSchema = z.object({
  tenKhuyenMai: z.string().min(1, "Tên khuyến mãi không được để trống"),
  loaiKhuyenMai: z.enum(["GiamPhanTram", "GiamTien"]),
  giaTriGiam: z.number().min(0, "Giá trị giảm phải lớn hơn hoặc bằng 0"),
  giamToiDa: z.number().min(0, "Giảm tối đa phải lớn hơn hoặc bằng 0").optional().nullable(),
  donHangToiThieu: z.number().min(0, "Đơn hàng tối thiểu phải lớn hơn hoặc bằng 0"),
  maLoaiNguoiDung: z.string().optional().nullable(),
  soLuong: z.number().min(1, "Số lượng phải lớn hơn 0").optional().nullable(),
  ngayBatDau: z.string().min(1, "Ngày bắt đầu không được để trống"),
  ngayKetThuc: z.string().min(1, "Ngày kết thúc không được để trống"),
  moTa: z.string().optional().nullable(),
}).refine((data) => {
  const start = new Date(data.ngayBatDau)
  const end = new Date(data.ngayKetThuc)
  return start <= end
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["ngayKetThuc"]
}).refine((data) => {
  if (data.loaiKhuyenMai === "GiamPhanTram" && data.giaTriGiam > 100) {
    return false
  }
  return true
}, {
  message: "Phần trăm giảm không được vượt quá 100%",
  path: ["giaTriGiam"]
}).refine((data) => {
  if (data.loaiKhuyenMai === "GiamPhanTram" && (data.giamToiDa === null || data.giamToiDa === undefined)) {
    return false
  }
  return true
}, {
  message: "Giảm tối đa là bắt buộc khi loại khuyến mãi là giảm theo phần trăm",
  path: ["giamToiDa"]
})

export type DiscountFormData = z.infer<typeof discountSchema>

interface DiscountFormProps {
  defaultValues?: Partial<DiscountFormData>
  userTypes: Array<{ maLoaiNguoiDung: string; tenLoaiNguoiDung: string }>
  onSubmit: (data: DiscountFormData) => Promise<void>
  onCancel: () => void
}

export const DiscountForm = ({
  defaultValues,
  userTypes,
  onSubmit,
}: DiscountFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      tenKhuyenMai: defaultValues?.tenKhuyenMai || "",
      loaiKhuyenMai: defaultValues?.loaiKhuyenMai || "GiamTien",
      giaTriGiam: defaultValues?.giaTriGiam || 0,
      giamToiDa: defaultValues?.giamToiDa || null,
      donHangToiThieu: defaultValues?.donHangToiThieu,
      maLoaiNguoiDung: defaultValues?.maLoaiNguoiDung || null,
      soLuong: defaultValues?.soLuong || null,
      ngayBatDau: defaultValues?.ngayBatDau || "",
      ngayKetThuc: defaultValues?.ngayKetThuc || "",
      moTa: defaultValues?.moTa || null
    }
  })

  const loaiKhuyenMai = watch("loaiKhuyenMai")

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2 py-4" id="discount-form">
        <div className="space-y-5">
          <div>
            <Label htmlFor="tenKhuyenMai">Tên khuyến mãi <span className="text-red-600">*</span></Label>
            <Input
              id="tenKhuyenMai"
              placeholder="Nhập tên khuyến mãi"
              {...register("tenKhuyenMai")}
            />
            {errors.tenKhuyenMai && <p className="text-sm text-red-600 mt-1">{errors.tenKhuyenMai.message}</p>}
          </div>

          <div>
            <Label htmlFor="loaiKhuyenMai">Loại khuyến mãi <span className="text-red-600">*</span></Label>
            <Controller
              name="loaiKhuyenMai"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại khuyến mãi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GiamPhanTram">Giảm theo phần trăm (%)</SelectItem>
                    <SelectItem value="GiamTien">Giảm theo số tiền (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.loaiKhuyenMai && <p className="text-sm text-red-600 mt-1">{errors.loaiKhuyenMai.message}</p>}
          </div>

          <div>
            <Label htmlFor="giaTriGiam">
              {loaiKhuyenMai === "GiamPhanTram" ? "Phần trăm giảm (%)" : "Số tiền giảm (VNĐ)"} 
              <span className="text-red-600">*</span>
            </Label>
            <Input
              id="giaTriGiam"
              type="number"
              placeholder={loaiKhuyenMai === "GiamPhanTram" ? "Nhập % giảm (0-100)" : "Nhập số tiền giảm"}
              {...register("giaTriGiam", { valueAsNumber: true, setValueAs: v => v === "" ? NaN : v })}
            />
            {errors.giaTriGiam && <p className="text-sm text-red-600 mt-1">{errors.giaTriGiam.message}</p>}
          </div>

          {loaiKhuyenMai === "GiamPhanTram" && (
            <div>
              <Label htmlFor="giamToiDa">Giảm tối đa (VNĐ)</Label>
              <Input
                id="giamToiDa"
                type="number"
                placeholder="Nhập số tiền giảm tối đa"
                {...register("giamToiDa", { valueAsNumber: true, setValueAs: v => v === "" ? NaN : v })}
              />
              {errors.giamToiDa && <p className="text-sm text-red-600 mt-1">{errors.giamToiDa.message}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="donHangToiThieu">Đơn hàng tối thiểu (VNĐ)</Label>
            <Input
              id="donHangToiThieu"
              type="number"
              placeholder="Nhập giá trị đơn hàng tối thiểu"
              {...register("donHangToiThieu", { valueAsNumber: true, setValueAs: v => v === "" ? NaN : v })}
            />
            {errors.donHangToiThieu && <p className="text-sm text-red-600 mt-1">{errors.donHangToiThieu.message}</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="soLuong">Số lượng <span className="text-red-600">*</span></Label>
            <Input
              id="soLuong"
              type="number"
              placeholder="Nhập số lượng mã (để trống nếu không giới hạn)"
              {...register("soLuong", { valueAsNumber: true, setValueAs: v => v === "" ? NaN : v })}
            />
            {errors.soLuong && <p className="text-sm text-red-600 mt-1">{errors.soLuong.message}</p>}
          </div>
          <div>
            <Label htmlFor="maLoaiNguoiDung">Đối tượng áp dụng</Label>
            <Controller
              name="maLoaiNguoiDung"
              control={control}
              render={({ field }) => (
                <Select value={field.value || "all"} onValueChange={(val) => field.onChange(val === "all" ? null : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đối tượng áp dụng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khách hàng</SelectItem>
                    {userTypes
                      .filter(ut => ut.maLoaiNguoiDung !== "NV" && ut.maLoaiNguoiDung !== "ADMIN")
                      .map(type => (
                      <SelectItem key={type.maLoaiNguoiDung} value={type.maLoaiNguoiDung}>
                        {type.tenLoaiNguoiDung}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.maLoaiNguoiDung && <p className="text-sm text-red-600 mt-1">{errors.maLoaiNguoiDung.message}</p>}
          </div>

          <div>
            <Label htmlFor="ngayBatDau">Ngày bắt đầu <span className="text-red-600">*</span></Label>
            <Input
              id="ngayBatDau"
              type="date"
              {...register("ngayBatDau")}
            />
            {errors.ngayBatDau && <p className="text-sm text-red-600 mt-1">{errors.ngayBatDau.message}</p>}
          </div>

          <div>
            <Label htmlFor="ngayKetThuc">Ngày kết thúc <span className="text-red-600">*</span></Label>
            <Input
              id="ngayKetThuc"
              type="date"
              {...register("ngayKetThuc")}
            />
            {errors.ngayKetThuc && <p className="text-sm text-red-600 mt-1">{errors.ngayKetThuc.message}</p>}
          </div>

          <div>
            <Label htmlFor="moTa">Mô tả</Label>
            <Textarea
              id="moTa"
              placeholder="Nhập mô tả chi tiết về chương trình khuyến mãi"
              rows={6}
              {...register("moTa")}
            />
            {errors.moTa && <p className="text-sm text-red-600 mt-1">{errors.moTa.message}</p>}
          </div>
        </div>
      </form>
    </>
  )
}