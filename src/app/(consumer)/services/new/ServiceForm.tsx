"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, Shield, Tag } from "lucide-react"
import { createServiceAction } from "./actions"

const serviceSchema = z.object({
    name: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    priceInNaira: z.number().int().min(1000, "Minimum price is $1,000"),
    categoryId: z.string().optional(),
    imageUrl: z.string().url("Must be a valid URL").or(z.string().startsWith("/")),
    reputationCriteria: z.object({
        minEthosScore: z.number().int().min(0).max(2500).optional(),
        minPositiveReviewPercent: z.number().int().min(0).max(100).optional(),
        minVouchCount: z.number().int().min(0).optional(),
    }),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
    categories: { id: string; name: string }[]
}

export function ServiceForm({ categories }: ServiceFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: "",
            description: "",
            priceInNaira: 5000,
            categoryId: "",
            imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
            reputationCriteria: {
                minEthosScore: undefined,
                minPositiveReviewPercent: undefined,
                minVouchCount: undefined,
            },
        },
    })

    const onSubmit = (data: ServiceFormData) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("name", data.name)
            formData.append("description", data.description)
            formData.append("priceInNaira", data.priceInNaira.toString())
            formData.append("imageUrl", data.imageUrl)
            if (data.categoryId) formData.append("categoryId", data.categoryId)
            if (data.reputationCriteria.minEthosScore) {
                formData.append("minEthosScore", data.reputationCriteria.minEthosScore.toString())
            }
            if (data.reputationCriteria.minPositiveReviewPercent) {
                formData.append("minPositiveReviewPercent", data.reputationCriteria.minPositiveReviewPercent.toString())
            }
            if (data.reputationCriteria.minVouchCount) {
                formData.append("minVouchCount", data.reputationCriteria.minVouchCount.toString())
            }

            const result = await createServiceAction(formData)

            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success("Service listed successfully!")
                router.push("/")
                router.refresh()
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-600" />
                            Service Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Smart Contract Security Audit"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your service in detail. What do you deliver? What's your process? What makes you unique?"
                                            rows={5}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Image URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Pricing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="priceInNaira"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Starting Price ($)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1000}
                                            step={500}
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-gray-500 mt-1">
                                        This is your base rate. You can discuss custom pricing with clients.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Reputation Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-600" />
                            Client Requirements
                            <span className="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Set minimum reputation requirements for clients who want to hire you. Leave empty for no requirements.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="reputationCriteria.minEthosScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Min Ethos Score</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 1200"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reputationCriteria.minPositiveReviewPercent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Min Positive Reviews %</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 80"
                                                min={0}
                                                max={100}
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reputationCriteria.minVouchCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Min Vouch Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 3"
                                                min={0}
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 min-w-32"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            "Publish Service"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
