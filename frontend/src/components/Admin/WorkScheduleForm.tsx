import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatTime } from "@/utils/formatDate"

const workScheduleSchema = z.object({
  maNhanVien: z.string().min(1, "Vui lòng chọn nhân viên"),
  maCaLam: z.string().min(1, "Vui lòng chọn ca làm"),
  ngayLam: z.string().min(1, "Vui lòng chọn ngày làm"),
  viTriLam: z.string().min(1, "Vui lòng chọn vị trí làm việc"),
})

export type WorkScheduleFormData = z.infer<typeof workScheduleSchema>

interface WorkScheduleFormProps {
  defaultValues?: Partial<WorkScheduleFormData>
  employees: Array<{ maNguoiDung: string; hoTen: string }>
  shifts: Array<{ maCaLam: string; tenCaLam: string; gioBatDau: string; gioKetThuc: string }>
  positions: [string, string][]
  onSubmit: (data: WorkScheduleFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export const WorkScheduleForm = ({
  defaultValues,
  employees,
  shifts,
  positions,
  onSubmit,
  onCancel,
  isEdit = false,
}: WorkScheduleFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<WorkScheduleFormData>({
    resolver: zodResolver(workScheduleSchema),
    defaultValues: {
      maNhanVien: defaultValues?.maNhanVien || "",
      maCaLam: defaultValues?.maCaLam || "",
      ngayLam: defaultValues?.ngayLam || "",
      viTriLam: defaultValues?.viTriLam || "",
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <Label>Nhân viên <span className="text-red-600">*</span></Label>
            <Select
              onValueChange={val => setValue("maNhanVien", val)}
              defaultValue={defaultValues?.maNhanVien}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.maNguoiDung} value={emp.maNguoiDung}>
                    {emp.hoTen}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maNhanVien && <p className="text-sm text-red-600 mt-1">{errors.maNhanVien.message}</p>}
          </div>

          <div>
            <Label>Ca làm <span className="text-red-600">*</span></Label>
            <Select
              onValueChange={val => setValue("maCaLam", val)}
              defaultValue={defaultValues?.maCaLam}
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn ca làm" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map(shift => (
                  <SelectItem key={shift.maCaLam} value={shift.maCaLam}>
                    {shift.tenCaLam} ({formatTime(shift.gioBatDau)} - {formatTime(shift.gioKetThuc)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maCaLam && <p className="text-sm text-red-600 mt-1">{errors.maCaLam.message}</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label>Ngày làm <span className="text-red-600">*</span></Label>
            <Input
              type="date"
              {...register("ngayLam")}
              disabled={isEdit}
            />
            {errors.ngayLam && <p className="text-sm text-red-600 mt-1">{errors.ngayLam.message}</p>}
          </div>

          <div>
            <Label>Vị trí làm việc <span className="text-red-600">*</span></Label>
            <Select
              onValueChange={val => setValue("viTriLam", val)}
              defaultValue={defaultValues?.viTriLam}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vị trí" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.viTriLam && <p className="text-sm text-red-600 mt-1">{errors.viTriLam.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : defaultValues ? "Cập nhật" : "Tạo lịch"}
        </Button>
      </div>
    </form>
  )
}

export default WorkScheduleForm