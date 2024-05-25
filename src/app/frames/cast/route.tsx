import { currentDateGreaterThan } from "@/utils/constants";
import { prismadb } from "@/utils/prismadb";
import { frames } from "../frames";
import { getDistributeTips, getTipAllowance } from "@/utils/helpers";
import { Button } from "frames.js/next";
import { getDegenQuery } from "@/utils/airstack";

export const dynamic = "force-dynamic";

export const POST = frames(async (ctx) => {
    const requesterFid = ctx.message?.requesterFid;
    const percentageToTip = ctx.message?.inputText;
    const tipAllowance = await getTipAllowance(requesterFid!);

    console.log("tipAllowance", tipAllowance);

    // get user's record from the database
    const user = await prismadb.user.findUnique({
        where: {
            fid: requesterFid,
        },
        include: {
            likes: {
                where: {
                    alreadyTipped: false,
                    likedAt: {
                        gte: new Date(currentDateGreaterThan.toUTCString()),
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

    if (!user || !user.signer || !user.likes) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">
                        Something went wrong, Make sure you have signed and
                        power liked.
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
                    <div tw="flex relative">No tipmarks yet, boss.</div>
                    <div tw="flex relative">
                        (See if you need to add more tipmarks)
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

    // get remaining allowance
    const { totalUsed, error } = await getDegenQuery(requesterFid!.toString());

    if (error) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">
                        Number of power likes: {user?.likes.length}
                    </div>
                    <div tw="flex relative">
                        Sorry, an error occured. Please try again.
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
    const distributeTips = getDistributeTips(
        user.likes.length,
        Number(tipAllowance) - totalUsed,
        percentageToTip,
    );

    if (distributeTips === 0 || distributeTips === "Invalid percentage") {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">
                        Sorry, you can't tip with the percentage you provided.
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

    try {
        const results = await Promise.allSettled(
            user.likes.map(async (cast) => {
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
                            text: `You've been tipped ${distributeTips} $degen`,
                            parent: cast.castId,
                            embeds: [
                                {
                                    url: "https://superlike-action.vercel.app",
                                },
                            ],
                        }),
                    },
                );

                if (!postCast.ok) throw new Error("Failed to tip");

                return cast.castId;
            }),
        );

        results.forEach(async (result) => {
            if (result.status === "fulfilled") {
                console.log("Tipped successfully");

                await prismadb.likes
                    .update({
                        where: {
                            castId: result.value,
                        },
                        data: {
                            alreadyTipped: true,
                        },
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        });
    } catch (e) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">Tipping failed. Try again</div>
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
});

// else {
//     return {
//         image: (
//             <div tw="flex flex-col relative w-full h-full items-center justify-center">
//                 <div tw="flex relative">
//                     Tipping failed. Try again
//                 </div>
//                 <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
//                     By @nkemjika
//                 </div>
//             </div>
//         ),
//         buttons: [
//             <Button
//                 action="post"
//                 key={1}
//                 target={{
//                     pathname: "/",
//                 }}
//             >
//                 BACK TO DASHBOARD
//             </Button>,
//         ],
//     };
// }
