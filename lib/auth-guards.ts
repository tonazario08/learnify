import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
 
type RequestHeaders = Headers;
type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";
 
export async function findCurrentUser(requestHeaders: RequestHeaders) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) return null;
 
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
}
 
export async function requireUser() {
  const user = await findCurrentUser(await headers());
  if (!user) redirect("/login");
  return user;
}
 
export async function requireRole(allowed: Role[]) {
  const user = await requireUser();

  if (!allowed.includes(user.role)) {
    redirect("/dashboard?denied=1");
  }

  return user;
}
