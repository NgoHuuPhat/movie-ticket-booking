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
import PaginationBar from "@/components/Admin/PaginationBar"
import { getAllTicketsStaff } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { Label } from "@/components/ui/label"
import { formatDate, formatTime } from "@/utils/formatDate"
import StaffLayout from "@/components/layout/StaffLayout"
import QRScannerModal from "@/components/Staff/QRScannerModal"
import FoodDetailModal from "@/components/Staff/FoodDetailModal"
import type { IInvoice } from "@/types/invoice"

const FoodOrdersPage = () => {
  const [invoices, setInvoices] = useState<IInvoice[]>([])
  const [expandedInvoiceIds, setExpandedInvoiceIds] = useState<string[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null)

  const [showScanner, setShowScanner] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [currentQRCode, setCurrentQRCode] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
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

  // Fetch invoices
  const fetchInvoices = async () => {
    try {

      const res = await getAllTicketsStaff({
        page: currentPage,
        search: searchQuery || undefined,
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
  useEffect(() => {
    fetchInvoices()
  }, [currentPage, searchQuery, hinhThucFilter, dateFilter])

  return (
    <StaffLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header + Stats */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hóa Đơn Bắp Nước</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Danh sách hóa đơn bắp nước đã được đặt.
              </p>
            </div>
            <Button onClick={() => setShowScanner(true)}>
              <ScanLine className="mr-2 h-4 w-4" /> Quét bắp nước
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
                              <div className="font-medium">{invoice.nguoiDung?.hoTen}</div>
                              <div className="text-xs text-gray-500">{invoice.nguoiDung?.email}</div>
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
                                {invoice.phuongThucThanhToan == 'TIENMAT' ? 'Tiền mặt' : `${invoice.phuongThucThanhToan}`} • {invoice.hinhThucDatVe}
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

                                  {/* Số lượng vé */}
                                  {invoice.ves.length > 0 && (
                                    <div className="mb-8">
                                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-purple-600" />
                                        Vé xem phim ({invoice.ves.length})
                                      </h3>
                                    </div>
                                  )}

                                  {/* Combo */}
                                  {invoice.combos.length > 0 && (
                                    <div className="mb-8">
                                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-amber-600" />
                                        Combo ({invoice.combos.length})
                                      </h3>
                                      <div className="overflow-x-auto rounded-lg border border-amber-100 shadow-sm">
                                        <table className="w-full">
                                          <thead className="bg-amber-50">
                                            <tr>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-amber-900">Mã combo</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-amber-900">Tên combo</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-amber-900">Số lượng</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-amber-900">Đơn giá</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-amber-900">Tổng tiền</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-amber-900">Trạng thái</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-amber-100">
                                            {invoice.combos.map((combo) => (
                                              <tr key={combo.maCombo} className="hover:bg-amber-50/50 transition-colors">
                                                <td className="py-4 px-4 font-medium text-gray-800">{combo.maCombo}</td>
                                                <td className="py-4 px-4 font-medium">{combo.tenCombo}</td>
                                                <td className="py-4 px-4">
                                                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                                                    x{combo.soLuong}
                                                  </Badge>
                                                </td>
                                                <td className="py-4 px-4 text-gray-700">{Number(combo.donGia).toLocaleString()} VNĐ</td>
                                                <td className="py-4 px-4 font-medium text-emerald-700">
                                                  {Number(combo.tongTien).toLocaleString()} VNĐ
                                                </td>
                                                <td className="py-4 px-4">
                                                  <Badge
                                                    className={
                                                      combo.daLay
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-orange-100 text-orange-800"
                                                    }
                                                  >
                                                    {combo.daLay ? "Đã lấy" : "Chưa lấy"}
                                                  </Badge>
                                                  {combo.daLay && combo.thoiGianLay && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      {formatTime(combo.thoiGianLay)} {formatDate(combo.thoiGianLay)}
                                                    </div>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* Sản phẩm */}
                                  {invoice.sanPhams.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                                        Sản phẩm ({invoice.sanPhams.length})
                                      </h3>
                                      <div className="overflow-x-auto rounded-lg border border-blue-100 shadow-sm">
                                        <table className="w-full">
                                          <thead className="bg-blue-50">
                                            <tr>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-900">Mã sản phẩm</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-900">Tên sản phẩm</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-900">Số lượng</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-900">Đơn giá</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-900">Tổng tiền</th>
                                              <th className="text-left py-3 px-4 text-sm font-semibold text-blue-900">Trạng thái</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-blue-100">
                                            {invoice.sanPhams.map((sp) => (
                                              <tr key={sp.maSanPham} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="py-4 px-4 font-medium text-gray-800">{sp.maSanPham}</td>
                                                <td className="py-4 px-4 font-medium">{sp.tenSanPham}</td>
                                                <td className="py-4 px-4">
                                                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                                                    x{sp.soLuong}
                                                  </Badge>
                                                </td>
                                                <td className="py-4 px-4 text-gray-700">{Number(sp.donGia).toLocaleString()} VNĐ</td>
                                                <td className="py-4 px-4 font-medium text-emerald-700">
                                                  {Number(sp.tongTien).toLocaleString()} VNĐ
                                                </td>
                                                <td className="py-4 px-4">
                                                  <Badge
                                                    className={
                                                      sp.daLay
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-orange-100 text-orange-800"
                                                    }
                                                  >
                                                    {sp.daLay ? "Đã lấy" : "Chưa lấy"}
                                                  </Badge>
                                                  {sp.daLay && sp.thoiGianLay && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                      {formatTime(sp.thoiGianLay)} {formatDate(sp.thoiGianLay)}
                                                    </div>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* Không có gì */}
                                  {!hasItems && (
                                    <div className="text-center text-gray-500 py-10">
                                      Không có combo hoặc sản phẩm nào trong hóa đơn này.
                                    </div>
                                  )}
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
                      <p className="font-medium">{selectedInvoice.nguoiDung?.hoTen}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.nguoiDung?.email}</p>
                      <p className="text-sm text-gray-600">{selectedInvoice.nguoiDung?.soDienThoai}</p>
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
                        {selectedInvoice.phuongThucThanhToan == 'TIENMAT' ? 'Tiền mặt' : `${selectedInvoice.phuongThucThanhToan}`}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Hình thức</Label>
                      <Badge variant="secondary" className="mt-1">
                        {selectedInvoice.hinhThucDatVe}
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
                </div>

                {/* Chi tiết combo */}
                {selectedInvoice.combos.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-amber-600" />
                      Combo đã mua ({selectedInvoice.combos.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedInvoice.combos.map(combo => (
                        <div key={combo.maCombo} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{combo.tenCombo}</p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {combo.soLuong} × {Number(combo.donGia).toLocaleString()} VNĐ
                            </p>

                            <div className="mt-2">
                              Bao gồm:
                              {combo.chiTietCombos.map(ctc => (
                                <p key={ctc.maSanPham} className="text-sm text-gray-600">
                                  {ctc.tenSanPham} x {ctc.soLuong}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-700">{Number(combo.tongTien).toLocaleString()} VNĐ</p>
                            <Badge className={combo.daLay ? "bg-green-100 text-green-800 mt-1" : "bg-orange-100 text-orange-800 mt-1"}>
                              {combo.daLay ? "Đã lấy" : "Chưa lấy"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chi tiết sản phẩm */}
                {selectedInvoice.sanPhams.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2 text-blue-600" />
                      Sản phẩm đã mua ({selectedInvoice.sanPhams.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedInvoice.sanPhams.map(sp => (
                        <div key={sp.maSanPham} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{sp.tenSanPham}</p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {sp.soLuong} × {Number(sp.donGia).toLocaleString()} VNĐ
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-700">{Number(sp.tongTien).toLocaleString()} VNĐ</p>
                            <Badge className={sp.daLay ? "bg-green-100 text-green-800 mt-1" : "bg-orange-100 text-orange-800 mt-1"}>
                              {sp.daLay ? "Đã lấy" : "Chưa lấy"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
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
          fetchInvoices()
        }}
      />

      { /* Food Detail Modal */ }
      <FoodDetailModal
        open={showDetail}
        onOpenChange={setShowDetail}
        ticketCode={currentQRCode}
      />
    </StaffLayout>
  )
}

export default FoodOrdersPage