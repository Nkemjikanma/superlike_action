import { PrismaClient } from "@prisma/client";

const globalThisForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prismadb =
    globalThisForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") {
    globalThisForPrisma.prisma = prismadb;
}
