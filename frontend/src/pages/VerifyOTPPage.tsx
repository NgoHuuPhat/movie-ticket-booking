import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { verifyOTP, forgotPassword } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import UserLayout from "@/components/layout/UserLayout"

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loadingOTP, setLoadingOTP] = useState(false)
  const [loadingResend, setLoadingResend] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const email = sessionStorage.getItem("email") || ""
  const navigate = useNavigate()

  useEffect(() => {
    if(!email) {
      navigate("/forgot-password")
      return
    }
  }, [navigate, email])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingOTP(true)
    setError("")

    if(!otp) {
      setError("OTP là bắt buộc")
      setLoadingOTP(false)
      return
    }

    try {
      await verifyOTP(email, otp)
      navigate("/reset-password")
    } catch (error) {
      setError(handleError(error))
    } finally {
      setLoadingOTP(false)
    }
  }

  const handleResendEmail = async () => {
    setLoadingResend(true)
    setError("")
    setSuccessMessage("")

    try {
      await forgotPassword(email)
      setSuccessMessage("OTP đã được gửi lại đến email của bạn.")
    } catch (error) {
      setError(handleError(error))
    } finally {
      setLoadingResend(false)
    }
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col items-center p-4 lg:p-0 mt-20">
        <Card className="relative w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl pt-8 lg:py-8 lg:px-4 gap-4">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-anton uppercase">Nhập mã OTP</CardTitle>
            <p className=" text-gray-600 text-md">
              Chúng tôi đã gửi mã xác minh 6 chữ số đến <span className="font-medium">{email}</span>. Vui lòng kiểm tra hộp thư đến của bạn.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  className="pl-6 h-12 bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập OTP đã gửi ở email"
                />
              </div>

              <Button 
                type="submit" 
                variant="yellowToPinkPurple"
                className="w-full h-12" 
                disabled={loadingOTP}
              >
                {loadingOTP ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xác minh...</span>
                  </div>
                ) : <span className=" uppercase text-base font-anton">Xác minh OTP</span>}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 items-center">
            {error && (
              <Alert className="bg-red-100/50 border-red-300/50 w-full">
                <AlertDescription className="text-red-700 text-center">{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="bg-green-100/50 border-green-300/50 w-full">
                <AlertDescription className="text-green-700 text-center">{successMessage}</AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-gray-500 text-center">
              <span>Không nhận được email? </span>
              <button onClick={handleResendEmail} className="text-purple-500 hover:text-purple-600 font-medium transition-colors cursor-pointer">
                {loadingResend ? "Đang gửi lại..." : "Gửi lại OTP"}
              </button>
            </p>
          </CardFooter>

        </Card>
      </div>
    </UserLayout>
  )
}

export default VerifyOTPPage