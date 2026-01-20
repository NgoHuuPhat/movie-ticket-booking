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
import { getAllProductCategoriesAdmin, createProductCategoryAdmin, updateProductCategoryAdmin, deleteProductCategoryAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { z } from "zod"
import type { IProductCategory } from "@/types/category"

const categorySchema = z.object({
  tenDanhMucSanPham: z.string()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục không được quá 100 ký tự")
    .trim(),
})

type CategoryFormData = z.infer<typeof categorySchema>

const ManageProductCategoriesPage = () => {
  const [categories, setCategories] = useState<IProductCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory | null>(null)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllProductCategoriesAdmin(searchQuery)
        setCategories(res)
      } catch (error) {
        toast.error("Không thể tải danh sách danh mục sản phẩm")
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
      const res = await createProductCategoryAdmin(data.tenDanhMucSanPham)
      setCategories(prev => [res.newCategory, ...prev])
      toast.success(res.message)
      resetAndClose()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleEdit = async (data: CategoryFormData) => {
    if (!selectedCategory) return

    try {
      const res = await updateProductCategoryAdmin(selectedCategory.maDanhMucSanPham, data.tenDanhMucSanPham)
      setCategories(prev =>
        prev.map(cat => (cat.maDanhMucSanPham === res.updatedCategory.maDanhMucSanPham ? res.updatedCategory : cat))
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
      const res = await deleteProductCategoryAdmin(selectedCategory.maDanhMucSanPham)
      setCategories(prev => prev.filter(cat => cat.maDanhMucSanPham !== selectedCategory.maDanhMucSanPham))
      toast.success(res.message)
      setIsDeleteOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const openEditModal = (category: IProductCategory) => {
    setSelectedCategory(category)
    form.reset({ tenDanhMucSanPham: category.tenDanhMucSanPham })
    setIsEditOpen(true)
  }

  const openDeleteModal = (category: IProductCategory) => {
    setSelectedCategory(category)
    setIsDeleteOpen(true)
  }

  const openAddModal = () => {
    form.reset({ tenDanhMucSanPham: "" })
    setIsAddOpen(true)
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Danh Mục Sản Phẩm</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Thêm, sửa, xóa các danh mục sản phẩm trong hệ thống
              </p>
            </div>
            <Button onClick={() => { openAddModal() }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Danh Mục Mới
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm danh mục sản phẩm..."
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
            <CardTitle>Danh Sách Danh Mục Sản Phẩm</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Mã danh mục</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Tên danh mục</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Số sản phẩm</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  { categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500">
                        {searchQuery ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.maDanhMucSanPham} className="border-b hover:bg-purple-50/30 transition-colors">
                        <td className="p-4 font-medium text-gray-800 text-sm">{cat.maDanhMucSanPham}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-sm bg-purple-100 text-purple-800">
                            {cat.tenDanhMucSanPham}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-sm">
                            {cat._count?.sanPhams || 0} sản phẩm
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Modal Thêm Danh Mục */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Danh Mục Sản Phẩm Mới</DialogTitle>
              <DialogDescription>Nhập tên danh mục sản phẩm mới.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAdd)}>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="add-tenDanhMucSanPham">Tên danh mục <span className="text-red-500">*</span></Label>
                  <Input
                    id="add-tenDanhMucSanPham"
                    {...form.register("tenDanhMucSanPham")}
                    placeholder="Ví dụ: Đồ ăn, Nước uống, Combo..."
                    autoFocus
                  />
                  {form.formState.errors.tenDanhMucSanPham && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tenDanhMucSanPham.message}
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

        {/* Modal Sửa Danh Mục */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Sửa Danh Mục Sản Phẩm</DialogTitle>
              <DialogDescription>Cập nhật tên danh mục sản phẩm.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleEdit)}>
              <div className="py-4 space-y-4">
                {selectedCategory && (
                  <div className="mb-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Mã danh mục</p>
                    <p className="font-medium">{selectedCategory.maDanhMucSanPham}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="edit-tenDanhMucSanPham">Tên danh mục <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-tenDanhMucSanPham"
                    {...form.register("tenDanhMucSanPham")}
                    autoFocus
                  />
                  {form.formState.errors.tenDanhMucSanPham && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tenDanhMucSanPham.message}
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

        {/* Modal Xóa Danh Mục */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa Danh Mục Sản Phẩm</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <div className="py-4 space-y-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-semibold text-lg">{selectedCategory.tenDanhMucSanPham}</p>
                  <p className="text-sm text-gray-600 mt-1">Mã: {selectedCategory.maDanhMucSanPham}</p>
                  {selectedCategory._count && selectedCategory._count.sanPhams > 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ Danh mục này có {selectedCategory._count.sanPhams} sản phẩm
                    </p>
                  )}
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

export default ManageProductCategoriesPage