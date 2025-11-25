import { useState, useEffect } from "react"
import type { IMovie } from "@/types/movie"
import { listMoviesShowing } from "@/services/api"

export default function useListMovieShowing() {
  const [movieShowing, setMoviesShowing] = useState<IMovie[]>([])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await listMoviesShowing()
        setMoviesShowing(data || [])
      } catch (error) {
        console.error("Error fetching now showing movies:", error)
      } 
    }
    fetchMovies()
  }, [])

  return { movieShowing }
}

