"use client"

import useSWR from "swr"
import { RefreshCw, AlertCircle, Loader2, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DashboardCard } from "@/components/dashboard-card"
import { useEffect, useState } from "react"

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

interface QuotaResponse {
  data: ProviderQuota[]
  error?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DashboardGrid() {
  const { data, error, isLoading, mutate } = useSWR<QuotaResponse>(
    "/api/quota",
    fetcher,
    {
      refreshInterval: 60000, // 每分钟自动刷新
      revalidateOnFocus: true,
    }
  )

  const [lastUpdated, setLastUpdated] = useState<string>("--")
  const [displayMode, setDisplayMode] = useState<"progress" | "circle">("progress")

  useEffect(() => {
    if (data || error) {
      setLastUpdated(new Date().toLocaleTimeString())
    }
  }, [data, error])

  const handleRefresh = () => {
    mutate()
    setLastUpdated(new Date().toLocaleTimeString())
  }

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === "progress" ? "circle" : "progress")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (error || data?.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>错误</AlertTitle>
        <AlertDescription>
          {data?.error || "获取配额信息失败，请检查 API 密钥配置。"}
        </AlertDescription>
      </Alert>
    )
  }

  const quotaData = data?.data || []

  if (quotaData.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>无数据</AlertTitle>
        <AlertDescription>
          未找到任何配额数据。请确保已配置 ZAI_API_KEY 或 ZHIPU_API_KEY 环境变量。
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDisplayMode}
          className="gap-2"
          aria-label={displayMode === "progress" ? "切换到圆形图表" : "切换到进度条"}
        >
          {displayMode === "progress" ? (
            <>
              <ToggleRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotaData.map((providerData) => (
          <DashboardCard
            key={providerData.provider}
            providerData={providerData}
            lastUpdated={lastUpdated}
            displayMode={displayMode}
          />
        ))}
      </div>
    </div>
  )
}