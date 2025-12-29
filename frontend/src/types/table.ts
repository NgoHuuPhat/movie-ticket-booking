interface SortableHeaderProps {
  field: string
  label: string
  sortField: string
  sortOrder: string
  onSort: (field: string) => void
  className?: string
}

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  className?: string
}

export type { SortableHeaderProps, PaginationBarProps }