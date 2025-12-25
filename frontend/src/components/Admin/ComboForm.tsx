import { useEffect } from "react"
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

interface ProductOption {
  maSanPham: string
  tenSanPham: string
  giaTien: number
}

const comboSchema = z.object({
  tenCombo: z.string().min(3, "Tên combo phải có ít nhất 3 ký tự"),
  giaGoc: z.number(),
  giaBan: z.number().min(1000, "Giá bán phải ≥ 1.000đ"),
  anhCombo: z.any().nullable(),
  chiTietCombos: z
    .array(
      z.object({
        maSanPham: z.string().min(1, "Vui lòng chọn sản phẩm"),
        soLuong: z.number().min(1, "Số lượng phải ≥ 1"),
      })
    )
    .min(1, "Phải có ít nhất 1 sản phẩm trong combo"),
}).refine((data) => data.giaBan <= data.giaGoc, {
  message: "Giá bán phải nhỏ hơn hoặc bằng giá gốc",
  path: ["giaBan"],
})

export type ComboFormData = z.infer<typeof comboSchema>

interface ComboFormProps {
  defaultValues?: Partial<ComboFormData>
  onSubmit: (data: ComboFormData) => Promise<void>
  onCancel: () => void
  availableProducts: ProductOption[]
}

export const ComboForm = ({
  defaultValues,
  onSubmit,
  availableProducts = [],
}: ComboFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<ComboFormData>({
    resolver: zodResolver(comboSchema),
    mode: "onSubmit",
    defaultValues: {
      tenCombo: defaultValues?.tenCombo || "",
      giaGoc: defaultValues?.giaGoc || 0,
      giaBan: defaultValues?.giaBan || 0,
      anhCombo: defaultValues?.anhCombo || null,
      chiTietCombos: defaultValues?.chiTietCombos?.length
        ? defaultValues.chiTietCombos
        : [{ maSanPham: "", soLuong: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chiTietCombos",
  })

  const chiTietCombos = useWatch({ control, name: "chiTietCombos" })
  useEffect(() => {
    if (!chiTietCombos || chiTietCombos.length === 0) return

    const calculatedGiaGoc = chiTietCombos.reduce((total, item) => {
      if (!item.maSanPham || item.soLuong < 1) return total

      const product = availableProducts.find((p) => p.maSanPham === item.maSanPham)
      if (!product) return total

      return total + product.giaTien * item.soLuong
    }, 0)
    
    setValue("giaGoc", calculatedGiaGoc)
  }, [chiTietCombos, availableProducts, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4" id="combo-form">
      <div className="space-y-5">
        <div>
          <Label>
            Tên combo <span className="text-red-600">*</span>
          </Label>
          <Input placeholder="VD: Combo Tết Trọn Vẹn" {...register("tenCombo")} />
          {errors.tenCombo && (
            <p className="text-sm text-red-600 mt-1">{errors.tenCombo.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              Giá gốc (VNĐ) <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              {...register("giaGoc", { valueAsNumber: true })}
              className="font-medium"
              disabled
            />
          </div>

          <div>
            <Label>
              Giá bán (VNĐ) <span className="text-red-600">*</span>
            </Label>
            <Input type="number" {...register("giaBan", { valueAsNumber: true })} />
            {errors.giaBan && (
              <p className="text-sm text-red-600 mt-1">{errors.giaBan.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Ảnh combo</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setValue("anhCombo", e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-base">
            Sản phẩm trong combo <span className="text-red-600">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ maSanPham: "", soLuong: 1 })}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
          </Button>
        </div>

        {errors.chiTietCombos && typeof errors.chiTietCombos === "string" && (
          <p className="text-sm text-red-600">{errors.chiTietCombos}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-wrap gap-3 items-end border rounded-lg p-3 bg-gray-50"
            >
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm">Sản phẩm</Label>
                {availableProducts.length > 0 ? (
                  <Controller
                    control={control}
                    name={`chiTietCombos.${index}.maSanPham`}
                    render={({ field: controllerField }) => (
                      <Select
                        onValueChange={controllerField.onChange}
                        defaultValue={controllerField.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn sản phẩm..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((prod) => (
                            <SelectItem key={prod.maSanPham} value={prod.maSanPham}>
                              {prod.tenSanPham} ({prod.maSanPham}) - {prod.giaTien.toLocaleString()}đ
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <div className="h-10 flex items-center px-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                    Không có sản phẩm nào để chọn
                  </div>
                )}

                {errors.chiTietCombos?.[index]?.maSanPham && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.chiTietCombos[index]?.maSanPham?.message}
                  </p>
                )}
              </div>

              <div className="w-28">
                <Label className="text-sm">Số lượng</Label>
                <Input
                  type="number"
                  min={1}
                  {...register(`chiTietCombos.${index}.soLuong`, { valueAsNumber: true })}
                />
                {errors.chiTietCombos?.[index]?.soLuong && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.chiTietCombos[index]?.soLuong?.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}