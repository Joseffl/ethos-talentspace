"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updateApplicationStatus } from "./actions"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ActionsProps {
    applicationId: string
    isAccepted?: boolean
    isRejected?: boolean
}

export function ApplicationActions({ applicationId, isAccepted, isRejected }: ActionsProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleUpdate = (status: "accepted" | "rejected") => {
        startTransition(async () => {
            const result = await updateApplicationStatus(applicationId, status)
            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success(result.message)
                router.refresh()
            }
        })
    }

    if (isAccepted) {
        return (
            <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                Accepted
            </div>
        )
    }

    if (isRejected) {
        return (
            <div className="flex items-center gap-2 text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-full text-sm">
                <XCircle className="w-4 h-4" />
                Rejected
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleUpdate("rejected")}
                disabled={isPending}
            >
                Reject
            </Button>
            <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdate("accepted")}
                disabled={isPending}
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
            </Button>
        </div>
    )
}
