import { Suspense } from "react";
import { requireRole } from "@/lib/auth-guards";
 
async function InstructorContent() {
  const user = await requireRole(["INSTRUCTOR", "ADMIN"]);
  return <main className="p-8">
    <h1 className="text-2xl font-bold">Khu vực giảng viên</h1>
    <p>Xin chào {user.name}. Bạn có quyền giảng viên.</p>
  </main>;
}
 
export default function InstructorPage() {
  return <Suspense fallback={<p>Đang kiểm tra quyền...</p>}>
    <InstructorContent />
  </Suspense>;
}
