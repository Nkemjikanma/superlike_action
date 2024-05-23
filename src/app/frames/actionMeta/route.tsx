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
    console.log("before getQuery", castId.hash);

    const like = await prismadb.likes.findUnique({
        where: {
            castId: castId.hash,
        },
    });

    console.log("after getQuery", like?.castId);

    const { data, error } = await getQuery(castId);

    if (like && like.castId === castId.hash.toString()) {
        console.log("them don like am oo");
        return Response.json({
            message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has already been PowerLiked`,
        });
    }

    // await prismadb.user.upsert({
    //     where: {
    //         fid: requesterFid,
    //     },
    //     create: {
    //         likes: {
    //             create: [
    //                 {
    //                     castId: castId.hash,
    //                     authorFid: castId.fid,
    //                     alreadyTipped: false,
    //                 },
    //             ],
    //         },
    //     },
    // });

    await prismadb.likes.create({
        data: {
            fid: requesterFid,
            castId: castId.hash,
            authorFid: castId.fid,
            alreadyTipped: false,
        },
    });

    return Response.json({
        message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has been PowerLiked`,
    });

    // if user does not exist, create user and like the cast
    // if (!user?.fid) {
    //     console.log("creating user");
    //     await prismadb.user.create({
    //         data: {
    //             fid: requesterFid,
    //             likes: {
    //                 create: [
    //                     {
    //                         castId: castId.hash,
    //                         authorFid: castId.fid,
    //                         alreadyTipped: false,
    //                     },
    //                 ],
    //             },
    //         },
    //     });

    //     return Response.json({
    //         message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has been PowerLiked`,
    //     });
    // } else {
    //     // check if user exists
    //     console.log("user", user?.likes);

    //     // check if user has liked the cast
    //     if (user?.likes.length === 0) {
    //         // if user has not liked the cast, like the cast

    //         console.log("creating like");

    //         await prismadb.likes.create({
    //             data: {
    //                 fid: user.fid,
    //                 castId: castId.hash,
    //                 authorFid: castId.fid,
    //                 alreadyTipped: false,
    //             },
    //         });

    //         return Response.json({
    //             message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has been PowerLiked`,
    //         });
    //     } else {
    //         console.log(
    //             "currently, this is just a message to test user has liked the cast",
    //         );
    //         return Response.json({
    //             message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has already been PowerLiked`,
    //         });
    //     }
    // }
});
