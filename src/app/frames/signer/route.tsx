import { prismadb } from "@/utils/prismadb";
import { NextResponse } from "next/server";
import { frames } from "@/app/frames/frames";
import { neynarClient } from "@/utils/constants";
import { generate_signature, getFid } from "@/utils/sign";
import { Button } from "frames.js/next";

export const POST = frames(async (ctx) => {
    try {
        const requesterFId = ctx.message?.requesterFid;

        // create a signer
        const createSigner: GeneratedKey = await fetch(
            "https://api.neynar.com/v2/farcaster/signer",
            {
                method: "POST",
                headers: {
                    api_key: process.env.NEYNAR_API_KEY!,
                },
            },
        ).then((res) => res.json());

        console.log("createSigner", createSigner);

        // generate a signature
        const { deadline, signature } = await generate_signature(
            createSigner.public_key,
        );

        console.log("deadline", deadline);
        console.log("signature", signature);

        // register the signed key
        const signedKey: CreateSignerType = await fetch(
            "https://api.neynar.com/v2/farcaster/signer/signed_key",
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    api_key: process.env.NEYNAR_API_KEY!,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    signer_uuid: createSigner.signer_uuid,
                    app_fid: process.env.FID!,
                    deadline,
                    signature,
                }),
            },
        ).then((res) => res.json());

        console.log("signedKey", signedKey);

        // save the signed key to the database
        await prismadb.signer.create({
            data: {
                fid: requesterFId!,
                status: signedKey.status,
                signer_uuid: signedKey.signer_uuid,
                signer_approval_url: signedKey.signer_approval_url,
                public_key: signedKey.public_key,
            },
        });

        if (signedKey.status === "pending_approval") {
            return {
                image: (
                    <div tw="flex flex-col relative w-full h-full items-center justify-center">
                        <div tw="flex relative">Approve</div>

                        <div tw="bottom-0 right-0 absolute bg-gray-800 border-t-4 border-r-4 border-gray-800 rounded-tl-2xl p-4 text-white text-2xl">
                            By @nkemjika
                        </div>
                    </div>
                ),
                buttons: [
                    <Button
                        action="link"
                        key={1}
                        target={signedKey.signer_approval_url!}
                    >
                        Approve
                    </Button>,
                ],
            };
        }
    } catch (error) {
        return NextResponse.json({ error: "Error siging" }, { status: 500 });
    }
    return NextResponse.json({ error: "Error signing" });
});

export const GET = frames(async (ctx) => {
    const signer_uuid = ctx.searchParams.signer_uuid;

    const signer = await neynarClient.lookupSigner(signer_uuid);
    if (signer.status === "approved") {
        await prismadb.signer.update({
            where: {
                fid: signer.fid,
            },
            data: {
                ...signer,
            },
        });
    }
    return NextResponse.json(signer, { status: 200 });
});
