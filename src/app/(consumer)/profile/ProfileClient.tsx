"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EthosReputationCard } from "@/components/EthosReputationCard"
import { updateProfileAction } from "@/features/users/actions/users"
import {
    User,
    Wallet,
    Mail,
    Twitter,
    ExternalLink,
    Check,
    Loader2,
    LinkIcon,
    Unlink,
    Briefcase,
    Star,
    TrendingUp,
    Calendar,
    Edit3,
    ShieldCheck
} from "lucide-react"
import { toast } from "sonner"

interface ProfileData {
    name?: string
    bio?: string
    imageUrl?: string
    averageRating?: number
    reviewCount?: number
    memberSince?: Date
    twitter?: {
        id: string
        username: string
        name: string
        image?: string
    }
    stats?: {
        gigsPosted: number
        dealsCompletedAsClient: number
        dealsCompletedAsTalent: number
        activeDeals: number
    }
}

export function ProfileClient({ initialData }: { initialData: ProfileData }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const {
        isLoading,
        isAuthenticated,
        walletAddress,
        email,
        hasWallet,
        hasEmail,
        linkWallet,
        login,
    } = useAuth()

    const [name, setName] = useState(initialData.name || "")
    const [bio, setBio] = useState(initialData.bio || "")
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isLinkingWallet, setIsLinkingWallet] = useState(false)
    const [isDisconnectingTwitter, setIsDisconnectingTwitter] = useState(false)

    // Handle Twitter OAuth callback messages
    useEffect(() => {
        const twitterConnected = searchParams.get("twitter_connected")
        const twitterError = searchParams.get("twitter_error")

        if (twitterConnected === "true") {
            toast.success("Twitter connected successfully!")
            // Clean up URL
            router.replace("/profile")
        } else if (twitterError) {
            const errorMessages: Record<string, string> = {
                missing_params: "Twitter connection failed - missing parameters",
                no_state: "Twitter connection failed - session expired",
                invalid_state: "Twitter connection failed - invalid session",
                token_error: "Twitter connection failed - token exchange error",
                user_info_error: "Twitter connection failed - couldn't fetch user info",
                callback_error: "Twitter connection failed - please try again",
            }
            toast.error(errorMessages[twitterError] || "Twitter connection failed")
            router.replace("/profile")
        }
    }, [searchParams, router])

    useEffect(() => {
        if (initialData.name) setName(initialData.name)
        if (initialData.bio) setBio(initialData.bio)
    }, [initialData])

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            toast.error("Name is required")
            return
        }

        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append("name", name.trim())
            formData.append("bio", bio.trim())

            const result = await updateProfileAction(formData)

            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success("Profile updated!")
                setIsEditing(false)
                router.refresh()
            }
        } catch {
            toast.error("Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleLinkWallet = async () => {
        setIsLinkingWallet(true)
        try {
            await linkWallet()
            toast.success("Wallet linked!")
            router.refresh()
        } catch {
            // User cancelled or error
        } finally {
            setIsLinkingWallet(false)
        }
    }

    const handleConnectTwitter = () => {
        // Redirect to Twitter OAuth flow
        window.location.href = "/api/auth/twitter"
    }

    const handleDisconnectTwitter = async () => {
        setIsDisconnectingTwitter(true)
        try {
            const response = await fetch("/api/auth/twitter/disconnect", {
                method: "POST",
            })

            if (response.ok) {
                toast.success("Twitter disconnected")
                router.refresh()
            } else {
                toast.error("Failed to disconnect Twitter")
            }
        } catch {
            toast.error("Failed to disconnect Twitter")
        } finally {
            setIsDisconnectingTwitter(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-6">
                    <User className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign in to view your profile</h2>
                <p className="text-gray-600 mb-6">
                    Connect your wallet or sign in to set up and manage your profile.
                </p>
                <Button onClick={login} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                </Button>
            </div>
        )
    }

    // Use Twitter image from database if available
    const imageUrl = initialData.twitter?.image || initialData.imageUrl
    const totalDealsCompleted = (initialData.stats?.dealsCompletedAsClient || 0) + (initialData.stats?.dealsCompletedAsTalent || 0)
    const hasTwitter = !!initialData.twitter

    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="overflow-hidden">
                <div className="bg-white h-18" />
                <CardContent className="relative pt-0 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-12">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg shrink-0">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                                {imageUrl ? (
                                    <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <User className="w-10 h-10 text-blue-600" />
                                )}
                            </div>
                        </div>

                        {/* Name & Bio */}
                        <div className="flex-1 pt-2 sm:pt-6">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Your display name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="font-semibold text-lg"
                                    />
                                    <Textarea
                                        placeholder="Write a short bio about yourself..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="resize-none"
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving || !name.trim()}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                            Save
                                        </Button>
                                        <Button variant="outline" onClick={() => {
                                            setIsEditing(false)
                                            setName(initialData.name || "")
                                            setBio(initialData.bio || "")
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold text-gray-900">{name || "Set your name"}</h2>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                            title="Edit profile"
                                        >
                                            <Edit3 className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                    <p className="text-gray-600 mt-1">
                                        {bio || <span className="italic text-gray-400">No bio yet. Click edit to add one.</span>}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 sm:gap-6 pt-2 sm:pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{totalDealsCompleted}</div>
                                <div className="text-xs text-gray-500">Deals Done</div>
                            </div>
                            {(initialData.averageRating || 0) > 0 && (
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                                        {initialData.averageRating?.toFixed(1)}
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div className="text-xs text-gray-500">{initialData.reviewCount} reviews</div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Stats Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Activity Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">{initialData.stats?.gigsPosted || 0}</div>
                                <div className="text-xs text-gray-600">Gigs Posted</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">{initialData.stats?.dealsCompletedAsTalent || 0}</div>
                                <div className="text-xs text-gray-600">Jobs Completed</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-4 text-center">
                                <TrendingUp className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900">{initialData.stats?.activeDeals || 0}</div>
                                <div className="text-xs text-gray-600">Active Deals</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                <div className="text-sm font-bold text-gray-900">
                                    {initialData.memberSince
                                        ? new Date(initialData.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                        : "New"
                                    }
                                </div>
                                <div className="text-xs text-gray-600">Member Since</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ethos Reputation Card */}
                <div>
                    {hasWallet && walletAddress ? (
                        <EthosReputationCard address={walletAddress} />
                    ) : (
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    Ethos Reputation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full mb-4">
                                    <Wallet className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Unlock Reputation Features
                                </h3>
                                <p className="text-sm text-gray-500 text-center max-w-xs mb-4">
                                    Connect your wallet to see your on-chain reputation from Ethos Network.
                                </p>
                                <Button
                                    onClick={handleLinkWallet}
                                    disabled={isLinkingWallet}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLinkingWallet ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Wallet className="w-4 h-4 mr-2" />
                                    )}
                                    Connect Wallet
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Connected Accounts Card */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-gray-600" />
                        Connected Accounts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {/* Email */}
                        {hasEmail && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Mail className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-400 font-medium">Email</div>
                                    <div className="text-sm font-medium text-gray-700 truncate">{email}</div>
                                </div>
                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                            </div>
                        )}

                        {/* Wallet */}
                        {hasWallet ? (
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <Wallet className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-green-600 font-medium">Wallet</div>
                                    <div className="text-sm font-medium text-gray-700 font-mono truncate">
                                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                                    </div>
                                </div>
                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                            </div>
                        ) : (
                            <button
                                onClick={handleLinkWallet}
                                disabled={isLinkingWallet}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                            >
                                <div className="bg-gray-100 p-2 rounded-full">
                                    {isLinkingWallet ? (
                                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                    ) : (
                                        <Wallet className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-gray-700">Connect Wallet</div>
                                    <div className="text-xs text-gray-400">Enable reputation</div>
                                </div>
                                <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            </button>
                        )}

                        {/* Twitter - Using direct OAuth */}
                        {hasTwitter ? (
                            <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl border border-sky-200">
                                <div className="bg-sky-100 p-2 rounded-full overflow-hidden">
                                    {initialData.twitter?.image ? (
                                        <img
                                            src={initialData.twitter.image}
                                            alt={initialData.twitter.name}
                                            className="w-5 h-5 rounded-full object-cover"
                                        />
                                    ) : (
                                        <Twitter className="w-5 h-5 text-sky-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-sky-600 font-medium">Twitter</div>
                                    <div className="text-sm font-medium text-gray-700 truncate">
                                        @{initialData.twitter?.username}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <a
                                        href={`https://twitter.com/${initialData.twitter?.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-sky-100 rounded-full transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-sky-600" />
                                    </a>
                                    <button
                                        onClick={handleDisconnectTwitter}
                                        disabled={isDisconnectingTwitter}
                                        className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                                    >
                                        {isDisconnectingTwitter ? (
                                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                        ) : (
                                            <Unlink className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnectTwitter}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-sky-300 hover:bg-sky-50/50 transition-colors"
                            >
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Twitter className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-gray-700">Connect Twitter</div>
                                    <div className="text-xs text-gray-400">Show your identity</div>
                                </div>
                                <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
