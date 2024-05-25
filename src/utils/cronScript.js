import { prismadb } from "./prismaClient";

const deleteOldFiles = async () => {
    try {
        await prismadb.like.deleteMany({
            where: {
                createdAt: {
                    lt: new Date().setUTCHours(7, 34, 59),
                },
            },
        });
    } catch (error) {
        console.log(error);
    }
};

deleteOldFiles();
