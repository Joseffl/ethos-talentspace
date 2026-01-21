import { getGigApplications } from "./actions"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User, ExternalLink, Calendar, DollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/formatters"
import { ApplicationActions } from "./ApplicationActions"

interface ManagePageProps {
    params: Promise<{ id: string }>
}

export default async function ManageGigPage({ params }: ManagePageProps) {
    const { id } = await params
    const data = await getGigApplications(id)

    if (!data) {
        redirect("/")
    }

    const { gig, applications } = data

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Applications</h1>
                        <h2 className="text-xl text-blue-600 font-semibold">{gig.title}</h2>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={`/gigs/${gig.id}`}>View Gig</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Applicants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{applications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg. Bid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {applications.length > 0
                                ? formatPrice(applications.reduce((acc, app) => acc + (app.proposedBudget || gig.budgetMin), 0) / applications.length)
                                : "-"
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Gig Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant={gig.status === "open" ? "default" : "secondary"} className="text-lg px-3 uppercase">
                            {gig.status.replace("_", " ")}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Applications List */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Applicants</h3>

                {applications.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900">No applicants yet</h4>
                        <p className="text-gray-500">Wait for talent to discover your gig and apply.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {applications.map((app) => (
                            <Card key={app.id}>
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                                <AvatarImage src={app.applicant.imageUrl || undefined} />
                                                <AvatarFallback>{app.applicant.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-lg">{app.applicant.name}</h4>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Applied {app.createdAt.toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">Proposed Budget</div>
                                                <div className="font-bold text-xl text-green-600">
                                                    {app.proposedBudget ? formatPrice(app.proposedBudget) : formatPrice(gig.budgetMin)}
                                                </div>
                                            </div>
                                            <div className="w-px h-10 bg-gray-200 hidden md:block" />
                                            <ApplicationActions
                                                applicationId={app.id}
                                                isAccepted={app.status === "accepted"}
                                                isRejected={app.status === "rejected"}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Cover Letter</h5>
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {app.coverLetter}
                                            </p>
                                        </div>

                                        {app.portfolioLinks && app.portfolioLinks.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Portfolio</h5>
                                                <div className="flex flex-wrap gap-3">
                                                    {app.portfolioLinks.map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors text-sm"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            {new URL(link).hostname}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div >
    )
}
