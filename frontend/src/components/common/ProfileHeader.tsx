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
    <div className="bg-white rounded shadow-2xl p-4 md:p-8 mb-8 border border-purple-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
        <div className="relative">
          <CircleUser strokeWidth={1.8} className="md:w-30 w-15 h-auto text-purple-500" />

          {isVIP && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full md:p-2 p-1 shadow-lg">
              <Crown className="md:w-5 md:h-5 w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl md:text-3xl font-anton text-gray-800 mb-4">
            {user.hoTen}
          </h1>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded flex items-center gap-2 shadow-md">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">
                {user.diemTichLuy.toLocaleString()} điểm
              </span>
            </div>

            <div
              className={`rounded flex items-center gap-2 shadow-md px-3 py-1.5 ${
                isVIP
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
              }`}
            >
              {isVIP ? (
                <Crown className="md:w-5 md:h-5 w-4 h-4 text-white" />
              ) : (
                <Award className="md:w-5 md:h-5 w-4 h-4 text-white" />
              )}

              <span className="font-semibold text-white text-sm md:text-base">
                {isVIP ? "Thành viên VIP" : user.capBac || "Thành viên"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="mt-8">
        <div className="flex justify-between text-sm md:text-base mb-2">
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
