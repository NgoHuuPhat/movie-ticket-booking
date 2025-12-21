import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ngonNgu } from "@/constants/language"
import { phienBan } from "@/constants/version"
import { z } from "zod"

const movieSchema = z.object({
  tenPhim: z.string().min(1, "Tên phim không được để trống"),
  moTa: z.string().min(1, "Mô tả không được để trống"),
  anhBia: z.instanceof(File, { message: "Vui lòng chọn ảnh bìa phim" }).nullable(),
  ngayKhoiChieu: z.string().min(1, "Ngày khởi chiếu không được để trống"),
  ngayKetThuc: z.string().min(1, "Ngày kết thúc không được để trống"),
  thoiLuong: z.number().min(1, "Thời lượng phải lớn hơn 0"),
  quocGia: z.string().min(1, "Quốc gia không được để trống"),
  daoDien: z.string().min(1, "Đạo diễn không được để trống"),
  dienVien: z.string().min(1, "Diễn viên không được để trống"),
  trailerPhim: z.string().min(1, "Link trailer không được để trống"),
  maPhanLoaiDoTuoi: z.string().min(1, "Vui lòng chọn phân loại độ tuổi"),
  phienBan: z.string().min(1, "Vui lòng chọn phiên bản"),
  ngonNgu: z.string().min(1, "Vui lòng chọn ngôn ngữ"),
  maTheLoais: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một thể loại")
}).refine((data) => {
  const start = new Date(data.ngayKhoiChieu)
  const end = new Date(data.ngayKetThuc)
  return start <= end
}, {
  message: "Ngày kết thúc phải sau ngày khởi chiếu",
  path: ["ngayKetThuc"]
})

export type MovieFormData = z.infer<typeof movieSchema>

interface MovieFormProps {
  defaultValues?: Partial<MovieFormData>
  categories: Array<{ maTheLoai: string; tenTheLoai: string }>
  ageRatings: Array<{ maPhanLoaiDoTuoi: string; tenPhanLoaiDoTuoi: string; moTa: string }>
  onSubmit: (data: MovieFormData) => Promise<void>
  onCancel: () => void
}

export const MovieForm = ({
  defaultValues,
  categories,
  ageRatings,
  onSubmit,
}: MovieFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    mode: "onTouched",
    defaultValues: defaultValues
  })
 
  const selectedCategories = watch("maTheLoais") || []

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-2 py-4" id="movie-form">
      <div className="space-y-5">
        <div>
          <Label htmlFor="tenPhim">Tên phim <span className="text-red-600">*</span></Label>
          <Input
            id="tenPhim"
            placeholder="Nhập tên phim"
            {...register("tenPhim")}
          />
          {errors.tenPhim && <p className="text-sm text-red-600 mt-1">{errors.tenPhim.message}</p>}
        </div>

        <div>
          <Label htmlFor="daoDien">Đạo diễn <span className="text-red-600">*</span></Label>
          <Input
            id="daoDien"
            placeholder="Nhập tên đạo diễn"
            {...register("daoDien")}
          />
          {errors.daoDien && <p className="text-sm text-red-600 mt-1">{errors.daoDien.message}</p>}
        </div>

        <div>
          <Label htmlFor="dienVien">Diễn viên <span className="text-red-600">*</span></Label>
          <Input
            id="dienVien"
            placeholder="Nhập tên diễn viên (chia cách bởi dấu phẩy)"
            {...register("dienVien")}
          />
          {errors.dienVien && <p className="text-sm text-red-600 mt-1">{errors.dienVien.message}</p>}
        </div>

        <div>
          <Label htmlFor="ngayKhoiChieu">Ngày khởi chiếu <span className="text-red-600">*</span></Label>
          <Input
            id="ngayKhoiChieu"
            type="date"
            {...register("ngayKhoiChieu")}
          />
          {errors.ngayKhoiChieu && <p className="text-sm text-red-600 mt-1">{errors.ngayKhoiChieu.message}</p>}
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
          <Label htmlFor="thoiLuong">Thời lượng (phút) <span className="text-red-600">*</span></Label>
          <Input
            id="thoiLuong"
            type="number"
            {...register("thoiLuong", { valueAsNumber: true })}
          />
          {errors.thoiLuong && <p className="text-sm text-red-600 mt-1">{errors.thoiLuong.message}</p>}
        </div>

        <div>
          <Label htmlFor="quocGia">Quốc gia <span className="text-red-600">*</span></Label>
          <Input
            id="quocGia"
            placeholder="Nhập quốc gia"
            {...register("quocGia")}
          />
          {errors.quocGia && <p className="text-sm text-red-600 mt-1">{errors.quocGia.message}</p>}
        </div>

        <div>
          <Label htmlFor="moTa">Mô tả <span className="text-red-600">*</span></Label>
          <Textarea
            id="moTa"
            placeholder="Nhập mô tả phim"
            rows={4}
            {...register("moTa")}
          />
          {errors.moTa && <p className="text-sm text-red-600 mt-1">{errors.moTa.message}</p>}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="anhBia">Ảnh bìa <span className="text-red-600">*</span></Label>
          <Input
            id="anhBia"
            type="file"
            accept="image/*"
            onChange={(e) => setValue("anhBia", e.target.files?.[0] || null)}
          />
          {errors.anhBia && <p className="text-sm text-red-600 mt-1">{errors.anhBia.message}</p>}
        </div>

        <div>
          <Label htmlFor="trailerPhim">Link trailer YouTube <span className="text-red-600">*</span></Label>
          <Input
            id="trailerPhim"
            placeholder="Nhập ID trailer YouTube"
            {...register("trailerPhim")}
          />
          {errors.trailerPhim && <p className="text-sm text-red-600 mt-1">{errors.trailerPhim.message}</p>}
        </div>

        <div>
          <Label htmlFor="maPhanLoaiDoTuoi">Phân loại độ tuổi <span className="text-red-600">*</span></Label>
          <Select
            value={watch("maPhanLoaiDoTuoi")}
            onValueChange={(value) => setValue("maPhanLoaiDoTuoi", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phân loại độ tuổi" />
            </SelectTrigger>
            <SelectContent>
              {ageRatings.map((rating) => (
                <SelectItem key={rating.maPhanLoaiDoTuoi} value={rating.maPhanLoaiDoTuoi}>
                  {rating.tenPhanLoaiDoTuoi} {rating.moTa && `- ${rating.moTa}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.maPhanLoaiDoTuoi && <p className="text-sm text-red-600 mt-1">{errors.maPhanLoaiDoTuoi.message}</p>}
        </div>

        <div>
          <Label htmlFor="phienBan">Phiên bản <span className="text-red-600">*</span></Label>
          <Select
            value={watch("phienBan")}
            onValueChange={(value) => setValue("phienBan", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phiên bản" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(phienBan).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.phienBan && <p className="text-sm text-red-600 mt-1">{errors.phienBan.message}</p>}
        </div>

        <div>
          <Label htmlFor="ngonNgu">Ngôn ngữ <span className="text-red-600">*</span></Label>
          <Select
            value={watch("ngonNgu")}
            onValueChange={(value) => setValue("ngonNgu", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn ngôn ngữ" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ngonNgu).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ngonNgu && <p className="text-sm text-red-600 mt-1">{errors.ngonNgu.message}</p>}
        </div>

        <div>
          <Label>Thể loại phim <span className="text-red-600">*</span></Label>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {categories.map((cat) => (
              <div key={cat.maTheLoai} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedCategories.includes(cat.maTheLoai)}
                  onCheckedChange={(checked) => {
                    const current = selectedCategories
                    setValue(
                      "maTheLoais",
                      checked
                        ? [...current, cat.maTheLoai]
                        : current.filter((id) => id !== cat.maTheLoai)
                    )
                  }}
                />
                <label className="text-sm">{cat.tenTheLoai}</label>
              </div>
            ))}
          </div>
          {errors.maTheLoais && <p className="text-sm text-red-600 mt-1">{errors.maTheLoais.message}</p>}
        </div>
      </div>
    </form>
  </>
  )
}