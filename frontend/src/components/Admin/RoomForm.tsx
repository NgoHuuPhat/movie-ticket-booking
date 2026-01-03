import { useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { z } from "zod"
import { ChevronRight, Armchair, X, Loader2, Users } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const roomSchema = z.object({
  tenPhong: z.string().min(1, "Tên phòng không được để trống"),
  maLoaiPhong: z.string().min(1, "Vui lòng chọn loại phòng"),
  soHang: z.number().min(1, "Số hàng phải lớn hơn 0").max(26, "Số hàng tối đa là 26"),
  soCot: z.number().min(1, "Số cột phải lớn hơn 0").max(30, "Số cột tối đa là 30"),
})

export type RoomFormData = z.infer<typeof roomSchema>

export interface SeatConfig {
  hangGhe: string
  soGhe: number
  maLoaiGhe: string
  hoatDong: boolean
  isCoupleSeat?: boolean
}

interface RoomFormProps {
  defaultValues?: Partial<RoomFormData>
  roomTypes: Array<{ maLoaiPhong: string; tenLoaiPhong: string }>
  seatTypes: Array<{ maLoaiGhe: string; tenLoaiGhe: string }>
  onSubmit: (data: RoomFormData, seatConfig: SeatConfig[]) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  existingSeats?: SeatConfig[]
  mode?: 'create' | 'edit'
  isLoading?: boolean
}

export const RoomForm = ({
  defaultValues = {
    tenPhong: "",
    maLoaiPhong: "",
    soHang: 10,
    soCot: 12,
  },
  roomTypes,
  seatTypes,
  onSubmit,
  onCancel,
  isEdit = false,
  existingSeats = [],
  mode = 'create',
  isLoading = false,
}: RoomFormProps) => {
  const [step, setStep] = useState(mode === 'edit' ? 2 : 1)
  const [selectedSeatType, setSelectedSeatType] = useState<string>(seatTypes[0]?.maLoaiGhe || "")
  const [seatLayout, setSeatLayout] = useState<Map<string, { maLoaiGhe: string; hoatDong: boolean; isCoupleSeat: boolean }>>(new Map())
  const [coupleRows, setCoupleRows] = useState<Set<number>>(new Set())

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues,
  })

  const soHang = watch("soHang", defaultValues.soHang || 10)
  const soCot = watch("soCot", defaultValues.soCot || 12)

  useEffect(() => {
    if (existingSeats.length > 0) {
      const newLayout = new Map<string, { maLoaiGhe: string; hoatDong: boolean; isCoupleSeat: boolean }>()
      const newCoupleRows = new Set<number>()
      
      existingSeats.forEach(seat => {
        const key = `${seat.hangGhe}-${seat.soGhe}`
        newLayout.set(key, { 
          maLoaiGhe: seat.maLoaiGhe, 
          hoatDong: seat.hoatDong,
          isCoupleSeat: seat.isCoupleSeat || false
        })
        
        if (seat.isCoupleSeat) {
          const rowIndex = seat.hangGhe.charCodeAt(0) - 65
          newCoupleRows.add(rowIndex)
        }
      })
      
      setSeatLayout(newLayout)
      setCoupleRows(newCoupleRows)
    }
  }, [existingSeats])

  const getRowLabel = (index: number) => String.fromCharCode(65 + index)

  const getSeatKey = (row: number, col: number) => `${getRowLabel(row)}-${col + 1}`

  const toggleCoupleRow = (rowIndex: number) => {
    const newCoupleRows = new Set(coupleRows)
    if (newCoupleRows.has(rowIndex)) {
      newCoupleRows.delete(rowIndex)
    } else {
      newCoupleRows.add(rowIndex)
    }
    setCoupleRows(newCoupleRows)
    
    // Rebuild layout for this row
    const newLayout = new Map(seatLayout)
    const isCouple = newCoupleRows.has(rowIndex)
    const maxSeats = isCouple ? Math.floor(soCot / 2) : soCot
    
    // Tìm loại ghế đôi (thường là loại ghế thứ 2 có tên chứa "đôi" hoặc "couple")
    const coupleSeatType = seatTypes.find(t => 
      t.tenLoaiGhe.toLowerCase().includes('đôi') || 
      t.tenLoaiGhe.toLowerCase().includes('couple')
    ) || seatTypes[1] || seatTypes[0]
    
    // Clear existing seats in this row
    for (let col = 0; col < soCot; col++) {
      const key = getSeatKey(rowIndex, col)
      newLayout.delete(key)
    }
    
    // Add new seats
    for (let i = 0; i < maxSeats; i++) {
      const seatNum = isCouple ? (i * 2 + 1) : (i + 1)
      const key = getSeatKey(rowIndex, seatNum - 1)
      newLayout.set(key, { 
        maLoaiGhe: isCouple ? coupleSeatType.maLoaiGhe : (seatTypes[0]?.maLoaiGhe || ""), 
        hoatDong: true,
        isCoupleSeat: isCouple
      })
    }
    
    setSeatLayout(newLayout)
  }

  const handleSeatClick = (row: number, col: number) => {
    const key = getSeatKey(row, col)
    const newLayout = new Map(seatLayout)
    
    if (newLayout.has(key)) {
      const current = newLayout.get(key)!
      if (current.maLoaiGhe === selectedSeatType) {
        newLayout.set(key, { ...current, hoatDong: !current.hoatDong })
      } else {
        newLayout.set(key, { ...current, maLoaiGhe: selectedSeatType, hoatDong: true })
      }
    } else {
      const isCouple = coupleRows.has(row)
      newLayout.set(key, { 
        maLoaiGhe: selectedSeatType, 
        hoatDong: true,
        isCoupleSeat: isCouple
      })
    }
    
    setSeatLayout(newLayout)
  }

  // Get color classes based on seat type
  const getSeatColor = (maLoaiGhe: string) => {
    const seatType = seatTypes.find(t => t.maLoaiGhe === maLoaiGhe)
    if (!seatType) return "bg-gray-400 hover:bg-gray-500"

    if (seatType.tenLoaiGhe.includes("Couple")) {
      return "bg-pink-500 hover:bg-pink-600"
    }
    if (seatType.tenLoaiGhe.includes("VIP")) {
      return "bg-rose-500 hover:bg-rose-600"
    } else {
      return "bg-blue-500 hover:bg-blue-600"
    }
  }

  const handleStepOneSubmit = (data: RoomFormData) => {
    const newLayout = new Map<string, { maLoaiGhe: string; hoatDong: boolean; isCoupleSeat: boolean }>()
    
    // Tìm loại ghế đôi (thường là loại ghế thứ 2 có tên chứa "đôi" hoặc "couple")
    const coupleSeatType = seatTypes.find(t => 
      t.tenLoaiGhe.toLowerCase().includes('đôi') || 
      t.tenLoaiGhe.toLowerCase().includes('couple')
    ) || seatTypes[1] || seatTypes[0]
    
    for (let row = 0; row < data.soHang; row++) {
      const isCouple = coupleRows.has(row)
      const maxSeats = isCouple ? Math.floor(data.soCot / 2) : data.soCot
      
      for (let i = 0; i < maxSeats; i++) {
        const seatNum = isCouple ? (i * 2 + 1) : (i + 1)
        const key = getSeatKey(row, seatNum - 1)
        newLayout.set(key, { 
          maLoaiGhe: isCouple ? coupleSeatType.maLoaiGhe : (seatTypes[0]?.maLoaiGhe || ""), 
          hoatDong: true,
          isCoupleSeat: isCouple
        })
      }
    }
    
    setSeatLayout(newLayout)
    setStep(2)
  }

  const handleFinalSubmit = async () => {
    const data = {
      tenPhong: watch("tenPhong"),
      maLoaiPhong: watch("maLoaiPhong"),
      soHang: watch("soHang"),
      soCot: watch("soCot"),
    }
    
    const seatConfig: SeatConfig[] = Array.from(seatLayout.entries()).map(([key, value]) => {
      const [hangGhe, soGheStr] = key.split("-")
      return {
        hangGhe,
        soGhe: parseInt(soGheStr),
        maLoaiGhe: value.maLoaiGhe,
        hoatDong: value.hoatDong,
        isCoupleSeat: value.isCoupleSeat,
      }
    })
    
    await onSubmit(data, seatConfig)
  }

  // Step 1: Thông tin phòng
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="tenPhong">Tên phòng <span className="text-red-600">*</span></Label>
            <Input id="tenPhong" placeholder="Ví dụ: Phòng 1, Phòng VIP..." {...register("tenPhong")} disabled={isEdit} />
            {errors.tenPhong && <p className="text-sm text-red-600 mt-1">{errors.tenPhong.message}</p>}
          </div>
          <div>
            <Label htmlFor="maLoaiPhong">Loại phòng <span className="text-red-600">*</span></Label>
            <Controller name="maLoaiPhong" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Chọn loại phòng" /></SelectTrigger>
                <SelectContent>{roomTypes.map((type) => (<SelectItem key={type.maLoaiPhong} value={type.maLoaiPhong}>{type.tenLoaiPhong}</SelectItem>))}</SelectContent>
              </Select>
            )} />
            {errors.maLoaiPhong && <p className="text-sm text-red-600 mt-1">{errors.maLoaiPhong.message}</p>}
          </div>
          <div>
            <Label htmlFor="soHang">Số hàng ghế <span className="text-red-600">*</span></Label>
            <Input id="soHang" type="number" placeholder="10" {...register("soHang", { valueAsNumber: true })} disabled={isEdit} />
            {errors.soHang && <p className="text-sm text-red-600 mt-1">{errors.soHang.message}</p>}
          </div>
          <div>
            <Label htmlFor="soCot">Số cột ghế <span className="text-red-600">*</span></Label>
            <Input id="soCot" type="number" placeholder="12" {...register("soCot", { valueAsNumber: true })} disabled={isEdit} />
            {errors.soCot && <p className="text-sm text-red-600 mt-1">{errors.soCot.message}</p>}
          </div>
        </div>

        {/* Chọn hàng ghế đôi */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent>
            <div className="flex gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <p className="font-semibold text-purple-900">Cấu hình hàng ghế đôi (Chọn các hàng ghế sẽ là ghế đôi)</p>
            </div>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2 mt-4">
              {Array.from({ length: soHang }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center space-x-2">
                  <Checkbox
                    id={`row-${rowIndex}`}
                    checked={coupleRows.has(rowIndex)}
                    onCheckedChange={() => toggleCoupleRow(rowIndex)}
                  />
                  <label
                    htmlFor={`row-${rowIndex}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {getRowLabel(rowIndex)}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Sau khi nhập thông tin phòng, bạn sẽ được chuyển sang bước cấu hình sơ đồ ghế. 
            Số hàng và số cột không thể thay đổi sau khi tạo.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
          {!isEdit && (
            <Button type="button" onClick={handleSubmit(handleStepOneSubmit)}>
              Tiếp theo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Step 2: Cấu hình sơ đồ ghế
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div>
            <p className="mb-3 text-sm text-center font-medium">Chọn loại ghế để áp dụng</p>
            <div className="flex flex-wrap justify-center gap-3">
              {seatTypes
                .filter(type => type.tenLoaiGhe !== "Couple")
                .map((type) => (
                  <Button
                    key={type.maLoaiGhe}
                    type="button"
                    size="sm"
                    variant={selectedSeatType === type.maLoaiGhe ? "default" : "outline"}
                    onClick={() => setSelectedSeatType(type.maLoaiGhe)}
                    className={selectedSeatType === type.maLoaiGhe ? getSeatColor(type.maLoaiGhe) : ""}
                  >
                    <Armchair className="h-4 w-4 mr-2" />
                    {type.tenLoaiGhe}
                  </Button>
              ))}
            </div>
          </div>

          {/* Sơ đồ ghế */}
          <div className="flex justify-center">
            <div className="inline-block">
              <div className="mx-10 mb-6 bg-gradient-to-b from-gray-800 to-gray-600 text-white text-center py-2 rounded-t-3xl">
                <p className="text-sm font-semibold">MÀN HÌNH</p>
              </div>

              <div className="flex justify-center mb-2 gap-1.5">
                {Array.from({ length: soCot }).map((_, colIndex) => (
                  <div key={colIndex} className={`w-9 text-center text-gray-700`}>
                    {colIndex + 1}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 items-center">
                {Array.from({ length: soHang }).map((_, rowIndex) => {
                  const isCouple = coupleRows.has(rowIndex)
                  const maxSeats = isCouple ? Math.floor(soCot / 2) : soCot
                  
                  return (
                    <div key={rowIndex} className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <div className="font-semibold text-gray-700">{getRowLabel(rowIndex)}</div>
                      </div>
                      <div className="flex gap-1.5">
                        {Array.from({ length: maxSeats }).map((_, i) => {
                          const seatNum = isCouple ? (i * 2 + 1) : (i + 1)
                          const colIndex = seatNum - 1
                          const key = getSeatKey(rowIndex, colIndex)
                          const seat = seatLayout.get(key)
                          
                          if (!seat) return null

                          return (
                            <button
                              key={i}
                              type="button"
                              disabled={isCouple}
                              onClick={() => handleSeatClick(rowIndex, colIndex)}
                              className={`
                                ${isCouple ? 'w-19.5' : 'w-9'} h-9 rounded flex items-center justify-center
                                transition-all hover:scale-105 cursor-pointer
                                ${seat.hoatDong 
                                  ? getSeatColor(seat.maLoaiGhe) + " text-white shadow-md" 
                                  : "bg-gray-200 text-gray-400"
                                }
                              `}
                              title={`${key} - ${seatTypes.find(t => t.maLoaiGhe === seat.maLoaiGhe)?.tenLoaiGhe || 'Ghế ẩn'}${isCouple ? ' (Ghế đôi)' : ''}`}
                            >
                              {seat.hoatDong ? (
                                isCouple ? (
                                  <div className="flex gap-1 cursor-not-allowed">
                                    <Armchair className="h-5 w-5" />
                                    <Armchair className="h-5 w-5" />
                                  </div>
                                ) : (
                                  <Armchair className="h-5 w-5" />
                                )
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <div className="w-12 text-center">
                        <div className="text-gray-700">{getRowLabel(rowIndex)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Chú thích */}
          <Card>
            <CardContent>
              <p className="text-sm font-semibold mb-3 text-center">Chú thích:</p>
              <div className="flex flex-wrap justify-center gap-6">
                {seatTypes.map((type) => {
                  const isCouple = type.tenLoaiGhe === "Couple"
                  const seatWidth = isCouple ? "w-14" : "w-6"

                  return (
                    <div key={type.maLoaiGhe} className="flex items-center gap-2">
                      <div className={`rounded ${getSeatColor(type.maLoaiGhe)} flex items-center justify-center h-full ${seatWidth}`}>
                        {isCouple ? (
                          <div className="flex gap-0.5">
                            <Armchair className="h-4 w-4 text-white" />
                            <Armchair className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <Armchair className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{type.tenLoaiGhe}</span>
                    </div>
                  )
                })}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                    <X className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-sm">Ghế ẩn</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hoàn thành / Lưu */}
          <div className="flex justify-between pt-4 border-t">
            {mode === 'create' && (
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Quay lại
              </Button>
            )}
            <Button type="button" onClick={handleFinalSubmit} className="ml-auto">
              {mode === 'edit' ? 'Lưu thay đổi' : 'Hoàn thành'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}