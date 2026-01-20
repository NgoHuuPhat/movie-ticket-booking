import { useState } from "react"
import { Receipt, Film, Package, Utensils, Clock, QrCode, CheckCircle2, ChevronDown, ChevronUp, CreditCard, Tag, Sparkles, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/utils/formatDate"
import { phienBan } from "@/constants/version"
import { ngonNgu } from "@/constants/language"
import TransactionQRModal from "@/components/common/TransactionQRModal"

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

interface IHoaDon {
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

interface TransactionHistoryTabProps {
  transactions: IHoaDon[]
}

const TransactionHistoryTab = ({ transactions }: TransactionHistoryTabProps) => {
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set())
  const [selectedTransaction, setSelectedTransaction] = useState<IHoaDon | null>(null)

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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <Receipt className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-600 mb-2">Chưa có giao dịch</h3>
        <p className="text-gray-500">Bạn chưa thực hiện giao dịch nào</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {transactions.map((transaction) => {
          const isExpanded = expandedTransactions.has(transaction.maHoaDon)
          const hasItems = 
            (transaction.ves?.length > 0) || 
            (transaction.hoaDonCombos?.length > 0) || 
            (transaction.hoaDonSanPhams?.length > 0)
          
          return (
            <div key={transaction.maHoaDon} className="bg-white backdrop-blur-lg rounded border border-purple-300 hover:border-purple-500 transition-all shadow-xl">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        Mã đặt vé: {transaction.maQR}
                      </h3>
                      <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${
                        transaction.hinhThucDatVe === 'Online' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-yellow-300 text-black'
                      }`}>
                        {transaction.hinhThucDatVe === 'Online' ? 'Đặt online' : 'Mua tại quầy'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3  text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>{formatTime(transaction.ngayThanhToan)} {formatDate(transaction.ngayThanhToan)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-purple-500" />
                        <span>{transaction.phuongThucThanhToan === 'VNPAY' ? 'VNPAY' : 'Tiền mặt'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {Number(transaction.tongTien).toLocaleString()} VNĐ
                    </div>
                    {transaction.khuyenMai && (
                      <div className="flex md:justify-end items-center gap-1.5  text-purple-600 mt-1">
                        <Tag className="w-4 h-4" />
                        <span>{transaction.khuyenMai.maCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t-2 border-purple-200">
                  <div className="flex items-center gap-4  text-gray-700">
                    {transaction.ves?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-blue-500" />
                        <span>{transaction.ves.length} vé</span>
                      </div>
                    )}
                    {transaction.hoaDonCombos?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-orange-500" />
                        <span>{transaction.hoaDonCombos.length} combo</span>
                      </div>
                    )}
                    {transaction.hoaDonSanPhams?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-red-500" />
                        <span>{transaction.hoaDonSanPhams.length} sản phẩm</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="purpleToYellowOrange"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      <span className="font-bold">QR</span>
                    </Button>
                    
                    {hasItems && (
                      <button
                        onClick={() => toggleExpand(transaction.maHoaDon)}
                        className="flex cursor-pointer items-center gap-1 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-all  font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Thu gọn
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Chi tiết
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && hasItems && (
                  <div className="mt-6 space-y-6 border-t-2 border-purple-200 pt-5">
                    {/* Tickets */}
                    {transaction.ves && transaction.ves.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                          <Film className="w-6 h-6 text-blue-500" />
                          Vé xem phim ({transaction.ves.length})
                        </h4>
                        <div className="space-y-4">
                          {transaction.ves.map((ve: Ve) => (
                            <div key={ve.maVe} className="bg-white rounded p-4 border-1 border-blue-200 flex flex-col md:flex-row gap-6 shadow-md">
                              <img
                                src={ve.gheSuatChieu.suatChieu.phim.anhBia}
                                alt={ve.gheSuatChieu.suatChieu.phim.tenPhim}
                                className="w-32 h-48 object-cover rounded border-1 border-blue-300 flex-shrink-0"
                              />
                              <div className="flex-1 space-y-3">
                                <div>
                                  <h5 className="font-bold text-gray-800 text-xl">
                                    {ve.gheSuatChieu.suatChieu.phim.tenPhim}
                                  </h5>
                                  <div className=" text-gray-600 mt-1">
                                    {phienBan[ve.gheSuatChieu.suatChieu.phim.phienBan]} • {ngonNgu[ve.gheSuatChieu.suatChieu.phim.ngonNgu]}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2  text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-500" />
                                    <span>{formatTime(ve.gheSuatChieu.suatChieu.gioBatDau)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-500" />
                                    <span>{ve.gheSuatChieu.ghe.phongChieu.rap.tenRap}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-x-6">
                                  <div className="flex items-center gap-2">
                                    <span className="text-purple-600 font-medium">Ghế:</span>
                                    <span className="bg-purple-100 px-3 py-1 rounded text-purple-800 font-semibold">
                                      {ve.gheSuatChieu.ghe.hangGhe}{ve.gheSuatChieu.ghe.soGhe}
                                    </span>
                                  </div>
                                  <div className="text-lg font-bold text-purple-600">
                                    {Number(ve.giaVe).toLocaleString()} VNĐ
                                  </div>
                                </div>
                              </div>
                              {ve.trangThai === 'DaCheckIn' && (
                                <div className="w-full md:w-72 lg:w-80 text-right md:border-l md:border-white/20 md:pl-6 flex flex-col justify-start gap-1">
                                  <div className="flex items-center justify-end gap-2 text-purple-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-medium text">Đã check-in</span>
                                  </div>
                                  <div className=" text-purple-600 flex items-center justify-end gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>{formatTime(ve.thoiGianCheckIn)} {formatDate(ve.thoiGianCheckIn)}</span>
                                  </div>
                                  {ve.nhanVienSoatVe && (
                                    <div className="text text-purple-600 italic">
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

                    {/* Combos & Products */}
                    {transaction.hoaDonCombos && transaction.hoaDonCombos.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                          <Package className="w-6 h-6 text-orange-500" />
                          Combo ({transaction.hoaDonCombos.length})
                        </h4>
                        <div className="space-y-3">
                          {transaction.hoaDonCombos.map((item: HoaDonCombo, idx: number) => (
                            <div key={idx} className="flex items-start gap-4 bg-white rounded p-4 border-1 border-orange-200 shadow-md">
                              <img src={item.combo.anhCombo} alt={item.combo.tenCombo} className="w-16 h-16 object-cover rounded border-1 border-orange-300" />
                              <div className="flex-1">
                                <div className="font-bold text-gray-800 text-lg">{item.combo.tenCombo}</div>
                                <div className="text-gray-700 mt-1">
                                  SL: {item.soLuong} • <span className="font-bold text-orange-600">{Number(item.tongTien).toLocaleString()} VNĐ</span>
                                </div>
                              </div>
                              {item.daLay && (
                                <div className="flex items-center gap-2 text-purple-600">
                                  <CheckCircle2 className="w-5 h-5" />
                                  <span className="font-semibold">Đã lấy</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {transaction.khuyenMai && (
                      <div className="bg-gradient-to-r from-purple-100 to-emerald-100 px-4 py-3 rounded border-1 border-purple-300">
                        <div className=" text-gray-700 flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          Khuyến mãi
                        </div>
                        <div className="font-bold text-purple-700">{transaction.khuyenMai.tenKhuyenMai}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTransaction && (
        <TransactionQRModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  )
}

export default TransactionHistoryTab