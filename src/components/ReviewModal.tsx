"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { submitReview } from "@/features/reviews/actions/reviews"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    gigId: string
}

export function ReviewModal({ isOpen, onClose, gigId }: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        setIsSubmitting(true)
        try {
            const result = await submitReview({
                gigId,
                rating,
                comment
            })

            if (result.success) {
                toast.success("Review submitted! Reputation updated.")
                onClose()
                router.refresh()
            } else {
                toast.error(result.message)
            }
        } catch {
            toast.error("Failed to submit review")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogDescription>
                        Rate your experience to help build the Ethos reputation network.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-6 gap-6">
                    {/* Star Rating */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 ${star <= rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300 hover:text-yellow-200"
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Comment Area */}
                    <div className="w-full space-y-2">
                        <label className="text-sm font-medium text-gray-700">Comment (Optional)</label>
                        <Textarea
                            placeholder="How was your experience working on this deal?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Skip
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
