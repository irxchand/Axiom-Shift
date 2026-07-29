import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'test-user-id';
  
  // Create user
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'test@example.com',
      passwordHash: 'fake-hash',
    }
  });

  // Create semester
  const semester = await prisma.semester.create({
    data: {
      name: 'Spring 2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-01'),
      userId,
    }
  });

  // Create subjects
  const s1 = await prisma.subject.create({
    data: {
      code: 'CS101',
      name: 'Intro to Programming',
      credits: 4,
      semesterId: semester.id,
      userId,
    }
  });

  // Create evaluation plan
  await prisma.evaluationPlan.create({
    data: {
      subjectId: s1.id,
      userId,
      components: {
        create: [
          { name: 'Midterm', weightPercent: 30 },
          { name: 'Final', weightPercent: 70 },
        ]
      }
    }
  });
  
  console.log('Seeded database for test-user-id');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
