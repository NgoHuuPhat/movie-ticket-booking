import { useState, useEffect } from "react"
import {
  Search, Plus, Filter, MoreVertical, Edit3, Trash2, Eye, Loader2,
  CheckSquare, Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { toast } from "sonner"
import { ProductForm, type ProductFormData } from "@/components/Admin/ProductForm"
import {
  getAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  bulkActionProducts,
  toggleShowProductAdmin,
  getAllProductCategoriesAdmin,
} from "@/services/api"
import { handleError } from "@/utils/handleError.utils"

interface ICategory {
  maDanhMucSanPham: string
  tenDanhMucSanPham: string
}

interface IProduct {
  maSanPham: string
  tenSanPham: string
  anhSanPham: string
  giaTien: number
  hienThi: boolean
  danhMucSanPham: ICategory
}

const ManageProductsPage = () => {
  const [products, setProducts] = useState<IProduct[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [hienThiFilter, setHienThiFilter] = useState<"all" | "true" | "false">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  // Load categories products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllProductCategoriesAdmin()
        setCategories(res)
      } catch (error) {
        console.error("Lỗi tải danh mục:", error)
        toast.error(handleError(error))
      }
    }
    fetchCategories()
  }, [])

  // Load list products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProductsAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          hienThi: hienThiFilter === "all" ? undefined : hienThiFilter === "true",
          maDanhMucSanPham: categoryFilter === "all" ? undefined : categoryFilter,
        })

        setProducts(res.products)
        setTotalProducts(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchProducts()
  }, [currentPage, searchQuery, hienThiFilter, categoryFilter])
  const handleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedProductIds(checked ? products.map((p) => p.maSanPham) : [])
  }

  const handleBulkAction = async (action: "hienThi" | "an" | "xoa") => {
    if (selectedProductIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm")
      return
    }

    setSubmitting(true)

    try {
      const res = await bulkActionProducts(selectedProductIds, action)

      setProducts((prev) => {
        if (action === "xoa") {
          return prev.filter((p) => !selectedProductIds.includes(p.maSanPham))
        } else {
          return prev.map((p) =>
            selectedProductIds.includes(p.maSanPham)
              ? { ...p, hienThi: action === "hienThi" }
              : p
          )
        }
      })

      toast.success(res.message)
      setSelectedProductIds([])
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleHienThi = async (id: string, current: boolean) => {
    try {
      const res = await toggleShowProductAdmin(id)
      setProducts((prev) =>
        prev.map((p) => (p.maSanPham === id ? { ...p, hienThi: !current } : p))
      )
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleEditProduct = (product: IProduct) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleViewProduct = (product: IProduct) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleSubmitCreate = async (data: ProductFormData) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("tenSanPham", data.tenSanPham)
      formData.append("maDanhMucSanPham", data.maDanhMucSanPham)
      formData.append("giaTien", data.giaTien.toString())
      if (data.anhSanPham) {
        formData.append("anhSanPham", data.anhSanPham)
      }

      const res = await createProductAdmin(formData)

      setProducts((prev) => [...prev, res.newProduct])
      setIsAddDialogOpen(false)
      toast.success("Thêm sản phẩm thành công!")
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitUpdate = async (data: ProductFormData) => {
    if (!selectedProduct) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("tenSanPham", data.tenSanPham)
      formData.append("maDanhMucSanPham", data.maDanhMucSanPham)
      formData.append("giaTien", data.giaTien.toString())
      if (data.anhSanPham) {
        formData.append("anhSanPham", data.anhSanPham)
      }

      const res = await updateProductAdmin(selectedProduct.maSanPham, formData)
      setProducts((prev) =>
        prev.map((p) => (p.maSanPham === res.updatedProduct.maSanPham ? res.updatedProduct : p))
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
    if (!selectedProduct) return
    setSubmitting(true)
    try {
      const res = await deleteProductAdmin(selectedProduct.maSanPham)
      setProducts((prev) => prev.filter((p) => p.maSanPham !== selectedProduct.maSanPham))
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
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
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Quản lý toàn bộ sản phẩm trong hệ thống
              </p>
            </div>
            <Button onClick={() => { setIsAddDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Sản Phẩm Mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={hienThiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Hiển thị
                    {hienThiFilter !== "all" && (
                      <span className="ml-1">
                        ({hienThiFilter === "true" ? "Đang hiển thị" : "Đang ẩn"})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("all"); setCurrentPage(1); }}>
                    Tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("true"); setCurrentPage(1); }}>
                    Đang hiển thị
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("false"); setCurrentPage(1); }}>
                    Đang ẩn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={categoryFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Danh mục
                    {categoryFilter !== "all" && <span>({categories.find(c => c.maDanhMucSanPham === categoryFilter)?.tenDanhMucSanPham || categoryFilter})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-72 overflow-y-auto">
                  <DropdownMenuItem onClick={() => { setCategoryFilter("all"); setCurrentPage(1); }}>
                    Tất cả
                  </DropdownMenuItem>
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.maDanhMucSanPham}
                      onClick={() => { setCategoryFilter(cat.maDanhMucSanPham); setCurrentPage(1); }}
                    >
                      {cat.tenDanhMucSanPham}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedProductIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Thao tác ({selectedProductIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction("hienThi")}>Hiển thị</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("an")}>Ẩn</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleBulkAction("xoa")}>
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Sản Phẩm</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedProductIds.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-24">Mã SP</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ảnh</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên sản phẩm</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Danh mục</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Giá bán</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hiển thị</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        Không tìm thấy sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.maSanPham} className="border-b hover:bg-gray-50/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedProductIds.includes(product.maSanPham)}
                            onCheckedChange={() => handleSelectProduct(product.maSanPham)}
                          />
                        </td>
                        <td className="p-4 font-medium">{product.maSanPham}</td>
                        <td className="p-4">
                          <img
                            src={product.anhSanPham}
                            alt={product.tenSanPham}
                            className="w-14 h-14 object-cover rounded-md border"
                          />
                        </td>
                        <td className="p-4 font-medium">{product.tenSanPham}</td>
                        <td className="p-4">
                          <Badge variant="secondary">
                            {product.danhMucSanPham.tenDanhMucSanPham}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium text-emerald-600">
                          {product.giaTien.toLocaleString()} VNĐ
                        </td>
                        <td className="p-4">
                          <Switch
                            checked={product.hienThi}
                            onCheckedChange={() => handleToggleHienThi(product.maSanPham, product.hienThi)}
                          />
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Edit3 className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
            totalItems={totalProducts}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Dialog Thêm */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Thêm Sản Phẩm Mới</DialogTitle>
              <DialogDescription>
                Nhập đầy đủ thông tin để thêm sản phẩm mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              categories={categories}
              onSubmit={handleSubmitCreate}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Sửa */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Sửa Sản Phẩm</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin sản phẩm.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              defaultValues={
                {
                  tenSanPham: selectedProduct?.tenSanPham || "",
                  maDanhMucSanPham: selectedProduct?.danhMucSanPham.maDanhMucSanPham || "",
                  giaTien: selectedProduct?.giaTien || 0,
                  anhSanPham: selectedProduct?.anhSanPham || null,
                }
              }
              categories={categories}
              onSubmit={handleSubmitUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Xóa */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa sản phẩm này? Hành động không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="py-4 flex items-center gap-4 bg-red-50 p-4 rounded-lg">
                <img
                  src={selectedProduct.anhSanPham}
                  alt={selectedProduct.tenSanPham}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{selectedProduct.tenSanPham}</p>
                  <p className="text-sm text-gray-600">
                    {selectedProduct.danhMucSanPham.tenDanhMucSanPham} • {selectedProduct.giaTien.toLocaleString()} VNĐ
                  </p>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa sản phẩm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Xem chi tiết */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-6 py-4">
                <div className="flex gap-6">
                  <img
                    src={selectedProduct.anhSanPham}
                    alt={selectedProduct.tenSanPham}
                    className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                  />
                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold">{selectedProduct.tenSanPham}</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant={selectedProduct.hienThi ? "default" : "secondary"}>
                        {selectedProduct.hienThi ? "Đang hiển thị" : "Đang ẩn"}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium text-emerald-600">
                      {selectedProduct.giaTien.toLocaleString()} VNĐ
                    </p>
                    <p>
                      <span className="font-medium">Danh mục:</span>{" "}
                      {selectedProduct.danhMucSanPham.tenDanhMucSanPham}
                    </p>
                    <p className="text-sm text-gray-500">
                      Mã sản phẩm: {selectedProduct.maSanPham}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageProductsPage