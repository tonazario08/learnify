import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth-guards";
import { LogoutButton } from "@/components/logout-button";
 
async function DashboardContent() {
  const user = await requireUser();
 
  return <main className="mx-auto max-w-2xl space-y-5 p-8">
    <h1 className="text-2xl font-bold">Bảng điều khiển Learnify</h1>
    <p>Xin chào, {user.name}</p>
    <p>Email: {user.email}</p>
    <p>Vai trò: {user.role}</p>
    <nav className="flex flex-wrap gap-4 underline">
      {(user.role === "ADMIN" || user.role === "INSTRUCTOR") &&
        <Link href="/dashboard/instructor">Khu vực giảng viên</Link>}
      {user.role === "ADMIN" &&
        <Link href="/dashboard/admin">Khu vực quản trị</Link>}
    </nav>
    <LogoutButton />
  </main>;
}
 
export default function DashboardPage() {
  return <Suspense fallback={<p className="p-8">Đang tải phiên...</p>}>
    <DashboardContent />
  </Suspense>;
}
