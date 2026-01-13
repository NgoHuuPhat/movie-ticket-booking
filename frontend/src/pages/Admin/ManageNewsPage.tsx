import { useState, useEffect } from "react"
import {
  Search, Plus, Filter, MoreVertical, Edit3, Trash2, Eye, Loader2,
  CheckSquare,
  Mail,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { toast } from "sonner"
import { NewsForm, type NewsFormData } from "@/components/Admin/NewsForm"
import {
  getNewsAdmin,
  createNewsAdmin,
  updateNewsAdmin,
  deleteNewsAdmin,
  bulkActionNewsAdmin,
  toggleShowNewsAdmin,
  getAllUserTypesAdmin,
  sendNewsMailAdmin
} from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import { formatDate, formatTime } from "@/utils/formatDate"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface INews {
  maTinTuc: string
  tieuDe: string
  noiDung: string
  anhDaiDien: string
  hienThi: boolean
  ngayDang: string
  nguoiDang: {
    maNguoiDung: string
    hoTen: string
  }
  daGuiMail: boolean
  thoiGianGuiMail: string | null
}

const ManageNewsPage = () => {
  const [news, setNews] = useState<INews[]>([])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<INews | null>(null)
  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [isSendMailDialogOpen, setIsSendMailDialogOpen] = useState(false)
  const [userTypes, setUserTypes] = useState<Array<{ maLoaiNguoiDung: string; tenLoaiNguoiDung: string }>>([])
  const [selectedUserType, setSelectedUserType] = useState<string>("")

  const [searchQuery, setSearchQuery] = useState("")
  const [hienThiFilter, setHienThiFilter] = useState<"all" | "true" | "false">("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNews, setTotalNews] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  // Load list news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await getNewsAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          hienThi: hienThiFilter === "all" ? undefined : hienThiFilter === "true",
        })

        setNews(res.news)
        setTotalNews(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchNews()
  }, [currentPage, searchQuery, hienThiFilter])

  // Load user types for send mail dialog
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const res = await getAllUserTypesAdmin()
        setUserTypes(res)
      } catch (error) {
        console.error("Failed to fetch user types:", error)
      }
    }
    fetchUserTypes()
  }, [])

  // Handle open send mail dialog
  const handleOpenSendMailDialog = (newsItem: INews) => {
    setSelectedNews(newsItem)
    setSelectedUserType("")
    setIsSendMailDialogOpen(true)
  }

  const handleSendMail = async () => {
    if (!selectedNews || !selectedUserType) {
      toast.error("Vui lòng chọn loại người dùng")
      return
    }

    setSubmitting(true)
    try {
      const res = await sendNewsMailAdmin(selectedNews.maTinTuc, selectedUserType)
      setNews((prev) =>
        prev.map((n) =>
          n.maTinTuc === selectedNews.maTinTuc
            ? { ...n, daGuiMail: true, thoiGianGuiMail: new Date().toISOString() }
            : n
        )
      )
      
      setIsSendMailDialogOpen(false)
      setSelectedNews(null)
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectNews = (id: string) => {
    setSelectedNewsIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedNewsIds(checked ? news.map((n) => n.maTinTuc) : [])
  }

  const handleBulkAction = async (action: "hienThi" | "an" | "xoa") => {
    if (selectedNewsIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tin tức")
      return
    }

    setSubmitting(true)

    try {
      const res = await bulkActionNewsAdmin(selectedNewsIds, action)

      setNews((prev) => {
        if (action === "xoa") {
          return prev.filter((n) => !selectedNewsIds.includes(n.maTinTuc))
        } else {
          return prev.map((n) =>
            selectedNewsIds.includes(n.maTinTuc)
              ? { ...n, hienThi: action === "hienThi" }
              : n
          )
        }
      })

      toast.success(res.message)
      setSelectedNewsIds([])
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleHienThi = async (id: string, current: boolean) => {
    try {
      const res = await toggleShowNewsAdmin(id)
      setNews((prev) =>
        prev.map((n) => (n.maTinTuc === id ? { ...n, hienThi: !current } : n))
      )
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleEditNews = (newsItem: INews) => {
    setSelectedNews(newsItem)
    setIsEditDialogOpen(true)
  }

  const handleViewNews = (newsItem: INews) => {
    setSelectedNews(newsItem)
    setIsViewDialogOpen(true)
  }

  const handleSubmitCreate = async (data: NewsFormData) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("tieuDe", data.tieuDe)
      formData.append("noiDung", data.noiDung)
      if (data.anhDaiDien instanceof File) {
        formData.append("anhDaiDien", data.anhDaiDien)
      }

      const res = await createNewsAdmin(formData)

      setNews((prev) => [res.newNews, ...prev])
      setIsAddDialogOpen(false)
      toast.success(res.message)
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitUpdate = async (data: NewsFormData) => {
    if (!selectedNews) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("tieuDe", data.tieuDe)
      formData.append("noiDung", data.noiDung)
      if (data.anhDaiDien instanceof File) {
        formData.append("anhDaiDien", data.anhDaiDien)
      }

      const res = await updateNewsAdmin(selectedNews.maTinTuc, formData)
      setNews((prev) =>
        prev.map((n) => (n.maTinTuc === res.updatedNews.maTinTuc ? res.updatedNews : n))
      )

      setIsEditDialogOpen(false)
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedNews) return
    setSubmitting(true)
    try {
      const res = await deleteNewsAdmin(selectedNews.maTinTuc)
      setNews((prev) => prev.filter((n) => n.maTinTuc !== selectedNews.maTinTuc))
      setIsDeleteDialogOpen(false)
      setSelectedNews(null)
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Tin Tức</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Quản lý toàn bộ tin tức trong hệ thống
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Tin Tức Mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tiêu đề tin tức..."
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
                    className={hienThiFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Hiển thị
                    {hienThiFilter !== "all" && (
                      <span className="ml-1">
                        ({hienThiFilter === "true" ? "Đang hiển thị" : "Đang ẩn"})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("all"); setCurrentPage(1); }}>
                    Tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("true"); setCurrentPage(1); }}>
                    Đang hiển thị
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHienThiFilter("false"); setCurrentPage(1); }}>
                    Đang ẩn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedNewsIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Thao tác ({selectedNewsIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction("hienThi")}>Hiển thị</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("an")}>Ẩn</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleBulkAction("xoa")}>
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
            <CardTitle>Danh Sách Tin Tức</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedNewsIds.length === news.length && news.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-24">Mã TT</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ảnh</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Tiêu đề</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày đăng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Người đăng</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Trạng thái gửi mail</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hiển thị</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {news.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        Không tìm thấy tin tức nào
                      </td>
                    </tr>
                  ) : (
                    news.map((newsItem) => (
                      <tr key={newsItem.maTinTuc} className="border-b hover:bg-gray-50/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedNewsIds.includes(newsItem.maTinTuc)}
                            onCheckedChange={() => handleSelectNews(newsItem.maTinTuc)}
                          />
                        </td>
                        <td className="p-4 font-medium">{newsItem.maTinTuc}</td>
                        <td className="p-4">
                          <img
                            src={newsItem.anhDaiDien}
                            alt={newsItem.tieuDe}
                            className="w-20 h-14 object-cover rounded-md border"
                          />
                        </td>
                        <td className="p-4 font-medium max-w-xs truncate">{newsItem.tieuDe}</td>
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>{formatDate(newsItem.ngayDang)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{newsItem.nguoiDang.hoTen}</td>
                        <td className="p-4">
                          {newsItem.daGuiMail ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="default" className="w-fit">
                                <Mail className="mr-1 h-3 w-3" />
                                Đã gửi
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="w-fit">
                              Chưa gửi
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Switch
                            checked={newsItem.hienThi}
                            onCheckedChange={() => handleToggleHienThi(newsItem.maTinTuc, newsItem.hienThi)}
                          />
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewNews(newsItem)}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenSendMailDialog(newsItem)}>
                                <Send className="mr-2 h-4 w-4" /> Gửi mail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditNews(newsItem)}>
                                <Edit3 className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedNews(newsItem)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
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
            totalItems={totalNews}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Dialog Thêm */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="md:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Thêm Tin Tức Mới</DialogTitle>
              <DialogDescription>
                Nhập đầy đủ thông tin để thêm tin tức mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <NewsForm
              onSubmit={handleSubmitCreate}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Sửa */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="md:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Sửa Tin Tức</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin tin tức.
              </DialogDescription>
            </DialogHeader>
            <NewsForm
              defaultValues={{
                tieuDe: selectedNews?.tieuDe || "",
                noiDung: selectedNews?.noiDung || "",
                anhDaiDien: selectedNews?.anhDaiDien || null,
              }}
              onSubmit={handleSubmitUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Xóa */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="md:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa tin tức này? Hành động không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedNews && (
              <div className="py-4 flex items-start gap-4 bg-red-50 p-4 rounded-lg">
                <img
                  src={selectedNews.anhDaiDien}
                  alt={selectedNews.tieuDe}
                  className="w-20 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold line-clamp-2">{selectedNews.tieuDe}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa tin tức"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Xem chi tiết */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="md:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết tin tức</DialogTitle>
            </DialogHeader>
            {selectedNews && (
              <div className="space-y-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{selectedNews.tieuDe}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <Badge variant={selectedNews.hienThi ? "default" : "secondary"}>
                        {selectedNews.hienThi ? "Đang hiển thị" : "Đang ẩn"}
                      </Badge>
                      <span>•</span>
                      <span>{formatTime(selectedNews.ngayDang)} {formatDate(selectedNews.ngayDang)}</span>
                      <span>•</span>
                      <span>Người đăng: {selectedNews.nguoiDang.hoTen}</span>
                      <span>•</span>
                      <Badge variant={selectedNews.daGuiMail ? "default" : "secondary"}>
                        {selectedNews.daGuiMail ? "Đã gửi mail" : "Chưa gửi mail"}
                      </Badge>
                      <span>•</span>
                      {selectedNews.thoiGianGuiMail && (
                        <span>
                          {formatTime(selectedNews.thoiGianGuiMail)} {formatDate(selectedNews.thoiGianGuiMail)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <img
                  src={selectedNews.anhDaiDien}
                  alt={selectedNews.tieuDe}
                  className="w-full h-80 object-cover rounded-lg border shadow-sm"
                />

                <div className="prose prose-sm md:prose-base max-w-none">
                  <h4 className="text-lg font-semibold mb-3">Nội dung:</h4>
                  <div 
                    className="bg-gray-50 rounded-lg p-6 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-img:rounded-lg prose-img:shadow-md prose-a:text-blue-600 hover:prose-a:text-blue-700"
                    dangerouslySetInnerHTML={{ __html: selectedNews.noiDung }}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog Gửi mail */}
        <Dialog open={isSendMailDialogOpen} onOpenChange={setIsSendMailDialogOpen}>
          <DialogContent className="md:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Gửi tin tức qua Email cho khách hàng
              </DialogTitle>
              <DialogDescription>
                Gửi tin tức này đến email của các khách hàng theo loại người dùng.
              </DialogDescription>
            </DialogHeader>

            {selectedNews && (
              <div className="space-y-4 pb-4">
                {/* Thông tin tin tức */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <img
                    src={selectedNews.anhDaiDien}
                    alt={selectedNews.tieuDe}
                    className="w-20 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-2">{selectedNews.tieuDe}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(selectedNews.ngayDang)}
                    </p>
                  </div>
                </div>

                {/* Chọn loại người dùng */}
                <div className="py-4">
                  <Label htmlFor="userType">
                    Chọn loại người dùng nhận email <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger id="userType">
                      <SelectValue placeholder="Chọn loại người dùng..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Tất cả khách hàng</span>
                        </div>
                      </SelectItem>
                      {userTypes
                        .filter((type) => !['ADMIN', 'NV'].includes(type.maLoaiNguoiDung))
                        .map((type) => (
                          <SelectItem key={type.maLoaiNguoiDung} value={type.maLoaiNguoiDung}>
                            {type.tenLoaiNguoiDung}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Thông báo */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <span className="text-amber-600 text-lg">⚠️</span>
                    <div className="text text-amber-800">
                      <p className="font-semibold mb-1">Lưu ý:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          {selectedUserType === 'all' 
                            ? 'Email sẽ được gửi đến TẤT CẢ khách hàng'
                            : 'Email sẽ được gửi đến tất cả người dùng thuộc loại đã chọn'}
                        </li>
                        <li>Hành động này không thể hoàn tác</li>
                        <li>Vui lòng kiểm tra kỹ nội dung trước khi gửi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSendMailDialogOpen(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSendMail}
                disabled={submitting || !selectedUserType}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gửi Email
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

export default ManageNewsPage