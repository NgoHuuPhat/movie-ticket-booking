import { useState, useEffect, Fragment } from "react"
import {
  Ticket, Search, Filter, MoreVertical, Eye,
  ChevronDown, ChevronRight,
  Package, ShoppingBag,
  ScanLine
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import PaginationBar from "@/components/Admin/PaginationBar"
import { getAllTicketsStaff, getMoviesForSelect } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { Label } from "@/components/ui/label"
import { formatDate, formatTime } from "@/utils/formatDate"
import StaffLayout from "@/components/layout/StaffLayout"
import QRScannerModal from "@/components/Staff/QRScannerModal"
import TicketDetailModal from "@/components/Staff/TicketDetailModal"

interface ITicket {
  maVe: string
  giaVe: number
  trangThai: "DaCheckIn" | "DaThanhToan"
  thoiGianCheckIn?: string
  suatChieu: {
    maSuatChieu: string
    gioBatDau: string
    phongChieu: { tenPhong: string }
    phim: { tenPhim: string }
    tenPhanLoaiDoTuoi: string
  }
  ghe: string[]
}

interface ICombo {
  maCombo: string
  tenCombo: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
}

interface ISanPham {
  maSanPham: string
  tenSanPham: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
}

interface IInvoiceDisplay {
  maHoaDon: string
  maQR: string
  maNguoiDung: string
  nguoiDung: {
    hoTen: string
    email: string
    soDienThoai: string
  }
  nhanVienBanVe: {
    hoTen: string
    email: string
    soDienThoai: string
  } | null
  tongTien: number
  phuongThucThanhToan: "VNPAY" | "MOMO" | "TIENMAT"
  ngayThanhToan: string
  hinhThuc: "Online" | "Offline"
  maKhuyenMai?: string
  ves: ITicket[]
  combos: ICombo[]
  sanPhams: ISanPham[]
}

const TicketOrdersPage = () => {
  const [invoices, setInvoices] = useState<IInvoiceDisplay[]>([])
  const [movies, setMovies] = useState<Array<{ maPhim: string; tenPhim: string }>>([])
  const [expandedInvoiceIds, setExpandedInvoiceIds] = useState<string[]>([])
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoiceDisplay | null>(null)

  const [showScanner, setShowScanner] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [currentQRCode, setCurrentQRCode] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [movieFilter, setMovieFilter] = useState<"all" | string>("all")
  const [hinhThucFilter, setHinhThucFilter] = useState<"all" | "online" | "offline">("all")
  const [dateFilter, setDateFilter] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const toggleExpandInvoice = (maHoaDon: string) => {
    setExpandedInvoiceIds(prev =>
      prev.includes(maHoaDon) ? prev.filter(id => id !== maHoaDon) : [...prev, maHoaDon]
    )
  }

  // Load movies for filter
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMoviesForSelect()
        setMovies(data)
      } catch (err) {
        toast.error(handleError(err))
      }
    }
    fetchMovies()
  }, [])


  // Load list bills
  useEffect(() => {
    const fetchInvoices = async () => {
      try {

        const res = await getAllTicketsStaff({
          page: currentPage,
          search: searchQuery || undefined,
          phim: movieFilter === "all" ? undefined : movieFilter,
          hinhThuc: hinhThucFilter === "all" ? undefined : hinhThucFilter,
          date: dateFilter || undefined
        })

        setInvoices(res.invoices)
        setTotalInvoices(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        toast.error(handleError(error) || "Không thể tải danh sách hóa đơn")
      }
    }
    fetchInvoices()
  }, [currentPage, searchQuery, movieFilter, hinhThucFilter, dateFilter])

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedInvoiceIds(checked ? invoices.map(i => i.maHoaDon) : [])
  }

  const getTrangThaiVeDisplay = (status: string) => {
    switch (status) {
      case "DaCheckIn": return { label: "Đã check-in", color: "bg-emerald-100 text-emerald-800" }
      case "DaThanhToan":     return { label: "Đã thanh toán", color: "bg-purple-100 text-purple-800" }
      case "DaHoanTien": return { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-800" }
      default: return { label: status, color: "bg-gray-100 text-gray-800" }
    }
  }

  return (
    <StaffLayout>
      <div className="max-w-8xl mx-auto pb-10">
        {/* Header + Stats */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hóa Đơn Vé</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Danh sách hóa đơn vé đã được đặt.
              </p>
            </div>
            <Button onClick={() => setShowScanner(true)}>
              <ScanLine className="mr-2 h-4 w-4" /> Quét vé
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm theo mã hóa đơn, khách hàng, QR..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              <Input
                type="date"
                value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setCurrentPage(1) }}
                className="w-full lg:w-48"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={movieFilter !== "all" ? "bg-emerald-50 text-emerald-700" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Phim
                    {movieFilter !== "all" && <span>({movies.find(m => m.maPhim === movieFilter)?.tenPhim || movieFilter})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setMovieFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  {movies.map(movie => (
                    <DropdownMenuItem key={movie.maPhim} onClick={() => { setMovieFilter(movie.maPhim); setCurrentPage(1) }}>
                      {movie.tenPhim}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={hinhThucFilter !== "all" ? "bg-purple-50 text-purple-700" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Hình thức
                    {hinhThucFilter !== "all" && <span className="ml-1">({hinhThucFilter})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHinhThucFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHinhThucFilter("online"); setCurrentPage(1) }}>Online</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHinhThucFilter("offline"); setCurrentPage(1) }}>Offline</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh sách hóa đơn ({totalInvoices.toLocaleString()})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/60 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedInvoiceIds.length === invoices.length && invoices.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 w-12"></th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Mã hóa đơn</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Khách hàng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Nhân viên đặt</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Số vé</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Hình thức thanh toán</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Ngày mua</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-20 text-gray-500">
                        Không tìm thấy hóa đơn nào
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => {
                      const isExpanded = expandedInvoiceIds.includes(invoice.maHoaDon)
                      const hasItems = invoice.combos.length > 0 || invoice.sanPhams.length > 0

                      return (
                        <Fragment key={invoice.maHoaDon}>
                          <tr
                            className="border-b hover:bg-purple-50/30 transition-colors cursor-pointer group"
                            onClick={() => toggleExpandInvoice(invoice.maHoaDon)}
                          >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedInvoiceIds.includes(invoice.maHoaDon)}
                                onCheckedChange={() => handleSelectInvoice(invoice.maHoaDon)}
                              />
                            </td>
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" onClick={() => toggleExpandInvoice(invoice.maHoaDon)}>
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-purple-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-500" />
                                )}
                              </Button>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-gray-900">{invoice.maHoaDon}</div>
                              <div className="text-xs text-gray-500 font-mono">{invoice.maQR}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{invoice.nguoiDung.hoTen}</div>
                              <div className="text-xs text-gray-500">{invoice.nguoiDung.email}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{invoice.nhanVienBanVe ? invoice.nhanVienBanVe.hoTen : ""} </div>
                              <div className="text-xs text-gray-500">{invoice.nhanVienBanVe ? invoice.nhanVienBanVe.email : ""}</div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="font-medium bg-purple-100 text-purple-800">
                                {invoice.ves.length} vé
                              </Badge>
                              {hasItems && (
                                <div className="flex gap-1 mt-1">
                                  {invoice.combos.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Package className="h-3 w-3 mr-1" />
                                      {invoice.combos.length}
                                    </Badge>
                                  )}
                                  {invoice.sanPhams.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <ShoppingBag className="h-3 w-3 mr-1" />
                                      {invoice.sanPhams.length}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">
                                {invoice.phuongThucThanhToan} • {invoice.hinhThuc}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm">
                              <div>{formatDate(invoice.ngayThanhToan)}</div>
                              <div className="text-xs text-gray-500">{formatTime(invoice.ngayThanhToan)}</div>
                            </td>
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedInvoice(invoice)
                                      setIsViewDialogOpen(true)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> Chi tiết
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-gradient-to-b from-purple-50/50 to-transparent">
                              <td colSpan={10} className="p-0">
                                <div className="px-6 py-6 border-t border-purple-200 animate-in fade-in duration-300">
                                  {/* Danh sách vé */}
                                  <div className="mb-8">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                      <Ticket className="h-5 w-5 text-purple-600" />
                                      Danh sách vé ({invoice.ves.length})
                                    </h3>
                                    <div className="overflow-x-auto rounded-lg border border-purple-100 shadow-sm">
                                      <table className="w-full">
                                        <thead className="bg-purple-50">
                                          <tr>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Mã vé</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Phim</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Suất chiếu</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Phòng</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Ghế</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Giá vé</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Trạng thái</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-100">
                                          {invoice.ves.map((ve) => {
                                            const veStatus = getTrangThaiVeDisplay(ve.trangThai)
                                            return (
                                              <tr key={ve.maVe} className="hover:bg-purple-50/50 transition-colors">
                                                <td className="py-4 px-4 font-medium text-gray-800">{ve.maVe}</td>
                                                <td className="py-4 px-4 font-medium">
                                                  {ve.suatChieu.phim.tenPhim} ({ve.suatChieu.tenPhanLoaiDoTuoi})
                                                  </td>
                                                <td className="py-4 px-4">
                                                  <div className="text-sm">
                                                    {formatDate(ve.suatChieu.gioBatDau)}
                                                    <div className="text-xs text-gray-500">{formatTime(ve.suatChieu.gioBatDau)}</div>
                                                  </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                                                    {ve.suatChieu.phongChieu.tenPhong}
                                                  </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                  <div className="flex flex-wrap gap-1">
                                                    {ve.ghe.map((g) => (
                                                      <Badge key={g} variant="secondary" className="text-xs">
                                                        {g}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                </td>
                                                <td className="py-4 px-4 font-medium text-emerald-700">
                                                  {Number(ve.giaVe).toLocaleString()} VNĐ
                                                </td>
                                                <td className="py-4 px-4">
                                                  <Badge className={veStatus.color}>{veStatus.label}</Badge>
                                                  {ve.trangThai === "DaCheckIn" && ve.thoiGianCheckIn && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      {formatTime(ve.thoiGianCheckIn)} {formatDate(ve.thoiGianCheckIn)}
                                                    </div>
                                                  )}
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })
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
            totalItems={totalInvoices}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Dialog Chi tiết hóa đơn */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết hóa đơn #{selectedInvoice?.maHoaDon}</DialogTitle>
              <DialogDescription>Thông tin chi tiết về hóa đơn và các mục đã mua</DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6 py-4">
                {/* Thông tin hóa đơn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Mã hóa đơn</Label>
                      <p className="font-semibold text-lg">{selectedInvoice.maHoaDon}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Mã QR</Label>
                      <p className="font-mono text-sm bg-white p-2 rounded border">{selectedInvoice.maQR}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Khách hàng</Label>
                      <p className="font-medium">{selectedInvoice.nguoiDung.hoTen}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.nguoiDung.email}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.nguoiDung.soDienThoai}</p>
                    </div>
                    {selectedInvoice.nhanVienBanVe && (
                      <div>
                        <Label className="text-sm text-gray-600">Nhân viên đặt</Label>
                        <p className="font-medium">{selectedInvoice.nhanVienBanVe.hoTen}</p>
                        <p className="text-sm text-gray-600">{selectedInvoice.nhanVienBanVe.email}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Ngày thanh toán</Label>
                      <p className="font-medium">
                        {formatDate(selectedInvoice.ngayThanhToan)} {formatTime(selectedInvoice.ngayThanhToan)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Phương thức thanh toán</Label>
                      <Badge variant="outline" className="mt-1">
                        {selectedInvoice.phuongThucThanhToan}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Hình thức</Label>
                      <Badge variant="secondary" className="mt-1">
                        {selectedInvoice.hinhThuc}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Chi tiết vé */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Ticket className="h-5 w-5 mr-2 text-purple-600" />
                    Vé đã mua ({selectedInvoice.ves.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedInvoice.ves.map(ve => {
                      const veStatus = getTrangThaiVeDisplay(ve.trangThai)
                      return (
                        <div key={ve.maVe} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-lg">{ve.suatChieu.phim.tenPhim}</p>
                              <p className="text-sm text-gray-600">Mã vé: {ve.maVe}</p>
                            </div>
                            <Badge className={veStatus.color}>{veStatus.label}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                            <div>
                              <Label className="text-xs text-gray-500">Phòng chiếu</Label>
                              <p className="font-medium">{ve.suatChieu.phongChieu.tenPhong}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Suất chiếu</Label>
                              <p className="font-medium">
                                {formatTime(ve.suatChieu.gioBatDau)} {formatDate(ve.suatChieu.gioBatDau)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Ghế</Label>
                              <div className="flex gap-1 flex-wrap">
                                {ve.ghe.map(g => (
                                  <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Giá vé</Label>
                              <p className="font-semibold text-emerald-700">{Number(ve.giaVe).toLocaleString()} VNĐ</p>
                            </div>
                          </div>
                          {ve.trangThai === "DaCheckIn" && ve.thoiGianCheckIn && (
                            <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                              Check-in: {formatTime(ve.thoiGianCheckIn)} {formatDate(ve.thoiGianCheckIn)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Chi tiết combo */}
                {selectedInvoice.combos.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-amber-600" />
                      Combo đã mua ({selectedInvoice.combos.length})
                    </h3>
                  </div>
                )}

                {/* Chi tiết sản phẩm */}
                {selectedInvoice.sanPhams.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2 text-blue-600" />
                      Sản phẩm đã mua ({selectedInvoice.sanPhams.length})
                    </h3>
                  </div>
                )}
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

      { /* QR Scanner Modal */ }
      <QRScannerModal 
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanSuccess={(text) => {
          setCurrentQRCode(text)
          setShowDetail(true)
        }}
      />
      
      { /* Ticket Detail Modal */ }
      <TicketDetailModal
        open={showDetail}
        onOpenChange={setShowDetail}
        ticketCode={currentQRCode}
      />
    </StaffLayout>
  )
}

export default TicketOrdersPage