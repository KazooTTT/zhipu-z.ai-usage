"use client"

import useSWR from "swr"
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuotaLimit {
  type: string
  percentage: number
  remaining?: string
  current?: number
  currentUsage?: number
  limit?: number
  usageDetails?: string
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

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return "N/A"
  return num.toLocaleString()
}

export function QuotaTable() {
  const { data, error, isLoading, mutate } = useSWR<QuotaResponse>(
    "/api/quota",
    fetcher,
    {
      refreshInterval: 60000, // 每分钟自动刷新
      revalidateOnFocus: true,
    }
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">AI 使用配额</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">服务商</TableHead>
                <TableHead className="w-[180px]">类型</TableHead>
                <TableHead className="w-[200px]">使用进度</TableHead>
                <TableHead className="w-[100px]">剩余</TableHead>
                <TableHead>当前 / 限额</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotaData.map((providerData) =>
                providerData.limits.length > 0 ? (
                  providerData.limits.map((limit, index) => (
                    <TableRow key={`${providerData.provider}-${index}`}>
                      {index === 0 && (
                        <TableCell
                          rowSpan={providerData.limits.length}
                          className="font-medium"
                        >
                          {providerData.provider}
                        </TableCell>
                      )}
                      <TableCell>{limit.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={limit.percentage}
                            className="h-2 w-24"
                          />
                          <span className="text-sm text-muted-foreground">
                            {limit.percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            limit.percentage > 80
                              ? "text-destructive font-medium"
                              : limit.percentage > 50
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-green-600 dark:text-green-400"
                          }
                        >
                          {limit.remaining || "N/A"}
                          {limit.remaining && ` (${100 - limit.percentage}%)`}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {limit.type.includes("Token") ? (
                          <>
                            {formatNumber(limit.current)} /{" "}
                            {formatNumber(limit.limit)} tokens
                          </>
                        ) : limit.type.includes("MCP") ? (
                          <>
                            {formatNumber(limit.currentUsage)} /{" "}
                            {formatNumber(limit.limit)} requests
                          </>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={providerData.provider}>
                    <TableCell className="font-medium">
                      {providerData.provider}
                    </TableCell>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      无配额数据
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
