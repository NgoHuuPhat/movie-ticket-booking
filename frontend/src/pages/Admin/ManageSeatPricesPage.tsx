import React, { useState, useEffect } from "react"
import { Search, Plus, Edit3, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import AdminLayout from "@/components/layout/AdminLayout"
import {
  getSeatPricesAdmin,
  createSeatPriceAdmin,
  updateSeatPriceAdmin,
} from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { z } from "zod"
import { getSeatTypesAdmin, getAllRoomTypesAdmin } from "@/services/api"

interface ISeatPrice {
  maLoaiPhong: string
  maLoaiGhe: string
  giaTien: number
  loaiGhe: { tenLoaiGhe: string }
  loaiPhongChieu: { tenLoaiPhong: string }
}

interface ISeatType {
  maLoaiGhe: string
  tenLoaiGhe: string
}

interface IRoomType {
  maLoaiPhong: string
  tenLoaiPhong: string
}

const createPriceSchema = z.object({
  maLoaiPhong: z.string().min(1, "Vui lòng chọn loại phòng"),
  maLoaiGhe: z.string().min(1, "Vui lòng chọn loại ghế"),
  giaTien: z.number().min(1000, "Giá tiền phải lớn hơn 1000 VNĐ"),
})

const updatePriceSchema = z.object({
  giaTien: z.number().min(1000, "Giá tiền phải lớn hơn 1000 VNĐ"),
})

type CreatePriceFormData = z.infer<typeof createPriceSchema>
type UpdatePriceFormData = z.infer<typeof updatePriceSchema>

const ManageSeatPricesPage: React.FC = () => {
  const [prices, setPrices] = useState<ISeatPrice[]>([])
  const [seatTypes, setSeatTypes] = useState<ISeatType[]>([])
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<ISeatPrice | null>(null)

  const createForm = useForm<CreatePriceFormData>({
    resolver: zodResolver(createPriceSchema),
  })

  const updateForm = useForm<UpdatePriceFormData>({
    resolver: zodResolver(updatePriceSchema),
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricesRes, seatTypesRes, roomTypesRes] = await Promise.all([
          getSeatPricesAdmin(searchQuery),
          getSeatTypesAdmin(),
          getAllRoomTypesAdmin(),
        ])

        setPrices(pricesRes)
        setSeatTypes(seatTypesRes)
        setRoomTypes(roomTypesRes)
      } catch (error) {
        toast.error(handleError(error))
        console.error(error)
      }
    }

    fetchData()
  }, [searchQuery])

  const resetForms = () => {
    createForm.reset({ maLoaiPhong: "", maLoaiGhe: "", giaTien: 0 })
    updateForm.reset({ giaTien: 0 })
    setSelectedPrice(null)
  }

  const handleCreate = async (data: CreatePriceFormData) => {
    try {
      const res = await createSeatPriceAdmin(data.maLoaiGhe, data.maLoaiPhong, data.giaTien)
      console.log(res)
      setPrices(prev => [...prev, res.price])
      toast.success(res.message)
      setIsAddOpen(false)
      resetForms()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleUpdate = async (data: UpdatePriceFormData) => {
    if (!selectedPrice) return

    try {
      const res = await updateSeatPriceAdmin(selectedPrice.maLoaiPhong, selectedPrice.maLoaiGhe, data.giaTien)
      setPrices(prev =>
        prev.map(item =>
          item.maLoaiPhong === res.price.maLoaiPhong && item.maLoaiGhe === res.price.maLoaiGhe
            ? { ...item, giaTien: res.price.giaTien }
            : item
        )
      )
      toast.success(res.message)
      setIsEditOpen(false)
      resetForms()
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const openAddModal = () => {
    resetForms()
    setIsAddOpen(true)
  }

  const openEditModal = (price: ISeatPrice) => {
    setSelectedPrice(price)
    console.log(price)
    updateForm.reset({ giaTien: price.giaTien })
    setIsEditOpen(true)
  }

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Giá Ghế Theo Loại Phòng</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Thiết lập giá tiền cho từng loại ghế trong từng loại phòng chiếu
              </p>
            </div>
            <Button onClick={() => { openAddModal() }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Danh Mục Mới
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo loại ghế hoặc loại phòng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Giá Ghế</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Loại Phòng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Loại Ghế</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600">Giá Tiền (VNĐ)</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600 w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  { prices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500">
                        {searchQuery ? "Không tìm thấy giá nào" : "Chưa có giá ghế nào được thiết lập"}
                      </td>
                    </tr>
                  ) : (
                    prices.map((item) => (
                      <tr key={`${item.maLoaiPhong}-${item.maLoaiGhe}`} className="border-b hover:bg-gray-50/50">
                        <td className="p-4">
                          <Badge variant="outline">{item.loaiPhongChieu.tenLoaiPhong}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge>{item.loaiGhe.tenLoaiGhe}</Badge>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {item.giaTien.toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(item)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Thêm Giá */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Giá Ghế Mới</DialogTitle>
              <DialogDescription>
                Thiết lập giá cho một loại ghế trong một loại phòng
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label>Loại Phòng</Label>
                <Controller
                  control={createForm.control}
                  name="maLoaiPhong"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((room) => (
                          <SelectItem key={room.maLoaiPhong} value={room.maLoaiPhong}>
                            {room.tenLoaiPhong}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {createForm.formState.errors.maLoaiPhong && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.maLoaiPhong.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Loại Ghế</Label>
                <Controller
                  control={createForm.control}
                  name="maLoaiGhe"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại ghế" />
                      </SelectTrigger>
                      <SelectContent>
                        {seatTypes.map((seat) => (
                          <SelectItem key={seat.maLoaiGhe} value={seat.maLoaiGhe}>
                            {seat.tenLoaiGhe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {createForm.formState.errors.maLoaiGhe && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.maLoaiGhe.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá Tiền (VNĐ)</Label>
                <Input
                  id="price"
                  type="number"
                  {...createForm.register("giaTien", { valueAsNumber: true })}
                  placeholder="50000"
                />
                {createForm.formState.errors.giaTien && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.giaTien.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createForm.formState.isSubmitting}>
                  {createForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Thêm
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Sửa Giá */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="md:max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh Sửa Giá Ghế</DialogTitle>
              <DialogDescription>
                Cập nhật giá tiền cho tổ hợp ghế và phòng hiện tại
              </DialogDescription>
            </DialogHeader>
            {selectedPrice && (
              <div className="mb-4 space-y-2">
                <p className="text-sm">
                  <strong>Loại phòng:</strong> {selectedPrice.loaiPhongChieu.tenLoaiPhong}
                </p>
                <p className="text-sm">
                  <strong>Loại ghế:</strong> {selectedPrice.loaiGhe.tenLoaiGhe}
                </p>
              </div>
            )}
            <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Giá Tiền Mới (VNĐ)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  {...updateForm.register("giaTien", { valueAsNumber: true })}
                  placeholder="60000"
                  autoFocus
                />
                {updateForm.formState.errors.giaTien && (
                  <p className="text-sm text-destructive">{updateForm.formState.errors.giaTien.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={updateForm.formState.isSubmitting}>
                  {updateForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Cập Nhật
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageSeatPricesPage