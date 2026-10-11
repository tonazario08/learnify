
import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.$queryRaw<
    Array<{
      database: string;
      username: string;
    }>
  >`
    SELECT
      current_database() AS database,
      current_user AS username
  `;

  console.table(result);

  if (
    result[0]?.database !== "learnify_db" ||
    result[0]?.username !== "learnify_app"
  ) {
    throw new Error("Unexpected database or user");
  }

  console.log("DB-01 connection: PASS");
}

main()
  .catch((error) => {
    console.error("DB-01 connection: FAIL", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
