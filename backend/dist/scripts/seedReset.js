import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Resetting database tables...');
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    console.log('Seeding demo user...');
    const demoUser = await prisma.user.create({
        data: {
            id: 'demo-user-123',
            email: 'student@demo.edu',
            passwordHash: '$2b$10$DemoHashStringForTestingPurposesOnly',
            profile: {
                create: {
                    displayName: 'Demo Student',
                    timezone: 'America/New_York',
                },
            },
        },
    });
    console.log(`Database reset complete. Demo user created: ${demoUser.id}`);
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seedReset.js.map