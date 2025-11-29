import { cn } from "@/lib/utils"

interface SeatProps {
  type: "single" | "double"
  status?: "available" | "selected" | "booked" 
  number?: string | number
  onClick?: () => void
  className?: string
}

const Seat = ({ type, status = "available", number, onClick, className }: SeatProps) => {
  const baseStyle = "w-7 h-5 md:w-12 md:h-8 rounded cursor-pointer font-anton transition-colors duration-200 flex items-center justify-center font-semibold text-xs md:text-sm"

  const statusStyles = {
    available: "bg-white text-purple-900",
    selected: "bg-yellow-300 text-purple-900",
    booked: "bg-gray-600 opacity-60 text-gray-400",
  }

  if (type === "single") {
      return (
        <div
          className={cn(
            baseStyle,
            statusStyles[status],
            className          
          )}
          onClick={status !== "booked" ? onClick : undefined}
        >
          {number}
        </div>
      )
    }

  return (
    <>
      <div className={cn("relative flex w-20 h-8", className)} onClick={status !== "booked" ? onClick : undefined}>
        <div className="w-full h-full bg-purple-600 rounded"></div>
        <div className="w-full h-full bg-purple-600 rounded"></div>
        
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-sm font-anton">{number}</span>
        </span>
      </div>
    </>
  )
}

export default Seat
