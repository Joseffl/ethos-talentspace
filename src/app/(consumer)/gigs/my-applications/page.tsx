import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/formatters"
import { Calendar, Clock, DollarSign, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getMyApplications } from "./actions"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/privy"

export default async function MyApplicationsPage() {
    const { userId } = await getCurrentUser()

    if (!userId) {
        redirect("/login?redirect=/gigs/my-applications")
    }

    const applications = await getMyApplications()

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        accepted: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
        withdrawn: "bg-gray-100 text-gray-700",
    }

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                    <p className="text-gray-500 mt-1">Track the status of your gig proposals</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/explore">Browse More Gigs</Link>
                </Button>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        You haven&apos;t applied to any gigs yet based on your profile and skills.
                    </p>
                    <Button asChild>
                        <Link href="/explore">Find Gigs to Apply For</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden">
                            <CardHeader className="bg-gray-50/50 pb-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg">
                                                <Link href={`/gigs/${app.gig.id}`} className="hover:text-blue-600 hover:underline">
                                                    {app.gig.title}
                                                </Link>
                                            </h3>
                                            <Badge className={`${statusColors[app.status]} capitalize`}>
                                                {app.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Posted by <span className="font-medium text-gray-900">{app.gig.client.name}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 mb-1">Applied on</div>
                                        <div className="font-medium flex items-center justify-end gap-1.5 text-sm">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {app.createdAt.toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Your Cover Letter</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-3">
                                            {app.coverLetter}
                                        </p>
                                    </div>
                                    {app.portfolioLinks && app.portfolioLinks.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Portfolio Links</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {app.portfolioLinks.map((link, i) => (
                                                    <a
                                                        key={i}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded hover:bg-blue-100 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        {new URL(link).hostname}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded p-4 space-y-4 h-fit">
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1">Client&apos;s Budget</span>
                                        <span className="font-medium text-gray-900 text-sm">
                                            {app.gig.budgetMax && app.gig.budgetMax > app.gig.budgetMin
                                                ? `${formatPrice(app.gig.budgetMin)} - ${formatPrice(app.gig.budgetMax)}`
                                                : formatPrice(app.gig.budgetMin)
                                            }
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <span className="text-xs text-gray-500 block mb-1">Your Proposal</span>
                                        <div className="flex items-center gap-1.5 text-green-700 font-bold text-lg">
                                            <DollarSign className="w-4 h-4" />
                                            {app.proposedBudget ? formatPrice(app.proposedBudget).replace('$', '') : formatPrice(app.gig.budgetMin).replace('$', '')}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
