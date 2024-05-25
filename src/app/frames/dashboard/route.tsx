import { Button } from "frames.js/next";

import { prismadb } from "@/utils/prismadb";
import { currentDateGreaterThan } from "@/utils/constants";
import { frames } from "../frames";
import { getTipAllowance } from "@/utils/helpers";
import { getDegenQuery } from "@/utils/airstack";

const handler = frames(async (ctx) => {
    if (!ctx.message?.isValid) {
        throw new Error("Invalid message");
    }

    const userId = ctx.message?.requesterFid;

    if (!userId) {
        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    Error: Could not get your userId. Try again.
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

    // get user
    // and check if user has sign data
    const user = await prismadb.user.findUnique({
        where: {
            fid: userId,
        },
        include: {
            likes: {
                where: {
                    likedAt: {
                        gte: new Date(currentDateGreaterThan.toUTCString()),
                    },
                },
            },
            signer: {
                where: {
                    fid: userId,
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
                            Number of Tipmarks: {user?.likes.length}
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
                            Number of Tipmarks: {user?.likes.length}
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

        const searchParams = new URLSearchParams({
            tipmarks: user?.likes.length.toString(),
            alreadyTipped: user?.likes
                .filter((like) => like.alreadyTipped === true)
                .length.toString(),
            tipAllowance: tipAllowance,
            degenTipped: totalUsed.toString(),
            remaining: (Number(tipAllowance) - totalUsed).toString(),
            time: new Date().toLocaleString(),
        });

        return {
            image: `https://superlike-action.vercel.app/frames/image?${searchParams}`,
            textInput: "Enter percentage",
            buttons: [
                user.signer?.signer_uuid ? (
                    <Button
                        action="post"
                        key={1}
                        target={{
                            pathname: "/cast",
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
                <span tw="text-sm mt-2">Add action to start Tipmarking</span>
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
