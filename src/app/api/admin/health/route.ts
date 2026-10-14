
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // 1. Lấy session từ Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // 2. Chưa đăng nhập -> 401
  if (!session?.user?.id) {
    return Response.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  // 3. Lấy role mới nhất từ PostgreSQL
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  // 4. Tài khoản không còn tồn tại -> 401
  if (!user) {
    return Response.json(
      { error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  // 5. Không phải ADMIN -> 403
  if (user.role !== "ADMIN") {
    return Response.json(
      { error: "FORBIDDEN" },
      { status: 403 }
    );
  }

  // 6. ADMIN hợp lệ -> 200
  return Response.json(
    {
      ok: true,
      role: user.role,
    },
    { status: 200 }
  );
}
