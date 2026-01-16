"use client";

import { useState } from "react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Search, BookOpen } from "lucide-react"; 

export type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInNaira: number;
  status: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

type AllCoursesProps = {
  products: Product[];
  categories: Category[];
  activeCategorySlug?: string;
};

export default function AllCourses({
  products,
  categories,
  activeCategorySlug,
}: AllCoursesProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase();
    return product.name.toLowerCase().includes(term);
  });

  const activeCategory = activeCategorySlug
    ? categories.find((c) => c.slug === activeCategorySlug)
    : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h3 className="text-2xl font-bold mb-4">
        {activeCategory ? activeCategory.name : "All Courses"}
      </h3>

      <section className="mb-8 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#28ac30] focus:border-transparent shadow-sm"
          />
        </div>
      </section>

      <CategoryFilter categories={categories} activeSlug={activeCategorySlug} />

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600">No courses found</h4>
          <p className="text-gray-400">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}