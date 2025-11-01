import { Badge } from "@/components/ui/badge"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { ReactNode } from "react"

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
    <header className="shadow bg-background z-10">
      <nav className="flex items-center justify-between container mx-auto px-4 h-12">
        <div className="flex items-center gap-2">
          <Link className="text-lg text-[#28ac30] font-bold " href="/admin">
            MAGS LMS
          </Link>
          <Badge className="bg-[#28ac30]">Admin</Badge>
        </div>

        <div className="flex items-center gap-4">
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
          <div className="size-8 flex items-center justify-center">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: { width: "100%", height: "100%" },
                },
              }}
            />
          </div>
        </div>
      </nav>
    </header>
  )
}
