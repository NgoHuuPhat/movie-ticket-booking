import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"

export const useTableParams = (defaultSortField = "id", defaultSortOrder = "desc") => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState(defaultSortField)
  const [sortOrder, setSortOrder] = useState(defaultSortOrder)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
    setRoleFilter(searchParams.get("role") || "all")
    setStatusFilter(searchParams.get("status") || "all")
    setSortField(searchParams.get("sortField") || defaultSortField)
    setSortOrder(searchParams.get("sortOrder") || defaultSortOrder)
    setCurrentPage(Number(searchParams.get("page")) || 1)
  }, [searchParams, defaultSortField, defaultSortOrder])

  const updateParams = (newParams: { [key: string]: string | number }) => {
    const params = {
      search: searchQuery,
      role: roleFilter,
      status: statusFilter,
      sortField,
      sortOrder,
      page: currentPage,
      ...newParams,
    }

    const newSearchParams = new URLSearchParams()
    if (params.search) newSearchParams.set("search", params.search)
    if (params.role !== "all") newSearchParams.set("role", params.role)
    if (params.status !== "all") newSearchParams.set("status", params.status)
    if (params.sortField) newSearchParams.set("sortField", params.sortField)
    if (params.sortOrder) newSearchParams.set("sortOrder", params.sortOrder)
    if (params.page) newSearchParams.set("page", params.page.toString())

    setSearchParams(newSearchParams)
  }

  return {
    searchQuery,
    roleFilter,
    statusFilter,
    sortField,
    sortOrder,
    currentPage,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setSortField,
    setSortOrder,
    setCurrentPage,
    updateParams,
  }
}
