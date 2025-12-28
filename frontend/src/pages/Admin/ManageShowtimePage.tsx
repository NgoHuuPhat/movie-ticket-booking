import { useState, useEffect, useMemo, Fragment } from "react"
import { Film, Search, Plus, Filter, MoreVertical, Edit3, Trash2, Eye, Loader2, Clock, Calendar, Video, CheckSquare, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { getShowtimesAdmin, getShowtimeStatsAdmin, createShowtimeAdmin, updateShowtimeAdmin, deleteShowtimeAdmin, toggleShowtimeActivationAdmin, bulkActionShowtimesAdmin, getMoviesForSelect, getRoomsForSelectAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { formatDate } from "@/utils/formatDate"
import { ShowtimeForm, type ShowtimeFormData } from "@/components/Admin/ShowtimeForm"
import { Switch } from "@/components/ui/switch"
import { ShowtimeSeatsViewer } from "@/components/Admin/ShowtimeSeatsViewer"

interface IShowtime {
  maSuatChieu: string
  maPhim: string
  maPhong: string
  phim: { tenPhim: string, ngayKhoiChieu: string, ngayKetThuc: string }
  phongChieu: { tenPhong: string }
  gioBatDau: string
  gioKetThuc: string
  hoatDong: boolean
  trangThai: "Sắp chiếu" | "Đang chiếu" | "Đã kết thúc"
}

const ManageShowtimePage = () => {
  const [showtimes, setShowtimes] = useState<IShowtime[]>([])
  const [expandedMovieIds, setExpandedMovieIds] = useState<string[]>([])
  const [preselectedMovieId, setPreselectedMovieId] = useState<string | null>(null)
  const [selectedShowtimeIds, setSelectedShowtimeIds] = useState<string[]>([])
  const [selectedShowtime, setSelectedShowtime] = useState<IShowtime | null>(null)
  const [movies, setMovies] = useState<Array<{ maPhim: string; tenPhim: string, ngayKhoiChieu: string, ngayKetThuc: string }>>([])
  const [rooms, setRooms] = useState<Array<{ maPhong: string; tenPhong: string }>>([])

  const [isSeatsDialogOpen, setIsSeatsDialogOpen] = useState(false)
  const [selectedShowtimeForSeats, setSelectedShowtimeForSeats] = useState<IShowtime | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [trangThaiFilter, setTrangThaiFilter] = useState<"all" | "sapChieu" | "dangChieu" | "daKetThuc">("all")
  const [dateFilter, setDateFilter] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalShowtimes, setTotalShowtimes] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  const [stats, setStats] = useState({
    total: 0,
    dangChieu: 0,
    sapChieu: 0,
    daKetThuc: 0,
  })

  // Nhóm suất chiếu theo mã phim
  const groupedShowtimes = useMemo(() => {
    const groups: Record<string, IShowtime[]> = {}
    showtimes.forEach(st => {
      if (!groups[st.maPhim]) {
        groups[st.maPhim] = []
      }
      groups[st.maPhim].push(st)
    })
    return groups
  }, [showtimes])

  // Lấy danh sách phim duy nhất từ showtimes hiện tại
  const moviesWithShowtimes = useMemo(() => {
    const uniqueMovies = new Map<string, { maPhim: string; tenPhim: string; ngayKhoiChieu: string; ngayKetThuc: string; showtimeCount: number }>()

    showtimes.forEach(st => {
      if (!uniqueMovies.has(st.maPhim)) {
        uniqueMovies.set(st.maPhim, {
          maPhim: st.maPhim,
          tenPhim: st.phim.tenPhim,
          ngayKhoiChieu: st.phim.ngayKhoiChieu,
          ngayKetThuc: st.phim.ngayKetThuc,
          showtimeCount: 0
        })
      }
      uniqueMovies.get(st.maPhim)!.showtimeCount += 1
    })

    return Array.from(uniqueMovies.values())
  }, [showtimes])

  const toggleExpandMovie = (maPhim: string) => {
    setExpandedMovieIds(prev =>
      prev.includes(maPhim) ? prev.filter(id => id !== maPhim) : [...prev, maPhim]
    )
  }

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [movieRes, roomRes] = await Promise.all([
          getMoviesForSelect(),
          getRoomsForSelectAdmin()
        ])
        setMovies(movieRes)
        setRooms(roomRes)
      } catch (error) {
        toast.error(handleError(error))
      } 
    }
    loadOptions()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getShowtimeStatsAdmin()
        setStats({
          total: res.total,
          dangChieu: res.dangChieu,
          sapChieu: res.sapChieu,
          daKetThuc: res.daKetThuc,
        })
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchStats()
  }, [showtimes])

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const res = await getShowtimesAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          trangThai: trangThaiFilter === "all" ? undefined : trangThaiFilter,
          date: dateFilter || undefined,
        })

        const mapped = res.showtimes.map((s: IShowtime) => ({
          ...s,
          trangThai: getTrangThai(s.gioBatDau, s.gioKetThuc)
        }))
        setShowtimes(mapped)
        setTotalShowtimes(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        toast.error(handleError(error))
      }
    }

    fetchShowtimes()
  }, [currentPage, searchQuery, trangThaiFilter, dateFilter])

  const getTrangThai = (gioBatDau: string, gioKetThuc: string): "Sắp chiếu" | "Đang chiếu" | "Đã kết thúc" => {
    const now = new Date()
    const start = new Date(gioBatDau)
    const end = new Date(gioKetThuc)

    if (end <= now) return "Đã kết thúc"
    if (start <= now && now < end) return "Đang chiếu"
    return "Sắp chiếu"
  }

  const handleViewSeats = (showtime: IShowtime) => {
    setSelectedShowtimeForSeats(showtime)
    setIsSeatsDialogOpen(true)
  }

  const handlePageChange = (page: number) => setCurrentPage(page)

  const handleBulkAction = async (action: "hoatDong" | "ngungHoatDong" | "xoa") => {
    if (selectedShowtimeIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một suất chiếu.")
      return
    }
    setSubmitting(true)
    try {
      const data = await bulkActionShowtimesAdmin(selectedShowtimeIds, action)
      setShowtimes(prev => {
        if (action === 'xoa') {
          return prev.filter(m => !selectedShowtimeIds.includes(m.maSuatChieu))
        } else if (action === 'hoatDong') {
          return prev.map(m => selectedShowtimeIds.includes(m.maSuatChieu) ? { ...m, hoatDong: true } : m)
        } else if (action === 'ngungHoatDong') {
          return prev.map(m => selectedShowtimeIds.includes(m.maSuatChieu) ? { ...m, hoatDong: false } : m)
        }
        return prev
      })
      setSelectedShowtimeIds([])
      toast.success(data.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActivation = async (showtimeId: string) => {
    setSubmitting(true)
    try {
      const res = await toggleShowtimeActivationAdmin(showtimeId)
      setShowtimes(prev => prev.map(s => s.maSuatChieu === showtimeId ? { ...s, hoatDong: !s.hoatDong } : s))
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdd = async (data: ShowtimeFormData) => {
    setSubmitting(true)
    try {
      const res = await createShowtimeAdmin(data.maPhim, data.maPhong, data.gioBatDau, data.gioKetThuc)
      console.log(res)
      setShowtimes(prev => [{
        ...res.newShowtime,
        trangThai: getTrangThai(res.newShowtime.gioBatDau, res.newShowtime.gioKetThuc),
      }, ...prev])
      setIsAddDialogOpen(false)
      toast.success("Thêm suất chiếu thành công!")
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (data: ShowtimeFormData) => {
    if (!selectedShowtime) return
    setSubmitting(true)
    try {
      const res = await updateShowtimeAdmin(
        selectedShowtime.maSuatChieu,
        data.gioBatDau,
        data.gioKetThuc
      )
      setShowtimes(prev => prev.map(s => s.maSuatChieu === res.updatedShowtime.maSuatChieu
        ? { ...res.updatedShowtime, trangThai: getTrangThai(res.updatedShowtime.gioBatDau, res.updatedShowtime.gioKetThuc) }
        : s
      ))
      setIsEditDialogOpen(false)
      toast.success("Cập nhật suất chiếu thành công!")
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedShowtime) return
    setSubmitting(true)
    try {
      await deleteShowtimeAdmin(selectedShowtime.maSuatChieu)
      setShowtimes(prev => prev.filter(s => s.maSuatChieu !== selectedShowtime.maSuatChieu))
      setIsDeleteDialogOpen(false)
      setSelectedShowtime(null)
      toast.success("Xóa suất chiếu thành công!")
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header + Stats */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản Lý Suất Chiếu</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Quản lý lịch chiếu phim trong rạp</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Suất Chiếu Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { title: "Tổng suất chiếu", value: stats.total, icon: <Film className="h-5 w-5" />, color: "bg-purple-500" },
              { title: "Sắp chiếu", value: stats.sapChieu, icon: <Calendar className="h-5 w-5" />, color: "bg-blue-500" },
              { title: "Đang chiếu", value: stats.dangChieu, icon: <Video className="h-5 w-5" />, color: "bg-green-500" },
              { title: "Đã kết thúc", value: stats.daKetThuc, icon: <Clock className="h-5 w-5" />, color: "bg-gray-500" },
            ].map((card, i) => (
              <Card key={i} className="bg-white/50 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl sm:text-3xl font-bold">{card.value}</p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg text-white`}>{card.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tên phim..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="pl-10"
                />
              </div>

              <Input
                type="date"
                value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setCurrentPage(1) }}
                className="w-full lg:w-48"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={trangThaiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}>
                    <Filter className="mr-2 h-4 w-4" /> Trạng thái
                    {trangThaiFilter !== "all" && ` (${trangThaiFilter === "sapChieu" ? "Sắp chiếu" : trangThaiFilter === "dangChieu" ? "Đang chiếu" : "Đã kết thúc"})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("sapChieu"); setCurrentPage(1) }}>Sắp chiếu</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("dangChieu"); setCurrentPage(1) }}>Đang chiếu</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("daKetThuc"); setCurrentPage(1) }}>Đã kết thúc</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedShowtimeIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Actions ({selectedShowtimeIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('hoatDong')}>Hoạt động</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('ngungHoatDong')}>Ngừng hoạt động</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleBulkAction('xoa')}>Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Suất Chiếu Theo Phim</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600 w-12"></th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Phim</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Số suất chiếu</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Khoảng thời gian</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {moviesWithShowtimes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        Không có suất chiếu nào
                      </td>
                    </tr>
                  ) : (
                    moviesWithShowtimes.map(movie => {
                      const isExpanded = expandedMovieIds.includes(movie.maPhim)
                      const movieShowtimes = groupedShowtimes[movie.maPhim] || []

                      return (
                        <Fragment key={movie.maPhim}>
                          <tr
                            className="border-b hover:bg-purple-50/30 transition-colors cursor-pointer bg-white"
                            onClick={() => toggleExpandMovie(movie.maPhim)}
                          >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpandMovie(movie.maPhim)}
                              >
                                {isExpanded ? <ChevronDown className="h-5 w-5 text-purple-600" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                              </Button>
                            </td>
                            <td className="p-4 font-medium">
                              <div className="font-semibold text-gray-900">{movie.tenPhim}</div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="font-medium bg-purple-100 text-purple-800">
                                {movie.showtimeCount} suất
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-700">
                              {movieShowtimes.length > 0 && (
                                <>
                                  {formatDate(movieShowtimes[movieShowtimes.length - 1].gioBatDau)}
                                  <span className="mx-2 text-gray-400">→</span>
                                  {formatDate(movieShowtimes[0].gioBatDau)}
                                </>
                              )}
                            </td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              {new Date(movie.ngayKetThuc) < new Date() ? (
                                <Badge variant="secondary" className="bg-gray-200 py-2 text-gray-800">Phim đã kết thúc</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setPreselectedMovieId(movie.maPhim)
                                    setIsAddDialogOpen(true)
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1"/> Thêm suất
                                </Button>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="p-0 bg-gradient-to-b from-purple-50/50 to-transparent">
                                <div className="px-6 py-5 border-t border-purple-200 animate-in fade-in duration-200">
                                  <table className="w-full bg-white rounded-lg shadow-sm">
                                    <thead className="bg-purple-100/50 border-b border-purple-200">
                                      <tr>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Mã suất</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Phòng</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Thời gian</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Trạng thái</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-purple-900">Hoạt động</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-purple-900">Hành động</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-100">
                                      {movieShowtimes.map(st => (
                                        <tr key={st.maSuatChieu} className="hover:bg-purple-50/50 transition-colors">
                                          <td className="py-4 px-4 font-medium text-gray-800">{st.maSuatChieu}</td>
                                          <td className="py-4 px-4">
                                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                                              {st.phongChieu.tenPhong}
                                            </Badge>
                                          </td>
                                          <td className="py-4 px-4">
                                            <div className="font-medium text-gray-900">
                                              {formatDate(st.gioBatDau, "dd/MM/yyyy HH:mm")}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              → {formatDate(st.gioKetThuc, "HH:mm")}
                                            </div>
                                          </td>
                                          <td className="py-4 px-4">
                                            <Badge variant={
                                              st.trangThai === "Đang chiếu" ? "default" :
                                              st.trangThai === "Sắp chiếu" ? "outline" : "secondary"
                                            }>
                                              {st.trangThai}
                                            </Badge>
                                          </td>
                                          <td className="py-4 px-4">
                                            <Switch
                                              checked={st.hoatDong}
                                              onCheckedChange={() => handleToggleActivation(st.maSuatChieu)}
                                            />
                                          </td>
                                          <td className="py-4 px-4 text-right">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                  <MoreVertical className="h-4 w-4 text-purple-600" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { handleViewSeats(st); setIsSeatsDialogOpen(true) }}>
                                                  <Eye className="mr-2 h-4 w-4" /> Xem sơ đồ ghế
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedShowtime(st); setIsEditDialogOpen(true) }}>
                                                  <Edit3 className="mr-2 h-4 w-4" /> Sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedShowtime(st); setIsDeleteDialogOpen(true) }}>
                                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalShowtimes}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Dialog Thêm Suất Chiếu */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm Suất Chiếu Mới</DialogTitle>
              <DialogDescription>Chọn phim, phòng và thời gian chiếu.</DialogDescription>
            </DialogHeader>
            <ShowtimeForm
              movies={movies}
              rooms={rooms}
              onSubmit={handleAdd}
              submitting={submitting}
              defaultValues={{
                maPhim: preselectedMovieId || undefined
              }}
            />
          </DialogContent>
        </Dialog>
        
        {/* Dialog Sửa Suất Chiếu */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Sửa Suất Chiếu</DialogTitle>
              <DialogDescription>Cập nhật thông tin suất chiếu.</DialogDescription>
            </DialogHeader>
            {selectedShowtime && (
              <ShowtimeForm
                movies={showtimes.filter(s => s.maSuatChieu === selectedShowtime.maSuatChieu).map(s => ({
                  maPhim: s.maPhim,
                  tenPhim: s.phim.tenPhim,
                  ngayKhoiChieu: s.phim.ngayKhoiChieu,
                  ngayKetThuc: s.phim.ngayKetThuc,
                }))}
                rooms={rooms}
                isEditMode={true}
                defaultValues={{
                  maPhim: selectedShowtime.maPhim,
                  maPhong: selectedShowtime.maPhong,
                  gioBatDau: formatDate(selectedShowtime.gioBatDau, "yyyy-MM-dd HH:mm"),
                  gioKetThuc: formatDate(selectedShowtime.gioKetThuc, "yyyy-MM-dd HH:mm"),
                }}
                onSubmit={handleEdit}
                submitting={submitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Xóa */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xóa suất chiếu</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn xóa suất chiếu này? Hành động này không thể hoàn tác.</DialogDescription>
            </DialogHeader>
            {selectedShowtime && (
              <div className="py-4 space-y-2">
                <p><strong>Phim:</strong> {selectedShowtime.phim.tenPhim}</p>
                <p><strong>Phòng:</strong> {selectedShowtime.phongChieu.tenPhong}</p>
                <p><strong>Thời gian:</strong> {formatDate(selectedShowtime.gioBatDau, "dd/MM/yyyy HH:mm")} → {formatDate(selectedShowtime.gioKetThuc, "HH:mm")}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Xem sơ đồ ghế */}
        <Dialog open={isSeatsDialogOpen} onOpenChange={setIsSeatsDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
            {selectedShowtimeForSeats && (
              <>
              <DialogHeader>
                <DialogTitle>
                  Sơ đồ ghế - {selectedShowtimeForSeats.phim.tenPhim}
                </DialogTitle>
                <DialogDescription>
                  Phòng: {selectedShowtimeForSeats.phongChieu.tenPhong} • 
                  Thời gian: {selectedShowtimeForSeats && formatDate(selectedShowtimeForSeats.gioBatDau, "dd/MM/yyyy HH:mm")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <ShowtimeSeatsViewer maSuatChieu={selectedShowtimeForSeats.maSuatChieu} />
              </div>
            </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageShowtimePage