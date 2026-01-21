import { notFound, redirect } from "next/navigation"
import { getGigForApplication } from "./actions"
import { GigApplicationForm } from "./GigApplicationForm"
import { getCurrentUser } from "@/services/privy"

interface ApplyPageProps {
    params: Promise<{ id: string }>
}

export default async function ApplyPage({ params }: ApplyPageProps) {
    const { id } = await params
    const { userId } = await getCurrentUser()

    if (!userId) {
        redirect(`/login?redirect=/gigs/${id}/apply`)
    }

    const gig = await getGigForApplication(id)

    if (!gig) {
        notFound()
    }

    if (gig.status !== "open") {
        redirect(`/gigs/${id}`)
    }

    if (gig.clientId === userId) {
        redirect(`/gigs/${id}`)
    }

    return (
        <div className="container py-8">
            <GigApplicationForm
                gig={{
                    id: gig.id,
                    title: gig.title,
                    description: gig.description,
                    budgetMin: gig.budgetMin,
                    budgetMax: gig.budgetMax,
                    skillTags: gig.skillTags,
                }}
            />
        </div>
    )
}
