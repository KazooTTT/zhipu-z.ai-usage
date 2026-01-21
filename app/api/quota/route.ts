export const dynamic = "force-dynamic"

interface QuotaLimit {
  type: string
  percentage: number
  remaining?: string
  current?: number
  currentUsage?: number
  limit?: number
  usageDetails?: string
  order: number
  resetAt?: string
  resetTimeRemaining?: string
}

interface ProviderConfig {
  name: string
  apiKey: string | undefined
  baseUrl: string
}

interface ProviderQuota {
  provider: string
  limits: QuotaLimit[]
  error?: string
}

const calculateTimeRemaining = (resetTimestamp?: number): string | undefined => {
  if (!resetTimestamp) return undefined
  
  const now = Date.now()
  const remainingMs = resetTimestamp - now
  
  if (remainingMs <= 0) return undefined
  
  const hours = Math.floor(remainingMs / (1000 * 60 * 60))
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0 && minutes > 0) {
    return `${hours} hours ${minutes} minutes`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  } else {
    return `${minutes} minutes`
  }
}

const processQuotaLimit = (data: { limits?: QuotaLimit[] }) => {
  if (!data || !data.limits) return data

  data.limits = data.limits.map((item) => {
    const resetTimestamp = (item as { nextResetTime?: number }).nextResetTime

    if (item.type === "TOKENS_LIMIT") {
      return {
        type: "Token usage(5 Hour)",
        percentage: item.percentage,
        remaining: `${100 - item.percentage}%`,
        current: (item as { currentValue?: number }).currentValue,
        limit: (item as { usage?: number }).usage,
        resetAt: resetTimestamp ? new Date(resetTimestamp).toISOString() : undefined,
        resetTimeRemaining: calculateTimeRemaining(resetTimestamp),
        order: 1,
      }
    }
    if (item.type === "TIME_LIMIT") {
      const currentUsage = (item as { currentValue?: number }).currentValue || 0
      const limit = (item as { usage?: number }).usage || 0
      const remainingCount = Math.max(0, limit - currentUsage)
      const calculatedPercentage = limit > 0 ? Math.round((currentUsage / limit) * 100) : 0
      return {
        type: "MCP usage(1 Month)",
        percentage: calculatedPercentage,
        remaining: `${remainingCount} requests`,
        currentUsage,
        limit,
        usageDetails: (item as { usageDetails?: string }).usageDetails,
        resetAt: resetTimestamp ? new Date(resetTimestamp).toISOString() : undefined,
        resetTimeRemaining: calculateTimeRemaining(resetTimestamp),
        order: 2,
      }
    }
    return { ...item, order: 99 }
  })

  data.limits.sort((a, b) => a.order - b.order)
  return data
}

const queryQuota = async (provider: ProviderConfig): Promise<QuotaLimit[]> => {
  const path = "/api/monitor/usage/quota/limit"
  const url = `${provider.baseUrl}${path}`

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: provider.apiKey || "",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const json = await res.json()
    const processedData = json.data ? processQuotaLimit(json.data) : json

    return processedData.limits || []
  } catch (error) {
    console.error(`${provider.name} failed:`, error)
    return []
  }
}

export async function GET() {
  const CONFIG: ProviderConfig[] = [
    {
      name: "Z.ai",
      apiKey: process.env.ZAI_API_KEY,
      baseUrl: process.env.ZAI_BASE_URL || "https://api.z.ai",
    },
    {
      name: "Zhipu AI",
      apiKey: process.env.ZHIPU_API_KEY,
      baseUrl: process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn",
    },
  ].filter((config) => config.apiKey)

  if (CONFIG.length === 0) {
    return Response.json(
      {
        error: "No API keys configured. Please set ZAI_API_KEY or ZHIPU_API_KEY environment variables.",
        data: [],
      },
      { status: 400 }
    )
  }

  const results: ProviderQuota[] = await Promise.all(
    CONFIG.map(async (provider) => {
      const limits = await queryQuota(provider)
      return {
        provider: provider.name,
        limits,
      }
    })
  )

  return Response.json({ data: results })
}
