import { prismadb } from "@/utils/prismadb";
import { NextResponse } from "next/server";
import { frames } from "@/app/frames/frames";
import { neynarClient } from "@/utils/constants";
import { getSignedKey } from "@/utils/sign";

export const POST = frames(async (ctx) => {
    const fid = ctx.message?.requesterFid;

    const signedKey = await getSignedKey();

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
