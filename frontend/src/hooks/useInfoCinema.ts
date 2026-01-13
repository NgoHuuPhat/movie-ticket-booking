import { useState, useEffect } from "react"
import { getCinemaInfo } from "@/services/api"
import { handleError } from "@/utils/handleError.utils"

interface CinemaInfo {
  tenRap: string
  diaChi: string
  soDienThoai: string
  email: string
}

export default function useInfoCinema() {
  const [ cinemaInfo, setCinemaInfo ] = useState<CinemaInfo | null>(null)
  
  useEffect(() => {
    const fetchInfoCinema = async () => {
      try {
        const fetchCinemaInfo = async () => {
          const cinemaInfo = await getCinemaInfo()
          setCinemaInfo(cinemaInfo)
        }
        fetchCinemaInfo()
      } catch (error) {
        console.error(handleError(error))
      } 
    }
    fetchInfoCinema()
  }, [])

  return { cinemaInfo }
}

