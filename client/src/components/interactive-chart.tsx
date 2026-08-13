import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart 
} from 'recharts'
import { Download, Filter, ZoomIn, TrendingUp, ArrowUpDown } from "lucide-react"
import { useState } from "react"

interface InteractiveChartProps {
  title: string
  description?: string
  data: any[]
  type: 'line' | 'bar' | 'area' | 'pie'
  dataKey: string
  xAxisKey?: string
  secondaryDataKey?: string
  colors?: string[]
  timeRanges?: string[]
  filters?: Array<{ key: string; label: string; options: string[] }>
  onDrillDown?: (data: any) => void
  showComparison?: boolean
  showExport?: boolean
}

export function InteractiveChart({
  title,
  description,
  data,
  type,
  dataKey,
  xAxisKey,
  secondaryDataKey,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  timeRanges = ['7d', '30d', '90d', '1y'],
  filters,
  onDrillDown,
  showComparison = true,
  showExport = true
}: InteractiveChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [showComparisonData, setShowComparisonData] = useState(false)

  const handleExport = () => {
    console.log('Exporting chart data...')
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
              {entry.payload.trend && (
                <Badge variant={entry.payload.trend > 0 ? "default" : "destructive"} className="text-xs">
                  {entry.payload.trend > 0 ? '+' : ''}{entry.payload.trend}%
                </Badge>
              )}
              {showComparisonData && secondaryDataKey && entry.name === dataKey && (
                <span className="text-sm text-muted-foreground">
                  {entry.payload[secondaryDataKey] && (
                    <>
                      <ArrowUpDown className="inline h-3 w-3 mx-1" />
                      Diff: {((entry.value - entry.payload[secondaryDataKey]) / entry.payload[secondaryDataKey] * 100).toFixed(1)}%
                    </>
                  )}
                </span>
              )}
            </div>
          ))}
          {onDrillDown && (
            <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => onDrillDown(payload[0].payload)}>
              <ZoomIn className="h-3 w-3 mr-1" />
              Drill Down
            </Button>
          )}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              name={dataKey === 'revenue' ? 'Revenue' : dataKey}
              dataKey={dataKey} 
              stroke={colors[0]} 
              strokeWidth={2} 
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {secondaryDataKey && showComparisonData && (
              <Line 
                type="monotone" 
                name={secondaryDataKey === 'forecast' ? 'Forecast' : secondaryDataKey}
                dataKey={secondaryDataKey} 
                stroke={colors[1]} 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        )
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              name={dataKey === 'revenue' ? 'Revenue' : dataKey}
              dataKey={dataKey} 
              stroke={colors[0]} 
              fill={colors[0]} 
              fillOpacity={0.6} 
            />
            {secondaryDataKey && showComparisonData && (
              <Area 
                type="monotone" 
                name={secondaryDataKey === 'forecast' ? 'Forecast' : secondaryDataKey}
                dataKey={secondaryDataKey} 
                stroke={colors[1]} 
                fill={colors[1]} 
                fillOpacity={0.4}
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        )
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {xAxisKey && <XAxis dataKey={xAxisKey} />}
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              name={dataKey === 'revenue' ? 'Revenue' : dataKey}
              dataKey={dataKey} 
              fill={colors[0]} 
            />
            {secondaryDataKey && showComparisonData && (
              <Bar 
                name={secondaryDataKey === 'forecast' ? 'Forecast' : secondaryDataKey}
                dataKey={secondaryDataKey} 
                fill={colors[1]} 
              />
            )}
          </BarChart>
        )
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        )
      
      default:
        return null
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
          <div className="flex items-center gap-2">
            {showComparison && secondaryDataKey && (
              <Button
                variant={showComparisonData ? "default" : "outline"}
                size="sm"
                onClick={() => setShowComparisonData(!showComparisonData)}
                className="gap-1"
              >
                <TrendingUp className="h-4 w-4" />
                {showComparisonData ? 'Hide Comparison' : 'Show Comparison'}
              </Button>
            )}
            {/* {showExport && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )} */}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
                {filter.options.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
