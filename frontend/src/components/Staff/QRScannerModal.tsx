import { useState, useEffect, useRef } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RotateCcw, ScanLine, Keyboard } from "lucide-react"
import { Label } from "@radix-ui/react-label"

interface QRScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanSuccess: (text: string) => void
}

const QRScannerModal = ({
  open,
  onOpenChange,
  onScanSuccess,
}: QRScannerModalProps) => {
  const [activeTab, setActiveTab] = useState("scan")
  const [isScanning, setIsScanning] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setActiveTab("scan")
      setIsScanning(true)
      setErrorMsg(null)
      setManualCode("")
    }
  }, [open])

  const processCode = (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return

    onScanSuccess(trimmed)
    setIsScanning(false)
    setTimeout(() => onOpenChange(false), 1200)
  }

  const handleRetry = () => {
    setErrorMsg(null)
    setIsScanning(true)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processCode(manualCode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quét hoặc nhập mã</DialogTitle>
          <DialogDescription>
            Quét QR hoặc nhập mã tay để check-in / xác thực vé
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="scan">
              <ScanLine className="mr-2 h-4 w-4" />
              Quét QR
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Keyboard className="mr-2 h-4 w-4" />
              Nhập tay
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="mt-4">
            {errorMsg ? (
              <div className="text-center text-red-500 py-10 space-y-4">
                <p>{errorMsg}</p>
                <Button onClick={handleRetry} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            ) : (
              <>
                <div className="relative w-full max-w-[360px] aspect-square mx-auto rounded-lg overflow-hidden border border-border shadow-sm">
                  {isScanning ? (
                    <Scanner
                      onScan={(detectedCodes: IDetectedBarcode[]) => {
                        if (detectedCodes.length > 0) {
                          processCode(detectedCodes[0].rawValue)
                        }
                      }}
                      onError={(err) => {
                        console.error("QR Scanner error:", err)
                        setErrorMsg("Lỗi khi truy cập camera. Vui lòng kiểm tra quyền truy cập hoặc thử nhập mã tay.")
                      }}
                      paused={!isScanning}
                      constraints={{
                        facingMode: "environment",
                        aspectRatio: { ideal: 1 },
                      }}
                      formats={["qr_code"]}
                      allowMultiple={false}
                      sound={true}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <Label htmlFor="manual-code" className="block text-sm font-medium mb-2">
                Nhập mã QR
              </Label>
              <Input
                id="manual-code"
                ref={inputRef}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())} 
                placeholder="Ví dụ: ABC123XYZ"
                className="text-lg h-12"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <Button type="submit" className="w-full h-10" disabled={!manualCode.trim()}>
                Xác nhận mã
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default QRScannerModal