import { cn } from "@/lib/utils"

interface SeatProps {
  type: "Standard" | "Couple" 
  status?: "DangTrong" | "DaDat" | "DangDuocChon" | "KhongSuDung"
  number?: string 
  onClick?: () => void
  className?: string
}

const Seat = ({ type, status = "DangTrong", number, onClick, className }: SeatProps) => {
  const baseStyle = "w-5 h-4 md:w-12 md:h-8 rounded font-anton transition-colors duration-200 flex items-center justify-center font-semibold text-[8px] md:text-sm"

  if (status === "KhongSuDung") {
    if (type === "Standard") {
      return <div className={cn(baseStyle, "bg-transparent", className)}></div>
    }
    return (
      <div className={cn("flex gap-[2px] md:gap-1 w-[41px] h-4 md:w-26 md:h-8", className)}>
        <div className="w-full h-full"></div>
        <div className="w-full h-full"></div>
      </div>
    )
  }

  const statusStyles = {
    DangTrong: { bg: "bg-white", text: "text-purple-900" },
    DangDuocChon: { bg: "bg-yellow-300", text: "text-purple-900" },
    DaDat: { bg: "bg-gray-500 opacity-60", text: "text-gray-300" }
  }

  const s = statusStyles[status as keyof typeof statusStyles]
  const cursorStyle = status === "DaDat" ? "cursor-not-allowed" : "cursor-pointer"

  if (type === "Standard") {
    return (
      <div
        className={cn(baseStyle, s.bg, s.text, cursorStyle, className)}
        onClick={status !== "DaDat" ? onClick : undefined}
      >
        {number}
      </div>
    )
  }

  const coupleBg = status === "DangTrong" ? "bg-pink-400" : s.bg
  const coupleText = status === "DangTrong" ? "text-white" : s.text

  return (
    <div 
      className={cn(
        "relative flex w-[41px] h-4 md:w-26 md:h-8",
        cursorStyle,
        className
      )}
      onClick={status !== "DaDat" ? onClick : undefined}
    >
      <div className={cn(coupleBg, "w-full h-full rounded relative")}>
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={cn("text-[10px] md:text-sm font-anton font-bold", coupleText)}>
            {number?.split('-')[0]}
          </span>
        </span>
      </div>
      
      <div className={cn(coupleBg, "w-full h-full rounded relative")}>
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={cn("text-[10px] md:text-sm font-anton font-bold", coupleText)}>
            {number?.split('-')[1]}
          </span>
        </span>
      </div>
    </div>
  )
}

export default Seat