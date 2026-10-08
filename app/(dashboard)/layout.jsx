import { Sidebar } from "../../components/layout/Sidebar"
import { Topbar } from "../../components/layout/Topbar"

import { VerificationBanner } from "../../components/layout/VerificationBanner"

export default function DashboardLayout({ children }) {
  return (
    <div className="h-full bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar />
        <VerificationBanner />
        <main className="flex-1">
          <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
