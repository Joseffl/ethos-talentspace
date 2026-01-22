"use client"

import { Button } from "@/components/ui/button"
import { submitWork, confirmGigCompletion } from "@/features/dashboard/actions/deals"
import { fundGig } from "@/features/dashboard/actions/payments"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2, Star, DollarSign, Wallet, Clock, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { ReviewModal } from "@/components/ReviewModal"
import { GigStatus } from "@/drizzle/schema/gig"

interface DealActionsProps {
    gigId: string
    status: GigStatus
    isFunded: boolean
    isClient: boolean
}

export function DealActions({ gigId, status, isFunded, isClient }: DealActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)

    // Talent Action: Submit Work
    const handleSubmitWork = async () => {
        setIsLoading(true)
        try {
            const res = await submitWork(gigId)
            if (res.success) {
                toast.success("Work submitted! Waiting for client confirmation.")
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

    // Client Action: Confirm Completion
    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            const res = await confirmGigCompletion(gigId)
            if (res.success) {
                toast.success("Deal completed and funds released!")
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

    // 1. Completed State
    if (status === "completed") {
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

    // 2. Active Deal Actions
    return (
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            {/* Escrow Status (Always Visible) */}
            {isFunded ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium">
                    <Wallet className="w-4 h-4" />
                    Escrow Funded
                </div>
            ) : isClient ? (
                <Button
                    onClick={handleFund}
                    disabled={isLoading || status !== "in_progress"} // Can only fund if not completed/submitted strictly speaking, but usually done early
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

            {/* Workflow Actions */}
            {status === "in_progress" && (
                isClient ? (
                    <Button disabled variant="secondary" className="bg-gray-100 text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        Work in Progress
                    </Button>
                ) : (
                    // Talent
                    <Button
                        onClick={handleSubmitWork}
                        disabled={isLoading}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Briefcase className="w-4 h-4 mr-2" />}
                        Submit Work
                    </Button>
                )
            )}

            {status === "submitted" && (
                isClient ? (
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                        Confirm & Release Funds
                    </Button>
                ) : (
                    // Talent
                    <Button disabled variant="outline" className="opacity-100 bg-blue-50 text-blue-700 border-blue-200">
                        <Clock className="w-4 h-4 mr-2" />
                        Pending Confirmation
                    </Button>
                )
            )}

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                gigId={gigId}
            />
        </div>
    )
}

function Briefcase(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}