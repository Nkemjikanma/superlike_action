import { NextRequest } from "next/server";
import { HttpError } from "@/utils/constants";

export async function POST(request: NextRequest) {
    try {
        const postCast = await fetch(
            "https://api.neynar.com/v2/farcaster/cast",
            {
                method: "POST",
                headers: {
                    api_key: process.env.NEYNAR_API_KEY!,
                },
                body: JSON.stringify({
                    signer_uuid: "",
                    text: "",
                    parent: "",
                }),
            },
        );
    } catch (error) {
        if (error instanceof HttpError) {
            if (error.response.status === 404) {
                console.log("Signer not found");
            }
        }
    }
}
