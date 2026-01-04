import { useState, useEffect } from "react"
import { Percent, Search, Plus, Filter, MoreVertical, Edit3, Trash2, Eye, Save, Loader2, CheckSquare, Calendar, Users, TrendingUp, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { 
  getDiscountsForAdmin, 
  createDiscountAdmin, 
  updateDiscountAdmin, 
  deleteDiscountAdmin, 
  bulkActionDiscountsAdmin, 
  toggleDiscountActivationAdmin,
  getAllUserTypesAdmin,
  getDiscountStatsAdmin
} from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/utils/formatDate"
import { DiscountForm, type DiscountFormData } from "@/components/Admin/DiscountForm"

interface IUserType {
  maLoaiNguoiDung: string
  tenLoaiNguoiDung: string
}

interface IDiscount {
  maKhuyenMai: string
  tenKhuyenMai: string
  maCode: string
  loaiKhuyenMai: "GiamPhanTram" | "GiamTien"
  giaTriGiam: number
  giamToiDa?: number
  donHangToiThieu: number 
  maLoaiNguoiDung?: string
  soLuong: number
  soLuongDaDung: number
  ngayBatDau: string
  ngayKetThuc: string
  hoatDong: boolean
  moTa?: string
  loaiNguoiDung?: { tenLoaiNguoiDung: string }
}

const ManageDiscountPage = () => {
  const [discounts, setDiscounts] = useState<IDiscount[]>([])
  const [userTypes, setUserTypes] = useState<IUserType[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<IDiscount | null>(null)
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [hoatDongFilter, setHoatDongFilter] = useState<"all" | "true" | "false">("all")
  const [trangThaiFilter, setTrangThaiFilter] = useState<"all" | "dangHoatDong" | "sapDienRa" | "daKetThuc">("all")
  const [loaiKhuyenMaiFilter, setLoaiKhuyenMaiFilter] = useState<"all" | "GiamPhanTram" | "GiamTien">("all")
  const [doiTuongFilter, setDoiTuongFilter] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDiscounts, setTotalDiscounts] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  const [stats, setStats] = useState({
    totalDiscount: 0,
    activeCount: 0,
    upcomingCount: 0,
    expiredCount: 0,
  })

  const [formData, setFormData] = useState<Partial<DiscountFormData>>({
    tenKhuyenMai: "",
    loaiKhuyenMai: "GiamPhanTram",
    giaTriGiam: 0,
    giamToiDa: null,
    donHangToiThieu: 0,
    maLoaiNguoiDung: null,
    soLuong: 1,
    ngayBatDau: "",
    ngayKetThuc: "",
    moTa: null
  })

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const types = await getAllUserTypesAdmin()
        setUserTypes(types)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchUserTypes()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDiscountStatsAdmin()
        setStats(data)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchStats()
  }, [userTypes])

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await getDiscountsForAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          hoatDong: hoatDongFilter === "all" ? undefined : hoatDongFilter === "true",
          trangThai: trangThaiFilter === "all" ? undefined : trangThaiFilter,
          loaiKhuyenMai: loaiKhuyenMaiFilter === "all" ? undefined : loaiKhuyenMaiFilter,
          doiTuongKhuyenMai: doiTuongFilter === "all" ? undefined : doiTuongFilter,
        })

        setDiscounts(res.discounts)
        setTotalDiscounts(res.totalDiscount)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchDiscounts()
  }, [currentPage, searchQuery, hoatDongFilter, trangThaiFilter, loaiKhuyenMaiFilter, doiTuongFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const resetForm = () => {
    setFormData({
      tenKhuyenMai: "",
      loaiKhuyenMai: "GiamPhanTram",
      giaTriGiam: 0,
      giamToiDa: null,
      donHangToiThieu: 0,
      maLoaiNguoiDung: null,
      soLuong: 1,
      ngayBatDau: "",
      ngayKetThuc: "",
      moTa: ""
    })
  }

  const handleSelectDiscount = (discountId: string) => {
    setSelectedDiscountIds(prev => 
      prev.includes(discountId) ? prev.filter(id => id !== discountId) : [...prev, discountId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedDiscountIds(checked ? discounts.map(d => d.maKhuyenMai) : [])
  }

  const handleBulkAction = async (action: "hoatDong" | "ngungHoatDong" | "xoa") => {
    if (selectedDiscountIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một khuyến mãi để thực hiện hành động.")
      return
    }

    setSubmitting(true)
    setSelectedDiscountIds([])

    try {
      const data = await bulkActionDiscountsAdmin(selectedDiscountIds, action)
      
      setDiscounts(prev => {
        if (action === 'xoa') {
          return prev.filter(d => !selectedDiscountIds.includes(d.maKhuyenMai))
        } else if (action === 'hoatDong') {
          return prev.map(d => selectedDiscountIds.includes(d.maKhuyenMai) ? { ...d, hoatDong: true } : d)
        } else if (action === 'ngungHoatDong') {
          return prev.map(d => selectedDiscountIds.includes(d.maKhuyenMai) ? { ...d, hoatDong: false } : d)
        }
        return prev
      })
      
      toast.success(data.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleHoatDong = async (discountId: string) => {
    setSubmitting(true)
    try {
      const data = await toggleDiscountActivationAdmin(discountId)
      setDiscounts(prev => prev.map(d => d.maKhuyenMai === discountId ? { ...d, hoatDong: !d.hoatDong } : d))
      toast.success(data.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditDiscount = (discount: IDiscount) => {
    setSelectedDiscount(discount)
    setFormData({
      tenKhuyenMai: discount.tenKhuyenMai,
      loaiKhuyenMai: discount.loaiKhuyenMai,
      giaTriGiam: discount.giaTriGiam,
      giamToiDa: discount.giamToiDa,
      donHangToiThieu: discount.donHangToiThieu,
      maLoaiNguoiDung: discount.maLoaiNguoiDung,
      soLuong: discount.soLuong,
      ngayBatDau: discount.ngayBatDau.split("T")[0],
      ngayKetThuc: discount.ngayKetThuc.split("T")[0],
      moTa: discount.moTa || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleSubmitAdd = async (data: DiscountFormData) => {
    setSubmitting(true)
    try {
      const res = await createDiscountAdmin(
        data.tenKhuyenMai,
        data.loaiKhuyenMai,
        data.giaTriGiam,
        data.ngayBatDau,
        data.ngayKetThuc,
        data.donHangToiThieu || 0,
        data.giamToiDa || undefined,
        data.maLoaiNguoiDung || undefined,
        data.soLuong || undefined,
        data.moTa || undefined
      )
      setDiscounts(prev => [res.newDiscount, ...prev])
      setIsAddDialogOpen(false)
      resetForm()
      toast.success(res.message)
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (data: DiscountFormData) => {
    console.log("Submitting edit:", data)
    if (!selectedDiscount) return
    setSubmitting(true)
    try {
      const res = await updateDiscountAdmin(
        selectedDiscount.maKhuyenMai,
        data.tenKhuyenMai,
        data.loaiKhuyenMai,
        data.giaTriGiam,
        data.ngayBatDau,
        data.ngayKetThuc,
        data.donHangToiThieu || 0,
        data.giamToiDa || undefined,
        data.maLoaiNguoiDung || undefined,
        data.soLuong || undefined,
        data.moTa || undefined
      )
      setDiscounts(prev => prev.map(d => d.maKhuyenMai === selectedDiscount.maKhuyenMai ? res.updatedDiscount : d))
      setIsEditDialogOpen(false)
      resetForm()
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedDiscount) return
    setSubmitting(true)
    try {
      const res = await deleteDiscountAdmin(selectedDiscount.maKhuyenMai)
      setDiscounts(prev => prev.filter(d => d.maKhuyenMai !== selectedDiscount.maKhuyenMai))
      setIsDeleteDialogOpen(false)
      setSelectedDiscount(null)
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (discount: IDiscount) => {
    const now = new Date()
    const start = new Date(discount.ngayBatDau)
    const end = new Date(discount.ngayKetThuc)
    end.setHours(23, 59, 59, 999)

    if (!discount.hoatDong) {
      return <Badge variant="secondary">Tạm ngưng</Badge>
    }
    if (now < start) {
      return <Badge className="bg-blue-500">Sắp diễn ra</Badge>
    }
    if (now > end) {
      return <Badge variant="destructive">Đã kết thúc</Badge>
    }
    return <Badge className="bg-green-500">Đang hoạt động</Badge>
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto pb-10">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Khuyến Mãi</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">Quản lý các mã khuyến mãi </p>
            </div>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Tạo Khuyến Mãi
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Tổng khuyến mãi", value: stats.totalDiscount, icon: <Percent className="h-5 w-5" />, color: "bg-purple-500" },
              { title: "Đang hoạt động", value: stats.activeCount, icon: <TrendingUp className="h-5 w-5" />, color: "bg-green-500" },
              { title: "Sắp diễn ra", value: stats.upcomingCount, icon: <Calendar className="h-5 w-5" />, color: "bg-blue-500" },
              { title: "Đã kết thúc", value: stats.expiredCount, icon: <Users className="h-5 w-5" />, color: "bg-gray-500" },
            ].map((card, i) => (
              <Card key={i} className="bg-white/50 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg text-white`}>{card.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tên hoặc mã khuyến mãi..."
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
                  <Button variant="outline" className={hoatDongFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Kích hoạt
                    {hoatDongFilter !== "all" && <span className="ml-1">({hoatDongFilter === "true" ? "Đang kích hoạt" : "Tạm ngưng"})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHoatDongFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHoatDongFilter("true"); setCurrentPage(1) }}>Đang kích hoạt</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHoatDongFilter("false"); setCurrentPage(1) }}>Tạm ngưng</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={trangThaiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Trạng thái
                    {trangThaiFilter !== "all" && <span className="ml-1">({trangThaiFilter === "dangHoatDong" ? "Đang hoạt động" : trangThaiFilter === "sapDienRa" ? "Sắp diễn ra" : "Đã kết thúc"})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("dangHoatDong"); setCurrentPage(1) }}>Đang hoạt động</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("sapDienRa"); setCurrentPage(1) }}>Sắp diễn ra</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("daKetThuc"); setCurrentPage(1) }}>Đã kết thúc</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={loaiKhuyenMaiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Loại KM
                    {loaiKhuyenMaiFilter !== "all" && <span className="ml-1">({loaiKhuyenMaiFilter === "GiamPhanTram" ? "Giảm phần trăm" : "Giảm tiền"})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setLoaiKhuyenMaiFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setLoaiKhuyenMaiFilter("GiamPhanTram"); setCurrentPage(1) }}>Giảm phần trăm (%)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setLoaiKhuyenMaiFilter("GiamTien"); setCurrentPage(1) }}>Giảm tiền (VNĐ)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={doiTuongFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Đối tượng
                    {doiTuongFilter !== "all" && (<span className="ml-1">({userTypes.find(ut => ut.maLoaiNguoiDung === doiTuongFilter)?.tenLoaiNguoiDung})</span>)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setDoiTuongFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  {userTypes.map(type => (
                    <DropdownMenuItem key={type.maLoaiNguoiDung} onClick={() => { setDoiTuongFilter(type.maLoaiNguoiDung); setCurrentPage(1) }}>
                      {type.tenLoaiNguoiDung}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedDiscountIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Actions ({selectedDiscountIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('hoatDong')}>Kích hoạt</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('ngungHoatDong')}>Tạm ngưng</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleBulkAction('xoa')}>Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Khuyến Mãi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600 w-12">
                      <Checkbox
                        checked={selectedDiscountIds.length === discounts.length && discounts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Mã khuyến mãi</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên khuyến mãi</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Loại</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Giá trị</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Số lượng (Đã dùng/Tổng)</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Thời gian</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Kích hoạt</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-8 text-gray-500">Không có khuyến mãi nào</td></tr>
                  ) : (
                    discounts.map(discount => (
                      <tr key={discount.maKhuyenMai} className="border-b hover:bg-gray-50/50 text-sm">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedDiscountIds.includes(discount.maKhuyenMai)}
                            onCheckedChange={() => handleSelectDiscount(discount.maKhuyenMai)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{discount.maKhuyenMai}</div>
                          <div className="text-xs text-gray-500 font-mono">{discount.maCode}</div>
                        </td>
                        <td className="p-4 font-medium">{discount.tenKhuyenMai}</td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {discount.loaiKhuyenMai === "GiamPhanTram" ? "Giảm phần trăm" : "Giảm tiền"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {discount.loaiKhuyenMai === "GiamPhanTram" 
                            ? `${discount.giaTriGiam}%` 
                            : (discount.giaTriGiam).toLocaleString() + " VNĐ"
                          }
                        </td>
                        <td className="p-4">{discount.soLuongDaDung}/{discount.soLuong || "Không giới hạn"}</td>
                        <td className="p-4">
                          <div className="text-xs">
                            <div>{formatDate(discount.ngayBatDau)}</div>
                            <div className="text-gray-500">đến {formatDate(discount.ngayKetThuc)}</div>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(discount)}</td>
                        <td className="p-4">
                          <Switch 
                            checked={discount.hoatDong} 
                            onCheckedChange={() => handleToggleHoatDong(discount.maKhuyenMai)} 
                          />
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedDiscount(discount); setIsViewDialogOpen(true) }}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditDiscount(discount)}>
                                <Edit3 className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedDiscount(discount); setIsDeleteDialogOpen(true) }}>
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

        <div className="mt-6">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalDiscounts}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modal Thêm */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="md:max-w-[900px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Tạo Khuyến Mãi Mới</DialogTitle>
              <DialogDescription>Nhập đầy đủ thông tin để tạo chương trình khuyến mãi mới.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 pr-2 overflow-y-auto">
              <DiscountForm
                userTypes={userTypes}
                onSubmit={handleSubmitAdd}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" form="discount-form" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Tạo khuyến mãi</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Sửa */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="md:max-w-[900px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Sửa Khuyến Mãi</DialogTitle>
              <DialogDescription>Cập nhật thông tin chương trình khuyến mãi.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 pr-2 overflow-y-auto">
              <DiscountForm
                defaultValues={formData}
                userTypes={userTypes}
                onSubmit={handleSubmitEdit}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" form="discount-form" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Cập nhật khuyến mãi</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Xóa */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="md:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xóa Khuyến Mãi</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.</DialogDescription>
            </DialogHeader>
            {selectedDiscount && (
              <div className="py-6 bg-red-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p className="font-semibold text-lg">{selectedDiscount.tenKhuyenMai}</p>
                  <p className="text-sm text-gray-600">Mã: <span className="font-mono">{selectedDiscount.maCode}</span></p>
                  <p className="text-sm text-gray-600">
                    Giá trị: {selectedDiscount.loaiKhuyenMai === "GiamPhanTram" 
                      ? `${selectedDiscount.giaTriGiam}%` 
                      : (selectedDiscount.giaTriGiam).toLocaleString() + " VNĐ"
                    }
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>Hủy</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...</> : <><Trash2 className="mr-2 h-4 w-4" /> Xóa khuyến mãi</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Xem Chi Tiết */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="md:max-w-[700px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Chi Tiết Khuyến Mãi</DialogTitle>
            </DialogHeader>
            {selectedDiscount && (
              <div className="space-y-6 py-4 overflow-y-auto max-h-[70vh]">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedDiscount.tenKhuyenMai}</h3>
                      <p className="text-sm text-gray-600 mt-1 font-mono">{selectedDiscount.maCode}</p>
                    </div>
                    {getStatusBadge(selectedDiscount)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Loại khuyến mãi</p>
                      <p className="text-lg font-semibold">
                        {selectedDiscount.loaiKhuyenMai === "GiamPhanTram" ? "Giảm theo %" : "Giảm số tiền"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Giá trị giảm</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {selectedDiscount.loaiKhuyenMai === "GiamPhanTram" 
                          ? `${selectedDiscount.giaTriGiam}%` 
                          : (selectedDiscount.giaTriGiam).toLocaleString() + " VNĐ"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Số lượng</Label>
                    <p className="mt-1 text-base">
                      <span className="font-semibold">{selectedDiscount.soLuongDaDung}</span>
                      <span className="text-gray-500"> / {selectedDiscount.soLuong || "Không giới hạn"}</span>
                    </p>
                  </div>

                  {selectedDiscount.giamToiDa && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Giảm tối đa</Label>
                      <p className="mt-1 text-base font-semibold">{(selectedDiscount.giamToiDa).toLocaleString() + " VNĐ"}</p>
                    </div>
                  )}

                  {selectedDiscount.donHangToiThieu && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Đơn hàng tối thiểu</Label>
                      <p className="mt-1 text-base font-semibold">{(selectedDiscount.donHangToiThieu).toLocaleString() + " VNĐ"}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Đối tượng áp dụng</Label>
                    <p className="mt-1 text-base">
                      {selectedDiscount.loaiNguoiDung?.tenLoaiNguoiDung || "Tất cả khách hàng"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-600">Thời gian áp dụng</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <Calendar className="inline h-4 w-4 mr-1 text-gray-500" />
                      Bắt đầu: <span className="font-medium">{formatDate(selectedDiscount.ngayBatDau)}</span>
                    </p>
                    <p className="text-sm">
                      <Calendar className="inline h-4 w-4 mr-1 text-gray-500" />
                      Kết thúc: <span className="font-medium">{formatDate(selectedDiscount.ngayKetThuc)}</span>
                    </p>
                  </div>
                </div>

                {selectedDiscount.moTa && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Mô tả</Label>
                    <p className="mt-2 text-gray-700 text-sm leading-relaxed">{selectedDiscount.moTa}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
              <Button onClick={() => { 
                setIsViewDialogOpen(false); 
                if(selectedDiscount) handleEditDiscount(selectedDiscount) 
              }}>
                Sửa khuyến mãi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageDiscountPage