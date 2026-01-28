import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import UserLayout from "@/components/layout/UserLayout"
import { getProfile, historyTickets, updatePassword } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import { toast } from "sonner"
import ProfileHeader from "@/components/common/ProfileHeader"
import ProfileInfoForm from "@/components/common/ProfileInfoForm"
import { ChangePasswordForm, type PasswordFormData } from "@/components/common/ChangePasswordForm"
import TransactionHistoryTab from "@/components/common/TransactionHistoryTab"
import type { IUserProfile, IHoaDon } from "@/types/profile"

export default function UserProfilePage() {
  const [user, setUser] = useState<IUserProfile | null>(null)
  const [transactions, setTransactions] = useState<IHoaDon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "info"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [profileData, historyData] = await Promise.all([
          getProfile(),
          historyTickets()
        ])
        setUser(profileData)
        setTransactions(historyData)
      } catch (error) {
        toast.error(handleError(error))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUpdatePassword = async (data: PasswordFormData, resetForm: () => void) => {
    try {
      setSubmitting(true)
      const res = await updatePassword(data.oldPassword, data.newPassword, data.confirmPassword)
      toast.success(res.message)
      resetForm()
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab })
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white text-xl">Đang tải...</p>
          </div>
        </div>
      </UserLayout>
    )
  }

  if (!user) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-white text-2xl">Không tìm thấy thông tin người dùng</div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto py-8">
        <ProfileHeader user={user} />

        {/* Tabs */}
        <div className="bg-white rounded shadow-2xl border-2 border-purple-200 overflow-hidden">
          <div className="flex border-b-2 border-purple-100">
            <button
              onClick={() => handleTabChange("info")}
              className={`flex-1 py-4 cursor-pointer font-anton uppercase transition-all md:text-lg ${
                activeTab === "info"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white "
                  : "text-gray-800 hover:bg-purple-50"
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`flex-1 py-4 cursor-pointer font-anton uppercase transition-all md:text-lg ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white "
                  : "text-gray-800 hover:bg-purple-50"
              }`}
            >
              Lịch sử giao dịch
            </button>
          </div>

          <div className="md:p-8 p-2">
            {activeTab === "info" && (
              <div className="space-y-8">
                <ProfileInfoForm user={user} />
                <ChangePasswordForm
                  onSubmit={handleUpdatePassword}
                  submitting={submitting}
                />
              </div>
            )}

            {activeTab === "history" && (
              <TransactionHistoryTab transactions={transactions} />
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}