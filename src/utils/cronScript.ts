import { prismadb } from "./prismadb";
import { getTodaysDate } from "./constants";

const deleteOldFiles = async () => {
    const timeToDelete = getTodaysDate();
    try {
        await prismadb.likes.deleteMany({
            where: {
                likedAt: {
                    lt: timeToDelete,
                },
            },
        });
    } catch (error) {
        console.log(error);
    }
};

deleteOldFiles();
