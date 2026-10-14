import { Suspense } from "react";
import { requireRole } from "@/lib/auth-guards";
 
async function AdminContent() {
  const user = await requireRole(["ADMIN"]);
  return <main className="p-8">
    <h1 className="text-2xl font-bold">Khu vực quản trị</h1>
    <p>Xin chào {user.name}. Bạn có quyền ADMIN.</p>
  </main>;
}
 
export default function AdminPage() {
  return <Suspense fallback={<p>Đang kiểm tra quyền...</p>}>
    <AdminContent />
  </Suspense>;
}
