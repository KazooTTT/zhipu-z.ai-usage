"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface CircularProgressProps {
  percentage: number
  size?: number
  type?: string
  remaining?: string
  current?: number
  limit?: number
  currentUsage?: number
}

// 使用指定的配色方案来区分已使用和未使用部分
const USED_COLOR = "var(--primary)"; // 已使用部分使用主色调
const UNUSED_COLOR = "color-mix(in oklab, var(--primary) 20%, transparent)"; // 未使用部分使用主色调的20%混合透明

export function CircularProgress({
  percentage,
  size = 100,
  type,
  remaining,
  current,
  limit,
  currentUsage
}: CircularProgressProps) {
  const data = [
    { name: "Used", value: percentage, fill: USED_COLOR },
    { name: "Remaining", value: 100 - percentage, fill: UNUSED_COLOR },
  ]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <ResponsiveContainer width={size} height={size}>
          <PieChart animationDuration={0}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={(size - 20) / 2 * 0.6}
              outerRadius={(size - 20) / 2}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              animationDuration={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip animationDuration={0} />
          </PieChart>
        </ResponsiveContainer>
        {/* 中心文本显示百分比 */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {percentage}%
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {current !== undefined && limit !== undefined
          ? `${current} / ${limit}`
          : currentUsage !== undefined && limit !== undefined
          ? `${currentUsage} / ${limit}`
          : "N/A"}
      </div>
    </div>
  )
}