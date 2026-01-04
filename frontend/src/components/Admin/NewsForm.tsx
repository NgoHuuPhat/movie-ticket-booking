import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Editor } from "@tinymce/tinymce-react"

const newsSchema = z.object({
  tieuDe: z.string().min(1, "Tiêu đề không được để trống"),
  noiDung: z.string().min(1, "Nội dung không được để trống"),
  anhDaiDien: z.any().nullable(),
})

export type NewsFormData = z.infer<typeof newsSchema>

interface NewsFormProps {
  defaultValues?: Partial<NewsFormData>
  onSubmit: (data: NewsFormData) => Promise<void>
  onCancel: () => void
}

export const NewsForm = ({
  defaultValues = {
    tieuDe: "",
    noiDung: "",
    anhDaiDien: null,
  },
  onSubmit,
  onCancel,
}: NewsFormProps) => {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    control,
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="tieuDe">
            Tiêu đề <span className="text-red-600">*</span>
          </Label>
          <Input
            id="tieuDe"
            placeholder="Nhập tiêu đề tin tức..."
            {...register("tieuDe")}
          />
          {errors.tieuDe && (
            <p className="text-sm text-red-600 mt-1">{errors.tieuDe.message}</p>
          )}
        </div>

        <div className="mt-2">
          <Controller
            name="noiDung"
            control={control}
            render={({ field }) => (
              <Editor
                apiKey="ad3radrawpu3dyalo999x5uh0nhbyy23z47c19atn7chhigt"
                value={field.value}
                onEditorChange={(content) => field.onChange(content)}
                init={{
                  height: 400,
                  menubar: false,                   
                  plugins: [
                    'advlist', 'autolink', 'lists', 
                  ],
                  toolbar:
                    'undo redo | ' +
                    'bold italic underline | ' +
                    'bullist numlist | ' +
                    'alignleft aligncenter alignright ' ,
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.5 }',
                  language: 'vi',
                  branding: false,
                  placeholder: 'Nhập nội dung tại đây...',
                  toolbar_mode: 'sliding',
                  toolbar_sticky: true,
                }}
              />
            )}
          />
        </div>

        <div>
          <Label>Ảnh sản phẩm <span className="text-red-600">*</span></Label>
          <Input
            type="file"
            accept="image/*"
            onChange={e => setValue("anhDaiDien", e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Lưu tin tức"
          )}
        </Button>
      </div>
    </form>
  )
}