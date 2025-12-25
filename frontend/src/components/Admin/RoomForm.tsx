import { useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { z } from "zod"
import { ChevronRight, Armchair, X, Loader2 } from "lucide-react"

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
  const [seatLayout, setSeatLayout] = useState<Map<string, { maLoaiGhe: string; hoatDong: boolean }>>(new Map())

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
      const newLayout = new Map<string, { maLoaiGhe: string; hoatDong: boolean }>()
      existingSeats.forEach(seat => {
        const key = `${seat.hangGhe}-${seat.soGhe}`
        newLayout.set(key, { maLoaiGhe: seat.maLoaiGhe, hoatDong: seat.hoatDong })
      })
      setSeatLayout(newLayout)
    }
  }, [existingSeats])

  const getRowLabel = (index: number) => String.fromCharCode(65 + index)

  const getSeatKey = (row: number, col: number) => `${getRowLabel(row)}-${col + 1}`

  const handleSeatClick = (row: number, col: number) => {
    const key = getSeatKey(row, col)
    const newLayout = new Map(seatLayout)
    
    if (newLayout.has(key)) {
      const current = newLayout.get(key)!
      if (current.maLoaiGhe === selectedSeatType) {
        newLayout.set(key, { ...current, hoatDong: !current.hoatDong })
      } else {
        newLayout.set(key, { maLoaiGhe: selectedSeatType, hoatDong: true })
      }
    } else {
      newLayout.set(key, { maLoaiGhe: selectedSeatType, hoatDong: true })
    }
    
    setSeatLayout(newLayout)
  }

  const getSeatColor = (maLoaiGhe: string) => {
    const index = seatTypes.findIndex(t => t.maLoaiGhe === maLoaiGhe)
    const colors = [
      "bg-blue-500 hover:bg-blue-600",
      "bg-purple-500 hover:bg-purple-600", 
      "bg-pink-500 hover:bg-pink-600",
      "bg-orange-500 hover:bg-orange-600",
      "bg-green-500 hover:bg-green-600"
    ]
    return colors[index % colors.length] || "bg-gray-500 hover:bg-gray-600"
  }

  const handleStepOneSubmit = (data: RoomFormData) => {
    const newLayout = new Map<string, { maLoaiGhe: string; hoatDong: boolean }>()
    for (let row = 0; row < data.soHang; row++) {
      for (let col = 0; col < data.soCot; col++) {
        const key = getSeatKey(row, col)
        newLayout.set(key, { maLoaiGhe: seatTypes[0]?.maLoaiGhe || "", hoatDong: true })
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
      }
    })
    
    await onSubmit(data, seatConfig)
  }

  // Step 1: Thông tin phòng
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
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
              {seatTypes.map((type) => (
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

              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-6 mb-2">
                  <div className="flex gap-1.5">
                    {Array.from({ length: soCot }).map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className="w-9 text-center text-sm font-semibold text-gray-600"
                      >
                        {colIndex + 1}
                      </div>
                    ))}
                  </div>
                </div>
                {Array.from({ length: soHang }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-6">
                    <div className="w-8 text-center font-semibold text-gray-700">
                      {getRowLabel(rowIndex)}
                    </div>
                    <div className="flex gap-1.5">
                      {Array.from({ length: soCot }).map((_, colIndex) => {
                        const key = getSeatKey(rowIndex, colIndex)
                        const seat = seatLayout.get(key)
                        if (!seat) return null

                        return (
                          <button
                            key={colIndex}
                            type="button"
                            onClick={() => handleSeatClick(rowIndex, colIndex)}
                            className={`
                              w-9 h-9 rounded-lg flex items-center justify-center
                              transition-all hover:scale-110 cursor-pointer
                              ${seat.hoatDong 
                                ? getSeatColor(seat.maLoaiGhe) + " text-white shadow-md" 
                                : "bg-gray-200 text-gray-400"
                              }
                            `}
                            title={`${key} - ${seatTypes.find(t => t.maLoaiGhe === seat.maLoaiGhe)?.tenLoaiGhe || 'Ghế ẩn'}`}
                          >
                            {seat.hoatDong ? <Armchair className="h-5 w-5" /> : <X className="h-4 w-4" />}
                          </button>
                        )
                      })}
                    </div>
                    <div className="w-8 text-center text-gray-500 text-sm">
                      {getRowLabel(rowIndex)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chú thích */}
          <Card>
            <CardContent>
              <p className="text-sm font-semibold mb-3 text-center">Chú thích:</p>
              <div className="flex flex-wrap justify-center gap-10">
                {seatTypes.map((type) => (
                  <div key={type.maLoaiGhe} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded ${getSeatColor(type.maLoaiGhe).split(" ")[0]} flex items-center justify-center`}>
                      <Armchair className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm">{type.tenLoaiGhe}</span>
                  </div>
                ))}
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
          <div className="flex justify-end pt-4 border-t">
            <Button type="button" onClick={handleFinalSubmit}>
              {mode === 'edit' ? 'Lưu thay đổi' : 'Hoàn thành'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}