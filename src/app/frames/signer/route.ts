import { client, getSignedKey } from "@/utils/helpers";
import { prismadb } from "@/utils/prismadb";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { FrameActionPayload } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { frames } from "../frames";

export const POST = frames(async (ctx) => {
    const fid = ctx.message?.requesterFid;

    try {
        // create a signer
        const signedKey: Signer = await getSignedKey();

        await prismadb.signer.create({
            data: {
                fid: fid!,
                status: signedKey.status,
                signer_uuid: signedKey.signer_uuid,
                signer_approval_url: signedKey.signer_approval_url,
                public_key: signedKey.public_key,
            },
        });

        return NextResponse.json(signedKey, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred - at getSignedKey" },
            { status: 500 },
        );
    }
});

export const GET = frames(async (ctx) => {
    const signer_uuid = ctx.searchParams.signer_uuid;

    if (!signer_uuid) {
        return NextResponse.json(
            { error: "signer_uuid is required" },
            { status: 400 },
        );
    }

    try {
        const signer = await client.lookupSigner(signer_uuid);
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
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred - at lookupSigner" },
            { status: 500 },
        );
    }
});
