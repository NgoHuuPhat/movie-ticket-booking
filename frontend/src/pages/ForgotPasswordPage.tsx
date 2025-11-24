import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import UserLayout from "@/components/layout/UserLayout"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState(sessionStorage.getItem("email") || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if(!email) {
      setError("Email là bắt buộc")
      setLoading(false)
      return
    }

    try {
      await forgotPassword(email)
      sessionStorage.setItem("email", email)
      navigate("/verify-otp")
    } catch (error) {
      setError(handleError(error))
    } finally {
      setLoading(false)
    }
  }

   return (
    <UserLayout>
      <div className="min-h-screen flex flex-col items-center px-4 lg:px-0 mt-20">
        <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl py-10 px-4 gap-4">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-4xl font-anton uppercase">Quên mật khẩu ?</CardTitle>
            <CardDescription>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-gray-700 font-semibold text-base">Email</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    className="pl-4 h-12 bg-gray-50 border-gray-300 text-gray-800 transition-all duration-300"
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                variant="yellowToPinkPurple"
                className="w-full h-12" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </div>
                ) : <span className=" uppercase text-base font-anton">Gửi yêu cầu</span>}
              </Button>
            </form>
            {error && (
              <Alert className="bg-red-100/50 border-red-300/50 mt-4">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex justify-center hover:text-purple-600 transition-colors">
            <Link
              to="/login"
            >
              Quay lại đăng nhập
            </Link>
          </CardFooter>
        </Card>
      </div>
    </UserLayout>
  )
}

export default ForgotPasswordPage