import type { IShift } from "@/types/shift"
import type { IStaff } from "@/types/staff"

export interface IWorkSchedule {
  maNhanVien: string
  maCaLam: string
  ngayLam: string
  viTriLam: string
  nguoiDung: IStaff
  caLam: IShift
}
