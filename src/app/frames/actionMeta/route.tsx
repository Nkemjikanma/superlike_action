import { frames } from "../frames";
import { getQuery } from "@/utils/airstack";
import { queryLikesData } from "@/utils/helpers";

// forces refresh of next cache
export const dynamic = "force-dynamic";

export const GET = frames(async () => {
    const data = {
        name: "TipMark",
        icon: "plus",
        description: "Save casts to tip later",
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

    if (message) {
        const { requesterFid, castId } = message;

        if (!castId) {
            return Response.json({
                message:
                    "Will not Tipmark a cast without a castId - i'll try again",
            });
        }
        const { data, error } = await getQuery(castId.fid);

        console.log("before db query", castId.hash);

        const queryDataResults = await queryLikesData(
            castId.hash,
            requesterFid,
            castId.fid,
        );

        // why is this not working? It is not found, it creates it, then comes back to say it is found
        // if (queryDataResults === "Like found") {
        //     return Response.json({
        //         message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has already been PowerLiked`,
        //     });
        // }

        if (queryDataResults === "Like error") {
            return Response.json({
                message: "Error, try again later",
            });
        }

        return Response.json({
            message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has been Tipmarked`,
        });
    }

    return Response.json({
        message: "No message found",
    });
});
