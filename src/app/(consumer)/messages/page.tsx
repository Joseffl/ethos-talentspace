import { PageHeader } from "@/components/PageHeader"
import { getCurrentUser } from "@/services/privy"
import { redirect } from "next/navigation"
import { MessageSquare, User, ArrowRight } from "lucide-react"
import { getMyDeals } from "@/features/dashboard/db/deals"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function MessagesPage() {
  const { userId } = await getCurrentUser()
  if (!userId) redirect("/")

  const deals = await getMyDeals(userId)
  const allDeals = [...deals.asTalent, ...deals.asClient]

  if (allDeals.length === 0) {
    return (
      <div className="container my-6">
        <PageHeader title="Messages" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10 text-[#2563EB]" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Conversations Yet
          </h2>
          <p className="text-gray-600 max-w-md">
            When you have active deals, you can chat with your clients or talent here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-6 max-w-3xl">
      <PageHeader title="Messages" />
      <p className="text-gray-500 mb-6">
        Chat with your clients and talent. Click on a conversation to view the deal and send messages.
      </p>

      <div className="space-y-3">
        {allDeals.map((deal) => {
          const isTalent = deal.applicantId === userId
          const counterpart = isTalent ? deal.gig.client : deal.applicant
          const counterpartName = counterpart?.name || "Unknown"
          const counterpartImage = counterpart?.imageUrl

          return (
            <Link key={deal.id} href={`/deals/${deal.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                    {counterpartImage ? (
                      <img src={counterpartImage} alt={counterpartName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{counterpartName}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {isTalent ? "Client" : "Talent"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{deal.gig.title}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
