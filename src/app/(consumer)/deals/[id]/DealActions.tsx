"use client"

import { Button } from "@/components/ui/button"
import { markGigAsCompleted } from "@/features/dashboard/actions/deals"
import { fundGig } from "@/features/dashboard/actions/payments"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2, Star, DollarSign, Wallet } from "lucide-react"
import { useState } from "react"
import { ReviewModal } from "@/components/ReviewModal"

interface DealActionsProps {
    gigId: string
    isCompleted: boolean
    isFunded: boolean
    isClient: boolean
}

export function DealActions({ gigId, isCompleted, isFunded, isClient }: DealActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            const res = await markGigAsCompleted(gigId)
            if (res.success) {
                toast.success("Gig marked as done!")
                setShowReviewModal(true)
                router.refresh()
            } else {
                toast.error(res.message)
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFund = async () => {
        setIsLoading(true)
        try {
            const res = await fundGig(gigId)
            if (res.success) {
                toast.success("Escrow funded! Funds are now locked.")
                router.refresh()
            } else {
                toast.error(res.message)
            }
        } catch {
            toast.error("Funding failed")
        } finally {
            setIsLoading(false)
        }
    }

    if (isCompleted) {
        return (
            <>
                <div className="flex gap-2">
                    <Button disabled variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 opacity-100 cursor-default">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                    </Button>
                    <Button variant="outline" onClick={() => setShowReviewModal(true)}>
                        <Star className="w-4 h-4 mr-2" />
                        Leave Review
                    </Button>
                </div>
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    gigId={gigId}
                />
            </>
        )
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            {/* Funding Status / Action */}
            {isFunded ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium">
                    <Wallet className="w-4 h-4" />
                    Escrow Funded
                </div>
            ) : isClient ? (
                <Button
                    onClick={handleFund}
                    disabled={isLoading}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
                    Fund Escrow
                </Button>
            ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 text-sm font-medium">
                    <DollarSign className="w-4 h-4" />
                    Awaiting Funding
                </div>
            )}

            <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Mark as Done
            </Button>

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                gigId={gigId}
            />
        </div>
    )
}