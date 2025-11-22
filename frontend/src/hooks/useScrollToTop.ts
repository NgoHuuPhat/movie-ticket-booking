import { useEffect } from "react"

const useScrollToTop = (deps: string) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [deps])
}

export default useScrollToTop