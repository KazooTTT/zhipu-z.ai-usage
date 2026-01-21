"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CircularProgress } from "@/components/circular-progress"

interface QuotaLimit {
  type: string
  percentage: number
  remaining?: string
  current?: number
  currentUsage?: number
  limit?: number
  usageDetails?: string
  refreshPeriod?: string
  resetTimeRemaining?: string
}

interface ProviderQuota {
  provider: string
  limits: QuotaLimit[]
}

interface DashboardCardProps {
  providerData: ProviderQuota
  lastUpdated: string
  displayMode: "progress" | "circle"
}

export function DashboardCard({ providerData, lastUpdated, displayMode }: DashboardCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // 触发页面级别的刷新逻辑
    window.location.reload()
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {providerData.provider}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayMode === "progress" ? (
          <div className="space-y-4">
            {providerData.limits.map((limit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{limit.type}</span>
                  <span className="text-muted-foreground">
                    {limit.percentage}% used
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full space-y-2">
                    <Progress value={limit.percentage} className="h-2 w-full" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        剩余: {limit.remaining || "N/A"}
                      </span>
                      <span className="text-muted-foreground">
                        {limit.current !== undefined && limit.limit !== undefined
                          ? `${limit.current} / ${limit.limit}`
                          : limit.currentUsage !== undefined && limit.limit !== undefined
                          ? `${limit.currentUsage} / ${limit.limit}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {providerData.limits.map((limit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-center text-sm">
                  <span className="font-medium">{limit.type}</span>
                </div>
                <div className="flex items-center justify-center">
                  <CircularProgress
                    percentage={limit.percentage}
                    size={80}
                    type={limit.type}
                    remaining={limit.remaining}
                    current={limit.current}
                    limit={limit.limit}
                    currentUsage={limit.currentUsage}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex flex-col items-center gap-1">
        <p className="text-xs text-muted-foreground">
          更新时间: {lastUpdated}
        </p>
        {providerData.limits.some(limit => limit.resetTimeRemaining) && (
          <p className="text-xs text-muted-foreground">
            刷新时间:{" "}
            {providerData.limits
              .map(limit => limit.resetTimeRemaining)
              .filter(Boolean)[0] || "N/A"}
          </p>
        )}
      </CardFooter>
    </Card>
  )
}