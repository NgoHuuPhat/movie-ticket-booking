import { create } from "zustand"

interface AlertState {
  isOpen: boolean
  message: string
  onConfirm?: () => void
  showToast: (msg: string, onConfirm?: () => void) => void
  hide: () => void
}

export const useAlert = create<AlertState>((set, get) => ({
  isOpen: false,
  message: "",
  onConfirm: undefined,
  showToast: (message, onConfirm) => set({ isOpen: true, message, onConfirm }),
  hide: () => {
    const { onConfirm } = get()
    if (onConfirm) {
      onConfirm()
    }
    set({ isOpen: false, message: "", onConfirm: undefined })
  },
}))