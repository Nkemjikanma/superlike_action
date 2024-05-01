import { prismadb } from "@/utils/prismadb";
import { NextResponse } from "next/server";
import { frames } from "@/app/frames/frames";
import { neynarClient } from "@/utils/constants";
import { generate_signature, getFid } from "@/utils/sign";

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

        // generate a signature
        const { deadline, signature } = await generate_signature(
            createSigner.public_key,
        );

        const fid = await getFid();

        // register the signed key
        const signedKey = await neynarClient.registerSignedKey(
            createSigner.signer_uuid,
            fid,
            deadline,
            signature,
        );

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

        return NextResponse.json(signedKey, { status: 200 });
    } catch (error) {
        throw new Error("Error creating signed key");
    }
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
