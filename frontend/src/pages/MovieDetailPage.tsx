import { useEffect, useRef, useState, type JSX } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Clock, Play, Tags, UserRoundCheck, X } from "lucide-react"
import UserLayout from "@/components/layout/UserLayout"
import { getAllCombos, getCategoriesWithProducts, getMovieDetails, getMovieShowtimes, getSeatsByShowTimeId, holdSeats } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import type { IGroupedShowtime, IMovie, IMovieShowtime } from "@/types/movie"
import type { ISeatData } from "@/types/seat"
import { phienBan } from "@/constants/version"
import { Button } from "@/components/ui/button"
import TrailerModal from "@/components/common/TrailerModal"
import useTrailerModal from "@/hooks/useTrailerModal"
import { formatDate, formatTime } from "@/utils/formatDate"
import Seat from "@/components/common/Seat"
import { useAlert } from "@/stores/useAlert"
import { ComboCard, ProductCard } from "@/components/common/FoodItemCard"
import type { ICategoryWithProducts, ICombo, IProduct, ISelectedFood } from "@/types/product"
import useBookingStore from "@/stores/useBookingStore"
  
export default function MovieDetailPage() {
  const [movieDetail, setMovieDetail] = useState<IMovie | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [showtimesData, setShowtimesData] = useState<IGroupedShowtime>({})
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [loadingShowtimes, setLoadingShowtimes] = useState(true)
  const [selectedShowtime, setSelectedShowtime] = useState<IMovieShowtime | null>(null)
  const [seats, setSeats] = useState<ISeatData[]>([])
  const [loadingSeats, setLoadingSeats] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"products" | "combos">("products")
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<ICategoryWithProducts[]>([])
  const [combos, setCombos] = useState<ICombo[]>([])
  const [foodQuantities, setFoodQuantities] = useState<{ [key: string]: number }>({})

  const seatRef = useRef<HTMLDivElement | null>(null)
  const { slug } = useParams<{ slug: string }>()
  const { showToast } = useAlert()
  const navigate = useNavigate()

  const { setMovie, setShowtime, setSeats: setSeatStore, setFoods } = useBookingStore()
  const { show, trailerId, openModal, closeModal } = useTrailerModal()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, combosData] = await Promise.all([
          getCategoriesWithProducts(),
          getAllCombos()
        ])
        setCombos(combosData)
        setCategoriesWithProducts(categoriesData)
      } catch (error) {
        console.error("Failed to fetch food data:", handleError(error))
      } 
    }
    fetchData()
  }, [])

  const handleFoodChange = (id: string, quantity: number) => {
    setFoodQuantities(prev => ({
      ...prev,
      [id]: quantity
    }))
  }

  const getSelectedFoodItems = () => {
    const items: {id: string, label: string}[] = []

    categoriesWithProducts.forEach(category => {
      category.sanPhams.forEach((product: IProduct) => {
        const qty = foodQuantities[product.maSanPham] || 0
        if (qty > 0) {
          items.push({ id: product.maSanPham, label: `${qty}x ${product.tenSanPham}` })
        }
      })
    })

    combos.forEach((combo: ICombo) => {
      const qty = foodQuantities[combo.maCombo] || 0
      if (qty > 0) {
        items.push({ id: combo.maCombo, label: `${qty}x ${combo.tenCombo}` })
      }
    })
    return items
  }

  const calculateFoodTotal = () => {
    let total = 0

    categoriesWithProducts.forEach(category => {
      category.sanPhams.forEach((product: IProduct) => {
        const qty = foodQuantities[product.maSanPham] || 0
        total += Number(product.giaTien) * qty
      })
    })

    combos.forEach((combo: ICombo) => {
      const qty = foodQuantities[combo.maCombo] || 0
      total += Number(combo.giaBan) * qty
    })
    return total
  }

  useEffect(() => {
    if(!slug) return
    try {
      const fetchMovieDetails = async () => {
        const data = await getMovieDetails(slug)
        setMovieDetail(data)
      }
      fetchMovieDetails()
    } catch (error) {
      console.error("Failed to fetch movie details:", handleError(error))
    }
  }, [slug])

  useEffect(() => {
    if(!movieDetail?.maPhim) return

    const fetchShowtimes = async () => {
      try {
        setLoadingShowtimes(true)
        const data = await getMovieShowtimes(movieDetail.maPhim)

        const grouped = data.reduce((acc: IGroupedShowtime, show: IMovieShowtime) => {
          const dateKey = formatDate(show.gioBatDau,"dd/MM")
          if(!acc[dateKey]) {
            acc[dateKey] = {}
          }
          if(!acc[dateKey][show.tenLoaiPhong]) {
            acc[dateKey][show.tenLoaiPhong] = []
          }
          acc[dateKey][show.tenLoaiPhong].push(show)
          return acc
        }, {})

        setAvailableDates(Object.keys(grouped))
        setSelectedDate(Object.keys(grouped)[0] || "")
        setShowtimesData(grouped)
      } catch (error) {
        console.error("Failed to fetch showtimes:", handleError(error))
      } finally {
        setLoadingShowtimes(false)
      }
    }
    fetchShowtimes()
  }, [movieDetail?.maPhim])

  const handleShowtimeSelect = async (show: IMovieShowtime) => {
    setSelectedShowtime(show)
    setSelectedSeats([])
    setLoadingSeats(true)
    
    try {
      const seatsData = await getSeatsByShowTimeId(show.maSuatChieu)
      setSeats(seatsData)
      
      seatRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      console.error("Failed to fetch seats:", handleError(error))
      setSeats([])
    } finally {
      setLoadingSeats(false)
    }
  }

  const isSeatFilled = (seat: ISeatData | null, selected: string[]) => {
    if (!seat) return true
    if (seat.trangThai === "DaDat") return true
    if (selected.includes(seat.maGhe)) return true
    return false
  }
  const checkForSeatGaps = (selected: string[]): { hasGap: boolean; message: string } => {
    const selectedSeatsData = selected.map(id => seats.find(s => s.maGhe === id)) as ISeatData[]
    const rows = [...new Set(selectedSeatsData.map(s => s.hangGhe))]

    for (const row of rows) {
      const rowSeats = seats
        .filter(s => s.hangGhe === row)
        .sort((a, b) => a.soGhe - b.soGhe)

      for (let i = 0; i < rowSeats.length; i++) {
        const seat = rowSeats[i]

        if (seat.tenLoaiGhe === "Couple") continue
        if (seat.trangThai === "DaDat") continue

        const isSelected = selected.includes(seat.maGhe)
        if (isSelected) continue

        const leftSeat = rowSeats[i - 1] || null
        const rightSeat = rowSeats[i + 1] || null

        const leftFilled = isSeatFilled(leftSeat, selected)
        const rightFilled = isSeatFilled(rightSeat, selected)

        if (leftFilled && rightFilled) {
          return {
            hasGap: true,
            message: `Không được để ghế ${seat.hangGhe}${seat.soGhe} trống! Vui lòng chọn ghế liền kề hoặc bỏ chọn ghế hai bên.`
          }
        }
      }
    }

    return { hasGap: false, message: "" }
  }

  const handleSeatClick = (maGhe: string) => {
    const seat = seats.find(s => s.maGhe === maGhe)
    if (!seat) return

    if (seat.trangThai === 'DaDat' || seat.trangThai === 'KhongSuDung') {
      return
    }

    if (seat.tenLoaiGhe === 'Couple') {
      const rowSeats = seats
        .filter(s => s.hangGhe === seat.hangGhe && s.tenLoaiGhe === 'Couple')
        .sort((a, b) => a.soGhe - b.soGhe)
      
      const currentIndex = rowSeats.findIndex(s => s.maGhe === maGhe)
      
      let pairSeat: ISeatData | undefined
      
      // Kiểm tra xem đây là ghế đầu hay ghế thứ 2 trong cặp
      if (currentIndex % 2 === 0) {
        pairSeat = rowSeats[currentIndex + 1]
      } else {
        pairSeat = rowSeats[currentIndex - 1]
      }

      if (pairSeat && pairSeat.trangThai !== 'DaDat') {
        setSelectedSeats(prev => {
          const hasFirst = prev.includes(seat.maGhe)
          const hasSecond = prev.includes(pairSeat!.maGhe)
          
          if (hasFirst || hasSecond) {
            // Bỏ chọn cả 2 ghế
            return prev.filter(id => id !== seat.maGhe && id !== pairSeat!.maGhe)
          } else {
            if (prev.length + 2 > 8) {
              showToast("Bạn chỉ có thể chọn tối đa 8 ghế!")
              return prev
            }
            // Chọn cả 2 ghế
            return [...prev, seat.maGhe, pairSeat!.maGhe]
          }
        })
      }
    } else {
      setSelectedSeats(prev => {
        if (prev.includes(maGhe)) {
          return prev.filter(id => id !== maGhe)
        }

        if (prev.length >= 8) {
          showToast("Bạn chỉ có thể chọn tối đa 8 ghế!")
          return prev
        }

        return [...prev, maGhe]
      })
    }
  }

  const calculateSeatsTotal = () => {
    return selectedSeats.reduce((total, maGhe) => {
      const seat = seats.find(s => s.maGhe === maGhe)
      return total + (Number(seat?.giaTien) || 0)
    }, 0)
  }

  const handleCheckout = async() => {
    try {
      if (!movieDetail || !selectedShowtime || selectedSeats.length === 0) {
        showToast("Vui lòng chọn suất chiếu và ghế ngồi!")
        return
      }

      const gapCheck = checkForSeatGaps(selectedSeats)
      if (gapCheck.hasGap) {
        showToast(gapCheck.message)
        return
      }

      const seatsData = selectedSeats.map(maGhe => {
        const seat = seats.find(s => s.maGhe === maGhe)
        return seat!
      }).filter(Boolean)

      const foodsData: ISelectedFood[] = []
      
      categoriesWithProducts.forEach(category => {
        category.sanPhams.forEach(product => {
          const qty = foodQuantities[product.maSanPham] || 0
          if (qty > 0) {
            foodsData.push({
              maSanPham: product.maSanPham,
              tenSanPham: product.tenSanPham,
              donGia: product.giaTien,
              soLuong: qty,
              loai: "sanpham"
            })
          }
        })
      })
      
      combos.forEach(combo => {
        const qty = foodQuantities[combo.maCombo] || 0
        if (qty > 0) {
          foodsData.push({
            maSanPham: combo.maCombo,
            tenSanPham: combo.tenCombo,
            donGia: combo.giaBan,
            soLuong: qty,
            loai: "combo"
          })
        }
      })

      setMovie(movieDetail)
      setShowtime(selectedShowtime)
      setSeatStore(seatsData)
      setFoods(foodsData)

      await holdSeats(selectedShowtime.maSuatChieu, selectedSeats)
      navigate("/checkout")
    } catch (error) {
      console.error("Checkout error:", handleError(error))
      showToast(handleError(error))
    }
  }

  const renderRowSeats = (row: string) => {
    const rowSeats = seats.filter(seat => seat.hangGhe === row).sort((a, b) => a.soGhe - b.soGhe)
    const renderedSeats: JSX.Element[] = []
    const processedIndices = new Set<number>()

    rowSeats.forEach((seat, index) => {
      if (processedIndices.has(index)) return

      const isCouple = seat.tenLoaiGhe === 'Couple'
      
      if (isCouple) {
        const nextSeat = rowSeats[index + 1]
        const isCouplePair = nextSeat && nextSeat.tenLoaiGhe === 'Couple' && nextSeat.soGhe === seat.soGhe + 1

        if (isCouplePair) {
          processedIndices.add(index)
          processedIndices.add(index + 1)


          const isDisabled = seat.trangThai === 'KhongSuDung' || nextSeat.trangThai === 'KhongSuDung'
          const isSelected = selectedSeats.includes(seat.maGhe)
          const isOccupied = seat.trangThai === 'DaDat'
          
          renderedSeats.push(
            <Seat
              key={seat.maGhe}
              type="Couple"
              number={`${seat.hangGhe}${seat.soGhe}-${seat.hangGhe}${nextSeat.soGhe}`}
              status={
                isDisabled ? "KhongSuDung" :
                isOccupied ? "DaDat" : 
                isSelected ? "DangDuocChon" 
                          : "DangTrong"
              }
              onClick={() => handleSeatClick(seat.maGhe)}
            />
          )
        }
      } else {
        processedIndices.add(index)
        const isSelected = selectedSeats.includes(seat.maGhe)
        const isDisabled = seat.trangThai === 'KhongSuDung'
        const isOccupied = seat.trangThai === 'DaDat'

        renderedSeats.push(
          <Seat
            key={seat.maGhe}
            type="Standard"
            number={`${seat.hangGhe}${seat.soGhe}`}
            status={
              isDisabled ? "KhongSuDung" :
              isOccupied ? "DaDat" : 
              isSelected ? "DangDuocChon" 
                        : "DangTrong"
            }
            onClick={() => handleSeatClick(seat.maGhe)}
          />
        )
      }
    })

    return renderedSeats
  }

  const uniqueRows = Array.from(new Set(seats.map(s => s.hangGhe))).sort()

  return (
    <UserLayout>
      <section className="relative max-w-7xl mx-auto mt-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Poster Column */}
          <div className="w-full md:w-64 lg:w-120 flex-shrink-0">
            <div className="aspect-[2/3] rounded overflow-hidden border-2 object-cover border-yellow-300/30 shadow-2xl bg-gray-800">
              {movieDetail?.anhBia ? (
                <img 
                  src={movieDetail.anhBia}
                  alt={movieDetail.tenPhim || "Movie poster"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 hover:text-yellow-300">
                  <span className="text-5xl mb-2">🎬</span>
                  <span className="text-sm">No image</span>
                </div>
              )}

              {/* Badges */}
              {(movieDetail?.phienBan || movieDetail?.tenPhanLoaiDoTuoi) && (
                <div className="flex">
                  <div className="flex items-center justify-center w-14 h-14 bg-yellow-300 text-black text-lg font-anton">
                    {phienBan[movieDetail?.phienBan] || "2D"}
                  </div>
                  <div className="flex items-center justify-center w-14 h-14 bg-red-600 text-white text-2xl font-anton">
                    {movieDetail?.tenPhanLoaiDoTuoi || "T18"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-anton uppercase text-white">
              {movieDetail?.tenPhim} ({movieDetail?.tenPhanLoaiDoTuoi})
            </h1>
            
            <div className="flex flex-wrap gap-2 items-center">
              <Tags className="text-yellow-300 w-5 h-5" />
              {movieDetail?.theLoais.map((genre, i) => (
                <span key={i} className="text-gray-300">
                  {genre}{i < movieDetail.theLoais.length - 1 && ", "}
                </span>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <Clock className="text-yellow-300 w-5 h-5" />
              <span className="text-gray-300">{movieDetail?.thoiLuong} phút</span>
            </div>

            <div className="flex gap-2 items-center">
              <UserRoundCheck className="text-yellow-300 w-5 h-5" />
              <span className="px-3 py-1 text-black bg-yellow-300 rounded font-semibold text-sm">
                {movieDetail?.tenPhanLoaiDoTuoi}: {movieDetail?.moTaPhanLoaiDoTuoi}
              </span>
            </div>
            
            {/* Movie Details */}
            <div className="space-y-3 mt-4">
              <h2 className="font-anton text-white text-xl uppercase">Mô tả</h2>
              
              <div className="flex gap-3">
                <span className="text-yellow-300 font-semibold min-w-24">Đạo diễn:</span>
                <span className="text-gray-300">{movieDetail?.daoDien}</span>
              </div>
              
              <div className="flex gap-3">
                <span className="text-yellow-300 font-semibold min-w-24">Khởi chiếu:</span>
                <span className="text-gray-300">{formatDate(movieDetail?.ngayKhoiChieu)}</span>
              </div>
              
              <div className="flex gap-3">
                <span className="text-yellow-300 font-semibold min-w-24">Diễn viên:</span>
                <span className="text-gray-300">{movieDetail?.dienVien}</span>
              </div>
            </div>

            {/* Movie Content */}
            <div className="space-y-3 mt-4">
              <h2 className="font-anton text-white text-xl uppercase">Nội dung phim</h2>
              <p className="text-gray-300 text-base leading-relaxed">
                {movieDetail?.moTa}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() => openModal(movieDetail?.trailerPhim || "")}
                disabled={!movieDetail?.trailerPhim}
                variant="yellowToPinkPurple"
                className="font-bold"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Xem Trailer</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto pt-8">
        <h2 className="text-4xl font-anton uppercase text-white text-center">Lịch chiếu</h2>

        {availableDates.length > 0 ? (
          <div className="overflow-x-auto mb-10">
            <div className="flex gap-4 min-w-max justify-center my-10">
              {availableDates.map((date) => {
                return (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedShowtime(null)
                      setSelectedSeats([])
                    }}
                    disabled={loadingShowtimes}
                    className={`w-24 cursor-pointer flex flex-col aspect-square items-center justify-center rounded border transition-all ${
                      selectedDate === date
                        ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-yellow-300 text-purple-900 font-bold shadow-lg'
                        : 'bg-white/10 border-yellow-300 text-yellow-300 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl font-anton">{date}</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-6">
              {loadingShowtimes ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-300 border-t-transparent"></div>
                  <p className="mt-4">Đang tải lịch chiếu...</p>
                </div>
              ) : showtimesData[selectedDate] ? (
                Object.entries(showtimesData[selectedDate]).map(([roomType, shows]) => (
                  <div
                    key={roomType}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-6 hover:border-yellow-300/50 hover:bg-white/10 transition-all"
                  >
                    <h4 className="font-semibold text-yellow-300 text-sm md:text-base mb-4 pl-3 border-l-3 border-yellow-300">
                      {roomType}
                    </h4>
                    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-14 gap-3">
                      {shows.map((show) => (
                        <button
                          key={show.maSuatChieu}
                          className="bg-gradient-to-r text-sm md:text-base cursor-pointer border border-yellow-300 from-yellow-300 to-pink-500 hover:from-yellow-400 hover:to-pink-500 text-black font-bold p-1 rounded transition-all shadow-lg"
                          onClick={() => {
                            handleShowtimeSelect(show)
                          }}
                        >
                          {formatTime(show.gioBatDau)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-gray-400 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xl">Không có suất chiếu trong ngày này</p>
                  <p className="text-sm mt-2">Vui lòng chọn ngày khác</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 my-10 text-gray-400 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xl">Chưa có lịch chiếu cho phim này</p>
            <p className="text-sm mt-2">Vui lòng quay lại sau</p>
          </div>
        )}
      </section>

      {/* Seat Selection Section */}
      {selectedShowtime && (
        <section ref={seatRef} className="max-w-7xl mx-auto pt-8 pb-32">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-300/50 rounded-lg py-6">
            {/* Header */}
            <div className="flex justify-center mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-3xl md:text-4xl font-anton uppercase text-white mb-2">Chọn ghế ngồi - {selectedShowtime.tenPhongChieu}</h2>
                <p className="text-gray-300 text-base text-center">
                  Suất chiếu: {formatTime(selectedShowtime.gioBatDau)} - {selectedShowtime.tenLoaiPhong}
                </p>
              </div>
            </div>

            {loadingSeats ? (
              <div className="text-center py-12 text-gray-400">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-yellow-300 border-t-transparent"></div>
                <p className="mt-4">Đang tải sơ đồ ghế...</p>
              </div>
            ) : (
              <>
                <div className="w-full flex justify-center overflow-x-auto">
                  <div className="inline-block min-w-min">
                    <div className="mb-6 md:mb-12">
                      <div className="bg-gradient-to-b from-yellow-300/50 to-transparent h-2 rounded-t-full"></div>
                      <p className="text-center text-yellow-300 text-base font-semibold mt-3">
                        MÀN HÌNH
                      </p>
                    </div>

                    <div className="flex flex-col gap-[2px]">
                      {uniqueRows.map((row) => {
                        return (
                          <div key={row} className="flex items-center gap-[1px] md:gap-4">
                            <div className="w-8 md:h-14 flex items-center justify-center text-yellow-300 font-bold text-xs md:text-lg">
                              {row}
                            </div>
                            <div className="flex gap-[1px] md:gap-2">
                              {renderRowSeats(row)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Color Status Seat  */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center my-8 text-sm">
                  <div className="flex items-center gap-3">
                    <Seat type="Standard" className="w-8 h-4" />
                    <span className="text-gray-300">Ghế thường</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Seat type="Couple" className="w-10 h-4" />
                    <span className="text-gray-300">Ghế đôi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Seat type="Standard" status="DangDuocChon" className="w-8 h-4" />
                    <span className="text-gray-300">Ghế đang chọn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Seat type="Standard" status="DaDat" className="w-8 h-4" />
                    <span className="text-gray-300">Ghế đã đặt</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Combo and Products */}
      {selectedShowtime && selectedSeats.length > 0 && (
        <section className="max-w-7xl mx-auto pb-32">
          <h2 className="text-4xl font-anton uppercase text-white text-center mb-10">
            Chọn Bắp Nước
          </h2>

            <div className="flex justify-center mb-8">
              <div className="flex bg-white/10 rounded-lg p-1 border border-yellow-300/30">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`px-8 py-3 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTab === "products"
                      ? "bg-gradient-to-r from-yellow-300 to-pink-500 text-black shadow-lg"
                      : "text-yellow-300 hover:text-white"
                  }`}
                >
                  Sản phẩm lẻ 
                </button>
                <button
                  onClick={() => setActiveTab("combos")}
                  className={`px-8 py-3 rounded-md font-semibold transition-all cursor-pointer ml-2 ${
                    activeTab === "combos"
                      ? "bg-gradient-to-r from-yellow-300 to-pink-500 text-black shadow-lg"
                      : "text-yellow-300 hover:text-white"
                  }`}
                >
                  Combo siêu hời
                </button>
              </div>
            </div>

              {activeTab === "products" && categoriesWithProducts.length === 0 && (
                <div className="text-center py-16 text-gray-400 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xl">Hết hàng mất rồi huhu</p>
                </div>
              )}

              {activeTab === "products" && categoriesWithProducts.length > 0 && (
                <div className="space-y-12">
                  {categoriesWithProducts.map((category) => (
                    <div
                      key={category.maDanhMucSanPham}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-yellow-300/50 transition-all"
                    >
                      <h3 className="text-2xl font-semibold text-yellow-300 mb-6 text-center uppercase">
                        {category.tenDanhMucSanPham}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {category.sanPhams.map((sp: IProduct) => (
                          <ProductCard
                            key={sp.maSanPham}
                            product={sp}
                            quantity={foodQuantities[sp.maSanPham] || 0}
                            onIncrease={() => handleFoodChange(sp.maSanPham, (foodQuantities[sp.maSanPham] || 0) + 1)}
                            onDecrease={() => handleFoodChange(sp.maSanPham, Math.max(0, (foodQuantities[sp.maSanPham] || 0) - 1))}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Combo */}
              {activeTab === "combos" && combos.length === 0 && (
                <div className="text-center py-16 text-gray-400 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xl">Chưa có combo nào hôm nay</p>
                </div>
              )}

              {activeTab === "combos" && combos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {combos.map((combo: ICombo) => (
                    <ComboCard
                      key={combo.maCombo}
                      combo={combo}
                      quantity={foodQuantities[combo.maCombo] || 0}
                      onIncrease={() => handleFoodChange(combo.maCombo, (foodQuantities[combo.maCombo] || 0) + 1)}
                      onDecrease={() => handleFoodChange(combo.maCombo, Math.max(0, (foodQuantities[combo.maCombo] || 0) - 1))}
                    />
                  ))}
                </div>
              )}
        </section>
      )}


      {/* Footer - Booking Summary */}
      {selectedShowtime && selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-purple-950 opacity-90 border-t-2 border-yellow-300 z-50">
          <div className="max-w-7xl mx-auto px-4 xl:px-0 py-4">
            <div className="flex flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 space-y-4">
                <h1 className="text-white font-anton text-2xl md:text-3xl leading-tight">
                  {movieDetail?.tenPhim} <span className="text-yellow-300">({movieDetail?.tenPhanLoaiDoTuoi})</span>
                </h1>
                <p className="text-white ">Phòng chiếu: {selectedShowtime?.tenPhongChieu} | Suất chiếu: {formatTime(selectedShowtime?.gioBatDau)}</p>

                {selectedSeats.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(maGhe => {
                      const seat = seats.find(s => s.maGhe === maGhe)
                      return (
                        <div
                          key={maGhe}
                          className="group relative bg-gradient-to-r from-yellow-300/20 to-pink-500/20 border border-yellow-300/50 px-2 py-1 rounded flex items-center gap-3 hover:border-yellow-300 transition-all"
                        >
                          <span className="text-yellow-300 font-anton text-lg">
                            {seat?.hangGhe}{seat?.soGhe}
                          </span>
                          <span className="text-yellow-200 text-sm">
                            {Number(seat?.giaTien).toLocaleString()} VNĐ
                          </span>

                          <button
                            onClick={() => handleSeatClick(maGhe)}
                            className="transition-opacity cursor-pointer text-white text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {getSelectedFoodItems().length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedFoodItems().map(item => (
                      <div
                        key={item.id}
                        className="group relative bg-gradient-to-r from-yellow-300/20 to-pink-500/20 border border-yellow-300/50 px-2 py-1 rounded flex items-center gap-3 hover:border-yellow-300 transition-all"
                      >
                        <span className="text-yellow-200 font-medium text-sm md:text-base">
                          {item.label}
                        </span>

                        <button
                          onClick={() => handleFoodChange(item.id, 0)}
                          className="transition-opacity cursor-pointer text-white text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right + Total + Button */}
              <div className="flex flex-col md:flex-row gap-3">
                <div>
                  <div className="mb-4 flex gap-4 justify-between items-center">
                    <p className="text-white text-base">Tổng tiền</p>
                    <p className="text-yellow-300 text-3xl font-anton">
                      {(calculateSeatsTotal() + calculateFoodTotal()).toLocaleString()} VNĐ
                    </p>
                  </div>
                  
                  <Button
                    variant="yellowToPinkPurple"
                    className="font-anton text-lg h-10 shadow-lg w-full"
                    onClick={handleCheckout}
                  >
                    <span>Đặt vé</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {movieDetail?.trailerPhim && trailerId && (
        <TrailerModal
          show={show}
          trailerId={trailerId}
          onClose={closeModal}
        />
      )}
    </UserLayout>
  )
}