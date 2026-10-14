
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // 1. Kiểm tra session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return Response.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  // 2. Lấy role từ database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // 3. Người dùng không còn tồn tại
  if (!user) {
    return Response.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  // 4. Chỉ INSTRUCTOR và ADMIN được truy cập
  if (
    user.role !== "INSTRUCTOR" &&
    user.role !== "ADMIN"
  ) {
    return Response.json(
      { error: "FORBIDDEN" },
      { status: 403 }
    );
  }

  // 5. Đủ quyền truy cập
  return Response.json(
    { ok: true, role: user.role },
    { status: 200 }
  );
}
