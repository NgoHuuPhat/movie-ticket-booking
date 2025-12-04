import { create } from "zustand"

interface AlertState {
  isOpen: boolean
  message: string
  showToast: (msg: string) => void
  hide: () => void
}

export const useAlert = create<AlertState>((set) => ({
  isOpen: false,
  message: "",
  showToast: (message) => set({ isOpen: true, message }),
  hide: () => set({ isOpen: false, message: "" }),
}))