import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import useBookingStore from "@/stores/useBookingStore"
import UserLayout from "@/components/layout/UserLayout"

export default function CheckoutResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearBooking } = useBookingStore()

  const status = searchParams.get("status") 
  const isSuccess = status === "success"

  useEffect(() => {
    clearBooking()
    localStorage.removeItem("booking-storage")
  }, [clearBooking])

  return (
    <UserLayout>
      <div className="max-w-2xl w-full mx-auto px-4 py-14">
        <div className={`rounded-3xl shadow-2xl border p-8 md:p-12 text-center
          ${isSuccess 
            ? "bg-gradient-to-tr from-transparent to-green-700 border-green-600" 
            : "bg-gradient-to-tr from-transparent to-pink-700 border-pink-600"}`}>
          
          <div className={`w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center
            ${isSuccess ? "bg-green-500/20" : "bg-pink-500/20"}`}>
            {isSuccess ? (
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            ) : (
              <XCircle className="w-12 h-12 text-pink-200" />
            )}
          </div>

          <h1 className="text-white font-anton text-2xl md:text-4xl mb-4 md:mb-6 uppercase">
            {isSuccess ? "Đặt vé thành công!" : "Thanh toán thất bại"}
          </h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 my-8 md:mb-10 border border-white/20 flex items-center justify-center text-center">
            <p className="text-white/90 md:text-lg">
              {isSuccess
                ? "Thông tin vé đã được gửi đến email của bạn. Hãy kiểm tra và đến rạp đúng giờ để tận hưởng bộ phim nhé!"
                : "Giao dịch không thành công. Vui lòng kiểm tra lại thông tin thanh toán và thử lại."}
            </p>
          </div>

          <Button
            onClick={() => navigate("/")}
            variant="yellowToPinkPurple"
            className="px-8 w-full h-8 md:h-12 font-anton text-lg"
          >
            <span>Về trang chủ</span>
          </Button>
        </div>
      </div>
    </UserLayout>
  )
}