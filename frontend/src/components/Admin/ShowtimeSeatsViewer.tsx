import { useState, useEffect } from "react"
import { Armchair, X, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getShowtimeDetailsAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"

interface SeatInfo {
  maGheSuatChieu: string
  maGhe: string
  maSuatChieu: string
  trangThaiGhe: 'DangTrong' | 'DaDat' | 'KhongSuDung'
  ghe: {
    maGhe: string
    hangGhe: string
    soGhe: number
    loaiGhe: {
      maLoaiGhe: string
      tenLoaiGhe: string
    }
  }
}

export const ShowtimeSeatsViewer = ({ maSuatChieu }: { maSuatChieu: string }) => {
  const [seats, setSeats] = useState<SeatInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [seatLayout, setSeatLayout] = useState<{
    soHang: number
    soCot: number
    seats: Map<string, SeatInfo>
    coupleRows: Set<number>
  }>({
    soHang: 0,
    soCot: 0,
    seats: new Map(),
    coupleRows: new Set()
  })

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true)
      try {
        const data = await getShowtimeDetailsAdmin(maSuatChieu)
        setSeats(data)

        const hangGhes = [...new Set(data.map((s: SeatInfo) => s.ghe.hangGhe))]
        const seatMap = new Map<string, SeatInfo>()
        const coupleRowsSet = new Set<number>()

        data.forEach((seat: SeatInfo) => {
          const key = `${seat.ghe.hangGhe}-${seat.ghe.soGhe}`
          seatMap.set(key, seat)

          // Xác định hàng nào là ghế đôi dựa vào tên loại ghế
          if (seat.ghe.loaiGhe.tenLoaiGhe.toLowerCase().includes('couple') ||
              seat.ghe.loaiGhe.tenLoaiGhe.toLowerCase().includes('đôi')) {
            const rowIndex = seat.ghe.hangGhe.charCodeAt(0) - 65
            coupleRowsSet.add(rowIndex)
          }
        })

        // Tính số cột tối đa (dựa trên ghế thường)
        const soCot = Math.max(...data.map((s: SeatInfo) => s.ghe.soGhe), 0)

        setSeatLayout({
          soHang: hangGhes.length,
          soCot: soCot,
          seats: seatMap,
          coupleRows: coupleRowsSet
        })
      } catch (error) {
        toast.error(handleError(error))
      } finally {
        setLoading(false)
      }
    }

    fetchSeats()
  }, [maSuatChieu])

  const getSeatColor = (seat: SeatInfo) => {
    const typeName = seat.ghe.loaiGhe.tenLoaiGhe

    if (seat.trangThaiGhe === "KhongSuDung") {
      return "bg-gray-200 cursor-not-allowed"
    }
    if (seat.trangThaiGhe === "DaDat") {
      return "bg-purple-700 hover:bg-purple-800 shadow-lg"
    }

    if (typeName.includes("Couple")) {
      return "bg-pink-500 hover:bg-pink-600"
    }
    if (typeName.includes("VIP")) {
      return "bg-rose-500 hover:bg-rose-700"
    }
    return "bg-blue-500 hover:bg-blue-600"
  }

  const stats = {
    total: seats.length,
    available: seats.filter(s => s.trangThaiGhe === "DangTrong").length,
    booked: seats.filter(s => s.trangThaiGhe === "DaDat").length,
    disabled: seats.filter(s => s.trangThaiGhe === "KhongSuDung").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }
  
  const seatTypes = Array.from(new Set(seats.map(seat => seat.ghe.loaiGhe.tenLoaiGhe)))
  const seatLegendColor: Record<string, string> = {
    Standard: "bg-blue-500",
    VIP: "bg-rose-500",
    Couple: "bg-pink-500"
  }

  return (
    <div className="space-y-6">
      {/* Thống kê ghế */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng ghế</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-600">Còn trống</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-600">Đã đặt</p>
              <p className="text-2xl font-bold text-purple-700">{stats.booked}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-gray-600">Không dùng</p>
              <p className="text-2xl font-bold text-gray-600">{stats.disabled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sơ đồ ghế */}
      <div className="flex justify-center overflow-x-auto pb-4">
        <div className="inline-block">
          <div className="mx-10 mb-6 bg-gradient-to-b from-gray-800 to-gray-600 text-white text-center py-2 rounded-t-3xl">
            <p className="text-sm font-semibold">MÀN HÌNH</p>
          </div>

          {/* Hàng số cột (1 2 3 ...) */}
          <div className="flex justify-center mb-3">
            <div className="flex gap-1.5">
              {Array.from({ length: seatLayout.soCot }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="w-10 h-6 flex items-center justify-center font-medium text-gray-600"
                >
                  {colIndex + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            {Array.from({ length: seatLayout.soHang }).map((_, rowIndex) => {
              const rowLabel = String.fromCharCode(65 + rowIndex)
              const isCouple = seatLayout.coupleRows.has(rowIndex)
              const maxSeats = isCouple ? Math.floor(seatLayout.soCot / 2) : seatLayout.soCot

              return (
                <div key={rowIndex} className="flex items-center gap-4">
                  {/* Nhãn hàng bên trái */}
                  <div className="w-12 text-center text-gray-700">
                    {rowLabel}
                  </div>

                  {/* Các ghế trong hàng */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: maxSeats }).map((_, i) => {
                      const seatNum = isCouple ? (i * 2 + 1) : (i + 1)
                      const key = `${rowLabel}-${seatNum}`
                      const seat = seatLayout.seats.get(key)

                      if (!seat) return null

                      return (
                        <button
                          key={i}
                          type="button"
                          className={`
                            ${isCouple ? 'w-21.5' : 'w-10'} h-10 rounded 
                            flex items-center justify-center
                            relative border border-gray-200 ${getSeatColor(seat)}
                          `}
                        >
                          {seat.trangThaiGhe !== "KhongSuDung" ? (
                            isCouple ? (
                              <div className="flex gap-1">
                                <Armchair className="h-5 w-5 text-white" />
                                <Armchair className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <Armchair className="h-5 w-5 text-white" />
                            )
                          ) : (
                            <X className="h-5 w-5 text-gray-400" />
                          )}

                          {seat.trangThaiGhe === "DaDat" && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-3 h-3 border border-white"></div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Nhãn hàng bên phải */}
                  <div className="w-12 text-center text-gray-700 text-sm">
                    {rowLabel}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chú thích */}
      <Card className="p-4">
        <CardContent>
          <p className="text-sm font-semibold mb-4 text-center">Chú thích:</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {seatTypes.map((type) => {
              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className={`
                      ${type === "Couple" ? "w-12" : "w-6"} h-6 rounded
                      ${seatLegendColor[type] || "bg-blue-500"}
                      flex items-center justify-center gap-0.5
                    `}
                  >
                    <Armchair className="h-4 w-4 text-white" />
                    {type === "Couple" && <Armchair className="h-4 w-4 text-white" />}
                  </div>
                  <span className="text-sm">
                    Ghế {type}
                  </span>
                </div>
              )
            })}

            {/* Trạng thái */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-700 flex items-center justify-center relative">
                <Armchair className="h-4 w-4 text-white" />
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-3 h-3 border border-white" />
              </div>
              <span>Đã đặt</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-400" />
              </div>
              <span>Không sử dụng</span>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  )
}