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
    const { message } = ctx;

    if (!message?.isValid) {
        throw new Error("Invalid frame");
    }

    if (message) {
        const { requesterFid, castId } = message;

        if (!castId?.hash || !castId?.fid) {
            return Response.json({
                message:
                    "Will not Tipmark a cast without a castId - i'll try again",
            });
        }

        if (requesterFid === castId.fid) {
            return Response.json({
                message: "You can't Tipmark your own cast",
            });
        }
        // get the author's username
        const { data, error } = await getQuery(castId.fid);

        // add like to the db
        const queryDataResults = await queryLikesData(
            castId.hash,
            requesterFid,
            castId.fid,
        );

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
