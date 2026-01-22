import { getDealById } from "@/features/dashboard/db/deals"
import { getCurrentUser } from "@/services/privy"
import { notFound, redirect } from "next/navigation"
import { DealActions } from "./DealActions"
import Link from "next/link"
import { ArrowLeft, User, Calendar, ExternalLink, ShieldCheck, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/formatters"
import { EthosReputationCard } from "@/components/EthosReputationCard"
import { ChatInterface } from "@/components/ChatInterface"

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [deal, { userId }] = await Promise.all([
        getDealById(id),
        getCurrentUser()
    ])

    if (!deal) notFound()

    // Auth Check
    const isTalent = deal.applicantId === userId
    const isClient = deal.gig.clientId === userId

    if (!userId || (!isTalent && !isClient)) {
        redirect("/")
    }

    const { gig, applicant } = deal
    const isCompleted = gig.status === "completed"

    return (
        <div className="container py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Active Deal</h1>
                            <Badge variant={isCompleted ? "secondary" : "default"} className={isCompleted ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-blue-600 hover:bg-blue-700"}>
                                {isCompleted ? "Completed" : gig.status === "submitted" ? "Submitted" : "In Progress"}
                            </Badge>
                        </div>
                        <h2 className="text-xl text-gray-600 font-medium flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            {gig.title}
                        </h2>
                    </div>
                    <DealActions
                        gigId={gig.id}
                        status={gig.status}
                        isFunded={!!gig.isFunded}
                        isClient={isClient}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Gig Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {gig.description}
                            </p>

                            {gig.externalLinks && gig.externalLinks.length > 0 && (
                                <div className="pt-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Attachments & Links</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {gig.externalLinks.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {new URL(link).hostname}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Proposal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Agreed Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Budget</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatPrice(deal.proposedBudget || gig.budgetMin)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Timeline</div>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : "No deadline"}
                                    </div>
                                </div>
                            </div>
                            {deal.coverLetter && (
                                <div className="mt-6 pt-6 border-t">
                                    <div className="text-sm font-semibold text-gray-900 mb-2">Proposal Note</div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{deal.coverLetter}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Counterpart Profile */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {isClient ? "Talent" : "Client"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={(isClient ? applicant.imageUrl : gig.client.imageUrl) || undefined} />
                                    <AvatarFallback>
                                        {(isClient ? applicant.name : gig.client.name)?.slice(0, 2).toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-bold text-gray-900">
                                        {isClient ? applicant.name : gig.client.name}
                                    </div>
                                    {/* Link to profile if exists (omitted for now) */}
                                </div>
                            </div>
                            {/* Reputation Card for the OTHER party */}
                            {(isClient ? applicant.walletAddress : gig.client.walletAddress) && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-600">
                                        <ShieldCheck className="w-4 h-4" />
                                        Ethos Reputation
                                    </div>
                                    <EthosReputationCard
                                        address={(isClient ? applicant.walletAddress : gig.client.walletAddress)!}
                                        compact
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chat Interface */}
                    <ChatInterface dealId={deal.id} currentUserId={userId} />
                </div>
            </div>
        </div>
    )
}
