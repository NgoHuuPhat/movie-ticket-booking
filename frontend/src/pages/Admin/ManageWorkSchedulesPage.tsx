import { useState, useEffect } from "react"
import {
  Search, Plus, MoreVertical, Edit3, Trash2, Loader2,
  Calendar, User, Clock, MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { WorkScheduleForm, type WorkScheduleFormData } from "@/components/Admin/WorkScheduleForm"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { getAllWorkSchedulesAdmin, createWorkScheduleAdmin, updateWorkScheduleAdmin, deleteWorkScheduleAdmin, getAllShiftsAdmin, getAllUsersAdmin, } from "@/services/api"
import { viTriLam } from "@/constants/position"
import { formatDate, formatTime } from "@/utils/formatDate"

interface IStaff {
  maNguoiDung: string
  hoTen: string
}

interface IShift {
  maCaLam: string
  tenCaLam: string
  gioBatDau: string
  gioKetThuc: string
}

interface IWorkSchedule {
  maNhanVien: string
  maCaLam: string
  ngayLam: string
  viTriLam: string
  nguoiDung: IStaff
  caLam: IShift
}

const ManageWorkSchedulesPage = () => {
  const [workSchedules, setWorkSchedules] = useState<IWorkSchedule[]>([])
  const [employees, setEmployees] = useState<IStaff[]>([])
  const [shifts, setShifts] = useState<IShift[]>([])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<IWorkSchedule | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [shiftFilter, setShiftFilter] = useState<string>("all")
  const [positionFilter, setPositionFilter] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSchedules, setTotalSchedules] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  // Load shifts and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shiftsRes, usersRes] = await Promise.all([
          getAllShiftsAdmin(),
          getAllUsersAdmin({ maLoaiNguoiDung: "NV" })
        ])

        setShifts(shiftsRes)
        setEmployees(usersRes.users)
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error)
        toast.error(handleError(error))
      }
    }
    fetchData()
  }, [])

  // Load work schedules
  useEffect(() => {
    const fetchWorkSchedules = async () => {
      try {
        const res = await getAllWorkSchedulesAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          ngayLam: dateFilter || undefined,
          maCaLam: shiftFilter === "all" ? undefined : shiftFilter,
          viTriLam: positionFilter === "all" ? undefined : positionFilter,
        })

        setWorkSchedules(res.workSchedules)
        setTotalSchedules(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchWorkSchedules()
  }, [currentPage, searchQuery, dateFilter, shiftFilter, positionFilter])

  const handleSubmitCreate = async (data: WorkScheduleFormData) => {
    setSubmitting(true)
    try {
      const res = await createWorkScheduleAdmin(
        data.maNhanVien,
        data.maCaLam,
        data.ngayLam,
        data.viTriLam
      )
      setWorkSchedules(prev => [res.newWorkSchedule, ...prev])

      setIsAddDialogOpen(false)
      toast.success(res.message)
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitUpdate = async (data: WorkScheduleFormData) => {
    if (!selectedSchedule) return
    setSubmitting(true)
    try {
      const res = await updateWorkScheduleAdmin(
        selectedSchedule.maNhanVien,
        selectedSchedule.maCaLam,
        selectedSchedule.ngayLam,
        data.viTriLam
      )

      setWorkSchedules(prev => 
        prev.map(ws => 
          ws.maNhanVien === res.updatedWorkSchedule.maNhanVien && 
          ws.ngayLam === selectedSchedule.ngayLam ? res.updatedWorkSchedule : ws
        )
      )

      setIsEditDialogOpen(false)
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedSchedule) return
    setSubmitting(true)
    try {
      const res = await deleteWorkScheduleAdmin(
        selectedSchedule.maNhanVien,
        selectedSchedule.maCaLam,
        selectedSchedule.ngayLam
      )
      
      setWorkSchedules(prev => 
        prev.filter(ws => 
          ws.maNhanVien !== selectedSchedule.maNhanVien || 
          ws.ngayLam !== selectedSchedule.ngayLam
        )
      )
      setIsDeleteDialogOpen(false)
      setSelectedSchedule(null)
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Lịch Làm Việc</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Quản lý lịch làm việc của nhân viên
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className=" h-4 w-4" /> Thêm Lịch Mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên nhân viên..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-40"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={shiftFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                    >
                      <Clock className=" h-4 w-4" />
                      Ca làm
                      {shiftFilter !== "all" && (
                        <span >
                          ({shifts.find(s => s.maCaLam === shiftFilter)?.tenCaLam})
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setShiftFilter("all"); setCurrentPage(1); }}>
                      Tất cả
                    </DropdownMenuItem>
                    {shifts.map((shift) => (
                      <DropdownMenuItem
                        key={shift.maCaLam}
                        onClick={() => { setShiftFilter(shift.maCaLam); setCurrentPage(1); }}
                      >
                        {shift.tenCaLam}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={positionFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                    >
                      <MapPin className=" h-4 w-4" />
                      Vị trí
                      {positionFilter !== "all" && <span >({viTriLam[positionFilter]})</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setPositionFilter("all"); setCurrentPage(1); }}>
                      Tất cả
                    </DropdownMenuItem>
                    {Object.entries(viTriLam).map(([key, value]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => { setPositionFilter(key); setCurrentPage(1); }}
                      >
                        {value}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Lịch Làm Việc</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Nhân viên</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ca làm</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày làm</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Vị trí</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Thời gian</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {workSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        Không tìm thấy lịch làm việc nào
                      </td>
                    </tr>
                  ) : (
                    workSchedules.map((schedule) => (
                      <tr key={`${schedule.maNhanVien}-${schedule.maCaLam}-${schedule.ngayLam}`} className="border-b text-sm hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{schedule.nguoiDung.hoTen}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {schedule.caLam.tenCaLam}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(schedule.ngayLam)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            {viTriLam[schedule.viTriLam]}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {formatTime(schedule.caLam.gioBatDau)} - {formatTime(schedule.caLam.gioKetThuc)}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedSchedule(schedule)
                                setIsEditDialogOpen(true)
                              }}>
                                <Edit3 className=" h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedSchedule(schedule)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className=" h-4 w-4" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="mt-6">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalSchedules}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Dialog Thêm */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="md:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Thêm Lịch Làm Việc Mới</DialogTitle>
              <DialogDescription>
                Nhập đầy đủ thông tin để thêm lịch làm việc mới.
              </DialogDescription>
            </DialogHeader>
            <WorkScheduleForm
              employees={employees}
              shifts={shifts}
              positions={Object.entries(viTriLam)}
              onSubmit={handleSubmitCreate}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>


        {/* Dialog Sửa */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="md:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Sửa Lịch Làm Việc</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin lịch làm việc.
              </DialogDescription>
            </DialogHeader>
            <WorkScheduleForm
              defaultValues={
                selectedSchedule ? {
                  maNhanVien: selectedSchedule.maNhanVien,
                  maCaLam: selectedSchedule.maCaLam,
                  ngayLam: new Date(selectedSchedule.ngayLam).toISOString().split('T')[0],
                  viTriLam: selectedSchedule.viTriLam,
                } : undefined
              }
              employees={employees}
              shifts={shifts}
              positions={Object.entries(viTriLam)}
              onSubmit={handleSubmitUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Xóa */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="md:max-w-xl">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa lịch làm việc này? Hành động không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedSchedule && (
              <div className="py-4 bg-red-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">{selectedSchedule.nguoiDung.hoTen}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Ca làm: {selectedSchedule.caLam.tenCaLam}</p>
                  <p>Ngày: {formatDate(selectedSchedule.ngayLam)}</p>
                  <p>Vị trí: {viTriLam[selectedSchedule.viTriLam]}</p>
                  <p>Giờ: {formatTime(selectedSchedule.caLam.gioBatDau)} - {formatTime(selectedSchedule.caLam.gioKetThuc)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className=" h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa lịch"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageWorkSchedulesPage