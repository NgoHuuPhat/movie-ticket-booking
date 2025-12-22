import { useState, useEffect } from "react"
import { Search, Plus, Edit3, Trash2, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AdminLayout from "@/components/layout/AdminLayout"
import { getAllCategoriesAdmin, createCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { z } from "zod"

interface ICategory {
  maTheLoai: string
  tenTheLoai: string
}

const categorySchema = z.object({
  tenTheLoai: z.string().min(1, "Tên thể loại không được để trống").max(50, "Tên thể loại không được quá 50 ký tự").trim(),
})

type CategoryFormData = z.infer<typeof categorySchema>

const ManageGenresMoviePage = () => {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesAdmin(searchQuery)
        setCategories(res)
      } catch (error) {
        toast.error("Không thể tải danh sách thể loại")
        console.error(error)
      } 
    }

    fetchCategories()
  }, [searchQuery])

  const resetAndClose = () => {
    form.reset()
    setSelectedCategory(null)
    setIsAddOpen(false)
    setIsEditOpen(false)
  }

  const handleAdd = async (data: CategoryFormData) => {
    try {
      const res = await createCategoryAdmin(data.tenTheLoai)
      setCategories(prev => [...prev, res.category])
      toast.success(res.message)
      resetAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleEdit = async (data: CategoryFormData) => {
    if (!selectedCategory) return

    try {
      const res = await updateCategoryAdmin(selectedCategory.maTheLoai, data.tenTheLoai)
      setCategories(prev =>
        prev.map(cat => (cat.maTheLoai === res.category.maTheLoai ? res.category : cat))
      )
      toast.success(res.message)
      resetAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      const res = await deleteCategoryAdmin(selectedCategory.maTheLoai)
      setCategories(prev => prev.filter(cat => cat.maTheLoai !== selectedCategory.maTheLoai))
      toast.success(res.message)
      setIsDeleteOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const openEditModal = (category: ICategory) => {
    setSelectedCategory(category)
    form.reset({ tenTheLoai: category.tenTheLoai })
    setIsEditOpen(true)
  }

  const openDeleteModal = (category: ICategory) => {
    setSelectedCategory(category)
    setIsDeleteOpen(true)
  }

  const openAddModal = () => {
    form.reset({ tenTheLoai: "" })
    setIsAddOpen(true)
  }

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              Quản Lý Thể Loại Phim
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Thêm, sửa, xóa các thể loại phim trong hệ thống
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Thể Loại
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm thể loại..."
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
            <CardTitle>Danh Sách Thể Loại</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-32">Mã thể loại</th>
                    <th className="p-4 text-sm font-medium text-gray-600">Tên thể loại</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600 w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-gray-500">
                        {searchQuery ? "Không tìm thấy thể loại nào" : "Chưa có thể loại nào"}
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-gray-500">
                        {searchQuery ? "Không tìm thấy thể loại nào" : "Chưa có thể loại nào"}
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.maTheLoai} className="border-b hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-sm">{cat.maTheLoai}</td>
                        <td className="p-4 ps-70">
                          <Badge variant="secondary" className="text-sm">
                            {cat.tenTheLoai}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(cat)}>
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

        {/* Modal Thêm Thể Loại */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Thể Loại Mới</DialogTitle>
              <DialogDescription>Nhập tên thể loại phim mới.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAdd)}>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="add-tenTheLoai">Tên thể loại</Label>
                  <Input
                    id="add-tenTheLoai"
                    {...form.register("tenTheLoai")}
                    placeholder="Ví dụ: Hành Động, Tình Cảm..."
                    autoFocus
                  />
                  {form.formState.errors.tenTheLoai && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tenTheLoai.message}
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

        {/* Modal Sửa Thể Loại */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sửa Thể Loại</DialogTitle>
              <DialogDescription>Cập nhật tên thể loại.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleEdit)}>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="edit-tenTheLoai">Tên thể loại</Label>
                  <Input
                    id="edit-tenTheLoai"
                    {...form.register("tenTheLoai")}
                    autoFocus
                  />
                  {form.formState.errors.tenTheLoai && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tenTheLoai.message}
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

export default ManageGenresMoviePage