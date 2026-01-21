import { PageHeader } from "@/components/PageHeader"
import { getCurrentUser } from "@/services/privy"
import { redirect } from "next/navigation"
import { Briefcase } from "lucide-react"

export default async function JobsPage() {
  const { userId } = await getCurrentUser()
  if (!userId) redirect("/")

  return (
    <div className="container my-6">
      <PageHeader title="Jobs" />
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="w-10 h-10 text-[#2563EB]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Jobs Coming Soon
        </h2>
        <p className="text-gray-600 max-w-md">
          Post jobs, browse opportunities, and manage your active gigs all in one place.
        </p>
      </div>
    </div>
  )
}
