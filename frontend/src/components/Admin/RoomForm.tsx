import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"

const roomSchema = z.object({
  tenPhong: z.string().min(1, "Tên phòng không được để trống"),
  maLoaiPhong: z.string().min(1, "Vui lòng chọn loại phòng"),
})

export type RoomFormData = z.infer<typeof roomSchema>

interface RoomFormProps {
  defaultValues?: Partial<RoomFormData>
  roomTypes: Array<{ maLoaiPhong: string; tenLoaiPhong: string }>
  onSubmit: (data: RoomFormData) => Promise<void>
  onCancel: () => void
}

export const RoomForm = ({
  defaultValues = {
    tenPhong: "",
    maLoaiPhong: "",
  },
  roomTypes,
  onSubmit,
}: RoomFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="room-form">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="tenPhong">Tên phòng <span className="text-red-600">*</span></Label>
          <Input
            id="tenPhong"
            placeholder="Ví dụ: Phòng 1, Phòng VIP..."
            {...register("tenPhong")}
          />
          {errors.tenPhong && <p className="text-sm text-red-600 mt-1">{errors.tenPhong.message}</p>}
        </div>

        <div>
          <Label htmlFor="maLoaiPhong">Loại phòng <span className="text-red-600">*</span></Label>
          <Controller
            name="maLoaiPhong"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.maLoaiPhong} value={type.maLoaiPhong}>
                      {type.tenLoaiPhong}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.maLoaiPhong && (
            <p className="text-sm text-red-600 mt-1">{errors.maLoaiPhong.message}</p>
          )}
        </div>
      </div>
    </form>
  )
}