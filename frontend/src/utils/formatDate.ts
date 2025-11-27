import { format, parseISO } from "date-fns"

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  
  const date = parseISO(dateString)
  return format(date, "dd/MM/yyyy")
}