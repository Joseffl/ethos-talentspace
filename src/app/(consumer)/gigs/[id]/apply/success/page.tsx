import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Search } from "lucide-react"

interface SuccessPageProps {
    params: Promise<{ id: string }>
}

export default async function ApplicationSuccessPage({ params }: SuccessPageProps) {
    const { id } = await params

    return (
        <div className="container max-w-lg py-20 text-center">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
            <p className="text-gray-500 mb-8 text-lg">
                Your application has been successfully sent to the client. You&apos;ll be notified when they review your proposal.
            </p>

            <div className="space-y-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base">
                    <Link href={`/gigs/${id}`}>
                        Return to Gig Details
                    </Link>
                </Button>

                <Button asChild variant="outline" className="w-full h-11 text-base">
                    <Link href="/gigs/my-applications">
                        View My Applications
                    </Link>
                </Button>

                <Button asChild variant="ghost" className="w-full">
                    <Link href="/explore" className="gap-2">
                        <Search className="w-4 h-4" />
                        Browse More Gigs
                    </Link>
                </Button>
            </div>
        </div>
    )
}
