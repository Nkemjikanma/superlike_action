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
    // let user: UserType;
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
    const { data, error } = await getQuery(castId.fid);

    console.log("before db query", castId.hash);

    const like = await prismadb.likes.findUnique({
        where: {
            castId: castId.hash,
        },
    });

    console.log("after db query", like);

    if (like && like.castId === castId.hash.toString()) {
        console.log("them don like am oo");
        return Response.json({
            message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has already been PowerLiked`,
        });
    }

    console.log("them never like am oo");
    await prismadb.likes.create({
        data: {
            fid: requesterFid,
            castId: castId.hash,
            authorFid: castId.fid,
            alreadyTipped: false,
        },
    });

    console.log("final response to know why");
    return Response.json({
        message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has been PowerLiked`,
    });
});
