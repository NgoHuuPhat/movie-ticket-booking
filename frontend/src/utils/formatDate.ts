import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale/vi"

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

export function formatWeekday(dateString?: string): string {
  if (!dateString) return ""

  const date = parseISO(dateString)
  return format(date, "EEEE", { locale: vi })
}

