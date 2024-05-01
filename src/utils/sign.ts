import { mnemonicToAccount } from "viem/accounts";
import { neynarClient } from "./constants";

export const getSignedKey = async () => {
    try {
        const createSigner: GeneratedKey = await fetch(
            "https://api.neynar.com/v2/farcaster/signer",
            {
                method: "POST",
                headers: {
                    api_key: process.env.NEYNAR_API_KEY!,
                },
            },
        ).then((res) => res.json());

        const { deadline, signature } = await generate_signature(
            createSigner.public_key,
        );

        const fid = await getFid();

        const signedKey = await neynarClient.registerSignedKey(
            createSigner.signer_uuid,
            fid,
            deadline,
            signature,
        );

        console.log("signedKey", signedKey);

        return signedKey;
    } catch (error) {
        throw new Error("Error creating signed key");
    }
};

export const generate_signature = async function (public_key: string) {
    // DO NOT CHANGE ANY VALUES IN THIS CONSTANT
    const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
        name: "Farcaster SignedKeyRequestValidator",
        version: "1",
        chainId: 10,
        verifyingContract:
            "0x00000000fc700472606ed4fa22623acf62c60553" as `0x${string}`,
    };

    // DO NOT CHANGE ANY VALUES IN THIS CONSTANT
    const SIGNED_KEY_REQUEST_TYPE = [
        { name: "requestFid", type: "uint256" },
        { name: "key", type: "bytes" },
        { name: "deadline", type: "uint256" },
    ];

    const account = mnemonicToAccount(
        process.env.FARCASTER_DEVELOPER_MNEMONIC!,
    );

    // Generates an expiration date for the signature
    // e.g. 1693927665
    const deadline = Math.floor(Date.now() / 1000) + 86400; // signature is valid for 1 day from now
    // You should pass the same value generated here into the POST /signer/signed-key Neynar API

    // Generates the signature
    const signature = await account.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
            SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
        },
        primaryType: "SignedKeyRequest",
        message: {
            requestFid: BigInt(process.env.FID!),
            key: public_key,
            deadline: BigInt(deadline),
        },
    });

    // Logging the deadline and signature to be used in the POST /signer/signed-key Neynar API
    return { deadline, signature };
};

export const getFid = async () => {
    if (!process.env.FARCASTER_DEVELOPER_MNEMONIC) {
        throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not set.");
    }

    const account = mnemonicToAccount(process.env.FARCASTER_DEVELOPER_MNEMONIC);

    // Lookup user details using the custody address.
    const { user: farcasterDeveloper } =
        await neynarClient.lookupUserByCustodyAddress(account.address);

    return Number(farcasterDeveloper.fid);
};
