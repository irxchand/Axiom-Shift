export function createUserRepository(prisma) {
    return {
        findByEmail(email) {
            return prisma.user.findUnique({ where: { email } });
        },
        findById(id) {
            return prisma.user.findUnique({ where: { id } });
        },
        create(data) {
            return prisma.user.create({ data });
        },
    };
}
//# sourceMappingURL=userRepository.js.map