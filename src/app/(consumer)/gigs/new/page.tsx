import { PageHeader } from "@/components/PageHeader"
import { getCurrentUser } from "@/services/privy"
import { redirect } from "next/navigation"
import { GigForm } from "./GigForm"

export default async function NewGigPage() {
    const { userId } = await getCurrentUser()
    if (!userId) redirect("/")

    return (
        <div className="container my-6 max-w-3xl">
            <PageHeader title="Post a Gig" />
            <p className="text-gray-500 mb-8">
                Describe the work you need done. Be specific about your requirements, budget, and timeline.
            </p>
            <GigForm />
        </div>
    )
}
