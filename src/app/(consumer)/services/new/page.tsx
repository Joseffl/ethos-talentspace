import { PageHeader } from "@/components/PageHeader"
import { getCurrentUser } from "@/services/privy"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { ServiceForm } from "./ServiceForm"

export default async function NewServicePage() {
    const { userId } = await getCurrentUser()
    if (!userId) redirect("/")

    const categories = await db.query.CategoryTable.findMany({
        orderBy: (c, { asc }) => asc(c.name),
    })

    return (
        <div className="container my-6 max-w-3xl">
            <PageHeader title="List a New Service" />
            <p className="text-gray-500 mb-8">
                Describe the service you offer. Be specific about what you deliver and any requirements for clients.
            </p>
            <ServiceForm categories={categories} />
        </div>
    )
}
