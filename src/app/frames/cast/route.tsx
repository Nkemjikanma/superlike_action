import { HttpError, currentDateGreaterThan } from "@/utils/constants";
import { prismadb } from "@/utils/prismadb";
import { frames } from "../frames";
import { getDistributeTips } from "@/utils/helpers";
import { Button } from "frames.js/next";
import { getDegenQuery } from "@/utils/airstack";

export const dynamic = "force-dynamic";

export const POST = frames(async (ctx) => {
    const requesterFid = ctx.message?.requesterFid;
    const percentageToTip = ctx.message?.inputText;
    const tipAllowance = ctx.searchParams.tipAllowance;

    // get user's record from the database
    const user = await prismadb.user.findUnique({
        where: {
            fid: requesterFid,
        },
        include: {
            likes: {
                where: {
                    fid: Number(requesterFid),
                    alreadyTipped: false,
                    likedAt: {
                        gte: new Date(currentDateGreaterThan),
                        // lte: new Date(endTime),
                    },
                },
            },
            signer: {
                where: {
                    fid: requesterFid,
                },
            },
        },
    });

    if (!user) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">
                        Something went wrong, please try again.
                    </div>
                    <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                        By @nkemjika
                    </div>
                </div>
            ),
            buttons: [
                <Button
                    action="post"
                    key={1}
                    target={{
                        pathname: "/",
                    }}
                >
                    TRY AGAIN
                </Button>,
            ],
        };
    }

    if (user.likes.length === 0) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">No powerlikes yet, boss.</div>
                    <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                        By @nkemjika
                    </div>
                </div>
            ),
            buttons: [
                <Button
                    action="post"
                    key={1}
                    target={{
                        pathname: "/",
                    }}
                >
                    TRY AGAIN
                </Button>,
            ],
        };
    }

    // get remaining allowance
    const { totalUsed, error } = await getDegenQuery(requesterFid!.toString());

    if (error) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">
                        Something went wrong, please try again.
                    </div>
                    <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                        By @nkemjika
                    </div>
                </div>
            ),
            buttons: [
                <Button
                    action="post"
                    key={1}
                    target={{
                        pathname: "/",
                    }}
                >
                    TRY AGAIN
                </Button>,
            ],
        };
    }

    // check if user has enough allowance to tip
    if (totalUsed >= Number(tipAllowance)) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">
                        You can not be tipping more than your allowance, boss.
                    </div>
                    <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                        By @nkemjika
                    </div>
                </div>
            ),
            buttons: [
                <Button
                    action="post"
                    key={1}
                    target={{
                        pathname: "/",
                    }}
                >
                    TRY AGAIN
                </Button>,
            ],
        };
    }

    // gets the tip to be given to each super like - from allowance and percentage
    const distributeTips =
        user &&
        getDistributeTips(
            user?.likes.length,
            Number(tipAllowance) - totalUsed,
            percentageToTip,
        );

    Promise.allSettled(
        user.likes.map(async (cast, index) => {
            try {
                const postCast = await fetch(
                    "https://api.neynar.com/v2/farcaster/cast",
                    {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                            accept: "application/json",
                            api_key: process.env.NEYNAR_API_KEY!,
                        },
                        body: JSON.stringify({
                            signer_uuid: user.signer?.signer_uuid,
                            text: `You've been tipped ${distributeTips} $degen. By @nkemjika`,
                            parent: user.likes[index].castId,
                        }),
                    },
                );

                if (postCast.ok) {
                    return cast.castId;
                }
            } catch (error) {
                if (error instanceof HttpError) {
                    if (error.response.status === 404) {
                        console.log("Signer not found");
                    }
                }
            }
        }),
    ).then((results) => {
        results.forEach(async (result) => {
            if (result.status === "fulfilled") {
                console.log("Tipped successfully");

                await prismadb.likes.update({
                    where: {
                        castId: result.value,
                    },
                    data: {
                        alreadyTipped: true,
                    },
                });

                return {
                    image: (
                        <div tw="flex flex-col relative w-full h-full items-center justify-center">
                            <div tw="flex relative">Tipped successfully.</div>
                            <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                                By @nkemjika
                            </div>
                        </div>
                    ),
                    buttons: [
                        <Button
                            action="post"
                            key={1}
                            target={{
                                pathname: "/",
                            }}
                        >
                            BACK TO DASHBOARD
                        </Button>,
                    ],
                };
            } else {
                return {
                    image: (
                        <div tw="flex flex-col relative w-full h-full items-center justify-center">
                            <div tw="flex relative">
                                Tipping failed. Try again
                            </div>
                            <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                                By @nkemjika
                            </div>
                        </div>
                    ),
                    buttons: [
                        <Button
                            action="post"
                            key={1}
                            target={{
                                pathname: "/",
                            }}
                        >
                            BACK TO DASHBOARD
                        </Button>,
                    ],
                };
            }
        });
    });

    return {
        image: (
            <div tw="flex flex-col relative w-full h-full items-center justify-center">
                <div tw="flex relative">
                    Something went wrong, please try again.
                </div>
                <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                    By @nkemjika
                </div>
            </div>
        ),
        buttons: [
            <Button
                action="post"
                key={1}
                target={{
                    pathname: "/",
                }}
            >
                TRY AGAIN
            </Button>,
        ],
    };
});
