"use client"

import { useState } from "react"
import { Search, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "@/features/products/components/ProductCard"
import { CategoryFilter } from "@/components/CategoryFilter"

type Product = {
  id: string
  name: string
  description: string
  priceInNaira: number
  imageUrl: string
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

type Category = {
  id: string
  name: string
  slug: string
}

type HomePageClientProps = {
  initialProducts: Product[]
  categories: Category[]
  activeSlug?: string
}

export function HomePageClient({ 
  initialProducts, 
  categories,
  activeSlug 
}: HomePageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = initialProducts.filter((product) => {
    const term = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category?.name.toLowerCase().includes(term)
    )
  })

  const activeCategory = activeSlug
    ? categories.find((cat) => cat.slug === activeSlug)
    : null

  return (
    <>
      <section className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28ac30] focus:border-transparent shadow-sm"
          />
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Continue Learning
          </h3>
          <a
            href="#"
            className="text-[#28ac30] font-semibold hover:text-[#229a28] flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h4 className="text-xl font-semibold text-gray-700 mb-2">
            No courses enrolled yet
          </h4>
          <p className="text-gray-600 mb-4">
            Start your learning journey by enrolling in a course below
          </p>
          <Link 
            href="/all-courses"
            className="inline-block px-6 py-2 bg-[#28ac30] text-white rounded-lg hover:bg-[#229a28] transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </section>

      <CategoryFilter categories={categories} activeSlug={activeSlug} />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {activeCategory ? activeCategory.name : "All Courses"}
          </h3>
          <p className="text-gray-600">
            {filteredProducts.length} course{filteredProducts.length !== 1 ? "s" : ""}
            {searchTerm && ` found for "${searchTerm}"`}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm
                ? `No courses found for "${searchTerm}"`
                : "No courses found in this category."}
            </p>
          </div>
        ) : (
          <div className="container my-6">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        )}
      </section>

      

      <section className="bg-gradient-to-r from-[#28ac30] to-[#1f8a26] rounded-2xl p-8 md:p-12 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">Ready to start Learning?</h3>
        <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
          Learn from industry experts with thousands of students worldwide and
          get positioned for your next career move.
        </p>
        <button className="px-8 py-3 bg-white text-[#28ac30] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Start Learning Today
        </button>
      </section>
    </>
  )
}