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


export const ShowtimeSeatsViewer = ({maSuatChieu}: {maSuatChieu: string}) => {
  const [seats, setSeats] = useState<SeatInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [seatLayout, setSeatLayout] = useState<{
    soHang: number
    soCot: number
    seats: Map<string, SeatInfo>
  }>({ soHang: 0, soCot: 0, seats: new Map() })

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true)
      try {
        const data = await getShowtimeDetailsAdmin(maSuatChieu)
        setSeats(data)

        // Layout
        const hangGhes = [...new Set(data.map((s: SeatInfo) => s.ghe.hangGhe))]
        const soGhes = [...new Set(data.map((s: SeatInfo) => s.ghe.soGhe))] as number[]

        const seatMap = new Map<string, SeatInfo>()
        data.forEach((seat: SeatInfo) => {
          seatMap.set(`${seat.ghe.hangGhe}-${seat.ghe.soGhe}`, seat)
        })

        setSeatLayout({
          soHang: hangGhes.length,
          soCot: soGhes.length > 0 ? Math.max(...soGhes) : 0,
          seats: seatMap
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
    if (seat.trangThaiGhe === "KhongSuDung") {
      return "bg-gray-200 cursor-not-allowed"
    }
    if (seat.trangThaiGhe === "DaDat") {
      return "bg-red-500 hover:bg-red-600"
    }
    
    // Color seats
    switch (seat.ghe.loaiGhe.maLoaiGhe) {
      case 'COUPLE':
        return "bg-pink-500 hover:bg-pink-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <p className="text-2xl font-bold text-red-600">{stats.booked}</p>
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

      {/* Seat Map */}
      <div className="flex justify-center">
        <div className="inline-block">
          <div className="mx-10 mb-6 bg-gradient-to-b from-gray-800 to-gray-600 text-white text-center py-2 rounded-t-3xl">
            <p className="text-sm font-semibold">MÀN HÌNH</p>
          </div>

          <div className="flex flex-col gap-2 items-center">
            {/* Column numbers */}
            <div className="flex items-center gap-6 mb-2">
              <div className="flex gap-1.5">
                {Array.from({ length: seatLayout.soCot }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="w-9 text-center text-sm font-semibold text-gray-600"
                  >
                    {colIndex + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Seat rows */}
            {Array.from({ length: seatLayout.soHang }).map((_, rowIndex) => {
              const rowLabel = String.fromCharCode(65 + rowIndex)
              return (
                <div key={rowIndex} className="flex items-center gap-6">
                  <div className="w-8 text-center font-semibold text-gray-700">
                    {rowLabel}
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: seatLayout.soCot }).map((_, colIndex) => {
                      const key = `${rowLabel}-${colIndex + 1}`
                      const seat = seatLayout.seats.get(key)
                      
                      if (!seat) return null

                      return (
                        <button
                          key={colIndex}
                          type="button"
                          className={`
                            w-9 h-9 rounded-lg flex items-center justify-center
                            transition-all hover:scale-110 relative
                            ${getSeatColor(seat)}
                            ${seat.trangThaiGhe === "DaDat" ? "shadow-lg" : ""}
                          `}
                        >
                          {seat.trangThaiGhe !== "KhongSuDung" ? (
                            <Armchair className="h-5 w-5 text-white" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                          {seat.trangThaiGhe === "DaDat" && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-3 h-3 border border-white"></div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="w-8 text-center text-gray-500 text-sm">
                    {rowLabel}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <CardContent>
          <p className="text-sm font-semibold mb-3 text-center">Chú thích:</p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                <Armchair className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm">Ghế Thường (Trống)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-pink-500 flex items-center justify-center">
                <Armchair className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm">Ghế Đôi (Trống)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center relative">
                <Armchair className="h-4 w-4 text-white" />
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-3 h-3 border border-white"></div>
              </div>
              <span className="text-sm">Đã đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-sm">Không sử dụng</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}