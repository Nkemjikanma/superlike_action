import { prismadb } from "./prismadb";
import { currentDateGreaterThan } from "./constants";

const deleteOldFiles = async () => {
    const timeToDelete = currentDateGreaterThan();
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
