import { useEffect, useState } from "react"

export default function useTrailerModal() {
  const [show, setShow] = useState(false)
  const [trailerId, setTrailerId] = useState<string | null>(null)

  useEffect(() => {
    if(show){
      document.body.style.overflow = "hidden"
    } 
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [show])

  const openModal = (id: string) => {
    setTrailerId(id)
    setShow(true)
  }

  const closeModal = () => {
    setShow(false)
    setTrailerId(null)
  }

  return { show, trailerId, openModal, closeModal }
}