import { Button } from "frames.js/next";

import { frames } from "./frames";

const handleRequest = frames(async () => {
    const actionUrl = `https://warpcast.com/~/add-cast-action?${new URLSearchParams({ url: new URL("/frames/actionMeta", "https://superlike-action.vercel.app").toString() })}`;

    return {
        image: (
            <div tw="flex flex-col relative w-full h-full items-center justify-center m-auto">
                <div tw="flex flex-col relative w-full h-1/3 items-center justify-center m-auto">
                    <p tw="text-[40px] font-bold">PowerLike Action ⚡️</p>
                    <p tw="text-[25px] mt-1 w-2/3 m-auto fit-content">
                        Add the Powerlike action to keep track of casts you want
                        to tip with click of a button.
                    </p>
                </div>
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
