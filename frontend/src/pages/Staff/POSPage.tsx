import { useState, useEffect } from 'react'
import { Check, Loader2, Plus, Printer } from 'lucide-react'
import StaffLayout from '@/components/layout/StaffLayout'
import {
  listMoviesShowing,
  getMovieShowtimes,
  getSeatsByShowTimeId,
  getCategoriesWithProducts,
  getAllCombos,
  checkCustomerExistsStaff,
  createVNPayPaymentStaff,
  cashPaymentStaff,
  dowloadTicketStaff,
  holdSeats,
  getHoldSeatTTL
} from '@/services/api'
import { useAlert } from "@/stores/useAlert"
import { formatDate, formatTime, formatWeekday } from '@/utils/formatDate'
import Seat from '@/components/common/Seat'
import type { IMovie, IMovieShowtime } from "@/types/movie"
import type { ISeatData } from "@/types/seat"
import type { ICombo, ICategoryWithProducts, ISelectedFood } from '@/types/product'
import { handleError } from '@/utils/handleError.utils'
import { toast } from 'sonner'
import type { IUser } from '@/types/user'
import { useSearchParams } from 'react-router-dom'

const CinemaPOS = () => {
  const [step, setStep] = useState<number>(1)
  const [movies, setMovies] = useState<IMovie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null)
  const [showtimes, setShowtimes] = useState<IMovieShowtime[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<IMovieShowtime | null>(null)
  const [seats, setSeats] = useState<ISeatData[]>([])

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)

  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [categories, setCategories] = useState<ICategoryWithProducts[]>([])
  const [combos, setCombos] = useState<ICombo[]>([])
  const [foodQuantities, setFoodQuantities] = useState<{ [key: string]: number }>({})
  const [customer, setCustomer] = useState<IUser | null>(null)
  const [phone, setPhone] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay' | ''>('')
  const [loading, setLoading] = useState(false)

  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number | null>(null)
  const [holdInterval, setHoldInterval] = useState<NodeJS.Timeout | null>(null)

  const { showToast } = useAlert()
  const [searchParams] = useSearchParams()
  const paymentStatus = searchParams.get('status')
  const maHoaDon = searchParams.get('maHoaDon')

  // Load initial data
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      try {
        const [moviesData, cats, combosData] = await Promise.all([
          listMoviesShowing(),
          getCategoriesWithProducts(),
          getAllCombos()
        ])
        setMovies(moviesData)
        setCategories(cats)
        setCombos(combosData)
      } catch {
        showToast("Lỗi tải dữ liệu ban đầu")
      } finally {
        setLoading(false)
      }
    }
    loadInitial()
  }, [])

  // Load showtimes when movie selected
  useEffect(() => {
    if (!selectedMovie) return
    const fetchShowtimes = async () => {
      setLoading(true)
      try {
        const data = await getMovieShowtimes(selectedMovie.maPhim)
        setShowtimes(data)
        setSelectedDate(null)
        setSelectedShowtime(null)
      } catch {
        showToast("Không tải được suất chiếu")
      } finally {
        setLoading(false)
      }
    }
    fetchShowtimes()
  }, [selectedMovie])

  // Load seats when showtime selected
  useEffect(() => {
    if (!selectedShowtime) return
    const fetchSeats = async () => {
      setLoading(true)
      try {
        const data = await getSeatsByShowTimeId(selectedShowtime.maSuatChieu)
        setSeats(data)
      } catch {
        showToast("Không tải được sơ đồ ghế")
      } finally {
        setLoading(false)
      }
    }
    fetchSeats()
  }, [selectedShowtime])

  // Group showtimes by date
  const groupedShowtimes = showtimes.reduce((acc: { [date: string]: IMovieShowtime[] }, show) => {
    const date = new Date(show.gioBatDau).toISOString().split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(show)
    return acc
  }, {})

  const dates = Object.keys(groupedShowtimes).sort()

  const handleSeatClick = (maGhe: string) => {
    const seat = seats.find(s => s.maGhe === maGhe)
    if (!seat) return

    if (seat.trangThai === 'DaDat' || seat.trangThai === 'KhongSuDung') {
      return
    }

    // Ghế đôi và ghế thường giờ xử lý giống nhau vì chỉ là 1 record
    setSelectedSeats(prev => {
      if (prev.includes(maGhe)) {
        return prev.filter(id => id !== maGhe)
      }

      // Check limit - Ghế đôi tính là 2 người
      const currentCount = prev.reduce((count, id) => {
        const s = seats.find(seat => seat.maGhe === id)
        return count + (s?.tenLoaiGhe === 'Couple' ? 2 : 1)
      }, 0)

      const newSeatCount = seat.tenLoaiGhe === 'Couple' ? 2 : 1
      
      if (currentCount + newSeatCount > 8) {
        showToast("Bạn chỉ có thể chọn tối đa 8 ghế!")
        return prev
      }

      return [...prev, maGhe]
    })
  }

  const calculateTotal = () => {
    const processedPairs = new Set<string>()

    const seatTotal = selectedSeats.reduce((total, maGhe) => {
      const seat = seats.find(s => s.maGhe === maGhe)
      if (!seat) return total

      const isCouple = seat.tenLoaiGhe.toLowerCase().includes('couple') || seat.tenLoaiGhe.toLowerCase().includes('đôi')

      if (isCouple) {
        const rowSeats = seats
          .filter(s => s.hangGhe === seat.hangGhe && (s.tenLoaiGhe.toLowerCase().includes('couple') || s.tenLoaiGhe.toLowerCase().includes('đôi')))
          .sort((a, b) => a.soGhe - b.soGhe)

        const currentIndex = rowSeats.findIndex(s => s.maGhe === maGhe)
        const pairKey = currentIndex % 2 === 0
          ? `${maGhe}-${rowSeats[currentIndex + 1]?.maGhe}`
          : `${rowSeats[currentIndex - 1]?.maGhe}-${maGhe}`

        if (processedPairs.has(pairKey)) return total
        processedPairs.add(pairKey)
      }

      return total + Number(seat.giaTien)
    }, 0)

    const foodTotal = Object.entries(foodQuantities).reduce((sum, [id, qty]) => {
      if (qty === 0) return sum

      const product = categories.flatMap(c => c.sanPhams).find(p => p.maSanPham === id)
      if (product) return sum + Number(product.giaTien) * qty

      const combo = combos.find(c => c.maCombo === id)
      return combo ? sum + Number(combo.giaBan) * qty : sum
    }, 0)

    return seatTotal + foodTotal
  }

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return showToast("Vui lòng chọn ít nhất 1 ghế")
    if (!paymentMethod) return showToast("Vui lòng chọn phương thức thanh toán")
    if (!selectedMovie || !selectedShowtime) {
      toast.error('Chưa chọn phim hoặc suất chiếu')
      return
    }

    setLoading(true)
    try {
      const seatDetails = selectedSeats.map(id => {
        const seat = seats.find(s => s.maGhe === id)!
        return { maGhe: seat.maGhe, giaTien: Number(seat.giaTien) }
      })

      const foodsData: ISelectedFood[] = []

      categories.forEach(category => {
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

      const payload = {
        maSuatChieu: selectedShowtime.maSuatChieu,
        selectedSeats: seatDetails,
        selectedFoods: foodsData,
        tongTien: calculateTotal(),
        soDienThoaiNguoiDung: customer?.soDienThoai,
      }

      let paymentUrl
      if (paymentMethod === 'cash') {
        paymentUrl = await cashPaymentStaff(payload)
      } else {
        paymentUrl = await createVNPayPaymentStaff(payload)
      }
      window.location.href = paymentUrl
    } catch (err) {
      showToast(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (paymentStatus === 'success' && maHoaDon) {
      setStep(5)
      setIsLoadingPDF(true)
      const downloadTicket = async () => {
        try {
          const blob = await dowloadTicketStaff(maHoaDon)
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
        } catch (error) {
          console.error('Download ticket error:', error)
          toast.error('Không tải được vé')
        } finally {
          setIsLoadingPDF(false)
        }
      }
      downloadTicket()
    }
  }, [paymentStatus, maHoaDon])

  const reset = () => {
    if (holdInterval) clearInterval(holdInterval)
    setHoldTimeRemaining(null)
    setStep(1)
    setSelectedMovie(null)
    setSelectedDate(null)
    setSelectedShowtime(null)
    setSelectedSeats([])
    setFoodQuantities({})
    setCustomer(null)
    setPhone('')
    setPaymentMethod('')
    setShowtimes([])
  }

  const TotalAmountHeader = () => {
    const total = calculateTotal()
    if (total === 0) return null
    return (
      <div className="bg-yellow-300 text-black px-4 py-1 rounded font-bold text-base shadow">
        {total.toLocaleString()} VND
      </div>
    )
  }

  const renderRowSeats = (row: string) => {
    const rowSeats = seats.filter(seat => seat.hangGhe === row).sort((a, b) => a.soGhe - b.soGhe)

    return rowSeats.map((seat) => {
      let seatType: "Standard" | "Couple" | "VIP" = "Standard"
      
      if (seat.tenLoaiGhe === "Couple") seatType = "Couple"
      else if (seat.tenLoaiGhe === "VIP") seatType = "VIP"   

      const isSelected = selectedSeats.includes(seat.maGhe)
      const isDisabled = seat.trangThai === "KhongSuDung"
      const isOccupied = seat.trangThai === "DaDat"

      return (
        <Seat
          key={seat.maGhe}
          type={seatType}
          number={`${seat.hangGhe}${seat.soGhe}`}
          status={
            isDisabled ? "KhongSuDung" :
            isOccupied ? "DaDat" :
            isSelected ? "DangDuocChon" : "DangTrong"
          }
          variant="purple"
          onClick={() => handleSeatClick(seat.maGhe)}
        />
      )
    })
  }

  const checkCustomerExists = async (phone: string) => {
    try {
      const customer = await checkCustomerExistsStaff(phone)
      setCustomer(customer)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleNextFromSeatSelection = async () => {
    if (selectedSeats.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 ghế")
      return
    }

    setLoading(true)
    try {
      await holdSeats(selectedShowtime!.maSuatChieu, selectedSeats)

      const firstSeatId = selectedSeats[0]
      const { ttl } = await getHoldSeatTTL(selectedShowtime!.maSuatChieu, firstSeatId)
      setHoldTimeRemaining(ttl)

      const interval = setInterval(() => {
        setHoldTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            toast.error('Hết thời gian giữ ghế!')
            setStep(2)
            setSelectedSeats([])
            setFoodQuantities({})
            return null
          }
          return prev - 1
        })
      }, 1000)

      setHoldInterval(interval)
      setStep(3)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const uniqueRows = Array.from(new Set(seats.map(s => s.hangGhe))).sort()
  const seatTypes = Array.from(new Set(seats.map(seat => seat.tenLoaiGhe)))
  return (
    <StaffLayout>
      <div className="max-w-8xl mx-auto bg-white shadow-md rounded">
        {/* Header */}
        <div className="bg-purple-700 text-white px-4 h-14 rounded flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg md:text-xl font-bold ms-2">
              {step === 1 && "Chọn phim - Suất chiếu"}
              {step === 2 && "Chọn ghế"}
              {step === 3 && "Bắp nước và Combo"}
              {step === 4 && "Thanh toán"}
              {step === 5 && "Hoàn tất"}
            </h1>
            {(step >= 2 && step <= 3) && <TotalAmountHeader />}
          </div>
          {holdTimeRemaining !== null && step > 2 && (
            <div className="bg-yellow-300 text-black px-3 py-1 rounded font-bold text">
              Thời gian giữ ghế: {formatTimeRemaining(holdTimeRemaining)}
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Step 1: Chọn phim + ngày dưới là ngày & suất chiếu */}
          {step === 1 && (
            <div className="space-y-8">
              {/* Danh sách phim */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {loading ? (
                  <Loader2 className="animate-spin col-span-full my-12 mx-auto" size={40} />
                ) : (
                  movies.map(movie => (
                    <div
                      key={movie.maPhim}
                      onClick={() => setSelectedMovie(movie)}
                      className={`border rounded overflow-hidden cursor-pointer transition-all ${
                        selectedMovie?.maPhim === movie.maPhim
                          ? 'border-purple-600 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-400 hover:shadow'
                      }`}
                    >
                      <img
                        src={movie.anhBia}
                        alt={movie.tenPhim}
                        className="w-full h-50 object-cover"
                      />
                      <div className="p-4 text-center text-purple-700 font-bold">
                        {movie.tenPhim}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Ngày dưới phim: Ngày + Suất chiếu */}
              {selectedMovie && (
                <div className="space-y-6 bg-gray-50 p-5 rounded border border-gray-200">
                  {/* Danh sách ngày */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {dates.map(date => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-2 rounded text-sm font-bold transition ${
                          selectedDate === date
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {formatWeekday(date)}, {formatDate(date)}
                      </button>
                    ))}
                  </div>

                  {/* Suất chiếu của ngày */}
                  {selectedDate && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
                      {groupedShowtimes[selectedDate].map(show => (
                        <button
                          key={show.maSuatChieu}
                          onClick={() => {
                            setSelectedShowtime(show)
                            setStep(2)
                          }}
                          className="border rounded p-2 border-gray-300 text-sm text-center hover:bg-purple-100 transition hover:border-purple-400"
                        >
                          <div className="font-bold">{formatTime(show.gioBatDau)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Ghế - Đã fix hiển thị ghế đôi */}
          {step === 2 && selectedShowtime && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-bold text-lg mt-4"> Chọn ghế - {selectedShowtime.tenPhongChieu}</h3>
              </div>

              {loading ? (
                <Loader2 className="animate-spin mx-auto my-12" size={40} />
              ) : (
                <>
                  <div className="w-full flex justify-center overflow-x-auto">
                    <div className="inline-block min-w-min">
                      <div className="mb-6">
                        <div className="bg-gradient-to-b from-purple-700/50 to-transparent h-2 rounded-t-full"></div>
                        <p className="text-center text-purple-500 text-base font-semibold mt-3">
                          MÀN HÌNH
                        </p>
                      </div>

                      <div className="flex flex-col gap-[2px]">
                        {uniqueRows.map((row) => {
                          return (
                            <div key={row} className="flex items-center gap-[1px] md:gap-8">
                              <div className="w-8 md:h-14 flex items-center justify-center text-purple-800 font-bold text-xs md:text-lg">
                                {row}
                              </div>
                              <div className="flex gap-[1px] md:gap-4">
                                {renderRowSeats(row)}
                              </div>
                              <div className="w-8 md:h-14 flex items-center justify-center text-purple-800 font-bold text-xs md:text-lg">
                                {row}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Color Status Seat  */}
                  <div
                    className="
                      flex flex-wrap justify-center gap-14 my-8 md:my-12 text-sm
                      md:grid md:grid-flow-col md:auto-cols-max md:justify-center md:items-center
                    "
                  >
                    {seatTypes.map((tenLoaiGhe) => {
                      return (
                        <div key={tenLoaiGhe} className="flex items-center gap-3">
                          <Seat type={tenLoaiGhe} variant="purple" className={tenLoaiGhe === "Couple" ? "w-20" : "w-8"} />
                          <span className="text-gray-300">Ghế {tenLoaiGhe}</span>
                        </div>
                      )
                    })}

                    {/* Trạng thái */}
                    <div className="flex items-center gap-3">
                      <Seat type="Standard" status="DangDuocChon" className="w-8" />
                      <span className="text-gray-300">Ghế đang chọn</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Seat type="Standard" status="DaDat" className="w-8" />
                      <span className="text-gray-300">Ghế đã đặt</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Food & Combo */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-10">
                {/* Combos */}
                <div>
                  <h3 className="text-xl font-bold text-purple-500 mb-5 flex items-center gap-3">
                    Combo hot hôm nay
                  </h3>
                  <div className="space-y-4">
                    {combos.map(combo => {
                      const qty = foodQuantities[combo.maCombo] || 0
                      return (
                        <div key={combo.maCombo} className="flex items-center gap-5 p-4 bg-white border border-purple-100 rounded hover:shadow-md transition">
                          <img src={combo.anhCombo} alt={combo.tenCombo} className="w-20 h-20 object-cover rounded" />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-base">{combo.tenCombo}</h4>
                            </div>
                            <div className="text-purple-600 font-semibold text-lg">
                              {Number(combo.giaBan).toLocaleString()} VND
                              {combo.giaGoc > combo.giaBan && (
                                <span className="text-gray-500 line-through text-sm ml-3">
                                  {Number(combo.giaGoc).toLocaleString()} VND
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {combo.chiTietCombos?.map(d => d.tenSanPham).join(' + ') || 'Combo siêu tiết kiệm'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setFoodQuantities(p => ({ ...p, [combo.maCombo]: Math.max(0, (p[combo.maCombo] || 0) - 1) }))}
                              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold"
                              disabled={qty === 0}
                            >
                              −
                            </button>
                            <span className="w-12 text-center text-xl font-bold">{qty}</span>
                            <button
                              onClick={() => setFoodQuantities(p => ({ ...p, [combo.maCombo]: (p[combo.maCombo] || 0) + 1 }))}
                              className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded hover:bg-purple-700 text-lg font-bold shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Products */}
                {categories.map(cat => (
                  <div key={cat.maDanhMucSanPham}>
                    <h3 className="text-xl font-bold text-purple-600 mb-5 flex items-center gap-3">
                      {cat.tenDanhMucSanPham}
                    </h3>
                    <div className="space-y-4">
                      {cat.sanPhams.map(product => {
                        const qty = foodQuantities[product.maSanPham] || 0
                        return (
                          <div key={product.maSanPham} className="flex items-center gap-5 p-4 bg-white border border-purple-100 rounded hover:shadow-md transition">
                            <img src={product.anhSanPham} alt={product.tenSanPham} className="w-20 h-20 object-cover rounded" />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-base">{product.tenSanPham}</h4>
                              </div>
                              <div className="text-purple-600 font-semibold text-lg">
                                {Number(product.giaTien).toLocaleString()} VND
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setFoodQuantities(p => ({ ...p, [product.maSanPham]: Math.max(0, (p[product.maSanPham] || 0) - 1) }))}
                                className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold"
                                disabled={qty === 0}
                              >
                                −
                              </button>
                              <span className="w-12 text-center text-xl font-bold">{qty}</span>
                              <button
                                onClick={() => setFoodQuantities(p => ({ ...p, [product.maSanPham]: (p[product.maSanPham] || 0) + 1 }))}
                                className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded hover:bg-purple-700 text-lg font-bold shadow-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="border rounded-lg p-5 bg-gray-50">
                <h3 className="font-bold text-lg mb-4 text-center">Tóm tắt đơn hàng</h3>

                <div className="space-y-3 text-sm">
                  {/* Phim & Suất chiếu */}
                  <div className="flex justify-between">
                    <span className="font-bold">Phim & Suất chiếu:</span>
                    <span>{selectedMovie?.tenPhim} - {formatTime(selectedShowtime!.gioBatDau)} - {formatDate(selectedShowtime!.gioBatDau)} </span>
                  </div>

                  {/* Ghế */}
                  <div className="flex justify-between">
                    <span className="font-bold">Ghế:</span>
                    <div className="text-right">
                      {selectedSeats
                        .map(id => {
                          const seat = seats.find(s => s.maGhe === id)
                          return `${seat?.hangGhe}${seat?.soGhe}`
                        })
                        .sort((a, b) => a.localeCompare(b))
                        .join(', ')}
                    </div>
                  </div>

                  {/* Chi tiết vé */}
                  <div className="flex justify-between font-medium">
                    <span className="font-bold">Tiền vé:</span>
                    <span>{(
                      selectedSeats.reduce((sum, id) => {
                        const seat = seats.find(s => s.maGhe === id)
                        return sum + Number(seat?.giaTien || 0)
                      }, 0).toLocaleString()
                    )} VNĐ</span>
                  </div>

                  {/* Tiền combo & sản phẩm */}
                  {Object.keys(foodQuantities).length > 0 && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <div className="font-bold mb-2">Bắp nước & combo:</div>
                        {Object.entries(foodQuantities)
                          .filter(([, qty]) => qty > 0)
                          .map(([id, qty]) => {
                            const combo = combos.find(c => c.maCombo === id)
                            if (combo) {
                              return (
                                <div key={id} className="flex justify-between text-sm mt-1">
                                  <span>{combo.tenCombo} x {qty}</span>
                                  <span>{(Number(combo.giaBan) * qty).toLocaleString()} VNĐ</span>
                                </div>
                              )
                            }

                            const product = categories.flatMap(c => c.sanPhams).find(p => p.maSanPham === id)
                            if (product) {
                              return (
                                <div key={id} className="flex justify-between text-sm mt-1">
                                  <span>{product.tenSanPham} x {qty}</span>
                                  <span>{(Number(product.giaTien) * qty).toLocaleString()} VNĐ</span>
                                </div>
                              )
                            }

                            return null
                          })}
                      </div>
                    </>
                  )}

                  {/* Tổng cộng */}
                  <div className="flex justify-between font-semibold text-base pt-4 border-t">
                    <span>TỔNG CỘNG:</span>
                    <span className="text-purple-600 text-lg">{calculateTotal().toLocaleString()} VNĐ</span>
                  </div>
                </div>
              </div>

              {/* Tên khách */}
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại khách hàng để tích điểm (nếu có)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value)
                    setCustomer(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      checkCustomerExists(e.currentTarget.value)
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Nhập số điện thoại..."
                />
                {customer && (
                  <div className="mt-2 text-sm text-green-600">
                    <p>Khách hàng: {customer.hoTen}</p>
                    <p>Điểm tích lũy: {customer.diemTichLuy}</p>
                  </div>
                )}
              </div>

              {/* Phương thức thanh toán */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 border rounded-lg text-sm font-medium ${
                    paymentMethod === 'cash' ? 'bg-green-50 border-green-600' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Tiền mặt
                </button>
                <button
                  onClick={() => setPaymentMethod('vnpay')}
                  className={`p-3 border rounded-lg text-sm font-medium ${
                    paymentMethod === 'vnpay' ? 'bg-purple-50 border-purple-600' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  VNPay
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Loading PDF */}
          {step === 5 && isLoadingPDF && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <Printer className="text-purple-600 animate-pulse" size={40} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Thanh toán thành công!
              </h2>
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
                <Loader2 className="animate-spin" size={20} />
                <p className="font-medium">Đang chuẩn bị in vé...</p>
              </div>
              <p className="text-sm text-gray-500">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && !isLoadingPDF && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="text-green-600" size={48} />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-8">
                Giao dịch của bạn đã được xử lý thành công
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Bán vé mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                if (step === 1) {
                  setSelectedMovie(null)
                  setShowtimes([])
                  setSelectedDate(null)
                  setSelectedShowtime(null)
                } else {
                  setStep(prev => Math.max(1, prev - 1))
                }
              }}
              disabled={step === 1 && !selectedMovie}
              className="px-6 py-2 bg-gray-300 rounded text-sm disabled:opacity-50"
            >
              Quay lại
            </button>

            <button
              onClick={async () => {
                if (step === 4) {
                  await handlePayment()
                } else if (step === 1) {
                  if (selectedShowtime) setStep(2)
                } else if (step === 2) {
                  await handleNextFromSeatSelection()
                } else {
                  setStep(prev => prev + 1)
                }
              }}
              disabled={
                loading ||
                (step === 2 && selectedSeats.length === 0) ||
                (step === 4 && !paymentMethod) ||
                (step === 1 && !selectedShowtime)
              }
              className="px-6 py-2 bg-purple-600 text-white rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {step === 4 ? 'Xác nhận' : 'Tiếp tục'}
            </button>
          </div>
        )}
      </div>

      {/* PDF Ticket Modal */}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="hidden"
          onLoad={(e) => {
            const iframe = e.currentTarget as HTMLIFrameElement
            iframe.contentWindow?.focus()
            iframe.contentWindow?.print()
          }}
        />
      )}
    </StaffLayout>
  )
}

export default CinemaPOS