import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.nextUrl);

    const tipmarks = searchParams.get("tipmarks");

    const alreadyTipped = searchParams.get("alreadyTipped");

    const tipAllowance = searchParams.get("tipAllowance");

    const degenTipped = searchParams.get("degenTipped");

    const remaining = searchParams.get("remaining");

    const displayedObject = [
        { subject: "Number of Tipmarks", value: tipmarks },
        {
            subject: "Already tipped",
            value: alreadyTipped,
        },
        { subject: "Tip allowance", value: tipAllowance },
        { subject: "Degen tipped", value: degenTipped },
        {
            subject: "Remaining tip allowance",
            value: remaining,
        },
    ];

    const imageResponse = new ImageResponse(
        (
            <div tw="flex flex-col relative w-full h-full items-center justify-center m-auto py-3 bg-white">
                <div tw="flex flex-col relative w-full h-fit items-center justify-center bg-white">
                    <div tw="flex flex-col relative h-fit m-auto items-center justify-center">
                        <ul tw="flex flex-col relative w-full h-fit">
                            {displayedObject.map(
                                ({ subject, value }, index) => (
                                    <li
                                        key={index}
                                        tw="flex flex-row relative border h-fit border-gray-800 justify-between px-2 text-[25px]"
                                    >
                                        <p>{subject}:</p>
                                        <p tw="ml-2">{value}</p>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                    <span tw="text-md mt-4 text-[19px]">
                        Leave textfield empty to tip 100%
                    </span>
                </div>
                <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                    By @nkemjika
                </div>
            </div>
        ),
    );

    // Set the cache control headers to ensure the image is not cached
    imageResponse.headers.set("Cache-Control", "public, max-age=0");

    return imageResponse;
}
