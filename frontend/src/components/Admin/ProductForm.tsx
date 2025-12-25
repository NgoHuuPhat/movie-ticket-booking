import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const productSchema = z.object({
  tenSanPham: z.string().min(2, "Tên sản phẩm quá ngắn"),
  maDanhMucSanPham: z.string().min(1, "Vui lòng chọn danh mục"),
  giaTien: z.number().min(1000, "Giá phải lớn hơn hoặc bằng 1.000đ"),
  anhSanPham: z.any().nullable(),
})

export type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>
  categories: Array<{ maDanhMucSanPham: string; tenDanhMucSanPham: string }>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

export const ProductForm = ({
  defaultValues,
  categories,
  onSubmit,
  onCancel
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tenSanPham: defaultValues?.tenSanPham || "",
      maDanhMucSanPham: defaultValues?.maDanhMucSanPham || "",
      giaTien: defaultValues?.giaTien || 0,
      anhSanPham: defaultValues?.anhSanPham || null,
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <Label>Tên sản phẩm <span className="text-red-600">*</span></Label>
            <Input {...register("tenSanPham")} />
            {errors.tenSanPham && <p className="text-sm text-red-600 mt-1">{errors.tenSanPham.message}</p>}
          </div>

          <div>
            <Label>Giá bán <span className="text-red-600">*</span></Label>
            <Input
              type="number"
              {...register("giaTien", { valueAsNumber: true })}
            />
            {errors.giaTien && <p className="text-sm text-red-600 mt-1">{errors.giaTien.message}</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label>Danh mục <span className="text-red-600">*</span></Label>
            <Select
              onValueChange={val => setValue("maDanhMucSanPham", val)}
              defaultValue={defaultValues?.maDanhMucSanPham}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.maDanhMucSanPham} value={cat.maDanhMucSanPham}>
                    {cat.tenDanhMucSanPham}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maDanhMucSanPham && <p className="text-sm text-red-600 mt-1">{errors.maDanhMucSanPham.message}</p>}
          </div>

          <div>
            <Label>Ảnh sản phẩm <span className="text-red-600">*</span></Label>
            <Input
              type="file"
              accept="image/*"
              onChange={e => setValue("anhSanPham", e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : defaultValues ? "Cập nhật" : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  )
}