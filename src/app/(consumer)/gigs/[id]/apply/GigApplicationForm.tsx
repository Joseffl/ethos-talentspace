"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
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
    FormDescription,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, FileText, Link as LinkIcon, Plus, X, ArrowLeft, Send } from "lucide-react"
import { submitGigApplication } from "./actions"
import Link from "next/link"

const applicationSchema = z.object({
    coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
    proposedBudget: z.number().int().min(100).optional(),
    portfolioLinks: z.array(z.object({ url: z.string().url("Must be a valid URL") })),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface GigApplicationFormProps {
    gig: {
        id: string
        title: string
        budgetMin: number
        budgetMax?: number | null
        description: string
        skillTags?: string[] | null
    }
}

export function GigApplicationForm({ gig }: GigApplicationFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            coverLetter: "",
            proposedBudget: gig.budgetMin,
            portfolioLinks: [],
        },
    })

    const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
        control: form.control,
        name: "portfolioLinks",
    })

    const onSubmit = (data: ApplicationFormData) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("gigId", gig.id)
            formData.append("coverLetter", data.coverLetter)
            if (data.proposedBudget) {
                formData.append("proposedBudget", data.proposedBudget.toString())
            }

            const links = data.portfolioLinks.map(l => l.url)
            formData.append("portfolioLinks", JSON.stringify(links))

            const result = await submitGigApplication(formData)

            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success("Application submitted successfully!")
                router.push(`/gigs/${gig.id}/apply/success`)
                router.refresh()
            }
        })
    }

    const budgetDisplay = gig.budgetMax && gig.budgetMax > gig.budgetMin
        ? `$${gig.budgetMin.toLocaleString()} - $${gig.budgetMax.toLocaleString()}`
        : `$${gig.budgetMin.toLocaleString()}`

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/gigs/${gig.id}`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Gig
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for this Gig</h1>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h2 className="font-semibold text-blue-900 mb-1">{gig.title}</h2>
                    <p className="text-sm text-blue-700">Budget: {budgetDisplay}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Cover Letter */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Cover Letter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="coverLetter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormDescription className="mb-3">
                                            Explain why you&apos;re the best fit for this gig. Highlight relevant experience and how you&apos;ll approach the project.
                                        </FormDescription>
                                        <FormControl>
                                            <Textarea
                                                placeholder="I'm excited to apply for this gig because..."
                                                rows={8}
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Proposed Budget */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                Your Proposal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="proposedBudget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proposed Budget ($)</FormLabel>
                                        <FormDescription>
                                            The client&apos;s budget: {budgetDisplay}
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={100}
                                                step={100}
                                                placeholder="Enter your proposed budget"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Portfolio Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <LinkIcon className="w-5 h-5 text-purple-600" />
                                Portfolio & References
                                <span className="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Add links to relevant work, GitHub repos, or other references that showcase your skills.
                            </p>

                            {linkFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`portfolioLinks.${index}.url`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => appendLink({ url: "" })}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Link
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-4">
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
                            className="bg-blue-600 hover:bg-blue-700 min-w-40"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Application
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
