import { redirect } from "next/navigation"

// Dashboard is now integrated into the home page
export default async function DashboardPage() {
  redirect("/")
}
