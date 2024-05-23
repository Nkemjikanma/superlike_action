import { init } from "@airstack/node";
import { airStackKey } from "./constants";
import { prismadb } from "./prismadb";

export const dynamic = "force-dynamic";

init(airStackKey);

export const getTipAllowance = async (fid: number) => {
    const response = await fetch(
        `https://api.dune.com/api/v1/query/3744089/results?limit=1&columns=tip_allowance&filters=fid=${fid}`,
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

    // if percentage is provided
    const percentageValue = (Number(percentage) / 100) * allowance;
    return percentageValue / numberOfLikes;
};

export const queryLikesData = async (
    castId: string,
    requesterFid: number,
    authorFid: number,
): Promise<string> => {
    let response: string;
    const like = await prismadb.likes.findUnique({
        where: {
            castId: castId,
        },
    });

    if (like && like.castId) {
        response = "Like found";
        return response;
    }

    const createLike = await prismadb.likes.create({
        data: {
            fid: requesterFid,
            castId: castId,
            authorFid: authorFid,
            alreadyTipped: false,
        },
    });

    if (!createLike) {
        response = "Like error";
        return response;
    }

    return "Success";
};
