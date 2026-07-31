import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete in reverse order of dependencies
  await prisma.notification.deleteMany({});
  await prisma.studyTask.deleteMany({});
  await prisma.studyPlan.deleteMany({});
  await prisma.agentRun.deleteMany({});
  await prisma.prediction.deleteMany({});
  await prisma.riskScore.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.evaluationComponent.deleteMany({});
  await prisma.evaluationPlan.deleteMany({});
  await prisma.idempotencyKey.deleteMany({});
  await prisma.outboxEvent.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.documentHandoff.deleteMany({});
  await prisma.sourceWorkspace.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.semester.deleteMany({});
  await prisma.semesterOperationsState.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding MVP demo data...');

  // 1. User and Profile
  const userId = 'test-user-id'; // Use a consistent ID for easy testing
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: 'demo@axiom-shift.edu',
      passwordHash: 'hashed_password', // Fake hash
      profile: {
        create: {
          displayName: 'Demo Student',
          timezone: 'Asia/Kolkata',
        }
      },
      state: {
        create: {
          summary: { status: 'OK', readiness: 'HIGH' }
        }
      }
    }
  });

  // 2. Semester
  const now = new Date();
  const semesterStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const semesterEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);

  const semester = await prisma.semester.create({
    data: {
      userId,
      name: `Spring ${now.getFullYear()} Demo`,
      startDate: semesterStart,
      endDate: semesterEnd,
      timezone: 'Asia/Kolkata',
    }
  });

  // Update State with active semester
  await prisma.semesterOperationsState.update({
    where: { userId },
    data: { activeSemesterId: semester.id }
  });

  // 3. Subjects
  const subjects = [
    { code: 'CS601', name: 'Software Engineering', credits: 4, color: '#3b82f6' },
    { code: 'CS602', name: 'Machine Learning', credits: 4, color: '#10b981' },
    { code: 'CS603', name: 'Distributed Systems', credits: 3, color: '#f59e0b' },
  ];

  const createdSubjects = [];
  for (const sub of subjects) {
    const created = await prisma.subject.create({
      data: {
        semesterId: semester.id,
        userId,
        ...sub
      }
    });
    createdSubjects.push(created);
  }

  // 4. Calendar Events (Classes)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.calendarEvent.createMany({
    data: [
      {
        userId,
        semesterId: semester.id,
        subjectId: createdSubjects[0].id,
        kind: 'RECURRING_CLASS',
        title: 'Software Engineering Lecture',
        sessionType: 'LECTURE',
        location: 'Hall A',
        dayOfWeek: 'MONDAY',
        startTime: '10:00',
        endTime: '11:30',
        eventType: 'CLASS',
      },
      {
        userId,
        semesterId: semester.id,
        subjectId: createdSubjects[1].id,
        kind: 'RECURRING_CLASS',
        title: 'Machine Learning Lab',
        sessionType: 'LAB',
        location: 'Lab 3',
        dayOfWeek: 'TUESDAY',
        startTime: '14:00',
        endTime: '16:00',
        eventType: 'CLASS',
      }
    ]
  });

  // Add a class happening 'today' for the briefing
  const todayClassStart = new Date(now);
  todayClassStart.setHours(now.getHours() - 1, 0, 0, 0); // Started 1 hour ago
  const todayClassEnd = new Date(now);
  todayClassEnd.setHours(now.getHours() + 1, 0, 0, 0); // Ends in 1 hour

  await prisma.calendarEvent.create({
    data: {
      userId,
      semesterId: semester.id,
      subjectId: createdSubjects[2].id,
      kind: 'ONE_OFF',
      title: 'Distributed Systems Tutorial',
      sessionType: 'TUTORIAL',
      location: 'Room 402',
      startAt: todayClassStart,
      endAt: todayClassEnd,
      eventType: 'CLASS',
    }
  });

  // 5. Evaluation, Assessments & Marks
  const mlSubject = createdSubjects[1];
  const evalPlan = await prisma.evaluationPlan.create({
    data: {
      userId,
      subjectId: mlSubject.id,
      components: {
        create: [
          { name: 'Midterm', weightPercent: 30 },
          { name: 'Final', weightPercent: 40 },
          { name: 'Assignments', weightPercent: 30 }
        ]
      }
    },
    include: { components: true }
  });

  const midtermComponent = evalPlan.components.find(c => c.name === 'Midterm');
  const assignmentComponent = evalPlan.components.find(c => c.name === 'Assignments');

  const midtermAssessment = await prisma.assessment.create({
    data: {
      userId,
      subjectId: mlSubject.id,
      evaluationComponentId: midtermComponent!.id,
      title: 'Midterm Exam',
      dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      maxMarks: 100,
      marks: {
        create: {
          userId,
          obtainedMarks: 65 // Subpar score to trigger risk
        }
      }
    }
  });

  await prisma.assessment.create({
    data: {
      userId,
      subjectId: mlSubject.id,
      evaluationComponentId: assignmentComponent!.id,
      title: 'Assignment 3',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      maxMarks: 50,
    }
  });

  // 6. Risk Scores
  await prisma.riskScore.create({
    data: {
      userId,
      subjectId: mlSubject.id,
      severity: 'HIGH',
      score: 75,
      drivers: ['Scored 65/100 on Midterm (High Weightage)'],
      recommended: {
        action: 'Review Midterm concepts and complete Assignment 3 early.',
        urgency: 'HIGH'
      }
    }
  });

  // 7. Source Workspace
  await prisma.sourceWorkspace.create({
    data: {
      userId,
      subjectId: mlSubject.id,
      title: 'ML NotebookLM Workspace',
      provider: 'SOURCE_NOTEBOOK',
      status: 'CONNECTED',
      sourceCount: 3,
      externalWorkspaceId: 'demo-workspace-id'
    }
  });

  // 8. Notifications
  await prisma.notification.create({
    data: {
      userId,
      type: 'HIGH_RISK_CHANGE',
      title: 'Risk Elevated: Machine Learning',
      message: 'Your risk level for Machine Learning has increased to HIGH due to recent midterm results.',
      dedupeKey: `risk_high_${mlSubject.id}_${now.toISOString().split('T')[0]}`,
      status: 'UNREAD'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
