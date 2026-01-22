import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/formatters"
import { User, Briefcase, Clock, CheckCircle, Send } from "lucide-react"
import Link from "next/link"

interface DealCardProps {
    role: "talent" | "client"
    deal: any // Using specific type would be better but keeping simple for now
}

function getStatusConfig(status: string) {
    switch (status) {
        case "completed":
            return { label: "Completed", className: "bg-green-100 text-green-800", icon: CheckCircle }
        case "submitted":
            return { label: "Submitted", className: "bg-amber-100 text-amber-800", icon: Send }
        case "in_progress":
        default:
            return { label: "In Progress", className: "bg-blue-100 text-blue-800", icon: Clock }
    }
}

export function DealCard({ role, deal }: DealCardProps) {
    const isClient = role === "client"

    // If I am the client, I want to see the applicant's info
    // If I am the talent, I want to see the client/gig info
    const counterpartName = isClient ? deal.applicant.name : deal.gig.client.name
    const counterpartImage = isClient ? deal.applicant.imageUrl : deal.gig.client.imageUrl
    const title = deal.gig.title
    const amount = deal.proposedBudget || deal.gig.budgetMin
    const date = new Date(deal.updatedAt).toLocaleDateString()
    const status = deal.gig.status
    const statusConfig = getStatusConfig(status)
    const StatusIcon = statusConfig.icon

    return (
        <Card className={status === "submitted" && isClient ? "border-amber-200 bg-amber-50/30" : ""}>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                            {counterpartImage ? (
                                <img src={counterpartImage} alt={counterpartName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg">{title}</h3>
                                <Badge variant="secondary" className={statusConfig.className}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                </Badge>
                                {status === "submitted" && isClient && (
                                    <Badge className="bg-amber-500 text-white animate-pulse">
                                        Action Needed
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                {isClient ? "Hired" : "Working for"} <span className="font-medium text-gray-900">{counterpartName}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-0 pt-4 md:pt-0">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Value</p>
                            <p className="font-bold text-lg text-green-700">{formatPrice(amount)}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Started</p>
                            <p className="text-sm font-medium">{date}</p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={`/deals/${deal.id}`}>
                                <Briefcase className="w-4 h-4 mr-2" />
                                View Deal
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
