import { headers } from "next/headers";
import { mnemonicToAccount } from "viem/accounts";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { ViemLocalEip712Signer } from "@farcaster/hub-nodejs";
import { bytesToHex, hexToBytes } from "viem";

export const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

export const getSignedKey = async () => {
    const createSigner = await client.createSigner();
    const { deadline, signature } = await generate_signature(
        createSigner.public_key,
    );

    if (deadline === 0 || signature === "") {
        throw new Error("Failed to generate signature");
    }

    const fid = await getFid();

    const signedKey = await client.registerSignedKey(
        createSigner.signer_uuid,
        fid,
        deadline,
        signature,
    );

    return signedKey;
};

const generate_signature = async function (public_key: string) {
    if (typeof process.env.FARCASTER_DEVELOPER_MNEMONIC === "undefined") {
        throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not defined");
    }

    const FARCASTER_DEVELOPER_MNEMONIC =
        process.env.FARCASTER_DEVELOPER_MNEMONIC;
    const FID = await getFid();

    const account = mnemonicToAccount(FARCASTER_DEVELOPER_MNEMONIC);
    const appAccountKey = new ViemLocalEip712Signer(account as any);

    // Generates an expiration date for the signature (24 hours from now).
    const deadline = Math.floor(Date.now() / 1000) + 86400;

    const uintAddress = hexToBytes(public_key as `0x${string}`);

    const signature = await appAccountKey.signKeyRequest({
        requestFid: BigInt(FID),
        key: uintAddress,
        deadline: BigInt(deadline),
    });

    if (signature.isErr()) {
        return {
            deadline,
            signature: "",
        };
    }

    const sigHex = bytesToHex(signature.value);

    return { deadline, signature: sigHex };
};

export const getFid = async () => {
    if (!process.env.FARCASTER_DEVELOPER_MNEMONIC) {
        throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not set.");
    }

    const account = mnemonicToAccount(process.env.FARCASTER_DEVELOPER_MNEMONIC);

    // Lookup user details using the custody address.
    const { user: farcasterDeveloper } =
        await client.lookupUserByCustodyAddress(account.address);

    return Number(farcasterDeveloper.fid);
};

export function currentURL(pathname: string): URL {
    const headersList = headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";

    try {
        return new URL(pathname, `${protocol}://${host}`);
    } catch (error) {
        return new URL("http://localhost:3000");
    }
}

export const getTipAllowance = async (fid: number) => {
    const response = await fetch(
        `https://api.dune.com/api/v1/query/3661369/results?limit=1&columns=tip_allowance&filters=fid=${fid}`,
        {
            headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY! },
        },
    );

    const data = await response.json();

    if (data.result.rows.length === 0) {
        return "0";
    }

    const tipAllowance: string = data.result.rows[0].tip_allowance;

    return tipAllowance;
};

export const getDistributeTips = (
    allowance: number,
    numberOfLikes: number,
    percentage?: string,
) => {
    // check if percenntage is not a number
    if (Number.isNaN(percentage) || Number(percentage) > 100) {
        return "Invalid percentage";
    }

    // check if percentage is not provided
    if (percentage === undefined) {
        return allowance / numberOfLikes;
    }

    // check if percentage is provided
    return (Number(percentage) / 100) * numberOfLikes;
};
