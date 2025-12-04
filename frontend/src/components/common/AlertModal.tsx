import { useAlert } from '@/stores/useAlert'
import { Button } from '@/components/ui/button'

export default function AlertModal() {
  const { isOpen, message, hide } = useAlert()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={hide}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg px-4 animate-in fade-in duration-800">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-tr from-transparent to-purple-900 shadow-2xl border-1 border-purple-600">
          <h1 className="text-white font-anton text-2xl text-center mt-6">Lưu ý!</h1>
          <div className="p-8 text-center">
            <p className="text-base text-white">
              {message}
            </p>
          </div>

          <div className="px-8 pb-8">
            <Button
              onClick={hide}
              variant="yellowToPinkPurple"
              className="w-full h-10 font-anton text-lg"
            >
              <span>OK</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}