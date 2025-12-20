import { useState, useEffect } from "react"
import { Search, Plus, Edit3, Trash2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" 
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import AdminLayout from "@/components/layout/AdminLayout"
import { getAllAgeRatingsAdmin, createAgeRatingAdmin, updateAgeRatingAdmin, deleteAgeRatingAdmin, } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"

interface IAgeRating {
  maPhanLoaiDoTuoi: string
  tenPhanLoaiDoTuoi: string
  moTa: string
}

const ManageAgeRatingsPage = () => {
  const [ageRatings, setAgeRatings] = useState<IAgeRating[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState<IAgeRating | null>(null)

  const [ratingName, setRatingName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    const fetchAgeRatings = async () => {
      setLoading(true)
      try {
        const res = await getAllAgeRatingsAdmin(searchQuery || undefined)
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

  const resetForm = () => {
    setRatingName("")
    setDescription("")
    setSelectedRating(null)
  }

  const handleAdd = async () => {
    if (!ratingName.trim()) {
      toast.error("Vui lòng nhập tên phân loại độ tuổi")
      return
    }
    if(!description.trim()) {
      toast.error("Vui lòng nhập mô tả phân loại độ tuổi")
      return
    }

    setSubmitting(true)
    try {
      const res = await createAgeRatingAdmin(ratingName.trim(), description.trim())
      toast.success("Thêm phân loại độ tuổi thành công!")
      setAgeRatings(prev => [...prev, res])
      setIsAddOpen(false)
      resetForm()
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedRating || !ratingName.trim()) return

    setSubmitting(true)
    try {
      await updateAgeRatingAdmin(selectedRating.maPhanLoaiDoTuoi, ratingName.trim(), description.trim())
      setAgeRatings(prev =>
        prev.map(item =>
          item.maPhanLoaiDoTuoi === selectedRating.maPhanLoaiDoTuoi
            ? { ...item, tenPhanLoaiDoTuoi: ratingName.trim(), moTa: description.trim() }
            : item
        )
      )
      toast.success("Cập nhật phân loại độ tuổi thành công!")
      setIsEditOpen(false)
      resetForm()
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedRating) return

    setSubmitting(true)
    try {
      await deleteAgeRatingAdmin(selectedRating.maPhanLoaiDoTuoi)
      setAgeRatings(prev => prev.filter(item => item.maPhanLoaiDoTuoi !== selectedRating.maPhanLoaiDoTuoi))
      toast.success("Xóa phân loại độ tuổi thành công!")
      setIsDeleteOpen(false)
      resetForm()
    } catch (error) {
      toast.error(handleError(error) || "Xóa phân loại độ tuổi thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (rating: IAgeRating) => {
    setSelectedRating(rating)
    setRatingName(rating.tenPhanLoaiDoTuoi)
    setDescription(rating.moTa)
    setIsEditOpen(true)
  }

  const openDeleteModal = (rating: IAgeRating) => {
    setSelectedRating(rating)
    setIsDeleteOpen(true)
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl pb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                Quản Lý Phân Loại Độ Tuổi Phim
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Thêm, sửa, xóa các phân loại độ tuổi (P, K, T13, T16, T18, C18,...)
              </p>
            </div>
            <Button onClick={() => { resetForm(); setIsAddOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Phân Loại
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 shadow-sm">
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50/50">
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
                        Không có phân loại độ tuổi nào
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
                        <td className="p-4 text-sm text-gray-700 max-w-md truncate">
                          {item.moTa || <span className="text-gray-400">Chưa có mô tả</span>}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(item)}
                          >
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
      </div>

      {/* Modal create age rating */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Phân Loại Độ Tuổi Mới</DialogTitle>
            <DialogDescription>Nhập thông tin phân loại độ tuổi mới.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="add-name">Tên phân loại (ví dụ: C16, C18)</Label>
              <Input
                value={ratingName}
                onChange={(e) => setRatingName(e.target.value)}
                placeholder="C16"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="add-desc">Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Phim dành cho khán giả từ 16 tuổi trở lên..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting ? (
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
        </DialogContent>
      </Dialog>

      {/* Modal update age rating */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa Phân Loại Độ Tuổi</DialogTitle>
            <DialogDescription>Cập nhật thông tin phân loại.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Tên phân loại</Label>
              <Input
                value={ratingName}
                onChange={(e) => setRatingName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? (
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
        </DialogContent>
      </Dialog>

      {/* Modal Xóa */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
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
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default ManageAgeRatingsPage