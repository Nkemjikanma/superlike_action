import { prismadb } from "@/utils/prismadb";
import { frames } from "../frames";
import { getQuery } from "@/utils/airstack";

// forces refresh of next cache
export const dynamic = "force-dynamic";

export const GET = frames(async () => {
    const data = {
        name: "PowerLike",
        icon: "plus",
        description: "Why like when you can PowerLike.",
        aboutUrl: "https://warpcast.com/nkemjika",
        action: {
            type: "post",
        },
    };

    return Response.json(data);
});

export const POST = frames(async (ctx) => {
    let user;
    const { message } = ctx;

    if (!message) {
        return Response.json({
            message: "Error, try again",
        });
    }

    const { requesterFid, castId } = message;

    if (!castId) {
        return Response.json({
            message:
                "Will not PowerLike a cast without a castId - i'll try again",
        });
    }

    user = await prismadb.user.findUnique({
        where: {
            fid: requesterFid,
        },
    });

    const { data, error } = await getQuery(castId);

    // check if user exists
    if (user) {
        // if user exists, check if user has liked the cast
        const like = await prismadb.likes.findUnique({
            where: { castId: castId.hash },
        });

        // if user has liked the cast, return a message
        if (like) {
            return Response.json({
                message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has already been PowerLiked`,
            });
        }

        // if user has not liked the cast, like the cast
        await prismadb.likes.create({
            data: {
                fid: user.fid,
                castId: castId.hash,
                authorFid: castId.fid,
                alreadyTipped: false,
            },
        });
    }

    // if user does not exist, create user and like the cast
    if (!user) {
        user = await prismadb.user.create({
            data: {
                fid: requesterFid,
                likes: {
                    create: [
                        {
                            castId: castId.hash,
                            authorFid: castId.fid,
                            alreadyTipped: false,
                        },
                    ],
                },
            },
        });
    }

    return Response.json({
        message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has been PowerLiked`,
    });
});
