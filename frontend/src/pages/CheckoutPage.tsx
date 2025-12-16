import { useState, useEffect } from "react"
import { Clock, CreditCard, QrCode, CheckCircle2, AlertCircle, MapPin, Calendar, Ticket, X, Tag } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { Button } from "@/components/ui/button"
import { getDiscountsForUser } from "@/services/api"
import type { IDiscount } from "@/types/discount"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("qr")
  const [countdown, setCountdown] = useState(900)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<IDiscount | null>(null)
  const [availableDiscounts, setAvailableDiscounts] = useState<IDiscount[]>([])

  const bookingData = {
    movie: {
      title: "AVATAR: THE WAY OF WATER",
      rating: "T13",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400"
    },
    showtime: {
      date: "16/12/2025",
      time: "19:30",
      room: "Phòng 3 - IMAX",
      cinema: "CGV Vincom Đà Nẵng"
    },
    seats: [
      { label: "H7", price: 120000 },
      { label: "H8", price: 120000 }
    ],
    foods: [
      { label: "2x Combo bắp nước", price: 150000 },
      { label: "1x Pepsi lớn", price: 35000 }
    ],
    total: 425000
  }

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const discounts = await getDiscountsForUser()
        setAvailableDiscounts(discounts)
      } catch (error) {
        console.error("Lỗi khi lấy mã giảm giá:", error)
      }
    }
    fetchDiscounts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleApplyDiscount = (codeFromClick?: string) => {
    const maCode = codeFromClick || selectedDiscount || customCode.trim().toUpperCase()
    if (!maCode) {
      alert("Vui lòng chọn hoặc nhập mã giảm giá")
      return
    }

    const found = availableDiscounts.find(d => d.maCode === maCode)
    if (found) {
      setAppliedDiscount(found)
      setCustomCode("")
      setSelectedDiscount("")
    } else {
      alert("Mã giảm giá không hợp lệ")
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setSelectedDiscount("")
    setCustomCode("")
  }

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0
    return appliedDiscount.loaiKhuyenMai === "GiamGiaTien" ? appliedDiscount.giaTriGiam : Math.round(bookingData.total * appliedDiscount.giaTriGiam / 100)
  }

  const calculateFinalTotal = () => bookingData.total - calculateDiscount()
  
  const handlePayment = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setPaymentSuccess(true)
    }, 2000)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <div className="bg-white/10 backdrop-blur-lg border border-yellow-300/30 rounded p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Thanh toán thành công!</h1>
            <p className="text-yellow-300 text-lg mb-8">Vé của bạn đã được đặt thành công</p>
            <div className="bg-white/5 rounded p-6 mb-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Ticket className="text-yellow-300 w-6 h-6" />
                <h3 className="text-white font-semibold text-lg">Mã đặt vé</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-300 text-center tracking-wider">
                CGV-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
            <div className="space-y-3 text-gray-300 mb-8">
              <p>✓ Vé điện tử đã được gửi đến email của bạn</p>
              <p>✓ Vui lòng đến rạp trước 15 phút để lấy vé</p>
              <p>✓ Xuất trình mã QR tại quầy để nhận vé</p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold py-4 rounded-lg hover:shadow-lg transition-all"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto mt-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Payment & Discount */}
          <div className="space-y-8">
            {/* Payment Methods */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-yellow-300" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-4">
                {["qr", "card"].map((method) => (
                  <div
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 rounded border-1 cursor-pointer transition-all ${
                      paymentMethod === method ? "border-yellow-300 bg-yellow-300/10" : "border-white/20 hover:border-yellow-300/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method ? "border-yellow-300" : "border-white/40"
                      }`}>
                        {paymentMethod === method && <div className="w-4 h-4 rounded-full bg-yellow-300"></div>}
                      </div>
                      {method === "qr" ? <QrCode className="w-8 h-8 text-yellow-300" /> : <CreditCard className="w-8 h-8 text-yellow-300" />}
                      <div>
                        <span className="text-white font-semibold text-lg block">
                          {method === "qr" ? "Quét mã QR" : "Thẻ ATM/Visa/Master"}
                        </span>
                        <span className="text-gray-300 text-sm">
                          {method === "qr" ? "VNPay, MoMo, ZaloPay" : "Hỗ trợ các loại thẻ quốc tế"}
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

              {/* Nhập mã thủ công */}
              <div className="mb-8">
                <div className="flex flex-col items-center sm:flex-row gap-4">
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã khuyến mãi của bạn"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyDiscount() }}
                    disabled={!!appliedDiscount}
                    className="flex-1 bg-white border border-white/30 rounded px-5 py-2 text-black placeholder-gray-400 focus:border-yellow-300 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {availableDiscounts.map((discount) => (
                  <div
                    key={discount.maCode}
                    onClick={() => {
                      if (!appliedDiscount) {
                        setSelectedDiscount(discount.maCode) 
                        handleApplyDiscount(discount.maCode)
                      }
                    }}
                    className={`p-4 rounded border-1 transition-all ${
                      selectedDiscount === discount.maCode
                        ? "border-yellow-300 bg-yellow-300/10"
                        : appliedDiscount
                        ? "border-white/20 bg-white/5 opacity-50"
                        : "border-white/30 bg-white/5 hover:border-yellow-300/50"
                    } ${appliedDiscount ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <h3 className="text-white font-bold text-lg mb-2">{discount.maCode}: {discount.tenKhuyenMai}</h3>
                    <p className="text-gray-300 text-sm">{discount.moTa}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-6 space-y-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-4">
                <h2 className="text-xl font-bold text-white">Thời gian giữ vé</h2>
                <p className="text-lg font-anton text-purple-900 px-3 py-0.5 rounded bg-yellow-300">{formatTime(countdown)}</p>
              </div>

              <div className="flex gap-5 pb-4 border-b border-white/20 mb-4">
                <img src={bookingData.movie.poster} alt={bookingData.movie.title} className="w-28 h-40 object-cover rounded" />
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">{bookingData.movie.title}</h3>
                  <span className="inline-block px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">{bookingData.movie.rating}</span>
                </div>
              </div>

              <div className="space-y-4 pb-4 border-b border-white/20 mb-4">
                <div className="flex items-center gap-4 text-white">
                  <MapPin className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                  <span>{bookingData.showtime.cinema}</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <Calendar className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                  <span>{bookingData.showtime.date}</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <Clock className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                  <span>{bookingData.showtime.time} - {bookingData.showtime.room}</span>
                </div>
              </div>

              <div className="pb-4 border-b border-white/20 mb-4 space-y-3">
                <p className="text-yellow-300 mb-4">Ghế đã chọn</p>
                {bookingData.seats.map((seat, idx) => (
                  <div key={idx} className="flex justify-between text-white">
                    <span>Ghế {seat.label}</span>
                    <span className="text-yellow-300 font-semibold">{seat.price.toLocaleString()} VNĐ</span>
                  </div>
                ))}
              </div>

              {bookingData.foods.length > 0 && (
                <div className="pb-4 border-b border-white/20 mb-4 space-y-3">
                  <p className="text-yellow-300 mb-4">Bắp nước</p>
                  {bookingData.foods.map((food, idx) => (
                    <div key={idx} className="flex justify-between text-white">
                      <span>{food.label}</span>
                      <span className="text-yellow-300 font-semibold">{food.price.toLocaleString()} VNĐ</span>
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
                  <span className="text-2xl font-semibold text-white">Tổng tiền hóa đơn</span>
                  <span className="text-3xl font-semibold text-yellow-300">{calculateFinalTotal().toLocaleString()} VNĐ</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                variant="yellowToPinkPurple"
                disabled={processing || countdown === 0}
                className="w-full mt-8 h-12 text-xl font-anton"
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

              {countdown === 0 && (
                <div className="mt-6 p-5 bg-red-500/20 border border-red-500 rounded flex items-center gap-4">
                  <AlertCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-base">Hết thời gian giữ vé. Vui lòng đặt lại.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}