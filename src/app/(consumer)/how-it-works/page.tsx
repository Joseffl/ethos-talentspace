import { PageHeader } from "@/components/PageHeader"
import { Wallet, Search, Handshake, Star } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Wallet,
      title: "Connect Your Wallet",
      description:
        "Sign up using your Web3 wallet. We support all major wallets including MetaMask, Coinbase Wallet, and WalletConnect.",
    },
    {
      icon: Search,
      title: "Browse or Post",
      description:
        "Explore verified talent profiles or post your project requirements. Filter by skills, experience, and availability.",
    },
    {
      icon: Handshake,
      title: "Connect & Collaborate",
      description:
        "Reach out to talent directly, discuss project details, and agree on terms. All communication happens on-platform.",
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description:
        "Complete projects, earn reviews, and build your on-chain reputation. Your track record follows you across Web3.",
    },
  ]

  return (
    <div className="container my-6">
      <PageHeader title="How It Works" />

      <div className="max-w-4xl mx-auto">
        <p className="text-xl text-gray-600 text-center mb-12">
          Ethos connects Web3 projects with top talent. Here&apos;s how to get started.
        </p>

        <div className="space-y-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-6 items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className="w-6 h-6 text-[#2563EB]" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-6">
            Join thousands of Web3 professionals and projects on Ethos.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-3 bg-white text-[#2563EB] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    </div>
  )
}
