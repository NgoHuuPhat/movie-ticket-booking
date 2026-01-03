import { cn } from "@/lib/utils"

interface SeatProps {
  type: "Standard" | "Couple" | "VIP"         
  status?: "DangTrong" | "DaDat" | "DangDuocChon" | "KhongSuDung"
  number?: string
  onClick?: () => void
  className?: string
  variant?: "default" | "purple" | "blue" | "green"
}

const Seat = ({
  type,
  status = "DangTrong",
  number,
  onClick,
  className,
  variant = "default",
}: SeatProps) => {
  const baseStyle = "w-5 h-4 md:w-12 md:h-8 rounded font-anton transition-colors duration-200 flex items-center justify-center font-semibold text-[8px] md:text-sm"

  // Standard seat colors based on variant
  const standardColors = {
    default: {
      DangTrong: { bg: "bg-white", text: "text-purple-900", border: "border-gray-300" },
      DangDuocChon: { bg: "bg-yellow-300", text: "text-purple-900" },
      DaDat: { bg: "bg-gray-500", text: "text-gray-300", opacity: "opacity-60" },
      KhongSuDung: { bg: "bg-transparent", text: "text-transparent" },
    },
    purple: {
      DangTrong: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
      DangDuocChon: { bg: "bg-yellow-300", text: "text-purple-900" },
      DaDat: { bg: "bg-gray-500", text: "text-gray-300", opacity: "opacity-60" },
      KhongSuDung: { bg: "bg-transparent", text: "text-transparent" },
    },
  }

  // VIP seat colors
  const vipColors = {
    DangTrong: { bg: "bg-rose-500", text: "text-white font-bold", border: "border-amber-600 shadow-md" },
    DangDuocChon: { bg: "bg-yellow-300", text: "text-purple-950 font-bold" },
    DaDat: { bg: "bg-gray-500", text: "text-gray-300", opacity: "opacity-70" },
    KhongSuDung: { bg: "bg-transparent", text: "text-transparent" },
  }

  // Couple seat colors (giữ nguyên)
  const coupleColors = {
    DangTrong: { bg: "bg-pink-400", text: "text-white" },
    DangDuocChon: { bg: "bg-yellow-300", text: "text-purple-900" },
    DaDat: { bg: "bg-gray-500", text: "text-gray-300", opacity: "opacity-60" },
    KhongSuDung: { bg: "bg-transparent", text: "text-transparent" },
  }

  // Xử lý ghế không sử dụng
  if (status === "KhongSuDung") {
    if (type === "Standard" || type === "VIP") {
      return <div className={cn(baseStyle, "bg-transparent", className)}></div>
    }
    // Couple
    return (
      <div className={cn("flex gap-[2px] md:gap-1 w-[41px] h-4 md:w-26 md:h-8", className)}>
        <div className="w-full h-full"></div>
        <div className="w-full h-full"></div>
      </div>
    )
  }

  // Cursor style
  const cursorStyle = status === "DaDat" ? "cursor-not-allowed" : "cursor-pointer"

  // Standard Seat
  if (type === "Standard") {
    const s = standardColors[variant as keyof typeof standardColors]?.[status as keyof typeof standardColors["default"]]
    return (
      <div
        className={cn(baseStyle, s?.bg, s?.text, cursorStyle, className)}
        onClick={status !== "DaDat" ? onClick : undefined}
      >
        {number}
      </div>
    )
  }

  // VIP Seat
  if (type === "VIP") {
    const v = vipColors[status as keyof typeof vipColors]
    return (
      <div
        className={cn(
          baseStyle,
          v.bg,
          v.text,
          cursorStyle,
          className
        )}
        onClick={status !== "DaDat" ? onClick : undefined}
      >
        {number}
      </div>
    )
  }

  // Couple Seat
  const c = coupleColors[status as keyof typeof coupleColors]
  return (
    <div className={cn("relative flex", cursorStyle, className)} onClick={status !== "DaDat" ? onClick : undefined}>
      <div className={cn(baseStyle, "w-[20.5px] h-4 md:w-14 md:h-8", c.bg, "rounded-l")} />
      <span className={cn("absolute inset-0 flex items-center justify-center font-anton text-[8px] md:text-sm", c.text)}>
        {number}
      </span>
      <div className={cn(baseStyle, "w-[20.5px] h-4 md:w-14 md:h-8", c.bg, "rounded-r")} />
    </div>
  )
}

export default Seat