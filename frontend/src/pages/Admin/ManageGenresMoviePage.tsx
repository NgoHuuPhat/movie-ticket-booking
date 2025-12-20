import { useState, useEffect } from "react"
import { Search, Plus, Edit3, Trash2, Loader2, Save, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import AdminLayout from "@/components/layout/AdminLayout"
import { getAllCategoriesAdmin, createCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin, } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"

interface ICategory {
  maTheLoai: string
  tenTheLoai: string
}

const ManageGenresMoviePage = () => {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null)

  const [categoryName, setCategoryName] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const res = await getAllCategoriesAdmin(searchQuery)
        setCategories(res)
      } catch (error) {
        toast.error("Không thể tải danh sách thể loại")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [searchQuery])

  const resetForm = () => {
    setCategoryName("")
    setSelectedCategory(null)
  }

  const handleAdd = async () => {
    if (!categoryName.trim()) {
      toast.error("Vui lòng nhập tên thể loại")
      return
    }

    setSubmitting(true)
    try {
      const res = await createCategoryAdmin(categoryName.trim())
      toast.success("Thêm thể loại thành công!")
      setCategories(prev => [...prev, res])
      setIsAddOpen(false)
      resetForm()
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedCategory || !categoryName.trim()) return

    setSubmitting(true)
    try {
      const res = await updateCategoryAdmin(selectedCategory.maTheLoai, categoryName.trim())
      setCategories(prev => prev.map(cat => cat.maTheLoai === selectedCategory.maTheLoai ? res : cat))
      toast.success("Cập nhật thể loại thành công!")
      setIsEditOpen(false)
      resetForm()
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    setSubmitting(true)
    try {
      await deleteCategoryAdmin(selectedCategory.maTheLoai)
      setCategories(prev => prev.filter(cat => cat.maTheLoai !== selectedCategory.maTheLoai))
      toast.success("Xóa thể loại thành công!")
      setIsDeleteOpen(false)
      resetForm()
    } catch (error) {
      console.error(handleError(error))
      toast.error(handleError(error) || "Xóa thể loại thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (category: ICategory) => {
    setSelectedCategory(category)
    setCategoryName(category.tenTheLoai)
    setIsEditOpen(true)
  }

  const openDeleteModal = (category: ICategory) => {
    setSelectedCategory(category)
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
                Quản Lý Thể Loại Phim
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Thêm, sửa, xóa các thể loại phim trong hệ thống
              </p>
            </div>
            <Button onClick={() => { resetForm(); setIsAddOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Thể Loại
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm thể loại..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Thể Loại</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-32">Mã thể loại</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên thể loại</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600 w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-gray-500">
                        Không có thể loại nào
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.maTheLoai} className="border-b hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-sm">{cat.maTheLoai}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-sm">
                            {cat.tenTheLoai}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(cat)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteModal(cat)}
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

      {/* Modal Thêm Thể Loại */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Thể Loại Mới</DialogTitle>
            <DialogDescription>Nhập tên thể loại phim mới.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="add-name">Tên thể loại</Label>
            <Input
              id="add-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ví dụ: Hành Động, Tình Cảm..."
              autoFocus
            />
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

      {/* Modal Sửa Thể Loại */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa Thể Loại</DialogTitle>
            <DialogDescription>Cập nhật tên thể loại.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-name">Tên thể loại</Label>
            <Input
              id="edit-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoFocus
            />
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

      {/* Modal Xóa Thể Loại */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa Thể Loại</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thể loại này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="py-4">
              <p className="text-lg font-medium">{selectedCategory.tenTheLoai}</p>
              <p className="text-sm text-gray-500 mt-1">Mã: {selectedCategory.maTheLoai}</p>
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

export default ManageGenresMoviePage