
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";

async function expectDuplicateRejected(
  action: () => Promise<unknown>,
) {
  try {
    await action();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return;
    }
    throw error;
  }

  throw new Error("Duplicate record was accepted");
}

async function main() {
  const suffix = randomUUID().slice(0, 8);
  const userIds: string[] = [];
  let courseId: string | undefined;

  try {
    // 1. Create users
    const instructor = await prisma.user.create({
      data: {
        name: "Test Instructor",
        email: `instructor-${suffix}@example.test`,
        role: "INSTRUCTOR",
      },
    });
    userIds.push(instructor.id);

    const student = await prisma.user.create({
      data: {
        name: "Test Student",
        email: `student-${suffix}@example.test`,
        role: "STUDENT",
      },
    });
    userIds.push(student.id);

    console.log("Create users: PASS");

    // 2. Create course
    const course = await prisma.course.create({
      data: {
        title: "Learnify Test Course",
        slug: `test-course-${suffix}`,
        instructorId: instructor.id,
      },
    });
    courseId = course.id;

    // 3. Create lesson
    await prisma.lesson.create({
      data: {
        title: "Introduction",
        position: 1,
        courseId: course.id,
      },
    });

    // 4. Create enrollment
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
      },
    });

    console.log("Create relations: PASS");

    // 5. Verify relations
    const result = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        instructor: true,
        lessons: true,
        enrollments: {
          include: { user: true },
        },
      },
    });

    assert.equal(result?.instructor.id, instructor.id);
    assert.equal(result?.lessons.length, 1);
    assert.equal(result?.enrollments.length, 1);
    assert.equal(
      result?.enrollments[0]?.user.id,
      student.id,
    );

    console.log("Relation queries: PASS");

    // 6. Verify unique enrollment
    await expectDuplicateRejected(() =>
      prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
        },
      }),
    );

    console.log("Duplicate enrollment: PASS");

    // 7. Verify unique lesson position
    await expectDuplicateRejected(() =>
      prisma.lesson.create({
        data: {
          title: "Duplicate position",
          position: 1,
          courseId: course.id,
        },
      }),
    );

    console.log("Duplicate lesson position: PASS");
    console.log("DB-02 integration tests: PASS");
  } finally {
    // Clean up only records created by this test
    if (courseId) {
      await prisma.enrollment.deleteMany({
        where: { courseId },
      });
      await prisma.lesson.deleteMany({
        where: { courseId },
      });
      await prisma.course.deleteMany({
        where: { id: courseId },
      });
    }

    if (userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error("DB-02 integration tests: FAIL", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
