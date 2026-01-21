"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Unlink
} from "lucide-react"
import { toast } from "sonner"

export function ProfileClient({ initialName }: { initialName?: string }) {
    const router = useRouter()
    const {
        isLoading,
        isAuthenticated,
        walletAddress,
        email,
        hasWallet,
        hasEmail,
        hasTwitter,
        twitterUsername,
        twitterName,
        twitterSubject,
        linkWallet,
        linkTwitter,
        unlinkTwitter,
        login,
    } = useAuth()

    const [name, setName] = useState(initialName || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isLinkingWallet, setIsLinkingWallet] = useState(false)
    const [isLinkingTwitter, setIsLinkingTwitter] = useState(false)

    useEffect(() => {
        if (initialName) {
            setName(initialName)
        }
    }, [initialName])

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            toast.error("Name is required")
            return
        }

        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append("name", name.trim())

            const result = await updateProfileAction(formData)

            if (result.error) {
                toast.error(result.message)
            } else {
                toast.success("Profile updated!")
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

    const handleLinkTwitter = async () => {
        setIsLinkingTwitter(true)
        try {
            await linkTwitter()
            toast.success("Twitter connected!")
            router.refresh()
        } catch {
            // User cancelled or error
        } finally {
            setIsLinkingTwitter(false)
        }
    }

    const handleUnlinkTwitter = async () => {
        try {
            await unlinkTwitter(twitterSubject!)
            toast.success("Twitter disconnected")
            router.refresh()
        } catch {
            toast.error("Failed to disconnect Twitter")
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

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Info Card */}
            <Card className="h-fit">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name / Alias</Label>
                        <div className="flex gap-2">
                            <Input
                                id="name"
                                placeholder="Enter your name or alias"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving || !name.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            This is how others will see you on the platform
                        </p>
                    </div>

                    {/* Email Display */}
                    {hasEmail && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <div className="text-xs text-gray-400">Email</div>
                                <div className="text-sm font-medium text-gray-700">{email}</div>
                            </div>
                            <Check className="w-4 h-4 text-green-500" />
                        </div>
                    )}

                    {/* Wallet Connection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Wallet Address</Label>
                        {hasWallet ? (
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Wallet className="w-5 h-5 text-green-600" />
                                <div className="flex-1">
                                    <div className="font-mono text-sm text-gray-700">
                                        {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}
                                    </div>
                                </div>
                                <Check className="w-4 h-4 text-green-500" />
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 h-12"
                                onClick={handleLinkWallet}
                                disabled={isLinkingWallet}
                            >
                                {isLinkingWallet ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Wallet className="w-5 h-5" />
                                )}
                                Connect Wallet
                                <LinkIcon className="w-4 h-4 ml-auto text-gray-400" />
                            </Button>
                        )}
                        <p className="text-xs text-gray-500">
                            Connect a wallet to enable Ethos reputation features
                        </p>
                    </div>

                    {/* Twitter Connection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Twitter Account</Label>
                        {hasTwitter ? (
                            <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                                <Twitter className="w-5 h-5 text-sky-500" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">
                                        {twitterName || `@${twitterUsername}`}
                                    </div>
                                    {twitterName && twitterUsername && (
                                        <div className="text-xs text-gray-500">@{twitterUsername}</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`https://twitter.com/${twitterUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-sky-100 rounded transition-colors"
                                        title="View profile"
                                    >
                                        <ExternalLink className="w-4 h-4 text-sky-600" />
                                    </a>
                                    <button
                                        onClick={handleUnlinkTwitter}
                                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                        title="Disconnect"
                                    >
                                        <Unlink className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 h-12 border-sky-200 hover:bg-sky-50"
                                onClick={handleLinkTwitter}
                                disabled={isLinkingTwitter}
                            >
                                {isLinkingTwitter ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Twitter className="w-5 h-5 text-sky-500" />
                                )}
                                <span className="text-gray-700">Connect Twitter</span>
                                <LinkIcon className="w-4 h-4 ml-auto text-gray-400" />
                            </Button>
                        )}
                        <p className="text-xs text-gray-500">
                            Link your Twitter to let others discover and follow you
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Ethos Reputation Card */}
            <div>
                {hasWallet && walletAddress ? (
                    <EthosReputationCard address={walletAddress} />
                ) : (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="bg-blue-100 p-1.5 rounded-full">
                                    <Wallet className="w-4 h-4 text-blue-600" />
                                </div>
                                Ethos Reputation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center py-8">
                            <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
                                <Wallet className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Connect Wallet for Reputation
                            </h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                                Link a wallet address to see your Ethos Network reputation score,
                                reviews, and vouches.
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleLinkWallet}
                                disabled={isLinkingWallet}
                                className="gap-2"
                            >
                                {isLinkingWallet ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Wallet className="w-4 h-4" />
                                )}
                                Connect Wallet
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
