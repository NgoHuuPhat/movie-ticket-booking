import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, QrCode, X, Tag } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { Button } from "@/components/ui/button"
import { createVNPayPayment, checkDiscountCode, getHoldSeatTTL } from "@/services/api"
import type { IDiscount } from "@/types/discount"
import useBookingStore from "@/stores/useBookingStore"
import { formatDate, formatTime } from "@/utils/formatDate"
import { BeatLoader } from "react-spinners"
import { handleError } from "@/utils/handleError.utils"
import { useAlert } from "@/stores/useAlert"
import { toast } from "sonner"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { showToast } = useAlert()
  const { movie, showtime, selectedSeats, selectedFoods, getGrandTotal } = useBookingStore()
  
  const [paymentMethod, setPaymentMethod] = useState("VNPAY")
  const [countdown, setCountdown] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<IDiscount | null>(null)

  useEffect(() => {
    if (!movie || !showtime || selectedSeats.length === 0) {
      navigate(-1)
    }
  }, [movie, showtime, selectedSeats, navigate])

  useEffect(() => {
    const fetchHoldTTLs = async () => {
      try {
        if(!showtime || selectedSeats.length === 0) return

        const seadId = selectedSeats[0].maGhe
        const res = await getHoldSeatTTL(showtime.maSuatChieu, seadId)
        setCountdown(res.ttl)
      } catch (error) {
        console.error("Lỗi khi lấy thời gian giữ ghế:", handleError(error))
        showToast(handleError(error))
      }
    }
    fetchHoldTTLs()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          showToast("Hết thời gian giữ ghế. Vui lòng đặt lại vé.", () => {
            navigate(-1)
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate, showToast])

  if (!movie || !showtime || selectedSeats.length === 0) {
    return (
      <UserLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <BeatLoader/>
            <p className="mt-4 text-white">Đang chuyển hướng...</p>
          </div>
        </div>
      </UserLayout>
    )
  }

  const formatTimeCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleApplyDiscount = async (codeFromClick?: string) => {
    const maCode = codeFromClick || selectedDiscount || customCode.trim().toUpperCase()
    if (!maCode) {
      alert("Vui lòng chọn hoặc nhập mã giảm giá")
      return
    }

    try {
      const res = await checkDiscountCode(maCode, getGrandTotal())
      setAppliedDiscount(res.discount)
      setSelectedDiscount(maCode)
      setCustomCode("")
      toast.success(res.message)
    } catch (error) {
      showToast(handleError(error))
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setSelectedDiscount("")
    setCustomCode("")
  }

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0

    const baseTotal = getGrandTotal()
    const giaTriGiam = Number(appliedDiscount.giaTriGiam) || 0
    let soTienGiam = 0
    

    if (appliedDiscount.loaiKhuyenMai === "GiamTien") {
      soTienGiam = giaTriGiam
    } else if (appliedDiscount.loaiKhuyenMai === "GiamPhanTram") {
      soTienGiam = Math.floor(baseTotal * (giaTriGiam / 100))
      if (appliedDiscount.giamToiDa) {
        soTienGiam = Math.min(soTienGiam, appliedDiscount.giamToiDa)
      }
    } 

    return soTienGiam
  }

  const calculateFinalTotal = () => getGrandTotal() - calculateDiscount()
  
  const handlePayment = async() => {
    try {
      setProcessing(true)
      const payload = {
        maPhim: movie.maPhim,
        maSuatChieu: showtime.maSuatChieu,
        selectedSeats: selectedSeats.map(s => ({ 
          maGhe: s.maGhe, 
          giaTien: Number(s.giaTien) || 0 
        })),
        selectedFoods: selectedFoods.map(f => ({
          maSanPham: f.maSanPham,
          soLuong: Number(f.soLuong) || 0,
          donGia: Number(f.donGia) || 0,
          loai: f.loai
        })),
        maCodeKhuyenMai: appliedDiscount?.maCode,
        tongTien: calculateFinalTotal()
      }

      const paymentUrl = await createVNPayPayment(payload)
      window.location.href = paymentUrl
    } catch (error) {
      console.error("Lỗi khi tạo thanh toán:", error)
    } finally {
      setProcessing(false)
    }
  }

  const bookingData = {
    movie: {
      maPhim: movie.maPhim,
      tenPhim: movie.tenPhim,
      tenPhanLoaiDoTuoi: movie.tenPhanLoaiDoTuoi,
      moTaPhanLoaiDoTuoi: movie.moTaPhanLoaiDoTuoi,
      anhBia: movie.anhBia
    },
    showtime: {
      ngayChieu: formatDate(showtime.gioBatDau),
      gioChieu: formatTime(showtime.gioBatDau),
      tenPhongChieu: showtime.tenPhongChieu,
      tenLoaiPhong: `${showtime.tenLoaiPhong}`
    },
    seats: selectedSeats.map(seat => ({
      ghe: `${seat.hangGhe}${seat.soGhe}`,
      donGia: Number(seat.giaTien) || 0,  
      loai: seat.tenLoaiGhe
    })),
    foods: selectedFoods.map(food => ({
      tenSanPham: `${food.soLuong}x ${food.tenSanPham}`,
      donGia: (Number(food.donGia) || 0) * (Number(food.soLuong) || 0), 
      loai: food.loai,
    })),
    total: getGrandTotal()
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto mt-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Payment & Discount */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-yellow-300" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-4">
                {["VNPAY", "MOMO"].map((method) => (
                  <div
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 rounded border cursor-pointer transition-all
                      ${
                        paymentMethod === method
                          ? "border-yellow-300 bg-yellow-300/10"
                          : "border-white/20 hover:border-yellow-300/50"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center
                          ${
                            paymentMethod === method
                              ? "border-yellow-300"
                              : "border-white/40"
                          }`}
                      >
                        {paymentMethod === method && (
                          <div className="w-4 h-4 rounded-full bg-yellow-300" />
                        )}
                      </div>

                      {method === "VNPAY" ? (
                        <QrCode className="w-8 h-8 text-yellow-300" />
                      ) : (
                        <CreditCard className="w-8 h-8 text-yellow-300" />
                      )}

                      <div>
                        <span className="text-white font-semibold text-lg block">
                          {method === "VNPAY" ? "VNPay" : "MoMo"}
                        </span>
                        <span className="text-gray-300 text-sm">
                          {method === "VNPAY"
                            ? "Thanh toán qua VNPay"
                            : "Ví điện tử MoMo"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Section */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Tag className="w-7 h-7 text-yellow-300" />
                Mã giảm giá / Ưu đãi
              </h2>

              {appliedDiscount && (
                <div className="mb-6 p-5 bg-yellow-300/20 border border-yellow-300 rounded flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-lg">Đã áp dụng: ({appliedDiscount.maCode}: {appliedDiscount.tenKhuyenMai})</p>
                    <p className="text-yellow-300">Giảm {calculateDiscount().toLocaleString()} VNĐ</p>
                  </div>
                  <button onClick={handleRemoveDiscount} className="text-white hover:text-red-300 transition cursor-pointer">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )}

              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã khuyến mãi của bạn"
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyDiscount() }}
                disabled={!!appliedDiscount}
                className="w-full mb-6 bg-white border border-white/30 rounded px-5 py-2 text-black placeholder-gray-400 focus:border-yellow-300 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="hidden md:flex gap-4">
              <Button
                onClick={() => navigate(-1)}
                variant="yellowToPinkPurple"
                className="flex-1 h-12 text-xl font-anton uppercase"
              >
                <span>Quay lại</span>
              </Button>

              <Button
                onClick={handlePayment}
                variant="yellowToPinkPurple"
                disabled={processing || countdown === 0}
                className="flex-1 h-12 text-xl font-anton uppercase"
              >
                {processing ? (
                  <>
                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span>Thanh toán</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="text-lg bg-white/10 backdrop-blur-lg border border-white/20 rounded p-6">
            <div className="flex flex-row justify-center border-b pb-4 border-white/20 md:items-center mb-4 gap-4">
              <h2 className="text-base text-white">Thời gian giữ ghế:</h2>
              <p className="text-base font-anton text-purple-900 px-2 rounded bg-yellow-300">{formatTimeCountdown(countdown)}</p>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 my-6">
              <div>
                <h3 className="text-white font-bold text-2xl mb-2">{bookingData.movie.tenPhim}</h3>
                <span className="px-3 py-2 text-black bg-yellow-300 rounded font-semibold text-sm">
                  {bookingData.movie.tenPhanLoaiDoTuoi}: {bookingData.movie.moTaPhanLoaiDoTuoi || "Phù hợp với mọi lứa tuổi"}
                </span>
              </div>
            </div>

            <div className="pb-4 flex gap-15 border-b border-white/20 mb-4 space-y-3">
              <div>
                <p className="text-yellow-300 mb-4">Thời gian</p>
                <div className="flex justify-between text-white">
                  <span>{bookingData.showtime.gioChieu} {bookingData.showtime.ngayChieu}</span>
                </div>
              </div>
              <div>
                <p className="text-yellow-300 mb-4">Phòng chiếu</p>
                <div className="flex justify-between text-white">
                  <span>{bookingData.showtime.tenPhongChieu}</span>
                </div>
              </div>
              <div>
                <p className="text-yellow-300 mb-4">Số vé</p>
                <div className="flex justify-between text-white">
                  <span>{bookingData.seats.length}</span>
                </div>
              </div>
            </div>

            <div className="pb-4 border-b border-white/20 mb-4 space-y-3">
              {(() => {
                const groupedSeats = bookingData.seats.reduce((acc, seat) => {
                  if (!acc[seat.loai]) {
                    acc[seat.loai] = { seats: [] }
                  }
                  acc[seat.loai].seats.push(seat.ghe)
                  return acc
                }, {} as Record<string, { seats: string[] }>)

                return Object.entries(groupedSeats).map(([loai, data]) => (
                  <div key={loai} className="flex  gap-10">
                    <div className="w-40">
                      <p className="text-yellow-300 mb-1">Loại ghế</p>
                      <p className="text-white font-semibold">{loai}</p>
                    </div>

                    <div>
                      <p className="text-yellow-300 mb-1">Số ghế</p>
                      <p className="text-white">{data.seats.join(", ")}</p>
                    </div>
                  </div>
                ))
              })()}
            </div>

            {bookingData.foods.length > 0 && (
              <div className="pb-4 border-b border-white/20 mb-4 space-y-3">
                <p className="text-yellow-300 mb-4">Bắp nước</p>
                {bookingData.foods.map((food, idx) => (
                  <div key={idx} className="flex justify-between text-white">
                    <span>{food.tenSanPham}</span>
                    <span className="text-white font-semibold">{food.donGia.toLocaleString()} VNĐ</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between text-white">
                <span>Tạm tính</span>
                <span>{bookingData.total.toLocaleString()} VNĐ</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-yellow-300">
                  <span>Giảm giá ({appliedDiscount.maCode})</span>
                  <span>- {calculateDiscount().toLocaleString()} VNĐ</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-6 border-t border-white/20">
                <span className="text-lg md:text-xl font-semibold text-yellow-300">Tổng tiền hóa đơn</span>
                <span className="text-lg md:text-2xl font-semibold text-yellow-300">{calculateFinalTotal().toLocaleString()} VNĐ</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              variant="yellowToPinkPurple"
              disabled={processing || countdown === 0}
              className="md:hidden w-full mt-8 h-12 text-xl font-anton"
            >
              {processing ? (
                <>
                  <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span>Thanh toán</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}