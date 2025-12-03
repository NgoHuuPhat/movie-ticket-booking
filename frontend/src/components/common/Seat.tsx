import { cn } from "@/lib/utils"

interface SeatProps {
  type: "Standard" | "Couple" 
  status?: "DangTrong" | "DaDat" | "DangDuocChon" | "KhongSuDung"
  number?: string 
  onClick?: () => void
  className?: string
}

const Seat = ({ type, status = "DangTrong", number, onClick, className }: SeatProps) => {
  const baseStyle = "w-5 h-4 md:w-12 md:h-8 rounded cursor-pointer font-anton transition-colors duration-200 flex items-center justify-center font-semibold text-[8px] md:text-sm"

  const statusStyles = {
    DangTrong: "bg-white text-purple-900",
    DangDuocChon: "bg-yellow-300 text-purple-900",
    DaDat: "bg-gray-600 opacity-60 text-gray-400 cursor-not-allowed",
    KhongSuDung: "bg-transparent cursor-not-allowed"
  }

  if (type === "Standard") {
      return (
        <div
          className={cn(
            baseStyle,
            statusStyles[status],
            className          
          )}
          onClick={status !== "DaDat" ? onClick : undefined}
        >
          {number}
        </div>
      )
    }

  return (
  <>
    <div 
      className={cn(
        "relative flex",
        "w-[41px] h-4 md:w-30 md:h-8",
        "cursor-pointer",
        className
      )}
      onClick={status !== "DaDat" ? onClick : undefined}
    >
      <div className={`${
        status === "DangDuocChon" 
          ? "bg-yellow-300" 
          : status === "DaDat" 
            ? "bg-gray-600 opacity-60" 
            : "bg-white"
      } w-full h-full rounded`}></div>

      <div className={`${
        status === "DangDuocChon" 
          ? "bg-yellow-300" 
          : status === "DaDat" 
            ? "bg-gray-600 opacity-60" 
            : "bg-white"
      } w-full h-full rounded`}></div>
      
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={cn(
          "text-[8px] md:text-base font-anton font-bold",
          status === "DaDat" ? "text-gray-400" : "text-purple-900"
        )}>
          {number}
        </span>
      </span>
    </div>
  </>
)
}

export default Seat
