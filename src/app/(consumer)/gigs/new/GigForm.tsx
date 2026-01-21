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
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, Shield, Briefcase, Link as LinkIcon, Tag, Calendar, Plus, X } from "lucide-react"
import { createGigAction } from "./actions"

const gigSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    description: z.string().min(50, "Description must be at least 50 characters"),
    budgetMin: z.number().int().min(1000, "Minimum budget is $1,000"),
    budgetMax: z.number().int().min(0).optional(),
    deadline: z.string().optional(),
    externalLinks: z.array(z.object({ url: z.string().url("Must be a valid URL") })),
    skillTags: z.array(z.object({ tag: z.string().min(1) })),
    reputationCriteria: z.object({
        minEthosScore: z.number().int().min(0).max(2500).optional(),
        minPositiveReviewPercent: z.number().int().min(0).max(100).optional(),
        minVouchCount: z.number().int().min(0).optional(),
    }),
})

type GigFormData = z.infer<typeof gigSchema>

export function GigForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [newTag, setNewTag] = useState("")

    const form = useForm<GigFormData>({
        resolver: zodResolver(gigSchema),
        defaultValues: {
            title: "",
            description: "",
            budgetMin: 10000,
            budgetMax: undefined,
            deadline: "",
            externalLinks: [],
            skillTags: [],
            reputationCriteria: {
                minEthosScore: undefined,
                minPositiveReviewPercent: undefined,
                minVouchCount: undefined,
            },
        },
    })

    const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
        control: form.control,
        name: "externalLinks",
    })

    const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
        control: form.control,
        name: "skillTags",
    })

    const addTag = () => {
        if (newTag.trim()) {
            appendTag({ tag: newTag.trim() })
            setNewTag("")
        }
    }

    const onSubmit = (data: GigFormData) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("description", data.description)
            formData.append("budgetMin", data.budgetMin.toString())
            if (data.budgetMax) formData.append("budgetMax", data.budgetMax.toString())
            if (data.deadline) formData.append("deadline", data.deadline)

            const links = data.externalLinks.map(l => l.url)
            formData.append("externalLinks", JSON.stringify(links))

            const tags = data.skillTags.map(t => t.tag)
            formData.append("skillTags", JSON.stringify(tags))

            if (data.reputationCriteria.minEthosScore) {
                formData.append("minEthosScore", data.reputationCriteria.minEthosScore.toString())
            }
            if (data.reputationCriteria.minPositiveReviewPercent) {
                formData.append("minPositiveReviewPercent", data.reputationCriteria.minPositiveReviewPercent.toString())
            }
            if (data.reputationCriteria.minVouchCount) {
                formData.append("minVouchCount", data.reputationCriteria.minVouchCount.toString())
            }

            const result = await createGigAction(formData)

            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success("Gig posted successfully!")
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
                            <Briefcase className="w-5 h-5 text-green-600" />
                            Gig Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gig Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Need a Smart Contract Audit for my DEX"
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
                                            placeholder="Describe what you need in detail. What's the project? What are your requirements? What's the expected deliverable?"
                                            rows={6}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Budget & Deadline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Budget & Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="budgetMin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Budget ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1000}
                                                step={1000}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="budgetMax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Budget ($) <span className="text-gray-400 text-sm">(Optional)</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1000}
                                                step={1000}
                                                placeholder="Leave empty for fixed price"
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

                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Deadline <span className="text-gray-400 text-sm">(Optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* External Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-blue-600" />
                            External Links
                            <span className="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Add links to relevant resources like GitHub repos, Figma designs, documentation, etc.
                        </p>

                        {linkFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <FormField
                                    control={form.control}
                                    name={`externalLinks.${index}.url`}
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

                {/* Skill Tags */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-purple-600" />
                            Required Skills
                            <span className="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. Solidity, React, Auditing"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        addTag()
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" onClick={addTag}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {tagFields.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tagFields.map((field, index) => (
                                    <span
                                        key={field.id}
                                        className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {form.getValues(`skillTags.${index}.tag`)}
                                        <button type="button" onClick={() => removeTag(index)} className="hover:text-purple-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reputation Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-600" />
                            Applicant Requirements
                            <span className="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Set minimum Ethos reputation requirements for freelancers who want to apply.
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
                                Posting...
                            </>
                        ) : (
                            "Post Gig"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
