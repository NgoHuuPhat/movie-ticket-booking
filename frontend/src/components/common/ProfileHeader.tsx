import { Star, Crown, Award, CircleUser } from "lucide-react"

interface IUserProfile {
  hoTen: string
  email: string
  avatar?: string
  diemTichLuy: number
  capBac?: string
}

interface ProfileHeaderProps {
  user: IUserProfile
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const DIEM_CAN_THIET = 10000

  const isVIP = user.diemTichLuy >= DIEM_CAN_THIET
  const diemConLai = Math.max(DIEM_CAN_THIET - user.diemTichLuy, 0)
  const tiLeHoanThanh = Math.min( Math.round((user.diemTichLuy / DIEM_CAN_THIET) * 100), 100 )

  return (
    <div className="bg-white rounded shadow-2xl p-8 mb-8 border border-purple-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative">
          <CircleUser strokeWidth={1.8} className="w-30 h-auto text-purple-500" />

          {isVIP && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-anton text-gray-800 mb-2 uppercase">
            {user.hoTen}
          </h1>

          <p className="text-gray-600 mb-4 text-lg">{user.email}</p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 rounded flex items-center gap-2 shadow-md">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">
                {user.diemTichLuy.toLocaleString()} điểm
              </span>
            </div>

            <div
              className={`px-5 py-2 rounded flex items-center gap-2 shadow-md ${
                isVIP
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
              }`}
            >
              {isVIP ? (
                <Crown className="w-5 h-5 text-white" />
              ) : (
                <Award className="w-5 h-5 text-white" />
              )}

              <span className="font-semibold text-white">
                {isVIP ? "Thành viên VIP" : user.capBac || "Thành viên"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="mt-8">
        <div className="flex justify-between mb-2">
          <p className={isVIP ? "text-orange-500" : "text-purple-600"}>
            {isVIP ? "Cấp độ VIP" : "Tiến độ lên VIP"}
          </p>

          <p className={isVIP ? "text-orange-500" : "text-purple-600"}>
            {isVIP
              ? "Bạn đã là thành viên VIP"
              : `${diemConLai.toLocaleString()} điểm nữa để lên VIP`}
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 flex items-center justify-end pr-2 shadow-md ${
              isVIP
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gradient-to-r from-purple-500 to-pink-500"
            }`}
            style={{ width: `${isVIP ? 100 : tiLeHoanThanh}%` }}
          >
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
