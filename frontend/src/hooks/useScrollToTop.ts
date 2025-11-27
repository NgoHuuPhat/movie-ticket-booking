import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const useScrollToTop = (deps?: string) => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [deps, pathname])
}

export default useScrollToTop