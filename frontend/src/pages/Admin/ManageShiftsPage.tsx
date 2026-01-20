import { useState, useEffect } from "react"
import { Search, Plus, Edit3, Trash2, Loader2, Save, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AdminLayout from "@/components/layout/AdminLayout"
import { getAllShiftsAdmin, createShiftAdmin, updateShiftAdmin, deleteShiftAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { z } from "zod"
import { formatTime } from "@/utils/formatDate"
import type { IShift } from "@/types/shift"

const shiftSchema = z.object({
  tenCaLam: z.string()
    .min(1, "Tên ca làm không được để trống")
    .max(100, "Tên ca làm không được quá 100 ký tự")
    .trim(),
  gioBatDau: z.string().min(1, "Giờ bắt đầu không được để trống"),
  gioKetThuc: z.string().min(1, "Giờ kết thúc không được để trống"),
}).refine(data => {
  const [startH, startM] = data.gioBatDau.split(":").map(Number)
  const [endH, endM] = data.gioKetThuc.split(":").map(Number)
  return endH * 60 + endM > startH * 60 + startM
}, {
  message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
  path: ["gioKetThuc"]
})
type ShiftFormData = z.infer<typeof shiftSchema>

const ManageShiftsPage = () => {
  const [shifts, setShifts] = useState<IShift[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<IShift | null>(null)

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await getAllShiftsAdmin(searchQuery)
        setShifts(res)
      } catch (error) {
        toast.error(handleError(error))
        console.error(error)
      }
    }
    
    fetchShifts()
  }, [searchQuery])

  const resetAndClose = () => {
    form.reset()
    setSelectedShift(null)
    setIsAddOpen(false)
    setIsEditOpen(false)
  }

  const handleAdd = async (data: ShiftFormData) => {
    try {
      const res = await createShiftAdmin(data.tenCaLam, data.gioBatDau, data.gioKetThuc)
      setShifts(prev => [res.newShift, ...prev])
      
      toast.success(res.message)
      resetAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleEdit = async (data: ShiftFormData) => {
    if (!selectedShift) return

    try {
      const res = await updateShiftAdmin(selectedShift.maCaLam, data.tenCaLam, data.gioBatDau, data.gioKetThuc)
      setShifts(prev =>
        prev.map(shift => (shift.maCaLam === res.updatedShift.maCaLam ? res.updatedShift : shift))
      )

      toast.success(res.message)
      resetAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleDelete = async () => {
    if (!selectedShift) return

    try {
      const res = await deleteShiftAdmin(selectedShift.maCaLam)
      setShifts(prev => prev.filter(shift => shift.maCaLam !== selectedShift.maCaLam))
      
      toast.success(res.message)
      setIsDeleteOpen(false)
      setSelectedShift(null)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const openEditModal = (shift: IShift) => {
    setSelectedShift(shift)
    form.reset({ 
      tenCaLam: shift.tenCaLam,
      gioBatDau: formatTime(shift.gioBatDau),
      gioKetThuc: formatTime(shift.gioKetThuc)
    })
    setIsEditOpen(true)
  }

  const openDeleteModal = (shift: IShift) => {
    setSelectedShift(shift)
    setIsDeleteOpen(true)
  }

  const openAddModal = () => {
    form.reset({ tenCaLam: "", gioBatDau: "", gioKetThuc: "" })
    setIsAddOpen(true)
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Ca Làm</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Thêm, sửa, xóa các ca làm việc trong hệ thống
              </p>
            </div>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Ca Làm Mới
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm ca làm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Ca Làm</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Mã ca làm</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Tên ca làm</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Giờ bắt đầu</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Giờ kết thúc</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  { shifts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        {searchQuery ? "Không tìm thấy ca làm nào" : "Chưa có ca làm nào"}
                      </td>
                    </tr>
                  ) : (
                    shifts.map((shift) => (
                      <tr key={shift.maCaLam} className="border-b hover:bg-purple-50/30 transition-colors text-sm">
                        <td className="p-4 font-medium text-gray-800">{shift.maCaLam}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-sm bg-purple-100 text-purple-800">
                            {shift.tenCaLam}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-700">{formatTime(shift.gioBatDau)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-700">{formatTime(shift.gioKetThuc)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => openEditModal(shift)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteModal(shift)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Thêm Ca Làm */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Ca Làm Mới</DialogTitle>
              <DialogDescription>Nhập thông tin ca làm mới.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAdd)}>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="add-tenCaLam">Tên ca làm <span className="text-red-500">*</span></Label>
                  <Input
                    id="add-tenCaLam"
                    {...form.register("tenCaLam")}
                    placeholder="Ví dụ: Ca sáng, Ca chiều, Ca tối..."
                    autoFocus
                  />
                  {form.formState.errors.tenCaLam && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tenCaLam.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="add-gioBatDau">Giờ bắt đầu <span className="text-red-500">*</span></Label>
                  <Input
                    id="add-gioBatDau"
                    type="time"
                    {...form.register("gioBatDau")}
                  />
                  {form.formState.errors.gioBatDau && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gioBatDau.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="add-gioKetThuc">Giờ kết thúc <span className="text-red-500">*</span></Label>
                  <Input
                    id="add-gioKetThuc"
                    type="time"
                    {...form.register("gioKetThuc")}
                  />
                  {form.formState.errors.gioKetThuc && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gioKetThuc.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetAndClose} disabled={form.formState.isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Thêm
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Sửa Ca Làm */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader className="p-0">
              <DialogTitle>Sửa Ca Làm</DialogTitle>
              <DialogDescription>Cập nhật thông tin ca làm.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleEdit)}>
              <div className="pt-4 pb-10 space-y-4">
                {selectedShift && (
                  <div>
                    <p className="text-sm text-gray-600">Mã ca làm</p>
                    <p className="font-medium">{selectedShift.maCaLam}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="edit-tenCaLam">Tên ca làm <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-tenCaLam"
                    {...form.register("tenCaLam")}
                    autoFocus
                  />
                  {form.formState.errors.tenCaLam && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tenCaLam.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-gioBatDau">Giờ bắt đầu <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-gioBatDau"
                    type="time"
                    {...form.register("gioBatDau")}
                  />
                  {form.formState.errors.gioBatDau && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gioBatDau.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-gioKetThuc">Giờ kết thúc <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-gioKetThuc"
                    type="time"
                    {...form.register("gioKetThuc")}
                  />
                  {form.formState.errors.gioKetThuc && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gioKetThuc.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetAndClose} disabled={form.formState.isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Cập nhật
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Xóa Ca Làm */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa Ca Làm</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa ca làm này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedShift && (
              <div className="py-4 space-y-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-semibold text-lg">{selectedShift.tenCaLam}</p>
                  <p className="text-sm text-gray-600 mt-1">Mã: {selectedShift.maCaLam}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {formatTime(selectedShift.gioBatDau)} - {formatTime(selectedShift.gioKetThuc)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageShiftsPage