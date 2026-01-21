import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ReactNode } from "react"
import { AdminNavbarClient } from "./navbar-client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  )
}

function Navbar() {
  return (
    <header className="shadow bg-background sticky top-0 z-50">
      <nav className="flex items-center justify-between container mx-auto px-4 h-14">
        <div className="flex items-center gap-2">
          <Link className="text-lg text-[#2563EB] font-bold " href="/admin">
            Ethos Talentspace
          </Link>
          <Badge className="bg-[#2563EB]">Admin</Badge>
        </div>

        <div className="flex items-center gap-4">
          <Link
            className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
            href="/"
          >
            Home
          </Link>
          <Link
            className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
            href="/admin/courses"
          >
            Courses
          </Link>
          <Link
            className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
            href="/admin/products"
          >
            Products
          </Link>
          <Link
            className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
            href="/admin/users"
          >
            Users
          </Link>
          <Link
            className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
            href="/admin/sales"
          >
            Sales
          </Link>
          <AdminNavbarClient />
        </div>
      </nav>
    </header>
  )
}
