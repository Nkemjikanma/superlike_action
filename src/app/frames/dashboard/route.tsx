import { Button } from "frames.js/next";

import { prismadb } from "@/utils/prismadb";
import { startTime, endTime, airStackKey } from "@/utils/constants";
import { frames } from "../frames";
import { init } from "@airstack/node";
import { getTipAllowance } from "@/utils/helpers";

// init(airStackKey);

export const dynamic = "force-dynamic";

const handler = frames(async (ctx) => {
    const userId = ctx.message?.requesterFid;

    const percentage = ctx.message?.inputText;
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

        // const tipAllowance = await getTipAllowance(user.fid);
        const tipAllowance = "0";

        if (tipAllowance === "0") {
            return {
                image: (
                    <div tw="flex flex-col relative w-full h-full items-center justify-center">
                        <div tw="flex relative">
                            Number of super likes: {user?.likes.length}
                        </div>
                        <div tw="flex relative">
                            Sorry, no tip allowance just yet.
                        </div>
                        <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                            By @nkemjika
                        </div>
                    </div>
                ),
                // TODO: remove tip buttons after testing signing
                buttons:
                    user.signer?.status === "" ||
                    user.signer?.status === undefined ||
                    user.signer?.status === null
                        ? [
                              <Button
                                  action="post"
                                  key={1}
                                  target={{
                                      pathname: "/api/signer",
                                  }}
                              >
                                  Sign to start
                              </Button>,
                          ]
                        : user.signer?.status === "pending_approval" &&
                            user.signer.signer_approval_url
                          ? [
                                <Button
                                    action="link"
                                    key={1}
                                    target={user?.signer?.signer_approval_url}
                                >
                                    Sign to approve tipping
                                </Button>,
                            ]
                          : user.signer.status === "approved"
                            ? [
                                  <Button
                                      action="post"
                                      key={1}
                                      target={{
                                          pathname: "/api/signer",
                                          query: {
                                              signer_uuid:
                                                  user.signer.signer_uuid,
                                          },
                                      }}
                                  >
                                      Tip away
                                  </Button>,
                              ]
                            : [],
            };
        }

        // gets the tip to be given to each super like
        // const distributeTips =
        // user &&
        //     getDistributeTips(
        //         user?.likes.length,
        //         Number(tipAllowance),
        //         percentage,
        //     );

        // check data of signing, if not today, change status to pending-approval

        return {
            image: (
                <div tw="flex flex-col relative w-full h-full items-center justify-center">
                    <div tw="flex relative">
                        Number of super likes: {user?.likes.length}
                    </div>
                    <div tw="flex relative">Tip allowance: {tipAllowance}</div>
                    <span tw="text-md mt-4">
                        Leave textfield empty to tip 100%
                    </span>
                    <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                        By @nkemjika
                    </div>
                </div>
            ),
            textInput: "Enter percentage",
            buttons:
                user.signer?.status === "" ||
                user.signer?.status === undefined ||
                user.signer?.status === null
                    ? [
                          <Button
                              action="post"
                              key={1}
                              target={{
                                  pathname: "/api/signer",
                                  query: {
                                      userId: userId,
                                  },
                              }}
                          >
                              Sign to start
                          </Button>,
                      ]
                    : user.signer?.status === "pending_approval" &&
                        user.signer.signer_approval_url
                      ? [
                            <Button
                                action="link"
                                key={1}
                                target={user?.signer?.signer_approval_url}
                            >
                                Sign to approve tipping
                            </Button>,
                        ]
                      : user.signer.status === "approved"
                        ? [
                              <Button
                                  action="post"
                                  key={1}
                                  target={{
                                      pathname: "/api/signer",
                                      query: {
                                          signer_uuid: user.signer.signer_uuid,
                                      },
                                  }}
                              >
                                  Tip away
                              </Button>,
                          ]
                        : [],
        };
    }

    return {
        image: (
            <div tw="flex flex-col relative w-full h-full items-center justify-center">
                Error: Havent added the action yet.
                <span tw="text-sm mt-2">Add action to start superliking</span>
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
});

export const GET = handler;
export const POST = handler;
