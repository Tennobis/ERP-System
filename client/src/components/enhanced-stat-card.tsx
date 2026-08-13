
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { LucideIcon, Info, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface EnhancedStatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    data?: Array<{ value: number }>
  }
  threshold?: {
    status: 'good' | 'warning' | 'critical'
    message: string
  }
  comparison?: {
    period: string
    value: string
    change: number
  }
  onClick?: () => void
  className?: string
}

export function EnhancedStatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  threshold,
  comparison,
  onClick,
  className
}: EnhancedStatCardProps) {
  const getThresholdColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getThresholdIcon = (status: string) => {
    switch (status) {
      case 'critical': return AlertTriangle
      case 'warning': return AlertTriangle
      default: return Info
    }
  }

  return (
    <TooltipProvider>
      <Card className={`hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${className}`} onClick={onClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {threshold && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    {(() => {
                      const ThresholdIcon = getThresholdIcon(threshold.status)
                      return <ThresholdIcon className={`h-3 w-3 ${getThresholdColor(threshold.status)}`} />
                    })()}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{threshold.message}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          
          <div className="mt-3 space-y-2">
            {trend && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  {trend.value > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={trend.value > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
                {trend.data && (
                  <div className="h-8 w-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend.data}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={trend.value > 0 ? "#10b981" : "#ef4444"} 
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
            
            {comparison && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{comparison.period}:</span>
                <div className="flex items-center gap-1">
                  <span>{comparison.value}</span>
                  <Badge variant={comparison.change > 0 ? "default" : "destructive"} className="text-xs">
                    {comparison.change > 0 ? '+' : ''}{comparison.change}%
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
