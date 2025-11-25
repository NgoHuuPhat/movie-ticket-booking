import { useState, useEffect } from "react"
import type { IMovie } from "@/types/movie"
import { listMoviesUpcoming } from "@/services/api"

export default function useListMovieUpcoming() {
  const [movieUpcoming, setMovieUpcoming] = useState<IMovie[]>([])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await listMoviesUpcoming()
        setMovieUpcoming(data || [])
      } catch (error) {
        console.error("Error fetching coming soon movies:", error)
      } 
    }

    fetchMovies()
  }, [])

  return { movieUpcoming }
}
