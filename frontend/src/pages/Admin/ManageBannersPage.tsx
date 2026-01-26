import { useState, useEffect } from "react"
import { Plus, MoreVertical, Edit3, Trash2, Eye, Save, Loader2, CheckSquare, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import AdminLayout from "@/components/layout/AdminLayout"
import { getBannersAdmin, createBannerAdmin, updateBannerAdmin, deleteBannerAdmin, bulkActionBannersAdmin, toggleShowBannerAdmin } from "@/services/api"
import { toast } from "sonner"
import { handleError } from "@/utils/handleError.utils"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/utils/formatDate"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { IBanner } from "@/types/banner"

const bannerSchemaAdd = z.object({
  anhBanner: z.instanceof(File, { message: "Vui lòng chọn ảnh banner" }).nullable(),
  duongDanLienKet: z.string().optional(),
  viTriHienThi: z.number().min(1, "Vị trí hiển thị phải lớn hơn 0")
})

const bannerSchemaEdit = z.object({
  anhBanner: z.instanceof(File).nullable().optional(),
  duongDanLienKet: z.string().optional(),
  viTriHienThi: z.number().min(1, "Vị trí hiển thị phải lớn hơn 0")
})
type BannerFormDataAdd = z.infer<typeof bannerSchemaAdd>
type BannerFormDataEdit = z.infer<typeof bannerSchemaEdit>

const ManageBannersPage = () => {
  const [banners, setBanners] = useState<IBanner[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<IBanner | null>(null)
  const [selectedBannerIds, setSelectedBannerIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd },
    setValue: setValueAdd,
    reset: resetAdd
  } = useForm<BannerFormDataAdd>({
    resolver: zodResolver(bannerSchemaAdd),
    mode: "onTouched",
    defaultValues: {
      anhBanner: null,
      duongDanLienKet: "",
      viTriHienThi: 1
    }
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
    reset: resetEdit
  } = useForm<BannerFormDataEdit>({
    resolver: zodResolver(bannerSchemaEdit),
    mode: "onTouched"
  })

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getBannersAdmin()
        setBanners(data)
      } catch (error) {
        toast.error(handleError(error))
      }
    }
    fetchBanners()
  }, [])

  const handleSelectBanner = (bannerId: string) => {
    setSelectedBannerIds(prev => 
      prev.includes(bannerId) ? prev.filter(id => id !== bannerId) : [...prev, bannerId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedBannerIds(checked ? banners.map(b => b.maBanner) : [])
  }

  const handleBulkAction = async (action: "hienThi" | "an" | "xoa") => {
    if (selectedBannerIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một banner để thực hiện hành động.")
      return
    }

    setSubmitting(true)

    try {
      const data = await bulkActionBannersAdmin(selectedBannerIds, action)
      
      if (action === 'xoa') {
        setBanners(prev => prev.filter(b => !selectedBannerIds.includes(b.maBanner)))
      } else {
        setBanners(prev => prev.map(b => 
          selectedBannerIds.includes(b.maBanner) 
            ? { ...b, hienThi: action === 'hienThi' } 
            : b
        ))
      }
      
      setSelectedBannerIds([])
      toast.success(data.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleHienThi = async (bannerId: string) => {
    setSubmitting(true)
    try {
      const data = await toggleShowBannerAdmin(bannerId)
      setBanners(prev => prev.map(b => b.maBanner === bannerId ? { ...b, hienThi: !b.hienThi } : b))
      toast.success(data.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBanner = (banner: IBanner) => {
    setSelectedBanner(banner)
    resetEdit({
      anhBanner: null,
      duongDanLienKet: banner.duongDanLienKet || "",
      viTriHienThi: banner.viTriHienThi ? Number(banner.viTriHienThi) : 1
    })
    setIsEditDialogOpen(true)
  }

  const onSubmitAdd = async (data: BannerFormDataAdd) => {
    setSubmitting(true)

    try {
      const formData = new FormData()
      if (data.anhBanner) {
        formData.append("anhBanner", data.anhBanner)
      }
      if (data.duongDanLienKet) {
        formData.append("duongDanLienKet", data.duongDanLienKet)
      }
      formData.append("viTriHienThi", data.viTriHienThi.toString())

      const res = await createBannerAdmin(formData)
      setBanners(prev => [res.newBanner, ...prev])
      setIsAddDialogOpen(false)
      resetAdd()
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmitEdit = async (data: BannerFormDataEdit) => {
    if (!selectedBanner) return
    setSubmitting(true)

    try {
      const formData = new FormData()
      if (data.anhBanner) {
        formData.append("anhBanner", data.anhBanner)
      }
      if (data.duongDanLienKet) {
        formData.append("duongDanLienKet", data.duongDanLienKet)
      }
      formData.append("viTriHienThi", data.viTriHienThi.toString())

      const res = await updateBannerAdmin(selectedBanner.maBanner, formData)
      setBanners(prev => prev.map(b => b.maBanner === selectedBanner.maBanner ? res.updatedBanner : b))
      setIsEditDialogOpen(false)
      resetEdit()
      toast.success(res.message)
    } catch (error) {
      toast.error(handleError(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedBanner) return
    setSubmitting(true)
    try {
      const data = await deleteBannerAdmin(selectedBanner.maBanner)
      setBanners(prev => prev.filter(b => b.maBanner !== selectedBanner.maBanner))
      setIsDeleteDialogOpen(false)
      setSelectedBanner(null)
      toast.success(data.message)
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
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quản Lý Banner</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">Quản lý toàn bộ banner quảng cáo trong hệ thống</p>
            </div>
            <Button onClick={() => { resetAdd(); setIsAddDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Banner Mới
            </Button>
          </div>
        </div>

        {/* Actions */}
        {selectedBannerIds.length > 0 && (
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-end gap-4">
                <span className="text-sm font-medium">Đã chọn {selectedBannerIds.length} banner</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Hành động
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Danh Sách Banner</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-100/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600 w-12">
                      <Checkbox
                        checked={selectedBannerIds.length === banners.length && banners.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Mã banner</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ảnh banner</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Vị trí hiển thị</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Đường dẫn</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Người tạo</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày tạo</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hiển thị</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-500">Không có banner nào</td></tr>
                  ) : (
                    banners.map(banner => (
                      <tr key={banner.maBanner} className="border-b hover:bg-gray-50/50 text-sm">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedBannerIds.includes(banner.maBanner)}
                            onCheckedChange={() => handleSelectBanner(banner.maBanner)}
                          />
                        </td>
                        <td className="p-4 font-medium">{banner.maBanner}</td>
                        <td className="p-4">
                          <img src={banner.anhBanner} alt="Banner" className="w-32 h-20 object-cover rounded" />
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">Vị trí {banner.viTriHienThi}</Badge>
                        </td>
                        <td className="p-4">
                          {banner.duongDanLienKet ? (
                            <a href={banner.duongDanLienKet} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline flex items-center">
                              <LinkIcon className="h-3 w-3 mr-1" /> Link
                            </a>
                          ) : (
                            <span className="text-gray-400">Không có</span>
                          )}
                        </td>
                        <td className="p-4">{banner.nguoiTao?.hoTen || 'N/A'}</td>
                        <td className="p-4">{formatDate(banner.ngayTao)}</td>
                        <td className="p-4">
                          <Switch checked={banner.hienThi} onCheckedChange={() => handleToggleHienThi(banner.maBanner)} />
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedBanner(banner); setIsViewDialogOpen(true) }}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBanner(banner)}>
                                <Edit3 className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedBanner(banner); setIsDeleteDialogOpen(true) }}>
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

        {/* Modal Thêm Banner */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="md:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm Banner Mới</DialogTitle>
              <DialogDescription>Nhập đầy đủ thông tin banner để thêm vào hệ thống.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="anhBanner-add">Ảnh banner <span className="text-red-600">*</span></Label>
                <Input
                  id="anhBanner-add"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setValueAdd("anhBanner", e.target.files?.[0] || null)}
                />
                {errorsAdd.anhBanner && <p className="text-sm text-red-600 mt-1">{errorsAdd.anhBanner.message}</p>}
              </div>

              <div>
                <Label htmlFor="viTriHienThi-add">Vị trí hiển thị <span className="text-red-600">*</span></Label>
                <Input
                  id="viTriHienThi-add"
                  type="number"
                  min="1"
                  placeholder="Nhập số thứ tự vị trí (1, 2, 3...)"
                  {...registerAdd("viTriHienThi", { valueAsNumber: true })}
                />
                {errorsAdd.viTriHienThi && <p className="text-sm text-red-600 mt-1">{errorsAdd.viTriHienThi.message}</p>}
              </div>

              <div>
                <Label htmlFor="duongDanLienKet-add">Đường dẫn liên kết (tùy chọn)</Label>
                <Input
                  id="duongDanLienKet-add"
                  placeholder="https://example.com"
                  {...registerAdd("duongDanLienKet")}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Tạo banner
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Sửa Banner */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="md:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Sửa Banner</DialogTitle>
              <DialogDescription>Cập nhật thông tin banner.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="anhBanner-edit">Ảnh banner (để trống nếu không đổi)</Label>
                <Input
                  id="anhBanner-edit"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setValueEdit("anhBanner", e.target.files?.[0] || null)}
                />
                {selectedBanner && (
                  <img src={selectedBanner.anhBanner} alt="Current" className="mt-2 w-full h-32 object-cover rounded" />
                )}
                {errorsEdit.anhBanner && <p className="text-sm text-red-600 mt-1">{errorsEdit.anhBanner.message}</p>}
              </div>

              <div>
                <Label htmlFor="viTriHienThi-edit">Vị trí hiển thị <span className="text-red-600">*</span></Label>
                <Input
                  id="viTriHienThi-edit"
                  type="number"
                  min="1"
                  placeholder="Nhập số thứ tự vị trí (1, 2, 3...)"
                  {...registerEdit("viTriHienThi", { valueAsNumber: true })}
                />
                {errorsEdit.viTriHienThi && <p className="text-sm text-red-600 mt-1">{errorsEdit.viTriHienThi.message}</p>}
              </div>

              <div>
                <Label htmlFor="duongDanLienKet-edit">Đường dẫn liên kết (tùy chọn)</Label>
                <Input
                  id="duongDanLienKet-edit"
                  placeholder="https://example.com"
                  {...registerEdit("duongDanLienKet")}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Cập nhật banner
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Xóa Banner */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="md:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xóa Banner</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.</DialogDescription>
            </DialogHeader>
            {selectedBanner && (
              <div className="py-6 flex flex-col items-center gap-4 bg-red-50 p-4 rounded-lg">
                <img src={selectedBanner.anhBanner} alt="Banner" className="w-full h-40 object-cover rounded" />
                <div className="text-center">
                  <p className="font-semibold">{selectedBanner.maBanner}</p>
                  <p className="text-sm text-gray-600">Vị trí {selectedBanner.viTriHienThi}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>Hủy</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...</> : <><Trash2 className="mr-2 h-4 w-4" /> Xóa banner</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Xem Chi Tiết Banner */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="md:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Chi Tiết Banner</DialogTitle>
            </DialogHeader>
            {selectedBanner && (
              <div className="space-y-6 py-4">
                <div>
                  <img src={selectedBanner.anhBanner} alt="Banner" className="w-full h-64 object-cover rounded-lg shadow-md" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Mã banner</Label>
                    <p className="font-medium">{selectedBanner.maBanner}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Vị trí hiển thị</Label>
                    <p className="font-medium">Vị trí {selectedBanner.viTriHienThi}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Người tạo</Label>
                    <p className="font-medium">{selectedBanner.nguoiTao?.hoTen || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Ngày tạo</Label>
                    <p className="font-medium">{formatDate(selectedBanner.ngayTao)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Trạng thái</Label>
                    <Badge variant={selectedBanner.hienThi ? "default" : "secondary"}>
                      {selectedBanner.hienThi ? "Đang hiển thị" : "Tạm ẩn"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Đường dẫn liên kết</Label>
                    {selectedBanner.duongDanLienKet ? (
                      <a href={selectedBanner.duongDanLienKet} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        <LinkIcon className="h-3 w-3 mr-1" /> Xem liên kết
                      </a>
                    ) : (
                      <p className="text-gray-400">Không có</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
              <Button onClick={() => { setIsViewDialogOpen(false); if(selectedBanner) handleEditBanner(selectedBanner) }}>Sửa banner</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default ManageBannersPage