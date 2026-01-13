import { useState, useEffect, useRef } from 'react'
import { Receipt, Calendar, CreditCard, Tag, Film, MapPin, Clock, QrCode, Package, Utensils, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { historyTickets } from '@/services/api'
import UserLayout from '@/components/layout/UserLayout'
import QRCodeLib from 'qrcode'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime } from '@/utils/formatDate'
import { toast } from 'sonner'
import { handleError } from '@/utils/handleError.utils'
import { phienBan } from '@/constants/version'
import { ngonNgu } from '@/constants/language'

interface KhuyenMai {
  tenKhuyenMai: string
  maCode: string
  loaiKhuyenMai: 'GiamTien' | 'GiamPhanTram'
  giaTriGiam: number
}

interface NhanVien {
  hoTen: string
}

interface Phim {
  tenPhim: string
  anhBia: string
  phienBan: 'TWO_D' | 'THREE_D'
  ngonNgu: 'LongTieng' | 'PhuDe'
}

interface LoaiGhe {
  tenLoaiGhe: string
}

interface Rap {
  tenRap: string
  diaChi: string
}

interface PhongChieu {
  tenPhong: string
  rap: Rap
}

interface Ghe {
  hangGhe: string
  soGhe: number
  loaiGhe: LoaiGhe
  phongChieu: PhongChieu
}

interface SuatChieu {
  gioBatDau: string
  phim: Phim
}

interface GheSuatChieu {
  ghe: Ghe
  suatChieu: SuatChieu
}

interface Ve {
  maVe: string
  giaVe: number
  trangThai: 'DaCheckIn' | 'DaThanhToan'
  thoiGianCheckIn?: string
  gheSuatChieu: GheSuatChieu
  nhanVienSoatVe?: NhanVien
}

interface Combo {
  tenCombo: string
  anhCombo: string
}

interface HoaDonCombo {
  maCombo: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
  combo: Combo
  nhanVienSoatBapNuoc?: NhanVien
}

interface SanPham {
  tenSanPham: string
  anhSanPham: string
}

interface HoaDonSanPham {
  maSanPham: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
  sanPham: SanPham
  nhanVienSoatBapNuoc?: NhanVien
}

interface HoaDon {
  maHoaDon: string
  maQR: string
  tongTien: number
  phuongThucThanhToan: 'VNPAY' | 'TIENMAT'
  ngayThanhToan: string
  hinhThucDatVe: 'Online' | 'Offline'
  khuyenMai?: KhuyenMai
  nhanVienBanVe?: NhanVien
  ves: Ve[]
  hoaDonCombos: HoaDonCombo[]
  hoaDonSanPhams: HoaDonSanPham[]
}

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<HoaDon[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedTransaction, setSelectedTransaction] = useState<HoaDon | null>(null)
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set())
  const qrCodeRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    if (selectedTransaction && qrCodeRef.current) {
      QRCodeLib.toCanvas(qrCodeRef.current, selectedTransaction.maQR, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    }
  }, [selectedTransaction])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await historyTickets()
      setTransactions(data)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (maHoaDon: string) => {
    setExpandedTransactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(maHoaDon)) {
        newSet.delete(maHoaDon)
      } else {
        newSet.add(maHoaDon)
      }
      return newSet
    })
  }

  const getPaymentMethodText = (method: string): string => {
    const methods: Record<string, string> = {
      'VNPAY': 'VNPay',
      'TIENMAT': 'Tiền mặt'
    }
    return methods[method] || method
  }

  const getBookingTypeText = (type: string): string => {
    return type === 'Online' ? 'Đặt online' : 'Mua tại quầy'
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-300 mx-auto mb-6"></div>
            <p className="text-white text-lg font-medium">Đang tải lịch sử giao dịch...</p>
          </div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="mx-auto max-w-8xl mt-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-anton text-white mb-4 uppercase">Lịch sử giao dịch</h1>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-lg rounded border border-white/30 shadow-2xl p-16 text-center">
            <Receipt className="w-24 h-24 text-white/60 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Chưa có giao dịch</h3>
            <p className="text-gray-200 text-lg">Bạn chưa thực hiện giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((transaction) => {
              const isExpanded = expandedTransactions.has(transaction.maHoaDon)
              const hasItems = 
                (transaction.ves?.length > 0) || 
                (transaction.hoaDonCombos?.length > 0) || 
                (transaction.hoaDonSanPhams?.length > 0)
              
              return (
                <div key={transaction.maHoaDon} className="bg-white/20 backdrop-blur-lg rounded border border-white/30 hover:border-yellow-300/60 transition-all shadow-xl">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            Mã đặt vé: {transaction.maQR}
                          </h3>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                            transaction.hinhThucDatVe === 'Online' 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          }`}>
                            {getBookingTypeText(transaction.hinhThucDatVe)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-yellow-300" />
                            <span className="font-medium">{formatTime(transaction.ngayThanhToan)} {formatDate(transaction.ngayThanhToan)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-yellow-300" />
                            <span className="font-medium">{getPaymentMethodText(transaction.phuongThucThanhToan)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                          {Number((transaction.tongTien)).toLocaleString()} VNĐ
                        </div>
                        {transaction.khuyenMai && (
                          <div className="flex md:justify-end items-center gap-1.5 text-sm text-green-400 mt-1">
                            <Tag className="w-4 h-4" />
                            <span className="font-medium">{transaction.khuyenMai.maCode}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center justify-between py-3 border-t border-white/20">
                      <div className="flex items-center gap-4 text-sm text-white">
                        {transaction.ves?.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-blue-400" />
                            <span>{transaction.ves.length} vé</span>
                          </div>
                        )}
                        {transaction.hoaDonCombos?.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-orange-400" />
                            <span>{transaction.hoaDonCombos.length} combo</span>
                          </div>
                        )}
                        {transaction.hoaDonSanPhams?.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Utensils className="w-4 h-4 text-red-400" />
                            <span>{transaction.hoaDonSanPhams.length} sản phẩm</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="yellowToPinkPurple"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="font-bold cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>QR</span>
                        </Button>
                        
                        {hasItems && (
                          <button
                            onClick={() => toggleExpand(transaction.maHoaDon)}
                            className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-all cursor-pointer text-sm font-medium"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                <span>Thu gọn</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                <span>Chi tiết</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && hasItems && (
                      <div className="mt-6 space-y-6 border-t border-white/20 pt-5">
                        {/* Vé xem phim */}
                        {transaction.ves && transaction.ves.length > 0 && (
                          <div>
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                              <Film className="w-6 h-6 text-blue-400" />
                              Vé xem phim ({transaction.ves.length})
                            </h4>
                            <div className="space-y-4">
                              {transaction.ves.map((ve) => (
                                <div 
                                  key={ve.maVe} 
                                  className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded p-4 border border-blue-400/30 flex flex-col md:flex-row gap-6"
                                >
                                  {/* Ảnh phim */}
                                  <img
                                    src={ve.gheSuatChieu.suatChieu.phim.anhBia}
                                    alt={ve.gheSuatChieu.suatChieu.phim.tenPhim}
                                    className="w-32 h-48 object-cover rounded border-2 border-white/30 flex-shrink-0"
                                  />

                                  {/* Thông tin vé */}
                                  <div className="flex-1 space-y-4">
                                    <div>
                                      <h5 className="font-bold text-white text-2xl truncate">
                                        {ve.gheSuatChieu.suatChieu.phim.tenPhim}
                                      </h5>
                                      <div className="text-sm text-gray-300 mt-1">
                                        {phienBan[ve.gheSuatChieu.suatChieu.phim.phienBan]} • {ngonNgu[ve.gheSuatChieu.suatChieu.phim.ngonNgu]}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-white">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-300" />
                                        <span className="font-medium">{formatTime(ve.gheSuatChieu.suatChieu.gioBatDau)}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-yellow-300" />
                                        <span className="font-medium">{ve.gheSuatChieu.ghe.phongChieu.rap.tenRap}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-yellow-300 font-medium">Phòng:</span>
                                        <span className="font-medium">{ve.gheSuatChieu.ghe.phongChieu.tenPhong}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-x-6 gap-y-3">
                                      <div className="flex items-center gap-3">
                                        <span className="text-yellow-300 font-medium text-base">Ghế:</span>
                                        <span className="bg-white/30 px-2 py-1 rounded text-white font-semibold text-sm">
                                          {ve.gheSuatChieu.ghe.hangGhe}{ve.gheSuatChieu.ghe.soGhe} ({ve.gheSuatChieu.ghe.loaiGhe.tenLoaiGhe})
                                        </span>
                                      </div>
                                      <div className="text-xl font-bold text-yellow-300">
                                        {Number((ve.giaVe)).toLocaleString()} VNĐ
                                      </div>
                                    </div>
                                  </div>

                                  {ve.trangThai === 'DaCheckIn' && (
                                    <div className="w-full md:w-72 lg:w-80 text-right md:border-l md:border-white/20 md:pl-6 flex flex-col justify-start gap-1">
                                      <div className="flex items-center justify-end gap-2 text-green-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-medium text">Đã check-in</span>
                                      </div>
                                      <div className="text-sm text-green-300/90 flex items-center justify-end gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span>{formatTime(ve.thoiGianCheckIn)} {formatDate(ve.thoiGianCheckIn)}</span>
                                      </div>
                                      {ve.nhanVienSoatVe && (
                                        <div className="text-sm text-gray-300 italic">
                                          Nhân viên soát vé: {ve.nhanVienSoatVe.hoTen}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Combo */}
                        {transaction.hoaDonCombos && transaction.hoaDonCombos.length > 0 && (
                          <div>
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                              <Package className="w-6 h-6 text-orange-400" />
                              Combo ({transaction.hoaDonCombos.length})
                            </h4>
                            <div className="space-y-3">
                              {transaction.hoaDonCombos.map((item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row items-start gap-4 bg-gradient-to-r from-orange-400/30 to-red-400/30 rounded p-4 border border-orange-300/40">
                                  <img
                                    src={item.combo.anhCombo}
                                    alt={item.combo.tenCombo}
                                    className="w-16 h-16 object-cover rounded border-2 border-white/30"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-white text-lg truncate">{item.combo.tenCombo}</div>
                                    <div className="text-base text-white mt-2">
                                      SL: {item.soLuong} • <span className="font-bold text-orange-200">{Number((item.tongTien)).toLocaleString()} VNĐ</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {item.daLay ? (
                                      <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-green-300">
                                          <CheckCircle2 className="w-5 h-5" />
                                          <span className="font-medium">Đã lấy</span>
                                        </div>
                                        <div className="text-sm text-green-200/90 flex items-center gap-2 mt-1">
                                          <Clock className="w-4 h-4" />
                                          <span>{formatTime(item.thoiGianLay)} {formatDate(item.thoiGianLay)}</span>
                                        </div>
                                        {item.nhanVienSoatBapNuoc && (
                                          <div className="text-sm text-gray-300 italic mt-1">
                                            Nhân viên soát bắp nước: {item.nhanVienSoatBapNuoc.hoTen}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-orange-200">
                                        <Clock className="w-5 h-5" />
                                        <span>Chưa lấy</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sản phẩm */}
                        {transaction.hoaDonSanPhams && transaction.hoaDonSanPhams.length > 0 && (
                          <div>
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                              <Utensils className="w-6 h-6 text-red-400" />
                              Sản phẩm ({transaction.hoaDonSanPhams.length})
                            </h4>
                            <div className="space-y-3">
                              {transaction.hoaDonSanPhams.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 bg-gradient-to-r from-red-400/30 to-pink-400/30 rounded p-4 border border-red-300/40">
                                  <img
                                    src={item.sanPham.anhSanPham}
                                    alt={item.sanPham.tenSanPham}
                                    className="w-16 h-16 object-cover rounded border-2 border-white/30"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-white text-lg truncate">{item.sanPham.tenSanPham}</div>
                                    <div className="text-base text-white mt-2">
                                      SL: {item.soLuong} • <span className="font-bold text-red-200">{Number((item.tongTien)).toLocaleString()} VNĐ</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {item.daLay ? (
                                      <div className="text-right">
                                        <div className="flex items-center gap-2 text-green-300">
                                          <CheckCircle2 className="w-5 h-5" />
                                          <span className="font-medium">Đã lấy</span>
                                        </div>
                                        <div className="text-sm text-green-200/90 flex items-center gap-2 mt-1">
                                          <Clock className="w-4 h-4" />
                                          <span>{formatTime(item.thoiGianLay)} {formatDate(item.thoiGianLay)}</span>
                                        </div>
                                        {item.nhanVienSoatBapNuoc && (
                                          <div className="text-sm text-gray-300 italic mt-1">
                                            Nhân viên: {item.nhanVienSoatBapNuoc.hoTen}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-red-300">
                                        <Clock className="w-5 h-5" />
                                        <span>Chưa lấy</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Khuyến mãi */}
                        {transaction.khuyenMai && (
                          <div className="bg-gradient-to-r from-green-400/30 to-emerald-400/30 px-4 py-3 rounded border border-green-300/40">
                            <div className="text-sm text-white flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-yellow-300" />
                              Khuyến mãi
                            </div>
                            <div className="font-bold text-green-200">{transaction.khuyenMai.tenKhuyenMai}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTransaction && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div 
            className="bg-gradient-to-br from-white to-gray-100 rounded p-8 max-w-md w-full border-2 border-yellow-300/70 max-h-[90vh] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <h3 className="text-3xl font-anton text-purple-900 uppercase ">Mã QR Hóa Đơn</h3>
              </div>
              <canvas ref={qrCodeRef} className="mx-auto border border-purple-400 rounded"></canvas>
              <p className="text-gray-700 text-lg my-4 font-bold">{selectedTransaction.maQR}</p>

              <div className="bg-purple-100 rounded p-4 mb-6 border border-purple-300">
                <p className="text-sm text-gray-800 font-medium">
                  Xuất trình mã QR này tại quầy để check-in hoặc nhận sản phẩm
                </p>
              </div>

              <Button
                variant="yellowToPinkPurple"
                onClick={() => setSelectedTransaction(null)}
                className="w-full h-12 text-lg font-anton uppercase"
              >
                <span>Đóng</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  )
}

export default TransactionHistoryPage