import { useState, useEffect } from "react"
import {  Search, Plus, Filter, MoreVertical, Edit3, Trash2, Eye, Loader2, CheckSquare, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger  } from "@/components/ui/dropdown-menu"
import {  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle  } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import {
  getAllCombosAdmin,
  createComboAdmin,
  updateComboAdmin,
  deleteComboAdmin,
  toggleShowComboAdmin,
  bulkActionCombosAdmin,
  getProductsForSelectAdmin,
} from "@/services/api"
import { ComboForm, type ComboFormData } from "@/components/Admin/ComboForm"

interface IChiTietCombo {
  maSanPham: string
  soLuong: number
  sanPham: {
    maSanPham: string
    tenSanPham: string
    giaTien: number        
    anhSanPham: string  
  }
}

interface ICombo {
  maCombo: string
  tenCombo: string
  anhCombo: string
  giaGoc: number
  giaBan: number
  hienThi: boolean
  chiTietCombos: IChiTietCombo[]
}

const ManageCombosPage = () => {
  const [combos, setCombos] = useState<ICombo[]>([])
  const [availableProducts, setAvailableProducts] = useState<{ maSanPham: string; tenSanPham: string; giaTien: number;}[]>([])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [selectedCombo, setSelectedCombo] = useState<ICombo | null>(null)
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [hienThiFilter, setHienThiFilter] = useState<"all" | "true" | "false">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCombos, setTotalCombos] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const products = await getProductsForSelectAdmin()
        setAvailableProducts(products)
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error)
        toast.error(handleError(error))
      }
    }
    fetchAvailableProducts()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hienThiParam = hienThiFilter === "all" ? undefined : hienThiFilter === "true"
        const res = await getAllCombosAdmin({
          page: currentPage,
          search: searchQuery.trim() || undefined,
          hienThi: hienThiParam,
        })

        setCombos(res.combos)
        setTotalCombos(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        console.error("Lỗi tải danh sách combo:", error)
        toast.error("Không thể tải danh sách combo")
      } 
    }
    fetchData()
  }, [currentPage, searchQuery, hienThiFilter])

  const handlePageChange = (page: number) => setCurrentPage(page)

  // Selection handlers
  const handleSelectCombo = (comboId: string) => {
    setSelectedComboIds(prev => 
      prev.includes(comboId) ? prev.filter(id => id !== comboId) : [...prev, comboId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedComboIds(checked ? combos.map(c => c.maCombo) : [])
  }

  // Bulk actions
  const handleBulkAction = async (action: "hienThi" | "an" | "xoa") => {
    if (selectedComboIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một combo")
      return
    }

    setSubmitting(true)
    try {
      await bulkActionCombosAdmin(selectedComboIds, action)
      setCombos((prev) => {
        if (action === "xoa") {
          return prev.filter((p) => !selectedComboIds.includes(p.maCombo))
        } else {
          return prev.map((p) =>
            selectedComboIds.includes(p.maCombo)
              ? { ...p, hienThi: action === "hienThi" }
              : p
          )
        }
      })
      toast.success(`Thực hiện ${action} thành công!`)
      setSelectedComboIds([])
    } catch (error) {
      toast.error(handleError(error) || "Thao tác thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle hiển thị
  const handleToggleHienThi = async (comboId: string) => {
    setSubmitting(true)
    try {
      const res = await toggleShowComboAdmin(comboId)
      setCombos(prev => prev.map(c => 
        c.maCombo === comboId ? res.updatedCombo : c
      ))
      toast.success("Cập nhật trạng thái thành công!")
    } catch (error) {
      toast.error(handleError(error) || "Cập nhật thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditCombo = (combo: ICombo) => {
    setSelectedCombo(combo)
    setIsEditDialogOpen(true)
  }

  // Form handlers
  const handleSubmitAdd = async (data: ComboFormData) => {
    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("tenCombo", data.tenCombo)
      formDataToSend.append("giaGoc", data.giaGoc.toString())
      formDataToSend.append("giaBan", data.giaBan.toString())
      if (data.anhCombo) {
        formDataToSend.append("anhCombo", data.anhCombo)
      }
      formDataToSend.append("chiTietCombos", JSON.stringify(data.chiTietCombos))
      
      const res = await createComboAdmin(formDataToSend)
      setCombos(prev => [res.newCombo, ...prev])
      toast.success(res.message)
      setIsAddDialogOpen(false)
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (data: ComboFormData) => {
    if (!selectedCombo) return
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("tenCombo", data.tenCombo)
      formDataToSend.append("giaGoc", data.giaGoc.toString())
      formDataToSend.append("giaBan", data.giaBan.toString())
      if (data.anhCombo) {
        formDataToSend.append("anhCombo", data.anhCombo)
      }
      formDataToSend.append("chiTietCombos", JSON.stringify(data.chiTietCombos))

      const res = await updateComboAdmin(selectedCombo.maCombo, formDataToSend)
      setCombos(prev => prev.map(c => 
        c.maCombo === res.updatedCombo.maCombo ? res.updatedCombo : c
      ))
      
      toast.success(res.message)
      setIsEditDialogOpen(false)
      setSelectedCombo(null)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedCombo) return
    setSubmitting(true)
    try {
      const res = await deleteComboAdmin(selectedCombo.maCombo)
      toast.success(res.message)
      setIsDeleteDialogOpen(false)
      setSelectedCombo(null)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const calculateDiscount = (giaGoc: number, giaBan: number) => 
    Math.round(((giaGoc - giaBan) / giaGoc) * 100)

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Combo</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">Quản lý các combo khuyến mãi tại rạp</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Combo
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
                  placeholder="Tìm kiếm tên combo..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
                  
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={hienThiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Hiển thị
                    {hienThiFilter !== "all" && <span className="ml-1">({hienThiFilter === "true" ? "Hiện" : "Ẩn"})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("true"); setCurrentPage(1) }}>Đang hiển thị</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("false"); setCurrentPage(1) }}>Đang ẩn</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedComboIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={submitting}>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Actions ({selectedComboIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('hienThi')}>Hiển thị</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('an')}>Tạm ẩn</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleBulkAction('xoa')}>Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh sách Combo </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600 w-12">
                      <Checkbox
                        checked={selectedComboIds.length === combos.length && combos.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Mã</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-20">Ảnh</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên combo</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Giá gốc</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Giá bán</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-24">Giảm giá</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-20">Hiển thị</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-20">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {combos.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-500">
                        {"Không có combo nào"}
                      </td>
                    </tr>
                  ) : (
                    combos.map(combo => (
                      <tr key={combo.maCombo} className="border-b hover:bg-gray-50/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedComboIds.includes(combo.maCombo)}
                            onCheckedChange={() => handleSelectCombo(combo.maCombo)}
                          />
                        </td>
                        <td className="p-4 font-medium text-sm">{combo.maCombo}</td>
                        <td className="p-4">
                          <img 
                            src={combo.anhCombo} 
                            alt={combo.tenCombo} 
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        </td>
                        <td className="p-4 font-medium max-w-48 truncate">{combo.tenCombo}</td>
                        <td className="p-4 text-sm text-gray-500 line-through">
                          {Number(combo.giaGoc).toLocaleString()} VNĐ
                        </td>
                        <td className="p-4 font-semibold text-green-600 text-sm">
                          {Number(combo.giaBan).toLocaleString()} VNĐ
                        </td>
                        <td className="p-4">
                          <Badge variant="destructive" className="text-xs">
                            -{calculateDiscount(Number(combo.giaGoc), Number(combo.giaBan))}%
                          </Badge>
                        </td>
                        <td className="p-4 pt-6">
                          <Switch 
                            checked={combo.hienThi} 
                            onCheckedChange={() => handleToggleHienThi(combo.maCombo)}
                            disabled={submitting}
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
                              <DropdownMenuItem onClick={() => { setSelectedCombo(combo); setIsViewDialogOpen(true) }}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCombo(combo)}>
                                <Edit3 className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedCombo(combo); setIsDeleteDialogOpen(true) }}>
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
            totalItems={totalCombos}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modals */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="md:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Thêm Combo Mới</DialogTitle>
              <DialogDescription>Nhập thông tin combo để thêm vào hệ thống.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 pr-2 overflow-y-auto">
              <ComboForm
                availableProducts={availableProducts}
                onSubmit={handleSubmitAdd}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" form="combo-form" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Tạo Combo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="md:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Sửa Combo - {selectedCombo?.tenCombo}</DialogTitle>
              <DialogDescription>Cập nhật thông tin combo.</DialogDescription>
            </DialogHeader>
            {selectedCombo && (
              <div className="flex-1 pr-2 overflow-y-auto">
                <ComboForm
                  defaultValues={{
                    tenCombo: selectedCombo.tenCombo,
                    giaGoc: selectedCombo.giaGoc,
                    giaBan: selectedCombo.giaBan,
                    anhCombo: selectedCombo.anhCombo,
                    chiTietCombos: selectedCombo.chiTietCombos.map(item => ({
                      maSanPham: item.maSanPham,
                      soLuong: item.soLuong,
                    })) || [{ maSanPham: "", }],
                  }}
                  availableProducts={availableProducts}
                  onSubmit={handleSubmitEdit}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              </div>
            )}
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" form="combo-form" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Cập nhật
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="md:max-w-[600px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Chi Tiết Combo</DialogTitle>
            </DialogHeader>

            {selectedCombo && (
              <div className="space-y-4 py-4 overflow-y-auto max-h-[65vh]">
                <div className="flex gap-4 items-start">
                  <img
                    src={selectedCombo.anhCombo}
                    alt={selectedCombo.tenCombo}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xl font-semibold truncate">{selectedCombo.tenCombo}</h3>
                    <p className="text-sm text-gray-500">Mã: {selectedCombo.maCombo}</p>
                    <p className="text-sm">{selectedCombo.chiTietCombos.length} sản phẩm</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Giá gốc</p>
                    <p className="line-through text-gray-400">{Number(selectedCombo.giaGoc).toLocaleString()} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giá bán</p>
                    <p className="font-bold text-green-600">{Number(selectedCombo.giaBan).toLocaleString()} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tiết kiệm</p>
                    <p className="font-bold text-red-600">{(Number(selectedCombo.giaGoc) - Number(selectedCombo.giaBan)).toLocaleString()} VNĐ</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mt-6 mb-2">Sản phẩm trong combo</h4>
                  {selectedCombo.chiTietCombos.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedCombo.chiTietCombos.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center border-b border-gray-200 py-1">
                          <span>{item.sanPham.tenSanPham || item.sanPham.maSanPham} ×{item.soLuong}</span>
                          {item.sanPham.giaTien && (
                            <span className="text-gray-700 font-medium">
                              {(Number(item.sanPham.giaTien) * item.soLuong).toLocaleString()} VNĐ
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Chưa có sản phẩm nào trong combo này</p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa Combo</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa combo này? Hành động này sẽ xóa vĩnh viễn và không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedCombo && (
              <div className="py-6 flex items-start gap-4 bg-red-50 p-4 rounded-lg border border-red-200">
                <img 
                  src={selectedCombo.anhCombo} 
                  alt={selectedCombo.tenCombo} 
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{selectedCombo.tenCombo}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="line-through text-gray-500">{Number(selectedCombo.giaGoc).toLocaleString()}VNĐ</span>
                    {' → '}
                    <span className="text-green-600 font-semibold">{Number(selectedCombo.giaBan).toLocaleString()}VNĐ</span>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    ({selectedCombo.chiTietCombos.length} sản phẩm sẽ bị xóa)
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
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa combo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageCombosPage