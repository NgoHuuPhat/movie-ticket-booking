import { useEffect, useRef } from "react"
import QRCodeLib from "qrcode"
import { Button } from "@/components/ui/button"

interface IHoaDon {
  maQR: string
}

interface TransactionQRModalProps {
  transaction: IHoaDon
  onClose: () => void
}

const TransactionQRModal = ({ transaction, onClose }: TransactionQRModalProps) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (qrCodeRef.current) {
      QRCodeLib.toCanvas(qrCodeRef.current, transaction.maQR, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    }
  }, [transaction.maQR])

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded p-8 max-w-md w-full border-1 border-purple-500 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h3 className="text-3xl font-anton text-gray-800 uppercase mb-6">Mã QR Hóa Đơn</h3>
          <canvas ref={qrCodeRef} className="mx-auto border-1 border-purple-300 rounded shadow-lg"></canvas>
          <p className="text-gray-800 text-lg my-4 font-bold">{transaction.maQR}</p>

          <div className="bg-purple-50 rounded p-4 mb-6 border-1 border-purple-200">
            <p className="text-sm text-gray-700 font-medium">
              Xuất trình mã QR này tại quầy để check-in hoặc nhận sản phẩm
            </p>
          </div>

          <Button
            onClick={onClose}
            variant="purpleToYellowOrange"
            className="w-full h-12 font-anton text-lg uppercase"
          >
            <span>Đóng</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TransactionQRModal