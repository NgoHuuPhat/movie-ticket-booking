import { format, parseISO } from "date-fns"

export function formatDate(dateString?: string, formatStr: string = "dd/MM/yyyy"): string {
  if (!dateString) return ""

  const date = parseISO(dateString)
  return format(date, formatStr)
}

export function formatTime(dateString?: string): string {
  if (!dateString) return ""
  
  const date = parseISO(dateString)
  return format(date, "HH:mm")
}

