import { SidebarNav } from "./SidebarNav"

export function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
        <div className="flex flex-shrink-0 items-center px-4">
          <span className="text-xl font-bold tracking-tight text-blue-600">JobOS</span>
        </div>
        <div className="mt-8 flex flex-1 flex-col">
          <SidebarNav />
        </div>
      </div>
    </div>
  )
}
