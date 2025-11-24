import axios from "axios"

export const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) return error.response?.data?.message || "An error occurred during the request."
  if (error instanceof Error) return error.message
  return "An unexpected error occurred"
}