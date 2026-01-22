"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Star, ShieldCheck, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

export function ExploreFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [minEthosScore, setMinEthosScore] = useState(
        Number(searchParams.get("minEthosScore")) || 0
    )
    const [minRating, setMinRating] = useState(
        Number(searchParams.get("minRating")) || 0
    )

    // Sync state with URL params
    useEffect(() => {
        setMinEthosScore(Number(searchParams.get("minEthosScore")) || 0)
        setMinRating(Number(searchParams.get("minRating")) || 0)
    }, [searchParams])

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (minEthosScore > 0) {
            params.set("minEthosScore", minEthosScore.toString())
        } else {
            params.delete("minEthosScore")
        }

        if (minRating > 0) {
            params.set("minRating", minRating.toString())
        } else {
            params.delete("minRating")
        }

        router.push(`/explore?${params.toString()}`)
    }

    const clearFilters = () => {
        setMinEthosScore(0)
        setMinRating(0)
        router.push("/explore")
    }

    const hasFilters = minEthosScore > 0 || minRating > 0

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-8 sticky top-24">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-gray-500 hover:text-gray-900">
                        <X className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Ethos Score Filter */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        Min Ethos Score
                    </label>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {minEthosScore}+
                    </Badge>
                </div>
                <Slider
                    value={[minEthosScore]}
                    min={0}
                    max={5000} // Assuming a max score for now
                    step={100}
                    onValueChange={(val: number[]) => setMinEthosScore(val[0] ?? 0)}
                    className="py-4"
                />
            </div>

            {/* Rating Filter */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Min Rating
                </label>
                <div className="flex flex-wrap gap-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1
                                ${minRating === rating
                                    ? "bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-500 ring-offset-1"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {rating}+
                            <Star className={`w-3 h-3 ${minRating === rating ? "fill-current" : ""}`} />
                        </button>
                    ))}
                </div>
            </div>

            <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700">
                Apply Filters
            </Button>
        </div>
    )
}
