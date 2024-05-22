import { prismadb } from "@/utils/prismadb";
import { frames } from "../frames";
import { getQuery } from "@/utils/airstack";

type UserType =
    | ({
          fid: number;
      } & {
          likes: {
              castId: string;
              authorFid: number;
              fid: number;
              alreadyTipped: boolean;
              likedAt: Date;
          }[];
      })
    | null;

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
    let user: UserType;
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
        include: {
            likes: {
                where: {
                    castId: castId.hash,
                },
            },
        },
    });

    const { data, error } = await getQuery(castId);

    // check if user exists
    console.log("user", user?.likes);
    if (user) {
        if (user?.likes.length > 0) {
            const like = user.likes.some((like) => like.castId === castId.hash);

            console.log("like", like);

            // if user has liked the cast, return a message
            if (like) {
                return Response.json({
                    message: `Cast by ${error ? ctx.message?.castId?.fid : data.Socials.Social[0].profileName} has already been PowerLiked`,
                });
            }
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
        await prismadb.user.create({
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
