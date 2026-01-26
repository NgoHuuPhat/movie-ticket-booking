
import { useState, useEffect } from "react"
import { Film, Search, Plus, Filter, MoreVertical, Edit3, Trash2, Eye, Save, Loader2, CheckSquare, Clock, Calendar, Users, Globe, Video, UserRoundCheck, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {  DropdownMenu,  DropdownMenuContent,  DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { getAllMoviesAdmin,  getStatsMoviesAdmin,  createMovieAdmin,  updateMovieAdmin,  deleteMovieAdmin, getAllCategoriesAdmin, bulkAction, toggleShowMovieAdmin, getAllAgeRatingsAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/utils/formatDate"
import { ngonNgu } from "@/constants/language"
import { MovieForm, type MovieFormData } from "@/components/Admin/MovieForm"
import { type ICategory, type IAgeRating } from "@/types/movie"

interface IMovieLocal {
  maPhim: string
  tenPhim: string
  daoDien: string
  dienVien: string
  thoiLuong: number
  moTa: string
  anhBia: string
  ngayKhoiChieu: string
  ngayKetThuc: string
  maPhanLoaiDoTuoi: string
  trailerPhim: string
  quocGia: string
  phienBan: string
  ngonNgu: string
  hienThi: boolean
  slug: string
  phanLoaiDoTuoi: { maPhanLoaiDoTuoi: string; tenPhanLoaiDoTuoi: string, moTa: string }
  phimTheLoais: { maTheLoai: string; tenTheLoai: string }[]
  trangThai: "Đang chiếu" | "Sắp chiếu" | "Đã kết thúc"
}

const ManageMoviePage = () => {
  const [movies, setMovies] = useState<IMovieLocal[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])
  const [ageRatings, setAgeRatings] = useState<IAgeRating[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<IMovieLocal | null>(null)
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [hienThiFilter, setHienThiFilter] = useState<"all" | "true" | "false">("all")
  const [trangThaiFilter, setTrangThaiFilter] = useState<"all" | "dangChieu" | "sapChieu" | "daKetThuc">("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMovies, setTotalMovies] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  const [stats, setStats] = useState({
    total: 0,
    dangChieu: 0,
    sapChieu: 0,
    daKetThuc: 0,
  })

  const [formData, setFormData] = useState({
    tenPhim: "",
    moTa: "",
    anhBia: null as File | null,
    ngayKhoiChieu: "",
    ngayKetThuc: "",
    thoiLuong: 0,
    quocGia: "",
    daoDien: "",
    dienVien: "",
    trailerPhim: "",
    maPhanLoaiDoTuoi: "",
    phienBan: "",
    ngonNgu: "",
    maTheLoais: [] as string[]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, ageRatingsData] = await Promise.all([
          getAllCategoriesAdmin(),
          getAllAgeRatingsAdmin()
        ])

        setCategories(cats)
        setAgeRatings(ageRatingsData)

      } catch (error) {
        console.error(handleError(error))
      } 
    }
    fetchData()
  }, [currentPage, searchQuery, hienThiFilter, trangThaiFilter])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getStatsMoviesAdmin()
        setStats({
          total: statsData.totalMovies,
          dangChieu: statsData.totalShowing,
          sapChieu: statsData.totalUpcoming,
          daKetThuc: statsData.totalEnded,
        })
      } catch (error) {
        console.error("Lỗi tải thống kê:", error)
      }
    }
    fetchStats()
  }, [movies])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await getAllCategoriesAdmin()
        setCategories(cats)

        const res = await getAllMoviesAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          hienThi: hienThiFilter === "all" ? undefined : hienThiFilter === "true",
          trangThai: trangThaiFilter === "all" ? undefined : trangThaiFilter,
        })

        setMovies(res.movies)
        setTotalMovies(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error)
        toast.error("Không thể tải dữ liệu từ server")
      } 
    }
    fetchData()
  }, [currentPage, searchQuery, hienThiFilter, trangThaiFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const resetForm = () => {
    setFormData({
      tenPhim: "",
      moTa: "",
      anhBia: null,
      ngayKhoiChieu: "",
      ngayKetThuc: "",
      thoiLuong: 0,
      quocGia: "",
      daoDien: "",
      dienVien: "",
      trailerPhim: "",
      maPhanLoaiDoTuoi: "",
      phienBan: "",
      ngonNgu: "",
      maTheLoais: []
    })
  }

  const handleSelectMovie = (movieId: string) => {
    setSelectedMovieIds(prev => 
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedMovieIds(checked ? movies.map(movie => movie.maPhim) : [])
  }

  const handleBulkAction = async (action: "hienThi" | "an" | "xoa") => {
    if (selectedMovieIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một phim để thực hiện hành động.")
      return
    }

    setSubmitting(true)
    setSelectedMovieIds([])

    try {
      const data = await bulkAction(selectedMovieIds, action)
      
      setMovies(prev => {
        if (action === 'xoa') {
          return prev.filter(m => !selectedMovieIds.includes(m.maPhim))
        } else if (action === 'hienThi') {
          return prev.map(m => selectedMovieIds.includes(m.maPhim) ? { ...m, hienThi: true } : m)
        } else if (action === 'an') {
          return prev.map(m => selectedMovieIds.includes(m.maPhim) ? { ...m, hienThi: false } : m)
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

  const handleToggleHienThi = async (movieId: string) => {
    setSubmitting(true)
    try {
      const data = await toggleShowMovieAdmin(movieId)
      setMovies(prev => prev.map(m => m.maPhim === movieId ? { ...m, hienThi: !m.hienThi } : m))
      toast.success(data.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMovie = (movie: IMovieLocal) => {
    setSelectedMovie(movie)
    setFormData({
      tenPhim: movie.tenPhim,
      moTa: movie.moTa,
      anhBia: null,
      ngayKhoiChieu: movie.ngayKhoiChieu.split('T')[0],
      ngayKetThuc: movie.ngayKetThuc.split('T')[0],
      thoiLuong: movie.thoiLuong,
      quocGia: movie.quocGia,
      daoDien: movie.daoDien,
      dienVien: movie.dienVien,
      trailerPhim: movie.trailerPhim,
      maPhanLoaiDoTuoi: movie.maPhanLoaiDoTuoi,
      phienBan: movie.phienBan,
      ngonNgu: movie.ngonNgu,
      maTheLoais: movie.phimTheLoais.map((c: { maTheLoai: string }) => c.maTheLoai),
    })
    setIsEditDialogOpen(true)
  }

  const handleSubmitAdd = async (data: MovieFormData) => {
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("tenPhim", data.tenPhim)
      formDataToSend.append("moTa", data.moTa)
      formDataToSend.append("thoiLuong", data.thoiLuong.toString())
      formDataToSend.append("quocGia", data.quocGia)
      formDataToSend.append("daoDien", data.daoDien)
      formDataToSend.append("dienVien", data.dienVien)
      formDataToSend.append("trailerPhim", data.trailerPhim)
      formDataToSend.append("ngayKhoiChieu", data.ngayKhoiChieu)
      formDataToSend.append("ngayKetThuc", data.ngayKetThuc)
      formDataToSend.append("maPhanLoaiDoTuoi", data.maPhanLoaiDoTuoi)
      formDataToSend.append("phienBan", data.phienBan)
      formDataToSend.append("ngonNgu", data.ngonNgu)

      if (data.anhBia) {
        formDataToSend.append("anhBia", data.anhBia)
      }

      data.maTheLoais.forEach(id => formDataToSend.append("maTheLoais[]", id))
      const res = await createMovieAdmin(formDataToSend)
      setMovies(prev => [res.movie, ...prev])

      setIsAddDialogOpen(false)
      resetForm()
      toast.success("Thêm phim thành công!")
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error) || "Thêm phim thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (data: MovieFormData) => {
    if (!selectedMovie) return
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("tenPhim", data.tenPhim)
      formDataToSend.append("moTa", data.moTa)
      formDataToSend.append("thoiLuong", data.thoiLuong.toString())
      formDataToSend.append("quocGia", data.quocGia)
      formDataToSend.append("daoDien", data.daoDien)
      formDataToSend.append("dienVien", data.dienVien)
      formDataToSend.append("trailerPhim", data.trailerPhim)
      formDataToSend.append("ngayKhoiChieu", data.ngayKhoiChieu)
      formDataToSend.append("ngayKetThuc", data.ngayKetThuc)
      formDataToSend.append("maPhanLoaiDoTuoi", data.maPhanLoaiDoTuoi)
      formDataToSend.append("phienBan", data.phienBan)
      formDataToSend.append("ngonNgu", data.ngonNgu)
      if (data.anhBia) {
        formDataToSend.append("anhBia", data.anhBia)
      }
      data.maTheLoais.forEach(id => formDataToSend.append("maTheLoais[]", id))

      const res = await updateMovieAdmin(selectedMovie.maPhim, formDataToSend)
      setMovies(prev => prev.map(m => m.maPhim === selectedMovie.maPhim ? res.movie : m))
      setIsEditDialogOpen(false)
      resetForm()
      toast.success("Cập nhật phim thành công!")
    } catch (error) {
      toast.error(handleError(error) || "Cập nhật phim thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedMovie) return
    setSubmitting(true)
    try {
      await deleteMovieAdmin(selectedMovie.maPhim)
      setMovies(prev => prev.filter(m => m.maPhim !== selectedMovie.maPhim))
      setIsDeleteDialogOpen(false)
      setSelectedMovie(null)
      toast.success("Xóa phim thành công!")
    } catch (error) {
      toast.error(handleError(error) || "Xóa phim thất bại!")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header + Stats */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Phim</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">Quản lý toàn bộ phim trong hệ thống rạp chiếu</p>
            </div>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Phim Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Tổng số phim", value: stats.total, icon: <Film className="h-5 w-5" />, color: "bg-purple-500" },
              { title: "Đang chiếu", value: stats.dangChieu, icon: <Video className="h-5 w-5" />, color: "bg-green-500" },
              { title: "Sắp chiếu", value: stats.sapChieu, icon: <Calendar className="h-5 w-5" />, color: "bg-blue-500" },
              { title: "Đã kết thúc", value: stats.daKetThuc, icon: <Clock className="h-5 w-5" />, color: "bg-gray-500" },
            ].map((card, i) => (
              <Card key={i} className="bg-white/50 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
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
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tên phim..."
                  value={searchQuery}
                  onChange={e => {
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
                    className={`
                      ${hienThiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100" : ""}
                    `}
                  >
                    <Filter className="mr-2 h-4 w-4" /> 
                    Hiển thị
                    {hienThiFilter !== "all" && <span>({hienThiFilter === "true" ? "Đang hiển thị" : "Đang ẩn"})</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("true"); setCurrentPage(1) }}>Đang hiển thị</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("false"); setCurrentPage(1) }}>Đang ẩn</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={`
                    ${trangThaiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100" : ""}
                  `}> 
                    <Filter className="mr-2 h-4 w-4" /> Trạng thái chiếu 
                    {trangThaiFilter !== "all" && (
                      <span>
                        ({trangThaiFilter === "dangChieu" ? "Đang chiếu" : trangThaiFilter === "sapChieu" ? "Sắp chiếu" : "Đã kết thúc"})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("all"); setCurrentPage(1) }}>Tất cả</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("dangChieu"); setCurrentPage(1) }}>Đang chiếu</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("sapChieu"); setCurrentPage(1) }}>Sắp chiếu</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setTrangThaiFilter("daKetThuc"); setCurrentPage(1) }}>Đã kết thúc</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedMovieIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="md:w-auto">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Actions ({selectedMovieIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('hienThi')}>
                      Hiển thị
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('an')}>
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
            <CardTitle>Danh Sách Phim</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600 w-12">
                      <Checkbox
                        checked={selectedMovieIds.length === movies.length && movies.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-20">Mã phim</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ảnh bìa</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tên phim</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày khởi chiếu</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày kết thúc</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Thể loại</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Thời lượng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hiển thị</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.length === 0 ? (
                    <tr><td colSpan={20} className="text-center py-8 text-gray-500">Không có phim nào</td></tr>
                  ) : (
                    movies.map(movie => (
                      <tr key={movie.maPhim} className="border-b hover:bg-gray-50/50 text-sm">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedMovieIds.includes(movie.maPhim)}
                            onCheckedChange={() => handleSelectMovie(movie.maPhim)}
                          />
                        </td>
                        <td className="p-4 font-medium">{movie.maPhim}</td>
                        <td className="p-4"><img src={movie.anhBia} alt={movie.tenPhim} className="w-12 h-16 object-cover rounded" /></td>
                        <td className="p-4 font-medium">{movie.tenPhim}</td>
                        <td className="p-4">{formatDate(movie.ngayKhoiChieu)}</td>
                        <td className="p-4">{formatDate(movie.ngayKetThuc)}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {movie.phimTheLoais.map(cat => <Badge key={cat.maTheLoai} variant="secondary" className="text-xs">{cat.tenTheLoai}</Badge>)}
                          </div>
                        </td>
                        <td className="p-4">{movie.thoiLuong} phút</td>
                        <td className="p-4">{movie.trangThai}</td>
                        <td className="p-4"><Switch checked={movie.hienThi} onCheckedChange={() => handleToggleHienThi(movie.maPhim)} /></td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedMovie(movie); setIsViewDialogOpen(true) }}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditMovie(movie)}>
                                <Edit3 className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedMovie(movie); setIsDeleteDialogOpen(true) }}>
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            totalItems={totalMovies}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modal add movie */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="md:max-w-[900px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Thêm Phim Mới</DialogTitle>
              <DialogDescription>Nhập đầy đủ thông tin phim để thêm vào hệ thống.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 pr-2 overflow-y-auto">
              <MovieForm
                categories={categories}
                ageRatings={ageRatings}
                onSubmit={handleSubmitAdd}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" form="movie-form" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Tạo phim
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Sửa Phim */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="md:max-w-[900px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Sửa Phim</DialogTitle>
              <DialogDescription>Nhập đầy đủ thông tin phim để thêm vào hệ thống.</DialogDescription>
            </DialogHeader>
            <div className="flex-1 pr-2 overflow-y-auto">
              <MovieForm
                defaultValues={formData}
                categories={categories}
                ageRatings={ageRatings}
                onSubmit={handleSubmitEdit}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" form="movie-form" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Cập nhật phim
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Xóa Phim */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="md:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xóa Phim</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn xóa phim này? Hành động này không thể hoàn tác.</DialogDescription>
            </DialogHeader>
            {selectedMovie && (
              <div className="py-6 flex items-center gap-4 bg-red-50 p-4 rounded-lg">
                <img src={selectedMovie.anhBia} alt={selectedMovie.tenPhim} className="w-16 h-24 object-cover rounded" />
                <div>
                  <p className="font-semibold text-lg">{selectedMovie.tenPhim}</p>
                  <p className="text-sm text-gray-600">{selectedMovie.ngayKhoiChieu} • {selectedMovie.thoiLuong} phút</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>Hủy</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...</> : <><Trash2 className="mr-2 h-4 w-4" /> Xóa phim</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Xem Chi Tiết Phim */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="md:max-w-[700px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Chi Tiết Phim</DialogTitle>
            </DialogHeader>
            {selectedMovie && (
              <div className="space-y-6 py-4 overflow-y-auto max-h-[70vh]">
                <div className="flex gap-6">
                  <img src={selectedMovie.anhBia} alt={selectedMovie.tenPhim} className="w-40 h-60 object-cover rounded-lg shadow-md" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedMovie.tenPhim}</h3>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedMovie.trangThai}
                      <Badge variant={selectedMovie.hienThi ? "default" : "secondary"}>{selectedMovie.hienThi ? "Đang hiển thị" : "Tạm ẩn"}</Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      {selectedMovie.daoDien && <p><Users className="inline h-4 w-4 mr-1" />Đạo diễn: <span className="font-medium">{selectedMovie.daoDien}</span></p>}
                      {selectedMovie.dienVien && <p><Users className="inline h-4 w-4 mr-1" />Diễn viên: <span className="font-medium">{selectedMovie.dienVien}</span></p>}
                      <p><Clock className="inline h-4 w-4 mr-1" />Thời lượng: <span className="font-medium">{selectedMovie.thoiLuong} phút</span></p>
                      {selectedMovie.phanLoaiDoTuoi && <p><UserRoundCheck className="inline h-4 w-4 mr-1" />Phân loại độ tuổi: <span className="font-medium">{selectedMovie.phanLoaiDoTuoi.tenPhanLoaiDoTuoi}</span></p>}
                      {selectedMovie.ngonNgu && <p><Globe className="inline h-4 w-4 mr-1" />Ngôn ngữ: <span className="font-medium">{ngonNgu[selectedMovie.ngonNgu]}</span></p>}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Mô tả phim</Label>
                  <p className="mt-2 text-gray-700">{selectedMovie.moTa || "Chưa có mô tả"}</p>
                </div>

                <div>
                  <Label className="text-base font-semibold">Thể loại</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMovie.phimTheLoais.map(cat => (
                      <Badge key={cat.maTheLoai} variant="secondary" className="text-sm">{cat.tenTheLoai}</Badge>
                    ))}
                  </div>
                </div>

                {selectedMovie.trailerPhim && (
                  <div>
                    <Label className="text-base font-semibold">Trailer</Label>
                    <a href={`https://www.youtube.com/watch?v=${selectedMovie.trailerPhim}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center mt-1">
                      <Video className="mr-2 h-4 w-4" /> Xem trailer trên YouTube
                    </a>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
              <Button onClick={() => { setIsViewDialogOpen(false); if(selectedMovie) handleEditMovie(selectedMovie) }}>Sửa phim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageMoviePage