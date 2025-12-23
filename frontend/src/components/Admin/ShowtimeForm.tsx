// components/Admin/ShowtimeForm.tsx
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Loader2, Save } from "lucide-react"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/utils/formatDate"

const schema = z.object({
  maPhim: z.string().min(1, "Vui lòng chọn phim"),
  maPhong: z.string().min(1, "Vui lòng chọn phòng"),
  gioBatDau: z.string().min(1, "Vui lòng nhập giờ bắt đầu"),
  gioKetThuc: z.string().min(1, "Vui lòng nhập giờ kết thúc"),
}).refine(data => new Date(data.gioBatDau) < new Date(data.gioKetThuc), {
  message: "Giờ kết thúc phải sau giờ bắt đầu",
  path: ["gioKetThuc"]
})

export type ShowtimeFormData = z.infer<typeof schema>

interface Props {
  movies: Array<{ maPhim: string; tenPhim: string, ngayKhoiChieu: string, ngayKetThuc: string }>
  rooms: Array<{ maPhong: string; tenPhong: string }>
  defaultValues?: Partial<ShowtimeFormData>
  onSubmit: (data: ShowtimeFormData) => Promise<void>
  submitting: boolean
  isEditMode?: boolean  
}

export const ShowtimeForm = ({ 
  movies, 
  rooms, 
  defaultValues, 
  onSubmit, 
  submitting,
  isEditMode = false 
}: Props) => {

  const { control, handleSubmit, watch, formState: { errors } } = useForm<ShowtimeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      maPhim: defaultValues?.maPhim || "",
      maPhong: defaultValues?.maPhong || "",
      gioBatDau: defaultValues?.gioBatDau || "",
      gioKetThuc: defaultValues?.gioKetThuc || "",
    }
  })

  console.log(movies)

  const selectedMaPhim = watch("maPhim")
  const selectedMovie = movies.find(m => m.maPhim === selectedMaPhim)
  const currentMovie = defaultValues?.maPhim 
    ? movies.find(m => m.maPhim === defaultValues.maPhim)
    : null
  const currentRoom = defaultValues?.maPhong 
    ? rooms.find(r => r.maPhong === defaultValues.maPhong)
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Phim */}
        <div>
          <Label>Phim <span className="text-red-600">*</span></Label>
          <Controller
            name="maPhim"
            control={control}
            render={({ field }) => (
              isEditMode && currentMovie ? (
                <>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm py-2 px-3">
                      {currentMovie.tenPhim}
                    </Badge>
                  </div>
                </>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phim" />
                  </SelectTrigger>
                  <SelectContent>
                    {movies.map(m => (
                      <SelectItem key={m.maPhim} value={m.maPhim}>
                        {m.tenPhim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            )}
          />
          {errors.maPhim && !isEditMode && (
            <p className="text-sm text-red-600 mt-1">{errors.maPhim.message}</p>
          )}
        </div>

        {/* Phòng chiếu */}
        <div>
          <Label>Phòng chiếu <span className="text-red-600">*</span></Label>
          <Controller
            name="maPhong"
            control={control}
            render={({ field }) => (
              isEditMode && currentRoom ? (
                <>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm py-2 px-3">
                      {currentRoom.tenPhong}
                    </Badge>
                  </div>
                </>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => (
                      <SelectItem key={r.maPhong} value={r.maPhong}>
                        {r.tenPhong}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            )}
          />
          {errors.maPhong && !isEditMode && (
            <p className="text-sm text-red-600 mt-1">{errors.maPhong.message}</p>
          )}
        </div>
      </div>
      {selectedMovie?.ngayKetThuc && (
        <div className="flex gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span>Ngày khởi chiếu: <span className="font-semibold text-red-600">{formatDate(selectedMovie.ngayKhoiChieu, "dd/MM/yyyy")}</span></span>
          <span>- Ngày kết thúc: <span className="font-semibold text-red-600">{formatDate(selectedMovie.ngayKetThuc, "dd/MM/yyyy")}</span></span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gioBatDau">Giờ bắt đầu <span className="text-red-600">*</span></Label>
          <Controller
            name="gioBatDau"
            control={control}
            render={({ field }) => (
              <Input type="datetime-local" {...field} />
            )}
          />
          {errors.gioBatDau && <p className="text-sm text-red-600 mt-1">{errors.gioBatDau.message}</p>}
        </div>

        <div>
          <Label htmlFor="gioKetThuc">Giờ kết thúc <span className="text-red-600">*</span></Label>
          <Controller
            name="gioKetThuc"
            control={control}
            render={({ field }) => (
              <Input type="datetime-local" {...field} />
            )}
          />
          {errors.gioKetThuc && <p className="text-sm text-red-600 mt-1">{errors.gioKetThuc.message}</p>}
        </div>
      </div>

      {/* Nút lưu */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? "Cập nhật thời gian" : "Tạo suất chiếu"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}