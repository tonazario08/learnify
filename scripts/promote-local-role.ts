import "dotenv/config";
import { prisma } from "../lib/prisma";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

const hostname = new URL(databaseUrl).hostname;

if (!["localhost", "127.0.0.1", "[::1]"].includes(hostname)) {
  throw new Error(
    "Role bootstrap is restricted to a local database"
  );
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = process.argv[3];
  if (process.env.NODE_ENV === "production" ||
      process.env.ALLOW_LOCAL_ROLE_BOOTSTRAP !== "YES") {
    throw new Error("Local role bootstrap is disabled");
  }
  if (!email || (role !== "ADMIN" && role !== "INSTRUCTOR")) {
    throw new Error("Usage: <email> <ADMIN|INSTRUCTOR>");
  }
  const existingUser = await prisma.user.findUnique({
  where: { email },
});

if (!existingUser) {
  throw new Error(
    `Không tìm thấy tài khoản ${email}. Hãy đăng ký trước khi nâng quyền.`
  );
}
  const user = await prisma.user.update({
    where: { email }, data: { role },
    select: { id: true, email: true, role: true },
  });
  console.log("Updated local role:", user);
}
 
main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
