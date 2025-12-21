import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Loader2,
  Building2,
  Projector,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import {
  getAllRoomsAdmin,
  createRoomAdmin,
  updateRoomAdmin,
  deleteRoomAdmin,
  getAllRoomTypesAdmin,
  bulkActionRoomsAdmin,
  toggleCinemaActivationAdmin,
} from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { RoomForm, type RoomFormData } from "@/components/Admin/RoomForm"

interface IRoom {
  maPhong: string
  tenPhong: string
  maLoaiPhong: string
  hoatDong: boolean
  loaiPhongChieu: {
    tenLoaiPhong: string
  }
}

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState<IRoom[]>([])
  const [roomTypes, setRoomTypes] = useState<{ maLoaiPhong: string; tenLoaiPhong: string }[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null)
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [hienThiFilter, setHienThiFilter] = useState<"all" | "true" | "false">("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRooms, setTotalRooms] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await getAllRoomTypesAdmin()
        setRoomTypes(types)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchRoomTypes()
  }, [])

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getAllRoomsAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          hienThi: hienThiFilter === "all" ? undefined : hienThiFilter === "true",
        })

        setRooms(res.rooms)
        setTotalRooms(res.total)
        setTotalPages(res.totalPages || Math.ceil(res.total / res.limit))
        setStartIndex(res.startIndex || (currentPage - 1) * res.limit + 1)
        setEndIndex(res.endIndex || Math.min(currentPage * res.limit, res.total))
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchRooms()
  }, [currentPage, searchQuery, hienThiFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedRoomIds(checked ? rooms.map((room) => room.maPhong) : [])
  }

  const handleBulkAction = async (action: "hoatDong" | "ngungHoatDong" | "xoa") => {
    if (selectedRoomIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một phòng để thực hiện hành động.")
    }
    setSubmitting(true)
    setSelectedRoomIds([])
    try {
      const data = await bulkActionRoomsAdmin(selectedRoomIds, action)
      
      setRooms(prev => {
        if (action === 'xoa') {
          return prev.filter(m => !selectedRoomIds.includes(m.maPhong))
        } else if (action === 'hoatDong') {
          return prev.map(m => selectedRoomIds.includes(m.maPhong) ? { ...m, hoatDong: true } : m)
        } else if (action === 'ngungHoatDong') {
          return prev.map(m => selectedRoomIds.includes(m.maPhong) ? { ...m, hoatDong: false } : m)
        }
        return prev
      })
      
      toast.success(data.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoomActivation = async (roomId: string) => {
      setSubmitting(true)
      try {
        const res = await toggleCinemaActivationAdmin(roomId)
        setRooms(prev => prev.map(r => r.maPhong === res.room.maPhong ? res.room : r))
        toast.success(res.message)
      } catch (error) {
        toast.error(handleError(error))
      } finally {
        setSubmitting(false)
      }
    }

  const handleEditRoom = (room: IRoom) => {
    setSelectedRoom(room)
    setIsEditDialogOpen(true)
  }

  const handleSubmitAdd = async (data: RoomFormData) => {
    setSubmitting(true)
    try {
      const res = await createRoomAdmin(
        data.tenPhong,
        data.maLoaiPhong,
      )
      setRooms((prev) => [res.room, ...prev])
      setIsAddDialogOpen(false)
      toast.success(res.message)
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error) || "Thêm phòng thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (data: RoomFormData) => {
    if (!selectedRoom) return
    setSubmitting(true)
    try {
      const res = await updateRoomAdmin(
        selectedRoom.maPhong,
        data.maLoaiPhong
      )
      setRooms((prev) =>
        prev.map((r) => (r.maPhong === res.room.maPhong ? res.room : r))
      )
      setIsEditDialogOpen(false)
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error) || "Cập nhật phòng thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedRoom) return
    setSubmitting(true)
    try {
      await deleteRoomAdmin(selectedRoom.maPhong)
      setRooms((prev) => prev.filter((r) => r.maPhong !== selectedRoom.maPhong))
      setIsDeleteDialogOpen(false)
      setSelectedRoom(null)
      toast.success("Xóa phòng chiếu thành công!")
    } catch (error) {
      toast.error(handleError(error) || "Xóa phòng thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-100 via-white to-teal-100 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Quản Lý Phòng Chiếu
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Quản lý các phòng chiếu phim trong rạp
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Phòng Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Tổng số phòng
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">{totalRooms}</p>
                  </div>
                  <div className="bg-indigo-500 p-3 rounded-lg text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Đang hoạt động
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {rooms.filter((r) => r.hoatDong).length}
                    </p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg text-white">
                    <Projector className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Tạm dừng
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {rooms.filter((r) => !r.hoatDong).length}
                    </p>
                  </div>
                  <div className="bg-gray-500 p-3 rounded-lg text-white">
                    <Projector className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tên phòng..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`${
                      hienThiFilter !== "all"
                        ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                        : ""
                    }`}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Hoạt động
                    {hienThiFilter !== "all" && (
                      <span>
                        ({hienThiFilter === "true" ? "Hoạt động" : "Tạm dừng"})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("all"); setCurrentPage(1) }}>
                    Tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("true"); setCurrentPage(1) }}>
                    Đang hoạt động
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("false"); setCurrentPage(1) }}>
                    Tạm dừng
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedRoomIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="sm:w-auto">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Actions ({selectedRoomIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('hoatDong')}>
                      Hiển thị
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('ngungHoatDong')}>
                      Tạm ẩn
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => handleBulkAction('xoa')}
                    >
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Phòng Chiếu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600 w-12">
                      <Checkbox
                        checked={selectedRoomIds.length === rooms.length && rooms.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Mã phòng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên phòng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Loại phòng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Không có phòng chiếu nào
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room.maPhong} className="border-b hover:bg-gray-50/50 text-sm">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedRoomIds.includes(room.maPhong)}
                            onCheckedChange={() => handleSelectRoom(room.maPhong)}
                          />
                        </td>
                        <td className="p-4 font-medium">{room.maPhong}</td>
                        <td className="p-4 font-medium">{room.tenPhong}</td>
                        <td className="p-4">
                          <Badge variant="secondary">
                            {room.loaiPhongChieu.tenLoaiPhong}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Switch
                            checked={room.hoatDong}
                            onCheckedChange={() => handleRoomActivation(room.maPhong)}
                          />
                        </td>
                        <td className="p-4 space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditRoom(room)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedRoom(room)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Pagination */}
        <div className="mt-6">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalRooms}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modal add room */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Thêm Phòng Chiếu Mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin phòng chiếu và cấu hình ghế.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <RoomForm
                roomTypes={roomTypes}
                onSubmit={handleSubmitAdd}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" form="room-form" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    Tạo phòng
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal update room */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Sửa Phòng Chiếu</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin phòng chiếu. Lưu ý: Không thể thay đổi số hàng/cột sau khi tạo.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedRoom && (
                <RoomForm
                  defaultValues={{
                    tenPhong: selectedRoom.tenPhong,
                    maLoaiPhong: selectedRoom.maLoaiPhong,
                  }}
                  roomTypes={roomTypes}
                  onSubmit={handleSubmitEdit}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              )}
            </div>
            <DialogFooter className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" form="room-form" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...
                  </>
                ) : (
                  <>
                    Cập nhật
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal delete room */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xóa Phòng Chiếu</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác và sẽ xóa toàn bộ ghế liên quan.
              </DialogDescription>
            </DialogHeader>
            {selectedRoom && (
              <div className="py-6 bg-red-50 p-4 rounded-lg">
                <p className="font-semibold text-lg">{selectedRoom.tenPhong}</p>
                <p className="text-sm text-gray-600">
                  {selectedRoom.loaiPhongChieu.tenLoaiPhong} • Mã: {selectedRoom.maPhong}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa phòng
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageRoomsPage