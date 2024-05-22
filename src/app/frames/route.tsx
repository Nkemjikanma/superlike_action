import { Button } from "frames.js/next";

import { frames } from "./frames";

const handleRequest = frames(async () => {
    const actionUrl = `https://warpcast.com/~/add-cast-action?${new URLSearchParams({ url: new URL("/frames/actionMeta", "https://superlike-action.vercel.app").toString() })}`;

    return {
        image: (
            <div tw="flex flex-col relative w-full h-full items-center justify-center m-auto">
                <p tw="text-xl">PowerLike Action ⚡️</p>
                <p tw="text-md mt-7 w-2/3">
                    Add the Powerlike action to keep track of casts you want to
                    automatically tip with the powerlike frame.
                </p>
                <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                    By @nkemjika
                </div>
            </div>
        ),
        buttons: [
            <Button action="link" target={actionUrl} key={1}>
                Install
            </Button>,
            <Button
                action="post"
                key={2}
                target={{
                    pathname: "/dashboard",
                }}
            >
                Dashboard
            </Button>,
        ],
    };
});

export const GET = handleRequest;
export const POST = handleRequest;

// https://superlike-action.vercel.app
// https://superlike-action.vercel.app
