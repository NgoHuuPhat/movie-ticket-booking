import React, { useState, useEffect } from "react"
import { Search, Plus, Edit3, Trash2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AdminLayout from "@/components/layout/AdminLayout"
import {
  getSeatTypesAdmin,
  createSeatTypeAdmin,
  updateSeatTypeAdmin,
  deleteSeatTypeAdmin,
} from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { z } from "zod"

interface ISeatType {
  maLoaiGhe: string
  tenLoaiGhe: string
  moTa: string
}

const seatTypeSchema = z.object({
  tenLoaiGhe: z.string().min(1, "Tên loại ghế không được để trống").trim(),
  moTa: z.string().optional(),
})
  
type SeatTypeFormData = z.infer<typeof seatTypeSchema>

const ManageSeatTypesPage: React.FC = () => {
  const [seatTypes, setSeatTypes] = useState<ISeatType[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedSeatType, setSelectedSeatType] = useState<ISeatType | null>(null)

  const form = useForm<SeatTypeFormData>({
    resolver: zodResolver(seatTypeSchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const fetchSeatTypes = async () => {
      try {
        const res = await getSeatTypesAdmin(searchQuery || undefined)
        setSeatTypes(res)
      } catch (error) {
        toast.error("Không thể tải danh sách loại ghế")
        console.error(error)
      } 
    }

    fetchSeatTypes()
  }, [searchQuery])

  const resetFormAndClose = () => {
    form.reset({ tenLoaiGhe: "", moTa: "" })
    setSelectedSeatType(null)
    setIsAddOpen(false)
    setIsEditOpen(false)
  }

  const handleCreate = async (data: SeatTypeFormData) => {
    try {
      const res = await createSeatTypeAdmin(data.tenLoaiGhe, data.moTa)
      setSeatTypes(prev => [...prev, res.category])
      toast.success(res.message)
      resetFormAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleUpdate = async (data: SeatTypeFormData) => {
    if (!selectedSeatType) return

    try {
      const res = await updateSeatTypeAdmin(selectedSeatType.maLoaiGhe, data.tenLoaiGhe, data.moTa)
      setSeatTypes(prev => prev.map(item => item.maLoaiGhe === res.category.maLoaiGhe ? res.category : item))
      toast.success(res.message)
      resetFormAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleDelete = async () => {
    if (!selectedSeatType) return

    try {
      const res = await deleteSeatTypeAdmin(selectedSeatType.maLoaiGhe)
      setSeatTypes(prev => prev.filter(item => item.maLoaiGhe !== selectedSeatType.maLoaiGhe))
      toast.success(res.message)
      setIsDeleteOpen(false)
      setSelectedSeatType(null)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const openAddModal = () => {
    setSelectedSeatType(null)
    form.reset({ tenLoaiGhe: "", moTa: "" })
    setIsAddOpen(true)
  }

  const openEditModal = (seatType: ISeatType) => {
    setSelectedSeatType(seatType)
    form.reset({
      tenLoaiGhe: seatType.tenLoaiGhe,
      moTa: seatType.moTa,
    })
    setIsEditOpen(true)
  }

  const openDeleteModal = (seatType: ISeatType) => {
    setSelectedSeatType(seatType)
    setIsDeleteOpen(true)
  }

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Quản Lý Loại Ghế
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Thêm, sửa, xóa các loại ghế trong rạp (Thường, VIP, Sweetbox, Couple,...)
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Loại Ghế
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm loại ghế hoặc mô tả..."
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
            <CardTitle>Danh Sách Loại Ghế</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-32">Mã ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên loại ghế</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Mô tả</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600 w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  { seatTypes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500">
                        {searchQuery ? "Không tìm thấy loại ghế nào" : "Chưa có loại ghế nào"}
                      </td>
                    </tr>
                  ) : (
                    seatTypes.map((item) => (
                      <tr key={item.maLoaiGhe} className="border-b hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-sm">{item.maLoaiGhe}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-sm font-medium">
                            {item.tenLoaiGhe}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-700 max-w-md">
                          {item.moTa || <span className="text-gray-400">Chưa có mô tả</span>}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(item)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteModal(item)}
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

        {/* Modal Thêm */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Loại Ghế Mới</DialogTitle>
              <DialogDescription>Nhập thông tin loại ghế mới.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Tên loại ghế</Label>
                <Input
                  id="add-name"
                  {...form.register("tenLoaiGhe")}
                  placeholder="VIP"
                  autoFocus
                />
                {form.formState.errors.tenLoaiGhe && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tenLoaiGhe.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-desc">Mô tả</Label>
                <Textarea
                  id="add-desc"
                  {...form.register("moTa")}
                  placeholder="Ghế VIP có không gian rộng rãi, tựa lưng êm ái, vị trí đẹp..."
                  rows={4}
                />
                {form.formState.errors.moTa && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.moTa.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetFormAndClose}>
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

        {/* Modal Sửa */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sửa Loại Ghế</DialogTitle>
              <DialogDescription>Cập nhật thông tin loại ghế.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên loại ghế</Label>
                <Input
                  id="edit-name"
                  {...form.register("tenLoaiGhe")}
                  autoFocus
                />
                {form.formState.errors.tenLoaiGhe && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tenLoaiGhe.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Mô tả</Label>
                <Textarea
                  id="edit-desc"
                  {...form.register("moTa")}
                  rows={4}
                />
                {form.formState.errors.moTa && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.moTa.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetFormAndClose}>
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

        {/* Modal Xóa */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa Loại Ghế</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa loại ghế này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedSeatType && (
              <div className="py-4">
                <p className="text-lg font-medium">{selectedSeatType.tenLoaiGhe}</p>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedSeatType.maLoaiGhe}</p>
                {selectedSeatType.moTa && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{selectedSeatType.moTa}"</p>
                )}
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

export default ManageSeatTypesPage