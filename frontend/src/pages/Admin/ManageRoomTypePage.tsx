import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, Edit3, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getAllRoomTypesAdmin, createRoomTypeAdmin, updateRoomTypeAdmin, deleteRoomTypeAdmin } from "@/services/api"
import AdminLayout from "@/components/layout/AdminLayout"
import { handleError } from "@/utils/handleError.utils"

const roomTypeSchema = z.object({
  tenLoaiPhong: z.string().min(1, "Tên loại phòng không được để trống").max(50, "Tên loại phòng không được vượt quá 50 ký tự").trim(),})

type RoomTypeForm = z.infer<typeof roomTypeSchema>

interface RoomType {
  maLoaiPhong: string
  tenLoaiPhong: string
}

const ManageRoomTypePage: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null)
  const [deletingRoomType, setDeletingRoomType] = useState<RoomType | null>(null)

  const form = useForm<RoomTypeForm>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      tenLoaiPhong: "",
    },
  })

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const data = await getAllRoomTypesAdmin(searchQuery)
        setRoomTypes(data)
      } catch (error) {
        toast.error(handleError(error))
      } 
    }
    fetchRoomTypes()
  }, [searchQuery])

  const resetFormAndClose = () => {
    form.reset({ tenLoaiPhong: "" })
    setEditingRoomType(null)
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
  }

  const handleCreate = async (data: RoomTypeForm) => {
    try {
      const res = await createRoomTypeAdmin(data.tenLoaiPhong)
      setRoomTypes((prev) => [...prev, res.roomType])
      toast.success(res.message || "Thêm loại phòng thành công!")
      resetFormAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleUpdate = async (data: RoomTypeForm) => {
    if (!editingRoomType) return

    try {
      const res = await updateRoomTypeAdmin(editingRoomType.maLoaiPhong, data.tenLoaiPhong)
      setRoomTypes((prev) =>
        prev.map((rt) =>
          rt.maLoaiPhong === editingRoomType.maLoaiPhong
            ? { ...rt, tenLoaiPhong: res.roomType.tenLoaiPhong }
            : rt
        )
      )
      toast.success(res.message || "Cập nhật loại phòng thành công!")
      resetFormAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const openCreateDialog = () => {
    setEditingRoomType(null)
    form.reset({ tenLoaiPhong: "" })
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (roomType: RoomType) => {
    setEditingRoomType(roomType)
    form.reset({ tenLoaiPhong: roomType.tenLoaiPhong })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (roomType: RoomType) => {
    setDeletingRoomType(roomType)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingRoomType) return

    try {
      const res = await deleteRoomTypeAdmin(deletingRoomType.maLoaiPhong)
      toast.success(res.message || "Xóa loại phòng thành công!")
      setRoomTypes((prev) => prev.filter((rt) => rt.maLoaiPhong !== deletingRoomType.maLoaiPhong))
      setIsDeleteOpen(false)
      setDeletingRoomType(null)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý loại phòng</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Quản lý danh sách các loại phòng trong hệ thống
              </p>
            </div>
            <Button onClick={() => { openCreateDialog() }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm loại phòng
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
              <Input
                placeholder="Tìm kiếm loại phòng..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách loại phòng</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="border-b bg-gray-100/50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Mã loại phòng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tên loại phòng</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map((roomType) => (
                    <tr key={roomType.maLoaiPhong} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <span className="text-sm">{roomType.maLoaiPhong}</span>
                      </td>
                      <td className="p-4 font-medium">{roomType.tenLoaiPhong}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(roomType)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(roomType)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal create room type */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="md:max-w-xl">
            <DialogHeader>
              <DialogTitle>Thêm loại phòng mới</DialogTitle>
              <DialogDescription>Nhập tên loại phòng mới</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-tenLoaiPhong">Tên loại phòng</Label>
                <Input
                  id="create-tenLoaiPhong"
                  {...form.register("tenLoaiPhong")}
                  placeholder="VD: Phòng Standard, Phòng VIP..."
                  autoFocus
                />
                {form.formState.errors.tenLoaiPhong && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tenLoaiPhong.message}
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
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo loại phòng"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal edit room type */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="md:max-w-xl">
            <DialogHeader>
              <DialogTitle>Sửa loại phòng</DialogTitle>
              <DialogDescription>Cập nhật tên loại phòng</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tenLoaiPhong">Tên loại phòng</Label>
                <Input
                  id="edit-tenLoaiPhong"
                  {...form.register("tenLoaiPhong")}
                  placeholder="VD: Phòng Standard, Phòng VIP..."
                  autoFocus
                />
                {form.formState.errors.tenLoaiPhong && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tenLoaiPhong.message}
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
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal delete room type */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="md:max-w-xl">
            <DialogHeader>
              <DialogTitle>Xóa loại phòng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa loại phòng này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {deletingRoomType && (
              <div className="py-4">
                <p className="text-lg font-medium">{deletingRoomType.tenLoaiPhong}</p>
                <p className="text-sm text-gray-500 mt-1">Mã: {deletingRoomType.maLoaiPhong}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
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

export default ManageRoomTypePage