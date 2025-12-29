import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { scanFoodStaff } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import axios from "axios"
import { formatDate, formatTime } from "@/utils/formatDate"

interface TicketDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketCode: string
}

interface IPhim {
  maPhim: string
  tenPhim: string
  anhPhim?: string
}

interface IPhongChieu {
  maPhong: string
  tenPhong: string
}

interface ISuatChieu {
  maSuatChieu: string
  gioBatDau: string
  gioKetThuc: string
  phim: IPhim
  phongChieu: IPhongChieu
}

interface IGhe {
  maGhe: string
  hangGhe: string
  soGhe: number
}

interface IGheSuatChieu {
  maGheSuatChieu: string
  ghe: IGhe
  suatChieu: ISuatChieu
}

export interface ITicket {
  maVe: string
  maGheSuatChieu: string
  maHoaDon: string
  giaVe: number
  thoiGianCheckIn: string | null
  maNhanVienSoat: string | null
  trangThai: 'DaThanhToan' | 'DaCheckIn'
  gheSuatChieu: IGheSuatChieu
}

interface ICombo {
  maCombo: string
  tenCombo: string
  anhCombo?: string
}

interface ISanPham {
  maSanPham: string
  tenSanPham: string
  anhSanPham?: string
}

export interface IBillProduct {
  maHoaDon: string
  maSanPham: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay: string | null
  sanPham: ISanPham
}

export interface IBillCombo {
  maHoaDon: string
  maCombo: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay: string | null
  combo: ICombo
}

export interface ScanTicketResponse {
  maHoaDon: string
  tongTien: number
  phuongThucThanhToan: string
  ngayThanhToan: string
  ves: ITicket[]
  hoaDonCombos: IBillCombo[]
  hoaDonSanPhams: IBillProduct[]
}

const TicketDetailModal = ({ open, onOpenChange, ticketCode }: TicketDetailModalProps) => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<ScanTicketResponse | null>(null)

  useEffect(() => {
    if (!open || !ticketCode) return

    const fetchData = async () => {
      setLoading(true)
      setSuccess(false)
      setError("")
      setData(null)

      try {
        const res = await scanFoodStaff(ticketCode)
        setSuccess(true)
        setData(res.data)
      } catch (err) {
        setSuccess(false)
        setError(handleError(err))
        if (axios.isAxiosError(err) && err.response?.data?.data) {
          setData(err.response.data.data)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, ticketCode])

  const firstTicket = data?.ves?.[0]
  const show = firstTicket?.gheSuatChieu?.suatChieu

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b">
          <DialogTitle className="text-2xl font-bold">Lấy bắp nước</DialogTitle>
        </DialogHeader>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-medium text-muted-foreground">Đang xử lý ...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Trạng thái nổi bật */}
              <div className={`p-6 rounded-xl border-2 shadow-sm ${
                success 
                  ? "bg-green-50 border-green-500 text-green-900" 
                  : "bg-red-50 border-red-500 text-red-900"
              }`}>
                <div className="flex items-start gap-5">
                  {success ? (
                    <div className="flex-shrink-0 rounded-full bg-green-100 p-3">
                      <CheckCircle2 className="h-9 w-9 text-green-600" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
                      <AlertCircle className="h-9 w-9 text-red-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xl font-bold leading-tight mb-2">
                      {success ? "Quét thành công!" : "Quét thất bại"}
                    </p>
                    <p className="text-base leading-relaxed">
                      {success 
                        ? "Bắp nước của quý khách đã được ghi nhận" 
                        : error || "Vui lòng kiểm tra lại mã vé hoặc liên hệ nhân viên"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin suất chiếu */}
              {show && (
                <div className="space-y-2">
                  <p className="text-xl font-bold">{show.phim.tenPhim}</p>
                  <div className="text-base space-y-2 text-muted-foreground">
                    <div>Phòng chiếu: {show.phongChieu.tenPhong}</div>
                    <div>
                      Suất chiếu: {formatTime(show.gioBatDau)} • {formatDate(show.gioBatDau)}
                    </div>
                  </div>
                </div>
              )}

              {/* Combo */}
              {data.hoaDonCombos?.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xl font-bold">Combo ({data.hoaDonCombos.length})</p>
                  <div className="space-y-2 text-base">
                    {data.hoaDonCombos.map((c: IBillCombo, i: number) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <span>{c.soLuong}x {c.combo.tenCombo}</span>
                        
                        {c.daLay ? (
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="default" className="text-xs">
                              Đã lấy
                            </Badge>
                            {c.thoiGianLay && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(c.thoiGianLay)} {formatTime(c.thoiGianLay)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Chưa lấy
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sản phẩm */}
              {data.hoaDonSanPhams?.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xl font-bold">Sản phẩm ({data.hoaDonSanPhams.length})</p>
                  <div className="space-y-2 text-base">
                    {data.hoaDonSanPhams.map((p: IBillProduct, i: number) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <span>{p.soLuong}x {p.sanPham.tenSanPham}</span>
                        
                        {p.daLay ? (
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="default" className="text-xs">
                              Đã lấy
                            </Badge>
                            {p.thoiGianLay && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(p.thoiGianLay)} {formatTime(p.thoiGianLay)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Chưa lấy
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-red-600">
              <AlertCircle className="h-12 w-12" />
              <p className="text-xl font-medium text-center">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer cố định */}
        <div className="border-t px-6 py-5 bg-muted/30">
          <div className="flex justify-end">
            <Button 
              size="lg" 
              className="min-w-[140px]"
              onClick={() => onOpenChange(false)}
            >
              {success ? "Hoàn tất" : "Đóng"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TicketDetailModal