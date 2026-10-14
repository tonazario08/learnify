import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
 
const base = process.env.AUTH_TEST_BASE_URL ?? "http://localhost:3000";
const email = `auth01-${randomUUID()}@example.test`;
const password = `A1!${randomBytes(16).toString("hex")}`;
const jar = new Map<string, string>();
let userId: string | undefined;
 
function storeCookies(response: Response) {
  for (const cookie of response.headers.getSetCookie()) {
    const first = cookie.split(";")[0];
    const name = first.split("=")[0];
    if (name) jar.set(name, first);
  }
}
 
function cookies() {
  return [...jar.values()].join("; ");
}
 
async function request(path: string, method = "GET", body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(method !== "GET" ? { origin: base } : {}),
      ...(cookies() ? { cookie: cookies() } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  storeCookies(response);
  return response;
}
 
async function main() {
  // Chưa đăng nhập: API quản trị phải từ chối.
  let res = await request("/api/admin/health");
  assert.equal(res.status, 401);
  console.log("Anonymous API blocked: PASS");
 
  // Cố gửi role ADMIN ngay trong sign-up.
  res = await request("/api/auth/sign-up/email", "POST", {
    name: "AUTH01 Test", email, password, role: "ADMIN",
  });
  assert.equal(res.ok, true, `Sign-up HTTP ${res.status}`);
 
  const created = await prisma.user.findUnique({ where: { email } });
  assert.ok(created, "User was not created");
  userId = created.id;
  assert.equal(created.role, "STUDENT");
  console.log("Sign-up / role escalation blocked: PASS");
 
  // Sai mật khẩu phải bị từ chối.
  res = await request("/api/auth/sign-in/email", "POST", {
    email, password: "invalid-password",
  });
  assert.equal(res.ok, false);
  console.log("Wrong password blocked: PASS");
 
  // Xóa cookie cache từ sign-up, test đăng nhập độc lập.
  jar.clear();
  res = await request("/api/auth/sign-in/email", "POST", {
    email, password,
  });
  assert.equal(res.ok, true, `Sign-in HTTP ${res.status}`);
  const originalCookie = cookies();
  assert.ok(originalCookie, "Session cookie missing");
  console.log("Sign-in / session cookie: PASS");
 
  res = await request("/api/auth/get-session");
  assert.equal(res.ok, true);
  const session = await res.json() as { user?: { id?: string } } | null;
  assert.equal(session?.user?.id, userId);
  console.log("Get session: PASS");
 
  res = await request("/api/admin/health");

  assert.equal(res.status, 403);
  res = await request("/api/instructor/health");
  assert.equal(res.status, 403);
  console.log("STUDENT forbidden from privileged APIs: PASS");
 
  // Cố thay đổi role qua Better Auth update-user.
  res = await request("/api/auth/update-user", "POST", {
    role: "ADMIN",
  });
  const current = await prisma.user.findUnique({ where: { email } });
  assert.equal(current?.role, "STUDENT");
  console.log("Client role update blocked: PASS");
 

  // Kiểm thử quyền INSTRUCTOR
  await prisma.user.update({
    where: { email },
    data: { role: "INSTRUCTOR" },
  });

  res = await request("/api/admin/health");
  assert.equal(
    res.status,
    403,
    "INSTRUCTOR must not access Admin API"
  );

  res = await request("/api/instructor/health");
  assert.equal(
    res.status,
    200,
    "INSTRUCTOR must access Instructor API"
  );

  console.log("INSTRUCTOR RBAC: PASS");

  // Kiểm thử quyền ADMIN
  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  res = await request("/api/admin/health");
  assert.equal(
    res.status,
    200,
    "ADMIN must access Admin API"
  );

  res = await request("/api/instructor/health");
  assert.equal(
    res.status,
    200,
    "ADMIN must access Instructor API"
  );

  console.log("ADMIN RBAC: PASS");


  res = await request("/api/auth/sign-out", "POST", {});
  assert.equal(res.ok, true);
  // Dùng lại cookie cũ để xác minh session đã bị thu hồi.
  jar.clear();
  for (const c of originalCookie.split("; ")) {
    const name = c.split("=")[0];
    if (name) jar.set(name, c);
  }
  res = await request("/api/auth/get-session");
  const after = await res.json() as { user?: unknown } | null;
  assert.equal(after?.user ?? null, null);
  console.log("Sign-out revokes session: PASS");
  console.log("AUTH-01 integration tests: PASS");
}
 
main()
  .catch((error) => { console.error("AUTH-01 FAIL", error); process.exitCode = 1; })
  .finally(async () => {
    if (userId) {
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.account.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });
