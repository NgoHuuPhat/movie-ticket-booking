import { useState, useEffect } from "react"
import { Search, Plus, Filter, MoreVertical, Trash2, Eye, Loader2, CheckSquare, UserCog,
  Lock, Unlock, EyeOffIcon, EyeIcon, Ticket, DollarSign, Star,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import AdminLayout from "@/components/layout/AdminLayout"
import PaginationBar from "@/components/Admin/PaginationBar"
import { toast } from "sonner"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  getAllUsersAdmin,
  createUserAdmin,
  toggleUserStatusAdmin,
  bulkActionUsersAdmin,
  deleteUserAdmin,
  getAllUserTypesAdmin,
  getUserStatsAdmin,
} from "@/services/api"
import { handleError } from "@/utils/handleError.utils"
import { formatDate } from "@/utils/formatDate"

interface IUserType {
  maLoaiNguoiDung: 'ADMIN' | 'KH' | 'NV' | 'VIP'
  tenLoaiNguoiDung: string
}

interface IUser {
  maNguoiDung: string
  hoTen: string
  email: string
  soDienThoai: string
  hoatDong: boolean
  ngaySinh: string
  gioiTinh: string
  diemTichLuy: number
  loaiNguoiDung: IUserType
}

const createUserSchema = z.object({
  hoTen: z.string().min(2, "Họ tên ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  matKhau: z.string().min(8, "Mật khẩu ít nhất 8 ký tự"),
  soDienThoai: z.string().regex(/^(0[3|5|7|8|9])[0-9]{8}$/, "Số điện thoại không hợp lệ (VN)"),
  ngaySinh: z.string().min(1, "Vui lòng chọn ngày sinh"),
  gioiTinh: z.enum(["Nam", "Nu", "Khac"]),
  maLoaiNguoiDung: z.string().min(1, "Vui lòng chọn vai trò"),
})
type UserFormData = z.infer<typeof createUserSchema>

const ManageUsersPage = () => {
  const [users, setUsers] = useState<IUser[]>([])
  const [userTypes, setUserTypes] = useState<IUserType[]>([])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [hoatDongFilter, setHoatDongFilter] = useState<"all" | "true" | "false">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    customerUsers: 0,
    vipUsers: 0,
    staffUsers: 0,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control
  } = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      hoTen: "",
      email: "",
      matKhau: "",
      soDienThoai: "",
      ngaySinh: "",
      maLoaiNguoiDung: "",
    },
  })

  // Load stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getUserStatsAdmin()
        setStats({
          totalUsers: res.totalUsers,
          activeUsers: res.activeUsers,
          inactiveUsers: res.inactiveUsers,
          customerUsers: res.customerUsers,
          vipUsers: res.vipUsers,
          staffUsers: res.staffUsers,
        })
      } catch (err) {
        console.error("Lỗi tải thống kê:", err)
        toast.error("Không thể tải thống kê vé")
      }
    }
    fetchStats()
  }, [])

  // Load user types (roles)
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const res = await getAllUserTypesAdmin()
        setUserTypes(res)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchUserTypes()
  }, [setValue])

  // Load users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsersAdmin({
          page: currentPage,
          search: searchQuery || undefined,
          hoatDong: hoatDongFilter === "all" ? undefined : hoatDongFilter === "true",
          maLoaiNguoiDung: roleFilter === "all" ? undefined : roleFilter,
        })

        setUsers(res.users)
        setTotalUsers(res.total)
        setTotalPages(res.totalPages)
        setStartIndex(res.startIndex)
        setEndIndex(res.endIndex)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchUsers()
  }, [currentPage, searchQuery, hoatDongFilter, roleFilter])

  const GIOI_TINH_LABEL: Record<string, string> = {
    Nam: "Nam",
    Nu: "Nữ",
    Khac: "Khác",
  }

  const getAdminStaffRoles = () => {
    return userTypes.filter((type) => 
      type.maLoaiNguoiDung === 'ADMIN' || type.maLoaiNguoiDung === 'NV'
    );
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedUserIds(checked ? users.map((u) => u.maNguoiDung) : [])
  }

  const handleBulkAction = async (action: "moKhoa" | "khoa" | "xoa") => {
    if (selectedUserIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người dùng")
      return
    }

    setSubmitting(true)
    try {
      const res = await bulkActionUsersAdmin(selectedUserIds, action)

      setUsers((prev) => {
        if (action === "xoa") {
          return prev.filter((u) => !selectedUserIds.includes(u.maNguoiDung))
        }
        return prev.map((u) =>
          selectedUserIds.includes(u.maNguoiDung)
            ? { ...u, hoatDong: action === "moKhoa" }
            : u
        )
      })

      toast.success(res.message)
      setSelectedUserIds([])
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleHoatDong = async (id: string, current: boolean) => {
    try {
      const res = await toggleUserStatusAdmin(id, current)
      setUsers((prev) =>
        prev.map((u) => (u.maNguoiDung === id ? { ...u, hoatDong: !current } : u))
      )
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const onCreateSubmit = async (data: UserFormData) => {
    setSubmitting(true)
    try {
      const res = await createUserAdmin(data.hoTen, data.email, data.matKhau, data.soDienThoai, data.ngaySinh, data.gioiTinh, data.maLoaiNguoiDung)
      setUsers((prev) => [res.newUser, ...prev])
      toast.success(res.message)
      setIsAddDialogOpen(false)
      reset()
      setCurrentPage(1)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return
    setSubmitting(true)
    try {
      const res = await deleteUserAdmin(selectedUser.maNguoiDung)
      setUsers((prev) => prev.filter((u) => u.maNguoiDung !== selectedUser.maNguoiDung))
      toast.success(res.message)
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">
                Quản lý toàn bộ tài khoản người dùng trong hệ thống
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Người Dùng
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: "Tổng Người Dùng", value: stats.totalUsers, icon: <UserCog />, color: "bg-blue-500" },
              { title: "Người Dùng Hoạt Động", value: stats.activeUsers, icon: <EyeIcon />, color: "bg-green-500" },
              { title: "Người Dùng Bị Khóa", value: stats.inactiveUsers, icon: <EyeOffIcon />, color: "bg-red-500" },
              { title: "Khách Hàng", value: stats.customerUsers, icon: <Ticket />, color: "bg-purple-500" },
              { title: "Người Dùng VIP", value: stats.vipUsers, icon: <Star />, color: "bg-yellow-500" },
              { title: "Nhân Viên", value: stats.staffUsers, icon: <DollarSign />, color: "bg-teal-500" },
            ].map((card, i) => (
              <Card key={i} className="bg-white/60 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-xl font-bold mt-1">{card.value}</p>
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
                  placeholder="Tìm theo tên, email, số điện thoại..."
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
                    className={hoatDongFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Trạng thái
                    {hoatDongFilter !== "all" && (
                      <span>
                        ({hoatDongFilter === "true" ? "Hoạt động" : "Bị khóa"})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setHoatDongFilter("all"); setCurrentPage(1) }}>
                    Tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHoatDongFilter("true"); setCurrentPage(1) }}>
                    Hoạt động
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setHoatDongFilter("false"); setCurrentPage(1) }}>
                    Bị khóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={roleFilter !== "all" ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    Vai trò
                    {roleFilter !== "all" && (
                      <span>
                        ({userTypes.find((r) => r.maLoaiNguoiDung === roleFilter)?.tenLoaiNguoiDung || roleFilter})
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-72 overflow-y-auto">
                  <DropdownMenuItem onClick={() => { setRoleFilter("all"); setCurrentPage(1) }}>
                    Tất cả
                  </DropdownMenuItem>
                  {userTypes.map((role) => (
                    <DropdownMenuItem
                      key={role.maLoaiNguoiDung}
                      onClick={() => { setRoleFilter(role.maLoaiNguoiDung); setCurrentPage(1) }}
                    >
                      {role.tenLoaiNguoiDung}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedUserIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Thao tác ({selectedUserIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction("moKhoa")}>
                      <Unlock className="mr-2 h-4 w-4" /> Mở khóa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("khoa")}>
                      <Lock className="mr-2 h-4 w-4" /> Khóa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleBulkAction("xoa")}>
                      <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
            <CardTitle>Danh Sách Người Dùng</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectedUserIds.length === users.length && users.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-32">Mã ND</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Họ tên</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">SĐT</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Vai trò</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Điểm tích lũy</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.maNguoiDung} className="text-sm border-b hover:bg-gray-50/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedUserIds.includes(user.maNguoiDung)}
                            onCheckedChange={() => handleSelectUser(user.maNguoiDung)}
                          />
                        </td>
                        <td className="p-4 font-medium">{user.maNguoiDung}</td>
                        <td className="p-4 font-medium">{user.hoTen}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.soDienThoai}</td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {user.loaiNguoiDung.tenLoaiNguoiDung}
                          </Badge>
                        </td>
                        <td className="p-4">{user.diemTichLuy}</td>
                        <td className="p-4">
                          <Switch
                            checked={user.hoatDong}
                            onCheckedChange={() => handleToggleHoatDong(user.maNguoiDung, user.hoatDong)}
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
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsViewDialogOpen(true) }}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true) }}
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
            totalItems={totalUsers}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Dialog Thêm người dùng */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="md:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Thêm Người Dùng Mới</DialogTitle>
              <DialogDescription>
                Nhập đầy đủ thông tin để tạo tài khoản người dùng mới.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-6 py-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium">Họ và tên <span className="text-red-600">*</span></label>
                    <Input {...register("hoTen")} />
                    {errors.hoTen && <p className="text-sm text-red-600 mt-1">{errors.hoTen.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Email <span className="text-red-600">*</span></label>
                    <Input type="email" {...register("email")} />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Mật khẩu <span className="text-red-600">*</span></label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...register("matKhau")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.matKhau && <p className="text-sm text-red-600 mt-1">{errors.matKhau.message}</p>}
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium">Số điện thoại <span className="text-red-600">*</span></label>
                    <Input {...register("soDienThoai")} />
                    {errors.soDienThoai && <p className="text-sm text-red-600 mt-1">{errors.soDienThoai.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Ngày sinh</label>
                    <Input type="date" {...register("ngaySinh")} />
                    {errors.ngaySinh && <p className="text-sm text-red-600 mt-1">{errors.ngaySinh.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Giới tính</label>
                    <Controller
                      control={control}
                      name="gioiTinh"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nam">Nam</SelectItem>
                            <SelectItem value="Nu">Nữ</SelectItem>
                            <SelectItem value="Khac">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gioiTinh && (
                      <p className="text-sm text-red-600 mt-1">{errors.gioiTinh.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Vai trò <span className="text-red-600">*</span></label>
                    <Controller
                      control={control}
                      name="maLoaiNguoiDung"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAdminStaffRoles().map((type) => (
                              <SelectItem key={type.maLoaiNguoiDung} value={type.maLoaiNguoiDung}>
                                {type.tenLoaiNguoiDung}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.maLoaiNguoiDung && (
                      <p className="text-sm text-red-600 mt-1">{errors.maLoaiNguoiDung.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Tạo người dùng"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Xóa */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="md:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa người dùng này? Hành động không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="py-4 space-y-2 bg-red-50 p-4 rounded-lg">
                <p className="font-semibold">{selectedUser.hoTen}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">
                  Vai trò: {selectedUser.loaiNguoiDung.tenLoaiNguoiDung}
                </p>
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
                  "Xóa người dùng"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Xem chi tiết */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="md:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Chi tiết người dùng</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Mã người dùng:</span>
                    <span className="font-semibold">{selectedUser.maNguoiDung}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Họ tên:</span>
                    <span>{selectedUser.hoTen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Số điện thoại:</span>
                    <span>{selectedUser.soDienThoai}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Vai trò:</span>
                    <Badge variant="outline">{selectedUser.loaiNguoiDung.tenLoaiNguoiDung}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Trạng thái:</span>
                    <Badge variant={selectedUser.hoatDong ? "default" : "secondary"}>
                      {selectedUser.hoatDong ? "Đang hoạt động" : "Bị khóa"}
                    </Badge>
                  </div>
                  {selectedUser.ngaySinh && (
                    <div className="flex justify-between">
                      <span className="font-medium">Ngày sinh:</span>
                      <span>{formatDate(selectedUser.ngaySinh)}</span>
                    </div>
                  )}
                  {selectedUser.gioiTinh && (
                    <div className="flex justify-between">
                      <span className="font-medium">Giới tính:</span>
                      <span>{GIOI_TINH_LABEL[selectedUser.gioiTinh]}</span>
                    </div>
                  )}
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
      </div>
    </AdminLayout>
  )
}

export default ManageUsersPage