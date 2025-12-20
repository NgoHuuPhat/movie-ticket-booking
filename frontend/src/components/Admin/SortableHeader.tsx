import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from "lucide-react"
import type { SortableHeaderProps } from "@/types/table"

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
  className,
}) => (
  <th className={`${className} text-left p-4 font-medium text-gray-600`}>
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="flex items-center gap-2 cursor-pointer"
    >
      {label}
      {sortField === field && (
        sortOrder === "asc" ? (
          <ArrowDownNarrowWide className="h-4 w-4" />
        ) : (
          <ArrowDownWideNarrow className="h-4 w-4" />
        )
      )}
    </Button>
  </th>
)

export default SortableHeader