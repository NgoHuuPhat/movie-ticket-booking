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
import { getAllAgeRatingsAdmin, createAgeRatingAdmin, updateAgeRatingAdmin, deleteAgeRatingAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { z } from "zod"

interface IAgeRating {
  maPhanLoaiDoTuoi: string
  tenPhanLoaiDoTuoi: string
  moTa: string
}

const ageRatingSchema = z.object({
  tenPhanLoaiDoTuoi: z.string().min(1, "Tên phân loại không được để trống").max(3, "Tên phân loại không được vượt quá 3 ký tự").trim(),
  moTa: z.string().min(1, "Mô tả không được để trống").trim(),
})
type AgeRatingFormData = z.infer<typeof ageRatingSchema>

const ManageAgeRatingsPage: React.FC = () => {
  const [ageRatings, setAgeRatings] = useState<IAgeRating[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState<IAgeRating | null>(null)

  const form = useForm<AgeRatingFormData>({
    resolver: zodResolver(ageRatingSchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const fetchAgeRatings = async () => {
      setLoading(true)
      try {
        const res = await getAllAgeRatingsAdmin(searchQuery)
        setAgeRatings(res)
      } catch (error) {
        toast.error("Không thể tải danh sách phân loại độ tuổi")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgeRatings()
  }, [searchQuery])

  const resetFormAndClose = () => {
    form.reset({ tenPhanLoaiDoTuoi: "", moTa: "" })
    setSelectedRating(null)
    setIsAddOpen(false)
    setIsEditOpen(false)
  }

  const handleCreate = async (data: AgeRatingFormData) => {
    try {
      const res = await createAgeRatingAdmin(data.tenPhanLoaiDoTuoi, data.moTa)
      setAgeRatings(prev => [...prev, res.ageRating]) 
      toast.success(res.message)
      resetFormAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleUpdate = async (data: AgeRatingFormData) => {
    if (!selectedRating) return

    try {
      const res = await updateAgeRatingAdmin(selectedRating.maPhanLoaiDoTuoi, data.tenPhanLoaiDoTuoi, data.moTa)
      setAgeRatings(prev =>
        prev.map(item =>
          item.maPhanLoaiDoTuoi === res.ageRating.maPhanLoaiDoTuoi
            ? { ...item, tenPhanLoaiDoTuoi: data.tenPhanLoaiDoTuoi, moTa: data.moTa }
            : item
        )
      )
      toast.success(res.message)
      resetFormAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleDelete = async () => {
    if (!selectedRating) return

    try {
      const res = await deleteAgeRatingAdmin(selectedRating.maPhanLoaiDoTuoi)
      setAgeRatings(prev => prev.filter(item => item.maPhanLoaiDoTuoi !== selectedRating.maPhanLoaiDoTuoi))
      toast.success(res.message)
      setIsDeleteOpen(false)
      setSelectedRating(null)
    } catch (error) {
      toast.error(handleError(error) || "Xóa phân loại độ tuổi thất bại!")
    }
  }

  const openAddModal = () => {
    setSelectedRating(null)
    form.reset({ tenPhanLoaiDoTuoi: "", moTa: "" })
    setIsAddOpen(true)
  }

  const openEditModal = (rating: IAgeRating) => {
    setSelectedRating(rating)
    form.reset({
      tenPhanLoaiDoTuoi: rating.tenPhanLoaiDoTuoi,
      moTa: rating.moTa,
    })
    setIsEditOpen(true)
  }

  const openDeleteModal = (rating: IAgeRating) => {
    setSelectedRating(rating)
    setIsDeleteOpen(true)
  }

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Phân Loại Độ Tuổi Phim</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Thêm, sửa hoặc xóa các phân loại độ tuổi cho phim chiếu tại rạp
              </p>
            </div>
            <Button onClick={() => { openAddModal() }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm phân loại độ tuổi
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm phân loại độ tuổi..."
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
            <CardTitle>Danh Sách Phân Loại Độ Tuổi</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-32">Mã ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên phân loại</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Mô tả</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600 w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : ageRatings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500">
                        {searchQuery ? "Không tìm thấy phân loại nào" : "Chưa có phân loại độ tuổi nào"}
                      </td>
                    </tr>
                  ) : (
                    ageRatings.map((item) => (
                      <tr key={item.maPhanLoaiDoTuoi} className="border-b hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-sm">{item.maPhanLoaiDoTuoi}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-sm font-medium">
                            {item.tenPhanLoaiDoTuoi}
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

        {/* Modal add age rating */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Phân Loại Độ Tuổi Mới</DialogTitle>
              <DialogDescription>Nhập thông tin phân loại độ tuổi mới.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Tên phân loại (ví dụ: C16, T18)</Label>
                <Input
                  id="add-name"
                  {...form.register("tenPhanLoaiDoTuoi")}
                  placeholder="C16"
                  autoFocus
                />
                {form.formState.errors.tenPhanLoaiDoTuoi && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tenPhanLoaiDoTuoi.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-desc">Mô tả</Label>
                <Textarea
                  id="add-desc"
                  {...form.register("moTa")}
                  placeholder="Phim dành cho khán giả từ 16 tuổi trở lên..."
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

        {/* Modal edit age rating */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Sửa Phân Loại Độ Tuổi</DialogTitle>
              <DialogDescription>Cập nhật thông tin phân loại.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên phân loại</Label>
                <Input
                  id="edit-name"
                  {...form.register("tenPhanLoaiDoTuoi")}
                  autoFocus
                />
                {form.formState.errors.tenPhanLoaiDoTuoi && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.tenPhanLoaiDoTuoi.message}
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

        {/* Modal delete age rating */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa Phân Loại Độ Tuổi</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa phân loại này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedRating && (
              <div className="py-4">
                <p className="text-lg font-medium">{selectedRating.tenPhanLoaiDoTuoi}</p>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedRating.maPhanLoaiDoTuoi}</p>
                {selectedRating.moTa && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{selectedRating.moTa}"</p>
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

export default ManageAgeRatingsPage