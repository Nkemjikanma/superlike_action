import { Button } from "frames.js/next";

import { prismadb } from "@/utils/prismadb";
import { startTime, endTime } from "@/utils/constants";
import { frames } from "../frames";
import { getTipAllowance } from "@/utils/helpers";
import { getDegenQuery } from "@/utils/airstack";

export const dynamic = "force-dynamic";

const handler = frames(async (ctx) => {
    const userId = ctx.message?.requesterFid;

    // const userId = 7251;
    // const userId = 405941;

    // get user
    // and check if user has sign data
    const user = await prismadb.user.findUnique({
        where: {
            fid: Number(userId),
        },
        include: {
            likes: {
                where: {
                    fid: Number(userId),
                    likedAt: {
                        gte: new Date(startTime),
                        lte: new Date(endTime),
                    },
                },
            },
            signer: {
                where: {
                    fid: Number(userId),
                },
            },
        },
    });

    if (user && user.fid) {
        /**
         * Tip button should:
         * 1. Get the user's allowance and balance - dune? neynar? - dunes - done
         * 2. Calculate the tip amount based on the percentage entered or 100% if empty - done
         * setup bot
         * 3. pass the casts, tip amount, to the next frame/bot
         */

        const tipAllowance = await getTipAllowance(user.fid);

        // get remaining allowance
        // const { totalUsed, error } = await getDegenQuery(user.fid.toString());

        const { totalUsed, error } = await getDegenQuery(user.fid.toString());

        console.log(totalUsed);

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
                            pathname: "/dashboard",
                        }}
                    >
                        TRY AGAIN
                    </Button>,
                ],
            };
        }

        if (tipAllowance === "0") {
            return {
                image: (
                    <div tw="flex flex-col relative w-full h-full items-center justify-center">
                        <div tw="flex relative">
                            Number of power likes: {user?.likes.length}
                        </div>
                        <div tw="flex relative">
                            Sorry, no tip allowance just yet.
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

        const displayedObject = [
            { subject: "Number of power likes", value: user?.likes.length },
            { subject: "Tip allowance", value: tipAllowance },
            { subject: "Already tipped", value: totalUsed },
        ];

        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center m-auto">
                    <div tw="flex flex-col relative w-3/4 h-4/5 items-center justify-center">
                        {displayedObject.map(({ subject, value }, index) => (
                            <div
                                key={index}
                                tw="flex flex-row relative w-full border border-gray-800 justify-between px-2"
                            >
                                <p>{subject}:</p>
                                <p tw="ml-2">{value}</p>
                            </div>
                        ))}

                        <span tw="text-md mt-4">
                            Leave textfield empty to tip 100%
                        </span>
                    </div>

                    <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                        By @nkemjika
                    </div>
                </div>
            ),
            textInput: "Enter percentage",
            buttons: [
                user.signer?.signer_uuid ? (
                    <Button
                        action="post"
                        key={1}
                        target={{
                            pathname: "/cast",
                            query: {
                                tipAllowance: tipAllowance,
                            },
                        }}
                    >
                        Tip away
                    </Button>
                ) : (
                    <Button
                        action="link"
                        key={2}
                        target="http://signer-seven.vercel.app"
                    >
                        Reply(needs signing)
                    </Button>
                ),
            ],
        };
    }

    return {
        image: (
            <div tw="flex flex-col relative w-full h-full items-center justify-center">
                Error: Havent added the action yet.
                <span tw="text-sm mt-2">Add action to start powerliking</span>
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

export const GET = handler;
export const POST = handler;
