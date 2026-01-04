import { useState, useEffect } from "react"
import { getNews } from "@/services/api"
import type { INews } from "@/types/news"

export default function useListNews() {
  const [news, setNews] = useState<INews[]>([])
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews()
        setNews(data)
      } catch (error) {
        console.error("Error fetching now showing movies:", error)
      } 
    }
    fetchNews()
  }, [])

  return { news }
}

