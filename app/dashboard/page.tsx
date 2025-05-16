import type { Metadata } from "next"
import MVPDashboard from "@/components/mvp-dashboard"

export const metadata: Metadata = {
  title: "Sprinkles - Panel de Control de MVPs",
  description: "Gestiona y rastrea MVPs de Ragnarok Online",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Panel de Control de MVPs</h1>
      <MVPDashboard />
    </div>
  )
}
