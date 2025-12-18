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

  const statusStyles = {
    DangTrong: { bg: "bg-white", text: "text-purple-900", cursor: "cursor-pointer" },
    DangDuocChon: { bg: "bg-yellow-300", text: "text-purple-900", cursor: "cursor-pointer" },
    DaDat: { bg: "bg-gray-500 opacity-60", text: "text-gray-300", cursor: "cursor-not-allowed" },
    KhongSuDung: { bg: "bg-transparent", text: "text-gray-300", cursor: "cursor-not-allowed" }
  }

  const s = statusStyles[status]

  if (type === "Standard") {
    return (
      <div
        className={cn(baseStyle, s.bg, s.text, s.cursor, className)}
        onClick={status !== "DaDat" ? onClick : undefined}
      >
        {number}
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "relative flex w-[41px] h-4 md:w-30 md:h-8",
        s.cursor,
        className
      )}
      onClick={status !== "DaDat" ? onClick : undefined}
    >
      <div className={cn(s.bg, "w-full h-full rounded")}></div>
      <div className={cn(s.bg, "w-full h-full rounded")}></div>
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={cn("text-[8px] md:text-base font-anton font-bold", s.text)}>
          {number}
        </span>
      </span>
    </div>
  )
}

export default Seat
