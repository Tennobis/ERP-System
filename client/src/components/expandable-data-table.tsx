import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronDown, ChevronRight, Search, Filter, Download,
  Edit, Eye, MoreHorizontal, AlertTriangle, Flag, Check, X, Trash
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface ExpandableTableProps {
  title: string
  description?: string
  data: any[]
  columns: Array<{
    key: string
    label: string
    type?: 'text' | 'number' | 'badge' | 'progress' | 'actions'
    options?: string[]
    min?: number
    max?: number
    step?: number
    multiple?: boolean
    className?: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  expandableContent?: (row: any) => React.ReactNode
  searchKey?: string
  filters?: Array<{
    key: string
    label: string
    options: string[]
    multiple?: boolean
  }>
  onRowAction?: (action: string, row: any, updatedData?: any) => void
  showExport?: boolean
  rowActions?: Array<'view' | 'edit' | 'delete' | 'flag'>
  onEditClick?: (row: any) => void
}

export function ExpandableDataTable({
  title,
  description,
  data,
  columns,
  expandableContent,
  searchKey,
  filters,
  onRowAction,
  showExport = true,
  rowActions,
  onEditClick,
}: ExpandableTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<any>(null)

  const effectiveRowActions: Array<'view' | 'edit' | 'delete' | 'flag'> = rowActions && rowActions.length > 0
    ? rowActions
    : ['view', 'edit', 'flag']

  const getSearchableValue = (row: any) => {
    // If no specific key is provided, search across all simple fields
    if (!searchKey) {
      return Object.values(row)
        .filter((value) => typeof value === "string" || typeof value === "number")
        .join(" ")
    }

    // Primary value from the configured key
    let primary = row[searchKey]

    // If the primary key is missing/empty, try a couple of common fallbacks
    if (
      (primary === undefined || primary === null || primary === "") &&
      searchKey === "name"
    ) {
      primary = row.itemName ?? row.title ?? null
    }

    if (primary !== undefined && primary !== null && primary !== "") {
      return typeof primary === "string" ? primary : String(primary)
    }

    // As a last resort, search across all simple fields for this row
    return Object.values(row)
      .filter((value) => typeof value === "string" || typeof value === "number")
      .join(" ")
  };

  const filteredData = data.filter(row => {
    const matchesSearch = !searchQuery ||
      getSearchableValue(row).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilters = Object.entries(selectedFilters).every(([key, value]) =>
      !value || value === `all_${key}` || row[key] === value
    )

    return matchesSearch && matchesFilters
  })

  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    : filteredData

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleExport = () => {
    // Get exportable columns (exclude actions and non-exportable types)
    const exportableColumns = columns.filter(col => col.type !== 'actions')
    
    // Create CSV headers
    const headers = exportableColumns.map(col => col.label)
    
    // Create CSV data rows
    const csvData = sortedData.map(row => {
      return exportableColumns.map(col => {
        let value = row[col.key]
        
        // Handle different data types for export
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value)
        } else if (value === null || value === undefined) {
          value = ''
        } else {
          value = String(value)
        }
        
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`
        }
        
        return value
      })
    })
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleAction = (action: string, row: any) => {
    switch (action) {
      case 'view':
        setSelectedRow(row)
        setIsViewDetailsOpen(true)
        break
      case 'edit':
        if (onEditClick) {
          onEditClick(row)
        } else {
          setSelectedRow(row)
          setEditFormData({ ...row })
          setIsEditOpen(true)
        }
        break
      case 'flag':
        onRowAction?.(action, row)
        break
      case 'delete':
        onRowAction?.(action, row)
        break
    }
  }

  const handleSaveEdit = () => {
    onRowAction?.('edit', selectedRow, editFormData)
    setIsEditOpen(false)
    setEditFormData(null)
    setSelectedRow(null)
    // Note: toast functionality removed as it's not available in this environment
  }

  const handleCategoryRemoveInEdit = (
    column: any,
    selectedValues: string[],
    valueToRemove: string
  ) => {
    const currentValues = new Set(selectedValues);
    currentValues.delete(valueToRemove);
    setEditFormData({ 
      ...editFormData, 
      [column.key]: Array.from(currentValues) 
    });
  };

  const renderEditField = (column: any) => {
    if (!editFormData) return null;
    
    const value = editFormData[column.key];

    switch (column.type) {
      case 'badge':
        if (column.key === 'status') {
          return (
            <div className="space-y-2">
              <Label>{column.label}</Label>
              <Select
                value={value || ''}
                onValueChange={(newValue) => {
                  setEditFormData({ ...editFormData, [column.key]: newValue });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${column.label.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent>
                  {(column.options && column.options.length > 0
                    ? column.options
                    : ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
                  ).map((opt: string) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        const selectedValues = Array.isArray(value) ? value : [value].filter(Boolean);
        
        return (
          <div className="space-y-2">
            <Label>{column.label}</Label>
            <Select
              value={selectedValues[0] || ''}
              onValueChange={(newValue) => {
                if (column.multiple) {
                  const currentValues = new Set(selectedValues);
                  if (currentValues.has(newValue)) {
                    currentValues.delete(newValue);
                  } else {
                    currentValues.add(newValue);
                  }
                  setEditFormData({ ...editFormData, [column.key]: Array.from(currentValues) });
                } else {
                  setEditFormData({ ...editFormData, [column.key]: newValue });
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {column.multiple ? (
                    selectedValues.length > 0 ? (
                      <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                        {selectedValues.map((val) => (
                          <Badge 
                            key={val} 
                            variant="secondary" 
                            className="mr-1 pr-1 flex items-center gap-1"
                          >
                            {val}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCategoryRemoveInEdit(column, selectedValues, val);
                              }}
                              className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      `Select ${column.label.toLowerCase()}...`
                    )
                  ) : (
                    selectedValues[0] || `Select ${column.label.toLowerCase()}...`
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <div className="p-2">
                  <div className="mb-2">
                    <Input
                      placeholder="Search options..."
                      className="h-8"
                      onChange={(e) => {
                        // Add search functionality if needed
                      }}
                    />
                  </div>
                  {column.options?.map((option: string) => (
                    <SelectItem 
                      key={option} 
                      value={option}
                      className="cursor-pointer hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border rounded flex items-center justify-center">
                          {selectedValues.includes(option) && <Check className="h-3 w-3" />}
                        </div>
                        {option}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
            {column.multiple && (
              <p className="text-xs text-muted-foreground">
                You can select multiple {column.label.toLowerCase()}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label>{column.label}</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newValue = Math.max((column.min || 0), (value || 0) - (column.step || 1))
                  setEditFormData({ ...editFormData, [column.key]: newValue })
                }}
              >
                -
              </Button>
              <Input
                type="number"
                value={value || 0}
                min={column.min || 0}
                max={column.max || 100}
                step={column.step || 1}
                onChange={(e) => {
                  const newValue = Math.min(column.max || 100, Math.max(column.min || 0, parseInt(e.target.value) || 0))
                  setEditFormData({ ...editFormData, [column.key]: newValue })
                }}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newValue = Math.min((column.max || 100), (value || 0) + (column.step || 1))
                  setEditFormData({ ...editFormData, [column.key]: newValue })
                }}
              >
                +
              </Button>
            </div>
          </div>
        )

      case 'progress':
        return (
          <div className="space-y-2">
            <Label>{column.label} ({value || 0}%)</Label>
            <Slider
              value={[value || 0]}
              onValueChange={(newValue) => setEditFormData({ ...editFormData, [column.key]: newValue[0] })}
              max={100}
              step={1}
            />
          </div>
        )

      case 'text':
        return (
          <div className="space-y-2">
            <Label>{column.label}</Label>
            <Input
              value={value || ''}
              onChange={(e) => setEditFormData({ ...editFormData, [column.key]: e.target.value })}
            />
          </div>
        )

      default:
        return null
    }
  }

  const renderCellContent = (column: any, value: any, row: any) => {
    if (column.render && column.key !== 'budget') {
      return column.render(value, row)
    }

    const flaggedStyle = row.isFlagged ? 'text-red-500 font-semibold' : ''
    const iconStrokeWidth = row.isFlagged ? 'stroke-[2.5]' : 'stroke-[1.5]'
    const buttonFlaggedStyle = row.isFlagged ? 'text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold [&>svg]:stroke-[2.5]' : ''

    switch (column.type) {
      case 'badge':
        const variant = value === 'Completed' ? 'default' :
          value === 'In Progress' ? 'secondary' :
            value === 'Critical' ? 'destructive' : 'outline'
        return (
          <div>
            <Badge variant={variant}>{value}</Badge>
          </div>
        )

      case 'progress':
        return (
          <div className={`flex items-center gap-2 ${flaggedStyle}`}>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${row.isFlagged ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm">{value}%</span>
          </div>
        )

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            {effectiveRowActions.includes('view') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('view', row)}
                className={buttonFlaggedStyle}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {effectiveRowActions.includes('edit') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('edit', row)}
                className={buttonFlaggedStyle}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {effectiveRowActions.includes('flag') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('flag', row)}
                className={buttonFlaggedStyle}
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
            {effectiveRowActions.includes('delete') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('delete', row)}
                className={buttonFlaggedStyle}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        )

      default:
        // Handle budget column specifically
        if (column.key === 'budget') {
          return (
            <div className={flaggedStyle}>
              ₹{(value / 1000000).toFixed(1)}M
            </div>
          )
        }
        return (
          <div className={flaggedStyle}>
            {value}
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export ({sortedData.length} rows)
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {searchKey && (
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2">
            {filters?.map(filter => (
              <Select
                key={filter.key}
                value={selectedFilters[filter.key] || ''}
                onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, [filter.key]: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={`all_${filter.key}`}>All {filter.label}</SelectItem>
                  {filter.options.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  {expandableContent && <th className="h-12 px-4 w-12"></th>}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`h-12 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/50 ${column.className || ''}`}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {sortConfig?.key === column.key && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, index) => {
                  const rowId = row.id || index.toString()
                  const isExpanded = expandedRows.has(rowId)
                  const rowButtonFlaggedStyle = row.isFlagged ? 'text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold [&>svg]:stroke-[2.5]' : ''

                  return (
                    <>
                      <tr
                        key={rowId}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        {expandableContent && (
                          <td className="p-4 align-middle">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(rowId)}
                              className={rowButtonFlaggedStyle}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        )}
                        {columns.map((column) => (
                          <td key={column.key} className={`p-4 align-middle ${column.className || ''}`}>
                            {renderCellContent(column, row[column.key], row)}
                          </td>
                        ))}
                      </tr>

                      {expandableContent && isExpanded && (
                        <tr>
                          <td colSpan={columns.length + 1} className="p-0">
                            <div className="bg-muted/50 p-4 border-t">
                              {expandableContent(row)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <div>
            Showing {sortedData.length} of {data.length} entries
            {Object.keys(selectedFilters).length > 0 && (
              <span> (filtered)</span>
            )}
          </div>
          <div className="flex gap-2">
            {Object.entries(selectedFilters).map(([key, value]) =>
              value && (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSelectedFilters(prev => ({ ...prev, [key]: '' }))}
                  >
                    ×
                  </Button>
                </Badge>
              )
            )}
          </div>
        </div>
      </CardContent>

      {/* View Details Dialog */}
      {selectedRow && (
        <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>View Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected item
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {columns
                .filter(col => col.type !== 'actions')
                .map((column) => (
                  <div key={column.key} className="grid grid-cols-2 gap-4">
                    <Label className="text-right">{column.label}:</Label>
                    <div>{renderCellContent(column, selectedRow[column.key], selectedRow)}</div>
                  </div>
                ))}
              {expandableContent && (
                <div className="col-span-2 border-t pt-4 mt-2">
                  {expandableContent(selectedRow)}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedRow && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Modify the details of the selected item
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(80vh-12rem)] pr-6">
              <div className="grid gap-4 py-4">
                {columns
                  .filter(col => col.type !== 'actions')
                  .map((column) => (
                    <div key={column.key}>
                      {renderEditField(column)}
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}