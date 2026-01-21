import { DashboardGrid } from "@/components/dashboard-grid"
import { Activity } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">实时监控</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            AI 使用配额限制
          </h1>
          <p className="text-muted-foreground">
            监控{" "}
            <a
              href="https://z.ai/manage-apikey/subscription"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              Z.ai
            </a>{" "}
            和{" "}
            <a
              href="https://bigmodel.cn/usercenter/glm-coding/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              Zhipu AI
            </a>{" "}
            的 API 使用情况
          </p>
        </header>

        <DashboardGrid />

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>数据每分钟自动刷新</p>
        </footer>
      </div>
    </main>
  )
}
