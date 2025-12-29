import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware" 
import type { IBookingState } from "@/types/store"

const useBookingStore = create<IBookingState>()(
  persist(                                     
    (set, get) => ({
      movie: null,
      showtime: null,
      selectedSeats: [],
      selectedFoods: [],
      seatsTotal: 0,
      foodsTotal: 0,

      setMovie: (movie) => set({ movie }),
      setShowtime: (showtime) => set({ showtime }),
      setSeats: (seats) => {
        const total = seats.reduce((sum, seat) => sum + (Number(seat.giaTien) || 0), 0)
        set({ selectedSeats: seats, seatsTotal: total })
      },
      setFoods: (foods) => {
        const total = foods.reduce((sum, food) => {
          const donGia = Number(food.donGia) || 0
          const soLuong = Number(food.soLuong) || 0
          return sum + (donGia * soLuong)
        }, 0)
        set({ selectedFoods: foods, foodsTotal: total })
      },
      clearBooking: () => set({
        movie: null,
        showtime: null,
        selectedSeats: [],
        selectedFoods: [],
        seatsTotal: 0,
        foodsTotal: 0
      }),
      getGrandTotal: () => {
        const state = get()
        return Number(state.seatsTotal) + Number(state.foodsTotal)
      }
    }),
    {
      name: "booking-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useBookingStore